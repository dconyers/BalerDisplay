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
* Obtain the necessary Node dependencies - `npm install`
* Obtain the necessary Typescript Definitions - `npm run typings install`
* Build the addon - `npm run build_addon`
* Transcompile the Typescript to Javascript - `npm run tsc`
* Run the application - `npm start`

## TODO
This is a prototype. There are lots of things that need to be done to make this a production package:
* Add Comments / Function Headers
* Add Typescript Lint
* Add Logging Capabilities
* Add Unit Tests
* Make Chromium Developer Tools enabled/disabled via npm script.
* Add bootstrap
* Add internationalization/localization
* ... and lots more!
