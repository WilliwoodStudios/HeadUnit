#!/bin/bash
rm *.apk
CROSSWALK=/Users/robwilliams/Library/Android/crosswalk-14.43.343.17
python $CROSSWALK/make_apk.py --app-versionCode=1 --package com.workshoptwelve.brainiac.ui --manifest=xwalk-simple/crosswalk.manifest.json --enable-remote-debugging
