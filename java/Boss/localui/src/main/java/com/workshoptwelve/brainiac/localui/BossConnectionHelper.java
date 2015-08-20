package com.workshoptwelve.brainiac.localui;

import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.ServiceConnection;
import android.os.Handler;
import android.os.IBinder;
import android.os.RemoteException;
import android.util.Log;

import com.workshoptwelve.brainiac.boss.IBoss;
import com.workshoptwelve.brainiac.boss.common.util.ForEachList;

/**
 * Created by robwilliams on 15-07-31.
 */
public class BossConnectionHelper {
    /**
     * The connection to the Boss service.
     */
    private IBoss mBoss;
    /**
     * The handler managing this helper.
     */
    private Handler mHandler;
    private int mServerPort;
    private Runnable mFindServerPort = new Runnable() {
        public void run() {
            Log.v("LOCALUI", "find server port");
            if (mBoss != null) {
                int serverPort = -1;
                try {
                    serverPort = mBoss.getServerPort();
                    Log.v("LOCALUI", "Port: " + serverPort);
                } catch (RemoteException re) {
                    // consume.
                }
                if (serverPort < 1) {
                    mHandler.postDelayed(this, 100);
                } else {
                    mServerPort = serverPort;
                    mHandler.postDelayed(mOpenContent, 0);
                }
            }
        }
    };
    private ServiceConnection mServiceConnection = new ServiceConnection() {
        @Override
        public void onServiceConnected(ComponentName name, IBinder service) {
            Log.v("LOCALUI", "Service connected");
            mBoss = IBoss.Stub.asInterface(service);
            mHandler.postDelayed(mFindServerPort, 0);
        }

        @Override
        public void onServiceDisconnected(ComponentName name) {
            Log.e("LOCALUI", "Uh oh");
        }
    };
    private BossConnectionHelper sInstance = new BossConnectionHelper();
    private Context mContext;
    private ForEachList<BossConnectionListener> mListeners = new ForEachList<>();

    private Runnable mConnectToService = new Runnable() {
        public void run() {
            if (mBoss == null) {
                Intent intent = new Intent("com.workshoptwelve.brainiac.bitch.SERVICE");
                intent.setPackage("com.workshoptwelve.brainiac.bitch");
                mContext.startService(intent);
                mContext.bindService(intent, mServiceConnection, Context.BIND_AUTO_CREATE);
            }
        }
    };

    public BossConnectionHelper getInstance() {
        return sInstance;
    }

    public void init(Context context) {
        if (mContext != context) {
            mContext = context;
            if (mHandler != null) {
                mHandler = new Handler();
            }
            mHandler.postDelayed(mConnectToService, 0);
        }
    }

    public void addBossConnectionListener(BossConnectionListener listener) {
        mListeners.addSingle(listener);
    }

    public void removeBossConnectionListener(BossConnectionListener listener) {
        mListeners.removeEach(listener);
    }

    public interface BossConnectionListener {
        void onBossConnectionAvailable();
    }

}
