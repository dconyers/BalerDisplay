Developer Readme
================
This document is in Markdown format. Please a markdown viewer for optimal viewing.

## Purpose
This document is designed to provide full instructions to allow a developer to get this project setup and running.

## Installation Requirements (Raspbian)
-------------------------
* Install [Node](https://nodejs.org/en/download/) - Version 2.3.4 or greater
  * For Raspbian, there are multiple ways to accomplish this, but this is the preferred way for our solution ([Reference](https://blog.wia.io/installing-node-js-v4-0-0-on-a-raspberry-pi)):
    * `wget https://nodejs.org/dist/v4.4.3/node-v4.4.3-linux-armv7l.tar.gz`
    * `tar -xvf node-v4.4.3-linux-armv7l.tar.gz`
    * `sudo cp -R node-v4.4.3-linux-armv7l/* /usr/local/`
* Git - Required access software repository
* USB Headers - Required for Load Cell Communication
  * `sudo apt-get install libusb-1.0-0-dev`
  * Setup udev configuration: `sudo cp configFiles/SiliconLabs.rules /etc/udev/rules.d/`
* Web Cam support ([Reference](https://www.raspberrypi.org/documentation/usage/webcams/))
  * `sudo apt-get install fswebcam`

## Cellular configuration
* Disable linux's usage of serial port.
  * `sudo systemctl stop serial-getty@ttyAMA0.service` # Stops service
  * `sudo systemctl disable serial-getty@ttyAMA0.service` # Disables service

* Need to allow user bjn to call pon and poff:
	`sudo cp configFiles/pppd /etc/sudoers.d/`

* Setup pppd:
  * `sudo cp configFiles/sim800 to /etc/ppp/peers/`
  * Note: script is currently setup to use Cricket network, application will need to turn off pppd and edit config file to change APN.
  * `sudo cp configFiles/1add-default-route /etc/ppp/ip-up.d/`

* Setup chatscript that pppd will use to issue AT commands:
  * `sudo cp configFiles/gprs to /etc/chatscripts/`
  * `sudo chgrp dip /etc/chatscripts/gprs`
  * `sudo chmod 664 /etc/chatscripts/gprs`
  * `sudo chmod 770 /etc/chatscripts`

* Need to add user to dialout group to access sim800 as serial port:
    `sudo usermod -a -G dialout bjn`

* Need to add user to dip group to access use pppd and modify configuration files.
  * `sudo usermod -a -G dip bjn`

* Install python-pip and pyserial to allow communication with AT commands:
  * `sudo apt-get install python-pip`
  * `pip install pyserial`

* Connection can be turned on and off with:
  * `sudo pon sim800`
  * `sudo poff sim800`
  
## Wifi configuration
* bjn user needs to be able to do multiple things in the /etc/NetworkManager/system-connections directory as root user. For now, just allowing bjn user to execute all sudo commands without password. WARNING: THIS IS VERY INSECURE. ESSENTIALLY, USER bjn HAS COMPLETE ROOT ACCESS. Should probably create a shell script that can do everything, and only allow bjn to execute this script without a password.
  * `sudo cp configFiles/wifi /etc/sudoers.d/`

In order to setup your development environment, run the following:
* Obtain the necessary Node dependencies - `npm install`
* Obtain the necessary Typescript Definitions - `npm run typings install`
* Build the addon - `npm run build_addon`
* Transcompile the Typescript to Javascript - `npm run tsc`
* Run the application - `npm start`

## Enable kiosk mode.
* Edit main.ts
`mainWindow = new BrowserWindow(
  {
    frame: false,
    fullscreen: true,
    kiosk: true
  }
);`

## TODO
This is a prototype. There are lots of things that need to be done to make this a production package:
* Add Comments / Function Headers
* Add Typescript Lint
* Add Logging Capabilities
* Add Unit Tests
* Make Chromium Developer Tools enabled/disabled via npm script.
* Add bootstrap
* ... and lots more!
