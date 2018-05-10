package com.williwoodstudios.pureviews.overlay;

import android.accessibilityservice.AccessibilityService;
import android.content.Context;
import android.view.WindowManager;

import java.util.Vector;

/**
 * This class manages the overlays that make up the on-screen controls.
 */
public class OverlayManager {
    private WindowManager mWindowManager;
    private Context mContext;

    private Vector<OverlayTargetView> mTargets;

    public OverlayManager(Context context) {
        mContext = context;
        mTargets = new Vector<>();
        mWindowManager = (WindowManager) mContext.getSystemService(Context.WINDOW_SERVICE);
        for (OverlayType type : OverlayType.values()) {
            OverlayTargetView toAdd = new OverlayTargetView(mContext, mWindowManager, type);
            mTargets.add(toAdd);
        }
    }

    public void invalidate() {
        for (OverlayTargetView view : mTargets) {
            view.invalidate();
        }
    }

    public void doLayout() {
        for (OverlayTargetView view : mTargets) {
            view.doLayout();
        }
    }

    public void setEnabled(boolean enabled) {
        for (OverlayTargetView view : mTargets) {
            view.setEnabled(enabled);
        }
    }

    public void destroy() {
        try {
            for (OverlayTargetView view : mTargets) {
                mWindowManager.removeView(view);
            }
            mTargets.clear();
        } catch (Throwable t) {
            // consume.
        }
    }

    public enum OverlayType {
        BACK(AccessibilityService.GLOBAL_ACTION_BACK),
        APP_SWITCH(AccessibilityService.GLOBAL_ACTION_RECENTS),
        HOME(AccessibilityService.GLOBAL_ACTION_HOME);

        private final int mAction;

        OverlayType(int action) {
            mAction = action;
        }

        public int getAction() {
            return mAction;
        }
    }
}
