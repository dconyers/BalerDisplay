#include <stdio.h>
#include <pthread.h>
#include <time.h>
#include <stdint.h>
#include <unistd.h>
#include <stdlib.h>
#include <string.h>

//#include "SLAB_USB_SPI.h"
#include "MY_SLAB_USB_SPI.h"

#define DEFAULT_VID 0x10c4
#define DEFAULT_PID 0x87a0

typedef enum {
  OK,
  NO_DEVICE_FOUND,
  OPEN_FAILED,
  CONFIG_FAILED,
  READ_FAILED,
  SWITCH_FAILED,
  WRONG_STATE,
  LED_TOGGLE_FAILED
} loadCellError_type;

volatile enum loadCellStatusEnum {
  UNINITIALIZED,
  IDLE,
  SAMPLING,
  CALIBRATING
} loadCellStatus = UNINITIALIZED;
pthread_mutex_t mutexLoadCellStatus;
pthread_cond_t cvIdle;
int  waitingForSampleEnd = 0;
int  waitingToSample = 0;

volatile double curWeight;
pthread_mutex_t mutexCurWeight;
volatile double calSlope;
volatile double calIntercept;
pthread_t samplingThread;
const char* calFilePath = "loadCell/calibrationSettings";
//CP213x_DEVICE phDevice;

loadCellError_type setup();
void termIOLoop();
void printWeight();
loadCellError_type calibrate();
loadCellError_type getSamples(int64_t* samples, int numSamples);
loadCellError_type closeDevice();
void printCalibration();
void loadCal();
void saveCal();
void setCalibration();
loadCellError_type turnRedOn();
loadCellError_type turnRedOff();
loadCellError_type turnYellowOn();
loadCellError_type turnYellowOff();

loadCellError_type turnRedOn() {
  pthread_mutex_lock(&mutexLoadCellStatus);
  if(loadCellStatus == UNINITIALIZED) {
    fprintf(stderr, "Load cell not initialized\n");
    pthread_mutex_unlock(&mutexLoadCellStatus);
    return WRONG_STATE;
  };
  pthread_mutex_unlock(&mutexLoadCellStatus);
  USB_SPI_STATUS retCode = CP213x_SetGpioModeAndLevel(9, GPIO_MODE_OUTPUT_PP, 1);
  if(retCode) {
    fprintf(stderr, "Failed LED SetGpioModeAndLevel with code: %d\n", retCode);
    return LED_TOGGLE_FAILED;
  }
  return OK;
}

loadCellError_type turnRedOff() {
  pthread_mutex_lock(&mutexLoadCellStatus);
  if(loadCellStatus == UNINITIALIZED) {
    fprintf(stderr, "Load cell not initialized\n");
    pthread_mutex_unlock(&mutexLoadCellStatus);
    return WRONG_STATE;
  };
  pthread_mutex_unlock(&mutexLoadCellStatus);
  USB_SPI_STATUS retCode = CP213x_SetGpioModeAndLevel(9, GPIO_MODE_OUTPUT_PP, 0);
  if(retCode) {
    fprintf(stderr, "Failed LED SetGpioModeAndLevel with code: %d\n", retCode);
    return LED_TOGGLE_FAILED;
  }
  return OK;
}

loadCellError_type turnYellowOn() {
  pthread_mutex_lock(&mutexLoadCellStatus);
  if(loadCellStatus == UNINITIALIZED) {
    fprintf(stderr, "Load cell not initialized\n");
    pthread_mutex_unlock(&mutexLoadCellStatus);
    return WRONG_STATE;
  };
  pthread_mutex_unlock(&mutexLoadCellStatus);
  USB_SPI_STATUS retCode = CP213x_SetGpioModeAndLevel(10, GPIO_MODE_OUTPUT_PP, 1);
  if(retCode) {
    fprintf(stderr, "Failed LED SetGpioModeAndLevel with code: %d\n", retCode);
    return LED_TOGGLE_FAILED;
  }
  return OK;
}

loadCellError_type turnYellowOff() {
  pthread_mutex_lock(&mutexLoadCellStatus);
  if(loadCellStatus == UNINITIALIZED) {
    fprintf(stderr, "Load cell not initialized\n");
    pthread_mutex_unlock(&mutexLoadCellStatus);
    return WRONG_STATE;
  };
  pthread_mutex_unlock(&mutexLoadCellStatus);
  USB_SPI_STATUS retCode = CP213x_SetGpioModeAndLevel(10, GPIO_MODE_OUTPUT_PP, 0);
  if(retCode) {
    fprintf(stderr, "Failed LED SetGpioModeAndLevel with code: %d\n", retCode);
    return LED_TOGGLE_FAILED;
  }
  return OK;
}

/*
 *  This Quickselect routine is based on the algorithm described in
 *  "Numerical recipes in C", Second Edition,
 *  Cambridge University Press, 1992, Section 8.5, ISBN 0-521-43108-5
 *  This code by Nicolas Devillard - 1998. Public domain.
 */
#define ELEM_SWAP(a,b) { register int64_t t=(a);(a)=(b);(b)=t; }
int64_t quick_select(int64_t arr[], int n) 
{
    int low, high ;
    int median;
    int middle, ll, hh;

    low = 0 ; high = n-1 ; median = (low + high) / 2;
    for (;;) {
        if (high <= low) /* One element only */
            return arr[median] ;

        if (high == low + 1) {  /* Two elements only */
            if (arr[low] > arr[high])
                ELEM_SWAP(arr[low], arr[high]) ;
            return arr[median] ;
        }

    /* Find median of low, middle and high items; swap into position low */
    middle = (low + high) / 2;
    if (arr[middle] > arr[high])    ELEM_SWAP(arr[middle], arr[high]) ;
    if (arr[low] > arr[high])       ELEM_SWAP(arr[low], arr[high]) ;
    if (arr[middle] > arr[low])     ELEM_SWAP(arr[middle], arr[low]) ;

    /* Swap low item (now in position middle) into position (low+1) */
    ELEM_SWAP(arr[middle], arr[low+1]) ;

    /* Nibble from each end towards middle, swapping items when stuck */
    ll = low + 1;
    hh = high;
    for (;;) {
        do ll++; while (arr[low] > arr[ll]) ;
        do hh--; while (arr[hh]  > arr[low]) ;

        if (hh < ll)
        break;

        ELEM_SWAP(arr[ll], arr[hh]) ;
    }

    /* Swap middle item (in position low) back into correct position */
    ELEM_SWAP(arr[low], arr[hh]) ;

    /* Re-set active partition */
    if (hh <= median)
        low = ll;
        if (hh >= median)
        high = hh - 1;
    }
}
#undef ELEM_SWAP

void saveCal() {
  FILE* fd = fopen(calFilePath, "w");
  fprintf(fd, "%lf\n", calSlope);
  fprintf(fd, "%lf\n", calIntercept);
  fclose(fd);
}

void loadCal() {
  int valid = 0;
  char buf[32];
  double input;
  FILE* fd = fopen(calFilePath, "a+");
  calSlope = 0;
  calIntercept = 0;
  if(fgets(buf, 32, fd)) {
    if(sscanf(buf, "%lf", &input) == 1) {
      valid = 1;
      calSlope = input;
    }
  }
  if(!valid) {
    // Error reading configuration, just use defaults: 0,0
    fclose(fd);
    return;
  }
  
  if(fgets(buf, 32, fd)) {
    if(sscanf(buf, "%lf", &input) == 1) {
      calIntercept = input;
    }
  }
  fclose(fd);
}

double sampleToWeight(int64_t sample) {
  return calSlope*(double)sample + calIntercept;
}

void* sampleForever(void* args) {
  struct timespec tim, tim2;
  tim.tv_sec = 0;
  tim.tv_nsec = 0;
  USB_SPI_STATUS retCode;
  /* Get 3 samples and take the median to get rid of bad readings. I.e. bad
     readings can be caused by sampling when ADC is not ready.
  */
  int64_t samples[3];
  while(1) {
    pthread_mutex_lock(&mutexLoadCellStatus);
    while(loadCellStatus != IDLE) {
      waitingToSample =  1;
      pthread_cond_wait(&cvIdle, &mutexLoadCellStatus);
    }
    waitingToSample = 0;
    loadCellStatus = SAMPLING;
    pthread_mutex_unlock(&mutexLoadCellStatus);
    
    retCode = getSamples(samples, 3);
    
    pthread_mutex_lock(&mutexLoadCellStatus);
    loadCellStatus = IDLE;
    if(waitingForSampleEnd ==  1) {
      pthread_cond_signal(&cvIdle);
    }
    pthread_mutex_unlock(&mutexLoadCellStatus);
    nanosleep(&tim, &tim2); // This thread was starving out the calibration routine on my deveopment system.

    if(retCode != OK) {
      /* There was some error getting samples. Assume device was disconnected
         or there is something else wrong with it.
         Try to close device, which should change state to uninitialized.
       */
       closeDevice();
       continue;
    }
    
    pthread_mutex_lock(&mutexCurWeight);
    curWeight = sampleToWeight(quick_select(samples, 3));
    pthread_mutex_unlock(&mutexCurWeight);
  }
  pthread_exit(NULL);
}

loadCellError_type setup() {
  DWORD numDevices;
  USB_SPI_STATUS retCode;
  BYTE controlBytes[CP213x_NUM_GPIO];
  pthread_mutex_lock(&mutexLoadCellStatus);
  if(loadCellStatus != UNINITIALIZED) {
    fprintf(stderr, "Load cell already IDLE\n");
    pthread_mutex_unlock(&mutexLoadCellStatus);
    return WRONG_STATE;
  }
  pthread_mutex_unlock(&mutexLoadCellStatus);

  /* Need to call CP213x_GetNumDevices before calling CP213x_Open to populate
     device indexes.
     Assuming vendor and product ID haven't been changed.
  */
  retCode = CP213x_GetNumDevices(&numDevices, DEFAULT_VID, DEFAULT_PID);
  if(retCode) {
    fprintf(stderr, "Failed GetNumDevices with code: %d\n", retCode);
    return NO_DEVICE_FOUND;
  }
  if(numDevices < 1) {
    fprintf(stderr, "No USB-SPI connected\n");
    return NO_DEVICE_FOUND;
  }
  
  /* Open first device seen. Assuming only one USB->SPI interface is connected.
  */
  retCode = CP213x_Open(0,
//                        &phDevice,
                        DEFAULT_VID,
                        DEFAULT_PID);
  if(retCode) {
    fprintf(stderr, "Failed Open with code: %d\n", retCode);
    return OPEN_FAILED;
  }
  
  /* Changing the clock rate on one "channel" seems to change the SCK clock rate
     Weird thing is it appears to change the clock rate to ~200khz instead of
     93.75.
     Need anything below 5Mhz for ADC chips.
  */
  retCode = CP213x_GetSpiControlBytes(controlBytes);
  if(retCode) {
    fprintf(stderr, "Failed GetSpiControlBytes with code: %d\n", retCode);
    return CONFIG_FAILED;
  }
  
  controlBytes[0] &= ~SPICTL_CLKRATE_MASK;
  controlBytes[0] |= SPICTL_CLKRATE_3M;
  controlBytes[0] &= ~SPICTL_CPHA_MASK;
  controlBytes[0] |= SPICTL_CPHA_TRAILING_EDGE << SPICTL_CPHA_SHIFT;  
  
  retCode = CP213x_SetSpiControlByte(0,
                                     controlBytes[0]);
  if(retCode) {
    fprintf(stderr, "Failed SetSpiControlByte with code: %d\n", retCode);
    return CONFIG_FAILED;
  }                
  
  
  // Keep PDWN on.
  retCode = CP213x_SetGpioModeAndLevel(4, GPIO_MODE_OUTPUT_PP, 1);
  if(retCode) {
    fprintf(stderr, "Failed SetGpioModeAndLevel with code: %d\n", retCode);
    return CONFIG_FAILED;
  }
  
  // Need to keep
  retCode = 0;
  retCode |= CP213x_SetChipSelect(0, CSMODE_IDLE);
  retCode |= CP213x_SetChipSelect(1, CSMODE_IDLE);
  retCode |= CP213x_SetChipSelect(2, CSMODE_IDLE);
  retCode |= CP213x_SetChipSelect(3, CSMODE_IDLE);
  retCode |= CP213x_SetChipSelect(4, CSMODE_IDLE);    
  retCode |= CP213x_SetChipSelect(5, CSMODE_IDLE);
  retCode |= CP213x_SetChipSelect(6, CSMODE_IDLE);    
  retCode |= CP213x_SetChipSelect(7, CSMODE_IDLE);  
  retCode |= CP213x_SetChipSelect(8, CSMODE_IDLE);
  retCode |= CP213x_SetChipSelect(9, CSMODE_IDLE);  
  retCode |= CP213x_SetChipSelect(10, CSMODE_IDLE);
  if(retCode) {
    fprintf(stderr, "Failed CP213x_SetChipSelect\n");
    return CONFIG_FAILED;
  }
  
  // Start with LEDs off
  retCode = CP213x_SetGpioModeAndLevel(9, GPIO_MODE_OUTPUT_PP, 0);
  if(retCode) {
    fprintf(stderr, "Failed CP213x_SetChipSelect\n");
    return CONFIG_FAILED;
  }
  retCode = CP213x_SetGpioModeAndLevel(10, GPIO_MODE_OUTPUT_PP, 0);
  if(retCode) {
    fprintf(stderr, "Failed CP213x_SetChipSelect\n");
    return CONFIG_FAILED;
  }
  
  pthread_mutex_lock(&mutexLoadCellStatus);
  loadCellStatus = IDLE;
  if(waitingToSample ==  1) {
    pthread_cond_signal(&cvIdle);
  }
  pthread_mutex_unlock(&mutexLoadCellStatus);
  return OK;
}

void printRsp(loadCellError_type rsp) {
  switch(rsp) {
    case OK:
      printf("OK\n");
      break;
    case NO_DEVICE_FOUND:
      printf("NO_DEVICE_FOUND\n");
      break;
    case OPEN_FAILED:
      printf("OPEN_FAILED\n");
      break;
    case CONFIG_FAILED:
      printf("CONFIG_FAILED\n");
      break;
    case SWITCH_FAILED:
      printf("SWITCH_FAILED\n");
      break;
    case WRONG_STATE:
      printf("WRONG_STATE\n");
      break;
  }
}

loadCellError_type closeDevice() {
  pthread_mutex_lock(&mutexLoadCellStatus);
  if(loadCellStatus == UNINITIALIZED) {
    fprintf(stderr, "Load cell already closed\n");
    pthread_mutex_unlock(&mutexLoadCellStatus);
    return WRONG_STATE;
  };
  while(loadCellStatus != IDLE) {
    waitingForSampleEnd =  1;
    pthread_cond_wait(&cvIdle, &mutexLoadCellStatus);
  }
  waitingForSampleEnd = 0;
  loadCellStatus = UNINITIALIZED;
  CP213x_Close(
//  phDevice
  );
  pthread_mutex_unlock(&mutexLoadCellStatus);
  return OK;
}

void printStatus() {
  pthread_mutex_lock(&mutexLoadCellStatus);
  switch(loadCellStatus) {
    case UNINITIALIZED:
      printf("UNINITIALIZED\n");
      break;
    case IDLE:
      printf("IDLE\n");
      break;
    case SAMPLING:
      printf("SAMPLING\n");
      break;
    case CALIBRATING:
      printf("CALIBRATING\n");
      break;
  }
  pthread_mutex_unlock(&mutexLoadCellStatus);
}

void termIOLoop() {
  char buf[32];
  loadCellError_type rsp;
  while(1) {
    if(fgets(buf, 32, stdin) == NULL) {
      fprintf(stderr, "Failed to read stdin. Or received EOF character\n");
      exit(-1);
    };
    if(strcmp(buf,"CALIBRATE\n") == 0) {
      rsp = calibrate();
      if(rsp != OK) {
        printRsp(rsp);
      }
    }
    else if(strcmp(buf,"GET_WEIGHT\n") == 0) {
      printWeight();
    }
    else if(strcmp(buf,"GET_CALIBRATION\n") == 0) {
      printCalibration();
    }
    else if(strcmp(buf,"SET_CALIBRATION\n") == 0) {
      setCalibration();
    }
    else if(strcmp(buf,"GET_STATUS\n") == 0) {
      printStatus();
    }
    else if(strcmp(buf,"OPEN_AND_CONFIG_DEVICE\n") == 0) {
      rsp = setup();
      printRsp(rsp);
    }
    else if(strcmp(buf,"CLOSE_DEVICE\n") == 0) {
      rsp = closeDevice();
      printRsp(rsp);
    }
    else if(strcmp(buf,"TURN_RED_ON\n") == 0) {
      rsp = turnRedOn();
      printRsp(rsp);
    }
    else if(strcmp(buf,"TURN_RED_OFF\n") == 0) {
      rsp = turnRedOff();
      printRsp(rsp);
    }
    else if(strcmp(buf,"TURN_YELLOW_ON\n") == 0) {
      rsp = turnYellowOn();
      printRsp(rsp);
    }
    else if(strcmp(buf,"TURN_YELLOW_OFF\n") == 0) {
      rsp = turnYellowOff();
      printRsp(rsp);
    }
    else if(strcmp(buf,"EXIT\n") == 0) {
      pthread_mutex_lock(&mutexLoadCellStatus);
      if(loadCellStatus != UNINITIALIZED) {
        pthread_mutex_unlock(&mutexLoadCellStatus);
        closeDevice();
      }
      else {
        pthread_mutex_unlock(&mutexLoadCellStatus);
      }
      exit(0);
    }
  }
}

// Gets sample and converts to signed 32bit int
loadCellError_type getSample(int64_t* sample) {
  BYTE pReadBuf[4];
  DWORD pBytesActuallyRead;
  USB_SPI_STATUS retCode;
  struct timespec tim, tim2;
  tim.tv_sec = 0;
  tim.tv_nsec = 1000; // 1us
  *sample = 0; // Make sure sample is zero because will hold sum.
  
  // Switch through all cells, sampling each one and summing the samples.
  int i;
  for(i = 0; i < 4; i++) {
    //A
    retCode = CP213x_SetGpioModeAndLevel(0, GPIO_MODE_OUTPUT_PP, i & 1);
    if(retCode) {
      fprintf(stderr, "Failed SetGpioModeAndLevel with code: %d\n", retCode);
      return SWITCH_FAILED;
    }
    //B
    retCode = CP213x_SetGpioModeAndLevel(1, GPIO_MODE_OUTPUT_PP, (i & 2) >> 1);
    if(retCode) {
      fprintf(stderr, "Failed SetGpioModeAndLevel with code: %d\n", retCode);
      return SWITCH_FAILED;
    }
    
    // allow time to switch cell before sampling
    nanosleep(&tim, &tim2);
    
    retCode = CP213x_TransferReadSync(//phDevice,
                                      pReadBuf,
                                      4, // 4 bytes
                                      1, // release SPI bus
                                      1000, // timeout after a second
                                      &pBytesActuallyRead);
    if(retCode) {
      fprintf(stderr, "Failed TransferReadSync with code: %d\n", retCode);
     return READ_FAILED;
    }
    if(pBytesActuallyRead != 4) {
      fprintf(stderr, "Read wrong number of bytes from spi: %lu\n", pBytesActuallyRead);
      return READ_FAILED;
    }
    
    *sample += (int32_t)(((uint32_t)pReadBuf[0] << 24) | 
               ((uint32_t)pReadBuf[1] << 16) |
               ((uint32_t)pReadBuf[2] << 8));
  }
  return OK;
}

loadCellError_type getSamples(int64_t* samples, int numSamples) {
  // ADC chips convert every 100ms, so wait 110ms before converting again.
  int i;
  loadCellError_type ret;
  struct timespec tim, tim2;
  tim.tv_sec = 0;
  tim.tv_nsec = 110000000l; // 110ms
  for(i = 0; i < numSamples; i++) {
    ret = getSample(samples + i);
    if(ret != OK) {
      return ret;
    }
    nanosleep(&tim, &tim2);
  }
  return OK;
}

void setCalibration() {
  char buf[16];
  int valid = 0;
  double inputSlope, inputIntercept;
  pthread_mutex_lock(&mutexLoadCellStatus);
  while(loadCellStatus != IDLE && loadCellStatus != UNINITIALIZED) {
    waitingForSampleEnd =  1;
    pthread_cond_wait(&cvIdle, &mutexLoadCellStatus);
  }
  waitingForSampleEnd = 0;
  enum loadCellStatusEnum prevStatus = loadCellStatus;
  loadCellStatus = CALIBRATING;
  pthread_mutex_unlock(&mutexLoadCellStatus);
  
  if(fgets(buf, 16, stdin) == NULL) {
    fprintf(stderr, "Failed to read stdin. Or received EOF character\n");
    exit(-1);
  };
  if(sscanf(buf, "%lf", &inputSlope) != 1) {
    // Invalid. Return without changing calibration parameters
    pthread_mutex_lock(&mutexLoadCellStatus);
    loadCellStatus = prevStatus;
    if(waitingToSample) {
      pthread_cond_signal(&cvIdle);
    }
    pthread_mutex_unlock(&mutexLoadCellStatus);
    return;
  }
  
  if(fgets(buf, 16, stdin) == NULL) {
    fprintf(stderr, "Failed to read stdin. Or received EOF character\n");
    exit(-1);
  };
  if(sscanf(buf, "%lf", &inputIntercept) != 1) {
    // Invalid. Return without changing calibration parameters
    pthread_mutex_lock(&mutexLoadCellStatus);
    loadCellStatus = prevStatus;
    if(waitingToSample) {
      pthread_cond_signal(&cvIdle);
    }
    pthread_mutex_unlock(&mutexLoadCellStatus);
    return;
  }
  calSlope = inputSlope;
  calIntercept = inputIntercept;
  
  pthread_mutex_lock(&mutexLoadCellStatus);
  loadCellStatus = prevStatus;
  if(waitingToSample) {
    pthread_cond_signal(&cvIdle);
  }
  pthread_mutex_unlock(&mutexLoadCellStatus);
  
  saveCal();
}

loadCellError_type calibrate() {
  int valid = 0;
  char buf[16];
  double input, weight2;
  loadCellError_type ret;
  int64_t samples[10];
  int32_t calWeight1, calWeight2;
  
  pthread_mutex_lock(&mutexLoadCellStatus);
  if(loadCellStatus == UNINITIALIZED) {
    fprintf(stderr, "Load cell not initialized\n");
    pthread_mutex_unlock(&mutexLoadCellStatus);
    return WRONG_STATE;
  };
  
  while(loadCellStatus != IDLE) {
    waitingForSampleEnd =  1;
    pthread_cond_wait(&cvIdle, &mutexLoadCellStatus);
  }
  waitingForSampleEnd = 0;
  loadCellStatus = CALIBRATING;
  pthread_mutex_unlock(&mutexLoadCellStatus);
  
  printf("EMPTY_AND_PRESS_ENTER\n");
  if(fgets(buf, 16, stdin) == NULL) {
    fprintf(stderr, "Failed to read stdin. Or received EOF character\n");
    exit(-1);
  };
  ret = getSamples(samples, 10);
  if(ret != OK) {
    pthread_mutex_lock(&mutexLoadCellStatus);
    loadCellStatus = IDLE;
    if(waitingToSample) {
      pthread_cond_signal(&cvIdle);
    }
    pthread_mutex_unlock(&mutexLoadCellStatus);
    
    /* There was some error getting samples. Assume device was disconnected
       or there is something else wrong with it.
       Try to close device, which should change state to uninitialized.
    */
    closeDevice();
    return ret;
  }
  calWeight1 = quick_select(samples, 10);
  
  while(!valid) {
    printf("ENTER_CAL_WEIGHT\n");
    if(fgets(buf, 16, stdin) == NULL) {
      fprintf(stderr, "Failed to read stdin. Or received EOF character\n");
      exit(-1);
    };
    if(sscanf(buf, "%lf", &input) == 1) {
      valid = 1;
    }
  }
  weight2 = input;
  ret = getSamples(samples, 10);
  if(ret != OK) {
    pthread_mutex_lock(&mutexLoadCellStatus);
    loadCellStatus = IDLE;
    if(waitingToSample) {
      pthread_cond_signal(&cvIdle);
    }
    pthread_mutex_unlock(&mutexLoadCellStatus);
    
    /* There was some error getting samples. Assume device was disconnected
       or there is something else wrong with it.
       Try to close device, which should change state to uninitialized.
    */
    closeDevice();
    return ret;
  }
  calWeight2 = quick_select(samples, 10);
  
  calSlope = -weight2/((double)calWeight1 - (double)calWeight2);
  calIntercept = -calSlope*(double)calWeight1;
  
  printf("CALIBRATION_COMPLETE\n");
  printCalibration();
  pthread_mutex_lock(&mutexLoadCellStatus);
  loadCellStatus = IDLE;
  if(waitingToSample) {
    pthread_cond_signal(&cvIdle);
  }
  pthread_mutex_unlock(&mutexLoadCellStatus);
  
  saveCal();
  
  return OK;
}

void printWeight() {
  pthread_mutex_lock(&mutexLoadCellStatus);
  if(loadCellStatus == UNINITIALIZED) {
    pthread_mutex_unlock(&mutexLoadCellStatus);
    printf("NO_DEVICE_FOUND\n");
    return;
  }
  pthread_mutex_unlock(&mutexLoadCellStatus);

  pthread_mutex_lock(&mutexCurWeight);
  printf("%f\n", curWeight);
  pthread_mutex_unlock(&mutexCurWeight);
}

void printCalibration() {
  printf("%f\n%f\n",
         calSlope,
         calIntercept);
}

/* TEST FUNCTIONS */
int32_t voltage_mock[4] = {0};
int voltage_mock_index = 0;
USB_SPI_STATUS CP213x_TransferReadSync_Mock(BYTE pReadBuf[],
                             DWORD length,
                             BOOL releaseBusAfterTransfer,
                             DWORD timeoutMs,
                             DWORD* pBytesActuallyRead) {
  *pBytesActuallyRead = 4;
  pReadBuf[0] = (voltage_mock[voltage_mock_index] >> 16) & 0xff;
  pReadBuf[1] = ((uint32_t)(voltage_mock[voltage_mock_index]) >> 8) & 0xff;
  pReadBuf[2] = ((uint32_t)(voltage_mock)[voltage_mock_index]) & 0xff;
  return 0;
}

loadCellError_type getSample_Mock(int64_t* sample) {
  BYTE pReadBuf[4];
  DWORD pBytesActuallyRead;
  USB_SPI_STATUS retCode;
  struct timespec tim, tim2;
  tim.tv_sec = 0;
  tim.tv_nsec = 1000; // 1us
  *sample = 0; // Make sure sample is zero because will hold sum.
  
  // Switch through all cells, sampling each one and summing the samples.
  int i;
  for(i = 0; i < 4; i++) {
    voltage_mock_index = i;
    retCode = CP213x_TransferReadSync_Mock(//phDevice,
                                      pReadBuf,
                                      4, // 4 bytes
                                      1, // release SPI bus
                                      1000, // timeout after a second
                                      &pBytesActuallyRead);
//    printf("pReadBuf[0]: %d\npReadBuf[1]: %d\npReadBuf[2]: %d\n", pReadBuf[0], pReadBuf[1], pReadBuf[2]);
    *sample += (int32_t)(((uint32_t)pReadBuf[0] << 24) | 
               ((uint32_t)pReadBuf[1] << 16) |
               ((uint32_t)pReadBuf[2] << 8));
  }
  return OK;
}

getSample_Test() {
  int32_t i;
  int32_t j;
  int64_t sample;
  int64_t voltSum;
  for(i = -8388608; i < 8388607; i++) {
    voltSum = 0;
    for(j = 0; j < 4; j++) {
      voltage_mock[j] = i;
      voltSum += voltage_mock[j] << 8;
//      printf("voltage_mock[j] << 8: %d\nvoltSum: %d\n", voltage_mock[j] << 8, voltSum);
    }
    getSample_Mock(&sample);
    if(sample != voltSum) {
      printf("getSample_Test failed.\nvoltSum: %lld\nsample: %lld\nvoltage_mock[0]: %d\nvoltage_mock[1]: %d\nvoltage_mock[2]: %d\nvoltage_mock[3]: %d\n",
             voltSum, sample, voltage_mock[0], voltage_mock[1], voltage_mock[2], voltage_mock[3]);
      break;
    }
  }
}

int main(void) {
  setlinebuf(stdout);
  CP213x_Init();
  loadCal();
  pthread_mutex_init(&mutexCurWeight, NULL);
  pthread_mutex_init(&mutexLoadCellStatus, NULL);
  pthread_cond_init(&cvIdle, NULL);
  pthread_create(&samplingThread, NULL, &sampleForever, NULL);
  termIOLoop();

//  getSample_Test();
}
