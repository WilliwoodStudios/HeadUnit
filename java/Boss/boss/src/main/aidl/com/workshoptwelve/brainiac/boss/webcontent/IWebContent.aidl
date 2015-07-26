// IWebContent.aidl
package com.workshoptwelve.brainiac.boss.webcontent;

// Declare any non-default types here with import statements

import android.os.ParcelFileDescriptor;

interface IWebContent {
    int getWebContent(in String path, in ParcelFileDescriptor output);
}
