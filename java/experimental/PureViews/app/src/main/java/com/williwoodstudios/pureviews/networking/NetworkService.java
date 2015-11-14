package com.williwoodstudios.pureviews.networking;

import android.app.Service;
import android.content.Intent;
import android.os.IBinder;
import android.os.Looper;
import android.support.annotation.Nullable;
import android.util.Log;

import java.io.InputStream;
import java.net.ServerSocket;
import java.net.Socket;

/**
 * Created by robwilliams on 2015-11-13.
 */
public class NetworkService extends Service {
    private ServerSocket mServerSocket;

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public void onCreate() {
        super.onCreate();
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
    }

    @Override
    public void onStart(Intent intent, int startId) {
        super.onStart(intent, startId);
        handleStart();
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        handleStart();
        return super.onStartCommand(intent, flags, startId);
    }
    private Thread mThread;

    @Override
    public boolean stopService(Intent name) {
        if (mThread != null && mServerSocket!=null) {
            mThread = null;
            try {
                mServerSocket.close();
            } catch (Throwable t) {
                // consume
            }
            mServerSocket = null;
        }
        return super.stopService(name);
    }

    public synchronized void handleStart() {
        if (mThread == null) {
            mThread = new Thread() {
                public void run() {
                    handleThread();
                }
            };
            mThread.start();
        }
    }

    private void handleThread() {
        try {
            mServerSocket = new ServerSocket(12345);
            while(true) {
                final Socket client = mServerSocket.accept();
                new Thread() {
                    public void run() {
                        handleClient(client);
                    }
                }.start();
            }
        } catch (Exception e) {
            Log.e("NetworkService","Failed handle thread",e);
        }
    }


    private static Byte sNextCommand;

    public static Byte getNextCommand() {
        Byte toReturn = sNextCommand;
        sNextCommand = null;
        return toReturn;
    }

    private void handleClient(Socket client) {
        try {
            InputStream in = client.getInputStream();
            byte [] buffer = new byte[20000];
            while(true) {
                int readLength = in.read(buffer);
                if (readLength==-1) {
                    client.close();
                    break;
                }
                for (int i=0; i<readLength; ++i) {
                    if (buffer[i] >' ' && buffer[i]<=127) {
                        sNextCommand = buffer[i];
                    }
                }
                Log.e("NetworkService","Read data");
            }
        } catch (Exception e) {
            Log.e("NetworkService","Failed handle client",e);
        }
    }
}
