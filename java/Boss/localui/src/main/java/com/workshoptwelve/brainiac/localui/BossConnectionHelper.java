package com.workshoptwelve.brainiac.localui;

import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.ServiceConnection;
import android.os.Handler;
import android.os.IBinder;
import android.os.RemoteException;

import com.workshoptwelve.brainiac.boss.IBoss;
import com.workshoptwelve.brainiac.boss.common.log.Log;
import com.workshoptwelve.brainiac.boss.common.util.ForEachList;

/**
 * Created by robwilliams on 15-07-31.
 */
public class BossConnectionHelper {
    private static final Log log = Log.getLogger(BossConnectionHelper.class);
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
            log.e("find server port");
            if (mBoss != null) {
                int serverPort = -1;
                try {
                    serverPort = mBoss.getServerPort();
                    log.e("port: " + serverPort);
                } catch (RemoteException re) {
                    // consume.
                }
                if (serverPort < 1) {
                    mHandler.postDelayed(this, 100);
                } else {
                    mServerPort = serverPort;
                    mHandler.postDelayed(mSafeToOpenContent, 0);
                }
            }
        }
    };

    public int getServerPort() {
        return mServerPort;
    }

    private Runnable mSafeToOpenContent = new Runnable() {
        public void run() {
            mListeners.forEach(new ForEachList.ForEach<BossConnectionListener>() {
                @Override
                public void go(BossConnectionListener item) {
                    item.onBossConnectionAvailable();
                }
            });
        }
    };
    private ServiceConnection mServiceConnection = new ServiceConnection() {
        @Override
        public void onServiceConnected(ComponentName name, IBinder service) {
            log.e("Service connected");
            mBoss = IBoss.Stub.asInterface(service);
            mHandler.postDelayed(mFindServerPort, 0);
        }

        @Override
        public void onServiceDisconnected(ComponentName name) {
            log.e("uh oh");
        }
    };
    private static BossConnectionHelper sInstance = new BossConnectionHelper();
    private Context mContext;
    private ForEachList<BossConnectionListener> mListeners = new ForEachList<>();

    private Runnable mConnectToService = new Runnable() {
        public void run() {
            log.e("Going to try and connect");
            if (mBoss == null) {
                Intent intent = new Intent("com.workshoptwelve.brainiac.boss.SERVICE");
                intent.setPackage("com.workshoptwelve.brainiac.boss");
                ComponentName componentName = mContext.startService(intent);
                if (componentName == null) {
                    mHandler.postDelayed(mNoService,0);

                } else {
                    mContext.bindService(intent, mServiceConnection, Context.BIND_AUTO_CREATE);
                }
            }
        }
    };

    private Runnable mNoService = new Runnable() {
        public void run() {
            log.e("Service not available");
            mListeners.forEach(new ForEachList.ForEach<BossConnectionListener>() {
                @Override
                public void go(BossConnectionListener item) {
                    item.onBossServicesNotAvailable();
                }
            });
        }
    };

    public static BossConnectionHelper getInstance() {
        return sInstance;
    }

    public void init(Context context) {
        if (mContext != context) {
            mContext = context;
            if (mHandler == null) {
                mHandler = new Handler();
            }
            log.e("Posting connect to service");
            mHandler.postDelayed(mConnectToService, 0);
        }
    }

    public void addBossConnectionListener(BossConnectionListener listener) {
        mListeners.addSingle(listener);
        log.e("Adding a connection listener");
    }

    public void removeBossConnectionListener(BossConnectionListener listener) {
        mListeners.removeEach(listener);
    }

    public interface BossConnectionListener {
        void onBossConnectionAvailable();
        void onBossServicesNotAvailable();
    }

}
