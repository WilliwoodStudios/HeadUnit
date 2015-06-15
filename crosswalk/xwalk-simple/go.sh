#!/bin/bash
rm *.apk
python /Users/robwilliams/Library/Android/crosswalk-13.42.319.11/make_apk.py --app-versionCode=1 --package com.workshoptwelve.brainiac --manifest=crosswalk.manifest.json --enable-remote-debugging
