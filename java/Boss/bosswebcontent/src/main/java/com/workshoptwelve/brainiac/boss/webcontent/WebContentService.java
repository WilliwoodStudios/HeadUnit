package com.workshoptwelve.brainiac.boss.webcontent;

import android.app.Service;
import android.content.Intent;
import android.os.IBinder;
import android.os.ParcelFileDescriptor;
import android.os.RemoteException;
import android.support.annotation.Nullable;
import android.util.Log;

import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;

/**
 * Created by robwilliams on 15-07-24.
 */
public class WebContentService extends Service {
    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return mBinder;
    }

    @Override
    public void onCreate() {
        super.onCreate();
        log("onCreate");
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        log("onStartCommand");
        return super.onStartCommand(intent, flags, startId);
    }

    @Override
    public void onDestroy() {
        log("onDestroy");
        super.onDestroy();
    }

    @Override
    public boolean onUnbind(Intent intent) {
        log("onUnbind");
        return super.onUnbind(intent);
    }

    @Override
    public void onRebind(Intent intent) {
        log("onRebind");
        super.onRebind(intent);
    }

    private final IWebContent.Stub mBinder = new IWebContent.Stub() {
        @Override
        public int getWebContent(final String path, final ParcelFileDescriptor output) {
            int toReturn = 0;
            try {
                final InputStream inputStream = getAssets().open(path);
                new Thread() {
                    public void run() {
                        try {
                            log("Asking for asset");
                            try {
                                log("Asking for FS");
                                FileOutputStream outputStream = new FileOutputStream(output.getFileDescriptor());
                                try {
                                    byte[] buffer = new byte[20000];
                                    int readLength = 0;
                                    do {
                                        log("do");
                                        readLength = inputStream.read(buffer);
                                        if (readLength > 0) {
//                                        toReturn += readLength;
                                            log("pre write");
                                            outputStream.write(readLength>>24);
                                            outputStream.write(readLength>>16);
                                            outputStream.write(readLength>>8);
                                            outputStream.write(readLength);
                                            outputStream.write(buffer, 0, readLength);
                                            log("post write");
                                            outputStream.flush();
                                        }
                                        log("while");
                                    } while (readLength > 0);

                                    outputStream.write(0);
                                    outputStream.write(0);
                                    outputStream.write(0);
                                    outputStream.write(0);
                                } finally {
                                    log("o close");
                                    outputStream.close();
                                }
                            } finally {
                                log("i close");
                                inputStream.close();
                            }
                        } catch (
                                IOException ioe
                                ) {
                            log(ioe.getMessage());
                        } finally {
                            try {
                                log("output close");
                                output.close();
                            } catch (IOException ioe) {
                                // consume.
                            }
                        }
                    }
                }.start();
                return toReturn;
            } catch (IOException ioe) {
                return -1;
            }
        }
    };

    private void log(String message) {
        Log.e("SERVICE", message);
    }
}
