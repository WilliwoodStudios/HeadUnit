package com.williwoodstudios.pureviews;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;

import com.williwoodstudios.pureviews.BrainiacLayout;

/**
 * Created by brcewane on 2018-05-27.
 */

public class AppManagerReceiver extends BroadcastReceiver {
    private BrainiacLayout mBrainiacLayout;

    public AppManagerReceiver(BrainiacLayout layout) {
        super();
        mBrainiacLayout = layout;
    }

    @Override
    public void onReceive (Context context, Intent intent) {
        final String action = intent.getAction();
        if (action.equals(Intent.ACTION_PACKAGE_ADDED) || action.equals(Intent.ACTION_PACKAGE_REMOVED)) {
            mBrainiacLayout.refreshAppGrid();
        }
    }
}
