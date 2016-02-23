Developer Readme
================
This document is in Markdown format. Please a markdown viewer for optimal viewing.

## Purpose
This document is designed to provide full instructions to allow a developer to get this project setup and running.

## Installation Requirements
-------------------------
* intall [Node](https://nodejs.org/en/download/) - Version 2.3.4 or greater
* Git - In order to access software repository

## Setup
In order to setup your development environment, run the following:
* Obtain the necessary dependencies - `npm install`
* Run the application - `npm start`

## Building Addon
In order for the addon to work with electron, the following command must be used to build:
`HOME=~/.electron-gyp node-gyp rebuild --target=0.36.7  --dist-url=https://atom.io/download/atom-shell`

## TODO
This is a prototype. There are lots of things that need to be done to make this a production package:
* Convert to Typescript
* Add Logging Capabilities
* Add Unit Tests
* Make Chromium Developer Tools enabled/disabled via npm script.
* Add bootstrap
* Add internationalization/localization
* ... and lots more!
