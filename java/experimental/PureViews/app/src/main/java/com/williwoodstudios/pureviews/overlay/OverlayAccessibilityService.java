package com.williwoodstudios.pureviews.overlay;

import android.accessibilityservice.AccessibilityService;
import android.util.Log;
import android.view.accessibility.AccessibilityEvent;
import android.widget.Toast;

import com.williwoodstudios.pureviews.R;

/**
 * This class is an AccessibilityService that exists just to issue events like "HOME" and "BACK".
 */
public class OverlayAccessibilityService extends AccessibilityService {
    public static final String TAG = OverlayAccessibilityService.class.getName();
    private static OverlayAccessibilityService sInstance;

    public OverlayAccessibilityService() {
        super();
    }

    public static void performActionForType(OverlayManager.OverlayType type) {
        if (sInstance != null) {
            boolean result = sInstance.performGlobalAction(type.getAction());
            if (!result) {
                Log.e(TAG,"Could not perform requested global action");
            }
        } else {
            Log.e(TAG, "Not performing any action; there's no service installed");
            Toast.makeText(OverlayService.getInstance(), R.string.accessibility_service_not_installed, Toast.LENGTH_LONG).show();
        }
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        if (sInstance == this) {
            sInstance = null;
        }
    }

    @Override
    public void onCreate() {
        super.onCreate();
        sInstance = this;
    }

    @Override
    public void onAccessibilityEvent(AccessibilityEvent event) {
        // do nothing.
    }

    @Override
    public void onInterrupt() {
        // do nothing.
    }
}
