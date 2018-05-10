package com.williwoodstudios.pureviews.overlay;

import android.annotation.TargetApi;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;

/**
 * This class queries M+ to see if permission has been granted to create overlays.
 */
public class OverlayPermissionChecker {
    private Context mContext;

    public OverlayPermissionChecker(Context context) {
        mContext = context;
    }

    @TargetApi(Build.VERSION_CODES.M)
    public boolean isRequiredPermissionGranted() {
        if (isMarshmallowOrHigher()) {
            return Settings.canDrawOverlays(mContext);
        }
        return true;
    }

    @TargetApi(Build.VERSION_CODES.M)
    public Intent createRequiredPermissionIntent() {
        if (isMarshmallowOrHigher()) {
            Intent intent = new Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                    Uri.parse("package:" + mContext.getPackageName()));
            return intent;
        }
        return null;
    }

    private boolean isMarshmallowOrHigher() {
        return android.os.Build.VERSION.SDK_INT >= Build.VERSION_CODES.M;
    }
}
