Developer Readme
================
This document is in Markdown format. Please a markdown viewer for optimal viewing.

## Purpose
This document is designed to provide full instructions to allow a developer to get this project setup and running.

## Pi Image Configuration
  We're using [Ubuntu Mate 16.04 LTS](https://ubuntu-mate.org/download/#xenial) for the base operating system.

  Please see [this link](https://ubuntu-mate.org/raspberry-pi/) for instructions on creating the microSDHC image on Windows.

  Once the image is written to the sdhc, install in the Pi3 and boot.

  For simplicity, set the username/password to baler/baler

  The last step looks like a promotional page, but is actually a loading page, so wait for the loading to complete and then the Pi will be ready to use.

At this point, it's recommend to go ahead and upgrade the system as well:  
`sudo apt update`  
`sudo apt full-upgrade`

## Pi WiFi configuration
  Pi3 includes built-in wireless. Using the UI, add the Pi3 to the wireless network and note the IP address assigned (ifconfig -a). In some cases, it may require an additional reboot to get the WiFi card to be fully recognized and loaded.

## Pi SSH configuration
  Openssh-server is pre-installed in the Ubuntu-Mate distribution for Pi. Otherwise, run the following command using [this reference](https://help.ubuntu.com/lts/serverguide/openssh-server.html) to install OpenSSH Server:   `sudo apt install openssh-server`

## Installation Requirements (Ubuntu-Mate)
* Install [Node](https://nodejs.org/en/download/) - Version 2.3.4 or greater
    * For Ubuntu-Mate running on a Pi, there are multiple ways to accomplish this, but this is the preferred way for our Msolution ([Reference](https://blog.wia.io/installing-node-js-v4-0-0-on-a-raspberry-pi)):
      * `wget https://nodejs.org/dist/v4.4.3/node-v4.4.3-linux-armv7l.tar.gz`
      * `tar -xvf node-v4.4.3-linux-armv7l.tar.gz`
      * `sudo cp -R node-v4.4.3-linux-armv7l/* /usr/local/`
  * Git - Required access software repository
    * `sudo apt install git`


## Obtain Source Code
`git clone https://github.com/dconyers/BalerDisplay.git`

## Baler Native Software
* USB Headers - Required for Load Cell Communication
  * `sudo apt-get install libusb-1.0-0-dev`
  * Setup udev configuration: `sudo cp ~/BalerDisplay/piSetup/configFiles/SiliconLabs.rules /etc/udev/rules.d/`
  * Build the addon - `npm run build_addon`  
    * You may need to install g++ if it's not already installed `sudo apt install build-essential`  

## Baler Display (Nodejs) Software
In order to setup your development environment, run the following:  

* Obtain the necessary Node dependencies - `npm install`  
* Obtain the necessary Typescript Definitions - `npm run typings install`  
* Transcompile the Typescript to Javascript - `npm run tsc`  
* Run the application - `npm start`  

## Web Cam Setup
* Web Cam support ([Reference](https://www.raspberrypi.org/documentation/usage/webcams/))
  * `sudo apt-get install fswebcam`

## Disable Display Manager
This portion of the guide is based on [this link](http://askubuntu.com/questions/679419/how-to-make-auto-login-work-in-ubuntu-no-display-manager).  
Run the following:

    sudo systemctl disable lightdm
    sudo mkdir -pv /etc/systemd/system/getty@tty1.service.d/
    sudo install -b -m 755 /dev/stdin /etc/systemd/system/getty@tty1.service.d/autologin.conf << EOF
    [Service]
    ExecStart=
    ExecStart=-/sbin/agetty --autologin baler --noclear %I 38400 linux
    EOF

    systemctl enable getty@tty1.service
    install -b -m 755 /dev/stdin ~baler/.bash_profile << EOF
    if [[ -z "\$DISPLAY" ]] && [[ \$(tty) = /dev/tty1 ]]; then
      exec startx -- -nocursor
    fi
    EOF

    install -b -m 755 /dev/stdin ~baler/.xinitrc << EOF
    xset s off
    xset -dpms
    xset s noblank
    cd BalerDisplay/app && npm start
    EOF

  ... This disables the main display manager and starts X11 with only the BalerDisplay app running.

## Cellular configuration
* Disable linux's usage of serial port.
  * `sudo systemctl stop serial-getty@ttyAMA0.service` # Stops service
  * `sudo systemctl disable serial-getty@ttyAMA0.service` # Disables service

* Need to fix core_freq to allow for reliable UART communication
  * `sudo cp configFiles/config.txt /boot`

* Need to allow user bjn to call pon and poff:
	`sudo cp configFiles/pppd /etc/sudoers.d/`

* Setup pppd:
  * `sudo cp configFiles/sim800 /etc/ppp/peers/`
  * Note: script is currently setup to use Cricket network, application will need to turn off pppd and edit config file to change APN.
  * `sudo cp configFiles/1add-default-route /etc/ppp/ip-up.d/`

* Setup chatscript that pppd will use to issue AT commands:
  * `sudo cp configFiles/gprs /etc/chatscripts/`
  * `sudo chgrp dip /etc/chatscripts/gprs`
  * `sudo chmod 664 /etc/chatscripts/gprs`
  * `sudo chmod 770 /etc/chatscripts`

* Need to add user to dialout group to access sim800 as serial port:
    `sudo usermod -a -G dialout baler`

* Need to add user to dip group to access use pppd and modify configuration files.
  * `sudo usermod -a -G dip baler`

* Install python-pip and pyserial to allow communication with AT commands:
  * `sudo apt-get install python-pip`
  * `pip install pyserial`

* Connection can be turned on and off with:
  * `sudo pon sim800`
  * `sudo poff sim800`

## Wifi configuration
* bjn user needs to be able to do multiple things in the /etc/NetworkManager/system-connections directory as root user. For now, just allowing bjn user to execute all sudo commands without password. WARNING: THIS IS VERY INSECURE. ESSENTIALLY, USER bjn HAS COMPLETE ROOT ACCESS. Should probably create a shell script that can do everything, and only allow bjn to execute this script without a password.
  * `sudo cp configFiles/wifi /etc/sudoers.d/`


## Enable kiosk mode.
* Edit main.ts
`mainWindow = new BrowserWindow(
  {
    frame: false,
    fullscreen: true,
    kiosk: true
  }
);`

## Printer configuration
* `sudo apt-get install imagemagick`
* `sudo service cups stop`
* `sudo apt-get install hplip --reinstall`
* `sudo cp configFiles/printers.conf /etc/cups/`
* `sudo cp configFiles/Zebra_Technologies_ZTC_GK420t.ppd /etc/cups/ppd/`
* `sudo service cups start`

## TODO
This is a prototype. There are lots of things that need to be done to make this a production package:
* Add Comments / Function Headers
* Add Typescript Lint
* Add Logging Capabilities
* Add Unit Tests
* Make Chromium Developer Tools enabled/disabled via npm script.
* ... and lots more!
