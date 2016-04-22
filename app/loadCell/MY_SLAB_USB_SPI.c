#include <stdio.h>
#include <libusb-1.0/libusb.h>
#include <string.h>
#include <stdint.h>
#include <time.h>
#include <sys/time.h>
#include <sys/select.h>
#include <stdlib.h>
#include "MY_SLAB_USB_SPI.h"

#define USB_TIMEOUT 1000
#define MAX_READ_SIZE = 12

int kernelAttached = 0;
libusb_device_handle* h;
libusb_context* context = NULL;
libusb_device** list = NULL;
int devListCnt = 0;
uint8_t inEndPointAddress;
uint8_t outEndPointAddress;
typedef struct {
  DWORD* pLengthTransferred;
  int waitObject;
  USB_SPI_STATUS status;
} bulkTransCtx_type;

int64_t  BulkTransfer_Asynch(BYTE *Buffer, DWORD Length, DWORD *LengthTransferred, DWORD Timeout, int WaitObject);
int64_t  ReadWritePipe(BYTE rwType, DWORD size, BYTE *buff, DWORD timeoutMs, DWORD *pBytesTransferred);
int64_t  BulkTransfer(BYTE *Buffer, DWORD Length, DWORD *LengthTransferred, DWORD Timeout);
void  BulkTransferCallback(struct libusb_transfer *transfer);

void cleanUp() {
  // Cleanup and deinitialize libusb
  if (h)
    libusb_release_interface(h, 0);
  if (kernelAttached)
    libusb_attach_kernel_driver(h, 0);
  if (h)
    libusb_close(h);
  if (list)
    libusb_free_device_list(list, 1);
/*  if (context)
    libusb_exit(context);*/
}

void fillEndPointAdresses(libusb_device* dev) {
  struct libusb_config_descriptor* config;
  int i;
  uint8_t endPointAddress;
  if(libusb_get_active_config_descriptor(dev, &config)) {
    libusb_close(h);
  }
  else {
    for ( i = 0; config->interface->altsetting->bNumEndpoints > i; ++i ) {
      endPointAddress = config->interface->altsetting->endpoint[i].bEndpointAddress;
      if ( endPointAddress & 0x80 ) {
        inEndPointAddress = endPointAddress;
      }
      else if ( !(endPointAddress & 0x80) ) {
        outEndPointAddress = endPointAddress;
      }
    }
  }
}

USB_SPI_STATUS CP213x_Open(DWORD deviceIndex, DWORD vid, DWORD pid) {
  USB_SPI_STATUS status = 1; // [sp+24h] [bp-5Ch]@1
  struct libusb_device_descriptor desc;
  
  int i;
  int cpCtr = 0;
  for(i = 0; i < devListCnt; i++) {
    if (libusb_get_device_descriptor(list[i], &desc) == 0) {
      if(desc.idVendor == vid && desc.idProduct == pid ) {
        if(cpCtr == deviceIndex) {
          status = libusb_open(list[i], &h);
          fillEndPointAdresses(list[i]);
          break;
        }
        cpCtr++;
      }
    }
  }
  if ( status ) {
    status = USB_SPI_ERRCODE_DEVICE_NOT_FOUND;
  }
  else {
    // See if a kernel driver is active already, if so detach it and store a
    // flag so we can reattach when we are done
    if (libusb_kernel_driver_active(h, 0) != 0) {
        libusb_detach_kernel_driver(h, 0); 
	      kernelAttached = 1;
    }
    
    // Finally, claim the interface
    if (libusb_claim_interface(h, 0) != 0) {
        status = USB_SPI_ERRCODE_UNKNOWN_ERROR;
        cleanUp();
    }
  }
  return status;
}

USB_SPI_STATUS CP213x_GetNumDevices(DWORD *lpdwNumDevices, DWORD vid, DWORD pid) {
  USB_SPI_STATUS status; // [sp+2Ch] [bp-4h]@2
  DWORD i;
/*  if(list) {
    libusb_free_device_list(list, 1LL);
    list = NULL;
  }*/
  devListCnt = libusb_get_device_list(context, &list);
  struct libusb_device_descriptor desc; // [sp+50h] [bp-20h]@2
  *lpdwNumDevices = 0; // [sp+38h] [bp-38h]@1

  if (lpdwNumDevices) {
    for(i = 0; i < devListCnt; ++i) {
      if(libusb_get_device_descriptor(list[i], &desc) == 0) {
        if(desc.idVendor == vid && desc.idProduct == pid) {
          (*lpdwNumDevices)++;
        }
      }
    }
//    libusb_free_device_list(list, 1LL);
    status = USB_SPI_ERRCODE_SUCCESS;
  }
  else {
    status = USB_SPI_ERRCODE_INVALID_PARAMETER;
  }
  return (unsigned int)status;
}

USB_SPI_STATUS CP213x_GetSpiControlBytes(BYTE controlBytes[CP213x_NUM_GPIO]) {
  USB_SPI_STATUS status = USB_SPI_ERRCODE_SUCCESS; // [sp+1Ch] [bp-44h]@3
  unsigned char data[16]; // [sp+30h] [bp-30h]@3
  
  if (controlBytes) {
    int result = libusb_control_transfer(h, 0xC0, 0x30, 0, 0, data, CP213x_NUM_GPIO, USB_TIMEOUT);
    if(result == CP213x_NUM_GPIO) {
      memcpy(controlBytes, data, CP213x_NUM_GPIO);
    }
    else {
      status = USB_SPI_ERRCODE_CONTROL_TRANSFER_ERROR;
    }
  }
  else {
    status = USB_SPI_ERRCODE_INVALID_PARAMETER;
  }
  return status;
}

USB_SPI_STATUS CP213x_SetSpiControlByte(BYTE channel, BYTE controlByte) {
  unsigned char data[2]; // [sp+30h] [bp-60h]@1

  data[0] = channel;
  data[1] = controlByte;
  if(libusb_control_transfer(h, 0x40, 0x31, 0, 0, data, 2, USB_TIMEOUT) == 2) {
    return USB_SPI_ERRCODE_SUCCESS;
  }
  else {
    return USB_SPI_ERRCODE_CONTROL_TRANSFER_ERROR;
  }
}

USB_SPI_STATUS CP213x_SetGpioModeAndLevel(BYTE index, BYTE mode, BYTE level) {
  unsigned char data[3]; // [sp+40h] [bp-30h]@7

  if ( index > 10 || mode && mode != 2 && mode != 1 || level > 1 ) {
    return USB_SPI_ERRCODE_INVALID_PARAMETER;
  }
  else {
    data[0] = index;
    data[1] = mode;
    data[2] = level;
    int ret = libusb_control_transfer(h, 0x40, 0x23, 0, 0, data, 3, USB_TIMEOUT);
    if(ret == 3) {
      return USB_SPI_ERRCODE_SUCCESS;
    }
    else {
      return USB_SPI_ERRCODE_CONTROL_TRANSFER_ERROR;
    }
  }
}

USB_SPI_STATUS CP213x_SetChipSelect(BYTE channel, BYTE mode) {
  unsigned char data[2]; // [sp+30h] [bp-30h]@1

  data[0] = channel;
  data[1] = mode;
  int ret = libusb_control_transfer(h, 0x40, 0x25, 0, 0, data, 2, USB_TIMEOUT);
  if(ret == 2) {
    return USB_SPI_ERRCODE_SUCCESS;
  }
  else {
    return USB_SPI_ERRCODE_CONTROL_TRANSFER_ERROR;
  }
}

USB_SPI_STATUS CP213x_Close() {
  cleanUp();
  return USB_SPI_ERRCODE_SUCCESS;
}

/*USB_SPI_STATUS CP213x_TransferReadSync(BYTE pReadBuf[],
                                       DWORD length,
                                       BOOL releaseBusAfterTransfer,
                                       DWORD timeoutMs,
                                       DWORD* pBytesActuallyRead ) {
  USB_SPI_STATUS result = USB_SPI_ERRCODE_SUCCESS;
  // send read command
  unsigned char readCommandBuf[14] = {0};
  *((uint32_t*)(readCommandBuf + 4)) = length;
  int bytesWritten;
  result = libusb_bulk_transfer(h,
                                0x01,
                                readCommandBuf,
                                sizeof(readCommandBuf),
                                &bytesWritten,
                                timeoutMs);
  printf("readcmd result: %d", result);
  if(result) {
    return result;
  }
  if(bytesWritten != sizeof(readCommandBuf)) {
    return USB_SPI_ERRCODE_INVALID_TRANSFER_SIZE;
  }
  
  // read data
  result = libusb_bulk_transfer(h,
                                0x01,
                                pReadBuf,
                                length,
                                &bytesWritten,
                                timeoutMs);
  printf("read result: %d", result);
  if(result) {
    return result;
  }
  *pBytesActuallyRead = bytesWritten;
  if(*pBytesActuallyRead != length) {
    return USB_SPI_ERRCODE_INVALID_TRANSFER_SIZE;
  }
  return USB_SPI_ERRCODE_SUCCESS;
}*/

void CP213x_Init() {
 if (libusb_init(&context) != 0) {
  cleanUp();
 }
}

//----- (000000000000C55A) ----------------------------------------------------
USB_SPI_STATUS CP213x_TransferReadSync(BYTE *pReadBuf, DWORD length, BOOL releaseBusAfterTransfer, DWORD timeoutMs, DWORD *pBytesActuallyRead)
{
  int64_t result; // rax@2
  int64_t v8; // rcx@18
  fd_set *v9; // rdi@18
  void *v10; // rsi@21
  BYTE v11; // al@37
  int64_t v12; // rbx@43
  USB_SPI_STATUS status; // [sp+48h] [bp-148h]@11
  int waitObject; // [sp+4Ch] [bp-144h]@9
  int waitResult; // [sp+50h] [bp-140h]@1
  int selResult; // [sp+54h] [bp-13Ch]@21
  DWORD bytesWritten; // [sp+60h] [bp-130h]@1
  DWORD bytesReadThisTime; // [sp+68h] [bp-128h]@1
  uint64_t waitStatus; // [sp+70h] [bp-120h]@1
  DWORD totalBytesRead; // [sp+78h] [bp-118h]@1
  DWORD bytesToRead; // [sp+80h] [bp-110h]@7
  struct timeval selTimeout; // [sp+90h] [bp-100h]@21
  struct timeval usbTimeout; // [sp+A0h] [bp-F0h]@24
  fd_set set; // [sp+B0h] [bp-E0h]@18
  uint8_t cmdBuffer[64]; // [sp+130h] [bp-60h]@13

  bytesWritten = 0;
  bytesReadThisTime = 0;
  totalBytesRead = 0;
  waitResult = 0;
  waitStatus = 0;
  if (pReadBuf && length && pBytesActuallyRead) {
    *pBytesActuallyRead = 0;
    bytesToRead = length;
    if (length > 0x100000) {
      bytesToRead = 0x100000;
    }
    waitObject = eventfd(0, 0);
    if (waitObject == -1) {
      result = USB_SPI_ERRCODE_SYSTEM_ERROR;
    }
    else {
      status = BulkTransfer_Asynch(pReadBuf,
                                   bytesToRead,
                                   &bytesReadThisTime,
                                   timeoutMs,
                                   waitObject);
      if (!status) {
        cmdBuffer[0] = 0;
        cmdBuffer[1] = 0;
        cmdBuffer[2] = 0;
        if (releaseBusAfterTransfer) {
          cmdBuffer[3] = -128;
        }
        else {
          cmdBuffer[3] = 0;
        }
        *(WORD *)&cmdBuffer[4] = length;
        cmdBuffer[6] = length >> 16;
        cmdBuffer[7] = length >> 24;
        status = ReadWritePipe(1, 8, cmdBuffer, 1000, &bytesWritten);
        if (!status) {
          do
          {
            do
            {
              v8 = 16;
              v9 = &set;
              while ( v8 )
              {
                v9->__fds_bits[0] = 0LL;
                v9 = (fd_set *)((char *)v9 + 8);
                --v8;
              }
              set.__fds_bits[waitObject / 64] |= 1LL << waitObject % 64;
              selTimeout.tv_sec = 0LL;
              selTimeout.tv_usec = 10000LL;
              v10 = &set;
              selResult = select(waitObject + 1, &set, 0LL, 0LL, &selTimeout);
              if ( selResult == -1 )
                break;
              if ( selResult <= 0 )
              {
                usbTimeout.tv_sec = 0LL;
                usbTimeout.tv_usec = 100LL;
                v10 = &usbTimeout;
                libusb_handle_events_timeout(0LL, &usbTimeout);
              }
              else
              {
                v10 = &waitStatus;
                waitResult = read(waitObject, &waitStatus, 8uLL);
              }
            }
            while ( !selResult && !waitResult );
            if ( !waitResult )
            {
              status = 49;
              bytesReadThisTime = 0LL;
              goto LABEL_40;
            }
            if ( waitStatus != 1 )
            {
              status = 49;
              bytesReadThisTime = 0LL;
              goto LABEL_40;
            }
            totalBytesRead += bytesReadThisTime;
            if ( totalBytesRead >= length )
              goto LABEL_40;
            bytesToRead = length - totalBytesRead;
            if ( length - totalBytesRead > 0x100000 )
              bytesToRead = 0x100000LL;
            bytesReadThisTime = 0LL;
            close(waitObject);
            waitObject = eventfd(0, 0);
            waitStatus = 0LL;
            waitResult = 0;
            if ( waitObject == -1 )
            {
              result = 4294967294LL;
              goto LABEL_43;
            }
            status = BulkTransfer_Asynch(
                       pReadBuf,
                       bytesToRead,
                       &bytesReadThisTime,
                       timeoutMs,
                       waitObject);
          }
          while ( !status );
LABEL_40:
          close(waitObject);
          if ( totalBytesRead != length )
          {
            status = 99;
          }
        }
      }
      *pBytesActuallyRead = totalBytesRead;
      result = (unsigned int)status;
    }
  }
  else {
    result = 16LL;
  }
LABEL_43:
  return result;
}
// 8440: using guessed type int  libusb_handle_events_timeout(_QWORD, _QWORD);

int64_t  BulkTransfer_Asynch(BYTE *Buffer, DWORD Length, DWORD *LengthTransferred, DWORD Timeout, int WaitObject)
{
  int64_t result; // rax@2
  USB_SPI_STATUS status; // [sp+48h] [bp-18h]@1
  struct libusb_transfer *transfer; // [sp+50h] [bp-10h]@3
  bulkTransCtx_type *context; // [sp+58h] [bp-8h]@3

  status = 0;
  if (h) {
    transfer = libusb_alloc_transfer(0);
    context = (bulkTransCtx_type *)malloc(sizeof(bulkTransCtx_type));
    if ( transfer && context ) {
      context->pLengthTransferred = LengthTransferred;
      context->waitObject = WaitObject;
      libusb_fill_bulk_transfer(
        transfer,
        h,
        inEndPointAddress,
        Buffer,
        Length,
        BulkTransferCallback,
        context,
        Timeout);
      if (libusb_submit_transfer(transfer)) {
        libusb_free_transfer(transfer);
        free(context);
        status = USB_SPI_ERRCODE_HWIF_DEVICE_ERROR;
      }
      result = (unsigned int)status;
    }
    else {
      if (transfer) {
        libusb_free_transfer(transfer);
      }
      if(context) {
        free(context);
      }
      result = USB_SPI_ERRCODE_ALLOC_FAILURE;
    }
  }
  else {
    result = USB_SPI_ERRCODE_INVALID_HANDLE;
  }
  return result;
}

void  BulkTransferCallback(struct libusb_transfer *transfer)
{
  uint64_t u; // [sp+10h] [bp-10h]@1
  bulkTransCtx_type *context; // [sp+18h] [bp-8h]@1

  u = 1LL;
  context = (bulkTransCtx_type *)transfer->user_data;
  if ( transfer->status ) {
    context->status = USB_SPI_ERRCODE_HWIF_DEVICE_ERROR;
    u = 2LL;
  }
  else {
    context->status = USB_SPI_ERRCODE_SUCCESS;
    *context->pLengthTransferred = transfer->actual_length;
  }
  write(context->waitObject, &u, 8uLL);
  libusb_free_transfer(transfer);
  free(context);
}

//----- (000000000000E833) ----------------------------------------------------
int64_t  ReadWritePipe(BYTE rwType, DWORD size, BYTE *buff, DWORD timeoutMs, DWORD *pBytesTransferred)
{
  int64_t v6; // rax@2
  BYTE v7; // al@7
  BYTE v8; // al@13
  unsigned int oldSum; // ST48_4@13
  BYTE v10; // al@20
  BYTE v11; // al@26
  unsigned int oldSum_0; // ST4C_4@26
  int status; // [sp+38h] [bp-28h]@1
  unsigned int sum; // [sp+3Ch] [bp-24h]@12
  unsigned int sum_0; // [sp+40h] [bp-20h]@25
  int result; // [sp+44h] [bp-1Ch]@7
  int resulta; // [sp+44h] [bp-1Ch]@20
  DWORD bytesTransferred; // [sp+50h] [bp-10h]@7

  status = 0;
  if (buff && pBytesTransferred) {
    if ( rwType == 1 ) {
      result = BulkTransfer(buff, size, &bytesTransferred, timeoutMs);
      if ( result ) {
        if ( result == -7 ) {
          // timeout
          if ( bytesTransferred ) {
            sum = bytesTransferred;
            while ( sum < size ) {
              BulkTransfer(buff, size, &bytesTransferred, timeoutMs);
              oldSum = sum;
              sum += bytesTransferred;
              if ( sum == oldSum ) {
                status = USB_SPI_ERRCODE_HWIF_TRANSFER_TIMEOUT;
                break;
              }
            }
          }
          else {
            status = USB_SPI_ERRCODE_HWIF_TRANSFER_TIMEOUT;
          }
        }
        else {
          bytesTransferred = 0;
          status = USB_SPI_ERRCODE_PIPE_WRITE_FAIL;
        }
      }
      else {
        status = USB_SPI_ERRCODE_SUCCESS;
      }
    }
    else if(rwType == 2) {
      resulta = BulkTransfer(buff, size, &bytesTransferred, timeoutMs);
      if ( resulta ) {
        if ( resulta == -7 ) {
          if ( bytesTransferred ) {
            sum_0 = bytesTransferred;
            while ( sum_0 < size ) {
              BulkTransfer(buff, size, &bytesTransferred, timeoutMs);
              oldSum_0 = sum_0;
              sum_0 += bytesTransferred;
              if ( sum_0 == oldSum_0 ) {
                status = USB_SPI_ERRCODE_HWIF_TRANSFER_TIMEOUT;
                break;
              }
            }
          }
          else {
            status = USB_SPI_ERRCODE_HWIF_TRANSFER_TIMEOUT;
          }
        }
        else {
          bytesTransferred = 0;
          status = USB_SPI_ERRCODE_PIPE_READ_FAIL;
        }
      }
      else {
        status = USB_SPI_ERRCODE_SUCCESS;
      }
    }
    else {
      bytesTransferred = 0;
      status = USB_SPI_ERRCODE_INVALID_ENUM_VALUE;
    }
    *pBytesTransferred = bytesTransferred;
  }
  else {
    status = USB_SPI_ERRCODE_INVALID_PARAMETER;
  }
  return status;
}

int64_t  BulkTransfer(BYTE *Buffer, DWORD Length, DWORD *LengthTransferred, DWORD Timeout) {
  int bytesTransferred; // [sp+34h] [bp-Ch]@3
  USB_SPI_STATUS status; // [sp+38h] [bp-8h]@1
  int result; // [sp+3Ch] [bp-4h]@3

  status = USB_SPI_ERRCODE_HWIF_DEVICE_ERROR;
  if (h) {
    result = libusb_bulk_transfer(
               h,
               outEndPointAddress,
               Buffer,
               (unsigned int)Length,
               &bytesTransferred,
               (unsigned int)Timeout);
    *LengthTransferred = bytesTransferred;
    if (!result) {
      status = USB_SPI_ERRCODE_SUCCESS;
    }
  }
  else {
    status = USB_SPI_ERRCODE_INVALID_HANDLE;
  }
  return status;
}
