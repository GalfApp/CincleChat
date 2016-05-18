#!/bin/bash
echo " > Installing app...";

rm -rf platforms;
rm -rf plugins;

ionic platform add ios;

cordova plugin add cordova-plugin-vibration;
cordova plugin add cordova-plugin-splashscreen;
cordova plugin add https://github.com/phonegap-build/PushPlugin.git;

bower install;

echo " > Done!";

