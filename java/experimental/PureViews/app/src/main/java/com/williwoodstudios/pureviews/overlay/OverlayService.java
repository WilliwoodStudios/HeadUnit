package com.williwoodstudios.pureviews.overlay;

import android.app.Notification;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Intent;
import android.content.res.Configuration;
import android.os.IBinder;
import android.util.Log;

import com.williwoodstudios.pureviews.R;
import com.williwoodstudios.pureviews.Theme;
import com.williwoodstudios.pureviews.ThemeListener;

public class OverlayService extends Service {
    public static final String INTENT_DISABLE = "com.williwoodstudios.pureviews.overlay.disable";
    public static final String INTENT_ENABLE = "com.williwoodstudios.pureviews.overlay.enable";
    private static final String TAG = OverlayService.class.getName();
    private final static int FOREGROUND_ID = 999;
    private static OverlayService sInstance;
    private OverlayPermissionChecker mPermissionChecker;
    private OverlayManager mOverlayManager;
    private ThemeListener mThemeListener = new ThemeListener() {
        @Override
        public void themeUpdated() {
            if (mOverlayManager != null) {
                mOverlayManager.invalidate();
            }

        }
    };

    public static OverlayService getInstance() {
        return sInstance;
    }

    @Override
    public IBinder onBind(Intent intent) {
        Log.e(TAG, "On bind");
        return null;
    }

    @Override
    public void onCreate() {
        super.onCreate();
        Theme.subscribe(mThemeListener);
        sInstance = this;
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        final String action = intent != null ? intent.getAction() : INTENT_ENABLE;
        Log.e(TAG, "Service started: " + action);

        if (mPermissionChecker == null) {
            mPermissionChecker = new OverlayPermissionChecker(this);
        }
        boolean enable = INTENT_ENABLE.equals(action) || action == null;
        if (!mPermissionChecker.isRequiredPermissionGranted()) {
            if (enable && action != null) {
                Intent requestPermission = mPermissionChecker.createRequiredPermissionIntent();
                startActivity(requestPermission);
            }
            enable = false;
        }

        Notification notification = createNotification(!enable);

        if (enable) {
            initOverlay();
            mOverlayManager.setEnabled(true);
        } else {
            if (mOverlayManager != null) {
                mOverlayManager.setEnabled(false);
            }
        }

        startForeground(FOREGROUND_ID, notification);

        return START_STICKY;
    }

    @Override
    public void onDestroy() {
        stopForeground(true);
        Theme.unsubscribe(mThemeListener);
        if (sInstance == this) {
            sInstance = null;
        }
        if (mOverlayManager != null) {
            mOverlayManager.destroy();
        }
    }

    private void initOverlay() {
        if (mOverlayManager == null) {
            mOverlayManager = new OverlayManager(this);
        }
    }

    private Notification createNotification(boolean willEnable) {
        Intent intent = new Intent(willEnable ? INTENT_ENABLE : INTENT_DISABLE);
        PendingIntent pendingIntent = PendingIntent.getService(this, 0, intent, 0);
        Notification toReturn = new Notification.Builder(this)
                .setContentTitle(getText(R.string.overlay_notification_title))
                .setContentText(getText(willEnable ? R.string.overlay_notification_enable : R.string.overlay_notification_disable))
                .setSmallIcon(R.mipmap.ic_launcher)
                .setContentIntent(pendingIntent)
                .build();
        return toReturn;
    }

    @Override
    public void onConfigurationChanged(Configuration newConfig) {
        Log.e(TAG, "Configuration changed: " + newConfig);
        super.onConfigurationChanged(newConfig);
        if (mOverlayManager != null) {
            mOverlayManager.doLayout();
        }
    }
}

