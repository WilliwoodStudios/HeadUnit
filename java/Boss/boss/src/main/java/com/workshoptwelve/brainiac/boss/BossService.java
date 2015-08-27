package com.workshoptwelve.brainiac.boss;

import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.os.IBinder;
import android.support.annotation.Nullable;

import com.workshoptwelve.brainiac.boss.common.content.ContentService;
import com.workshoptwelve.brainiac.boss.common.content.PropertyService;
import com.workshoptwelve.brainiac.boss.common.hardware.accessory.AccessoryService;
import com.workshoptwelve.brainiac.boss.common.hardware.obdii.OBDService;
import com.workshoptwelve.brainiac.boss.common.log.Log;
import com.workshoptwelve.brainiac.boss.common.multimedia.MultiMediaService;
import com.workshoptwelve.brainiac.boss.common.server.Server;
import com.workshoptwelve.brainiac.boss.hardware.accessory.AndroidAccessoryManager;
import com.workshoptwelve.brainiac.boss.hardware.obdii.AndroidOBDConnection;
import com.workshoptwelve.brainiac.boss.hardware.usb.BossUSBManager;
import com.workshoptwelve.brainiac.boss.log.AndroidLogger;

/**
 * Created by robwilliams on 15-07-25.
 */
public class BossService extends Service {
    static AndroidLogger sAndroidLogger;
    private static boolean sStarted;
    private static int sPort = -1;
    private IBoss.Stub mBinder = new IBoss.Stub() {
        public int getServerPort() {
            return sPort;
        }

        public String getVersion() {
            return "TBA";
        }
    };

    private static synchronized void initServices(Context context) {
        if (!sStarted) {
            Log.setLogger(sAndroidLogger = new AndroidLogger("boss"));

            ContentService.getInstance().setContentServiceImpl(new AndroidContentServiceImpl(context, "html/src"));
            MultiMediaService.getInstance().setMultiMediaServiceImpl(new AndroidMultiMediaService(context));
            OBDService.getInstance().setOBDConnection(new AndroidOBDConnection());
            AccessoryService.getInstance().setAccessoryManager(AndroidAccessoryManager.getInstance());
            PropertyService.getInstance().setPropertyServiceImpl(new AndroidPropertyServiceImpl(context));

            Server server = Server.getInstance();
            server.addService(MultiMediaService.getInstance());
            if (server.start()) {
                sPort = server.getPort();
            }

            BossUSBManager.getInstance().startup(context);

            sStarted = true;
        }
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return mBinder;
    }

    @Override
    public void onCreate() {
        super.onCreate();
        initServices(this);
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        return super.onStartCommand(intent, flags, startId);
    }

    @Override
    public void onLowMemory() {
        super.onLowMemory();
    }

    @Override
    public boolean onUnbind(Intent intent) {
        return super.onUnbind(intent);
    }

    @Override
    public void onRebind(Intent intent) {
        super.onRebind(intent);
    }


}
