package com.workshoptwelve.brainiac.boss;

import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.ServiceConnection;
import android.os.Handler;
import android.os.IBinder;
import android.os.ParcelFileDescriptor;
import android.os.RemoteException;

import com.workshoptwelve.brainiac.boss.common.content.AContentServiceImpl;
import com.workshoptwelve.brainiac.boss.common.log.Log;
import com.workshoptwelve.brainiac.boss.common.server.stream.HttpOutputStream;
import com.workshoptwelve.brainiac.boss.webcontent.IWebContent;

import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;

/**
 * Created by robwilliams on 15-05-05.
 */
public class AndroidContentServiceImpl extends AContentServiceImpl {
    private final Handler mHandler;
    private Log log = Log.getLogger(AndroidContentServiceImpl.class);


    private final Context mContext;
    private IWebContent mWebContentService;
    private final ServiceConnection mServiceConnection = new ServiceConnection() {

        @Override
        public void onServiceConnected(ComponentName name, IBinder service) {
            mWebContentService = IWebContent.Stub.asInterface(service);
            log.v("Service connected");
        }

        @Override
        public void onServiceDisconnected(ComponentName name) {
            mWebContentService = null;
            log.e("Service disconnected");
            mHandler.postDelayed(mConnectService,1000);
        }
    };

    private Runnable mConnectService = new Runnable() {
        public void run() {
            log.v("Attempt to reconnect service");
            connectService();
            mHandler.postDelayed(mCheckService, 1000);
        }
    };

    private Runnable mCheckService = new Runnable() {
        public void run() {
            log.v("Checking Service");
            if (mWebContentService == null) {
                mHandler.postDelayed(mConnectService, 100);
            }
        }
    };

    public AndroidContentServiceImpl(Context context, String s) {
        super();
        mContext = context;
        mHandler = new Handler();
        mHandler.postDelayed(mConnectService, 0);
    }

    private void connectService() {
        synchronized (this) {
            if (mWebContentService != null) {
                return;
            }
        }
        log.v("ConnectService()");
        Intent serviceIntent = new Intent("com.workshoptwelve.brainiac.boss.WEBCONTENT");
        serviceIntent.setPackage("com.workshoptwelve.brainiac.boss.webcontent");
        mContext.startService(serviceIntent);
        mContext.bindService(serviceIntent, mServiceConnection, Context.BIND_AUTO_CREATE);
    }

    @Override
    public void sendPathToStream(String path, HttpOutputStream outputStream) throws IOException {
        if (mWebContentService == null) {
            outputStream.setResponse(503, "Service Missing");
        } else {
            ParcelFileDescriptor[] pipe = ParcelFileDescriptor.createPipe();
            try {
                int length = mWebContentService.getWebContent(path, pipe[1]);
                if (length >= 0) {
                    outputStream.setResponse(200, "OK");
                    FileInputStream fis = new FileInputStream(pipe[0].getFileDescriptor());
                    try {
                        stream32ToStream(fis, outputStream);
                    } finally {
                        fis.close();
                    }
                } else {
                    outputStream.setResponse(404,"File not found");
                }
            } catch (RemoteException re) {
                outputStream.setResponse(404, "Content not found (" + re.getMessage() + ")");
            } finally {
                try {
                    pipe[0].close();
                } catch (IOException ioe) {
                    // ignore.
                }
                try {
                    pipe[1].close();
                } catch (IOException ioe) {
                    // ignore.
                }
            }
        }
    }

    private void stream32ToStream(InputStream in, OutputStream out) throws IOException {
        byte[] buffer = new byte[20000];
        outer:
        while (true) {
            int length = ((in.read() & 0xff) << 24) | ((in.read() & 0xff) << 16) | ((in.read() & 0xff) << 8) | ((in.read() & 0xff));
            if (length == 0) {
                break;
            }
            int remaining = length;
            while (remaining > 0) {
                int readLength = in.read(buffer, length - remaining, remaining);
                if (readLength < 0) {
                    break outer;
                }
                remaining -= readLength;
            }
            out.write(buffer, 0, length);
            out.flush();
        }
    }
}
