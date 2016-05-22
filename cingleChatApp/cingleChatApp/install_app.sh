#!/bin/bash
echo " > Installing app...";

rm -rf platforms;
rm -rf plugins;

ionic platform add ios;

cordova plugin add cordova-plugin-vibration;
cordova plugin add cordova-plugin-splashscreen;
cordova plugin add cordova-plugin-dialogs;
cordova plugin add phonegap-plugin-push --variable SENDER_ID="XXXXXXX"

bower install;

echo " > Done!";

