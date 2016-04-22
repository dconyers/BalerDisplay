all:
#	gcc -Wl,-rpath=loadCell -g -O1 loadCell.c libslab_usb_spi.so.1.0 -lpthread -o loadCell
	gcc -O3 -march=native -mtune=native loadCell.c MY_SLAB_USB_SPI.c -lpthread -lusb-1.0 -o loadCell

