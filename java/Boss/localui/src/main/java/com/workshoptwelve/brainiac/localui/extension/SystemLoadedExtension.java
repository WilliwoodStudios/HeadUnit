package com.workshoptwelve.brainiac.localui.extension;

import android.content.Context;

import org.xwalk.core.XWalkExtension;

/**
 * Created by robwilliams on 15-10-09.
 */
public class SystemLoadedExtension extends XWalkExtension {
    private SystemLoadedListener mListener;

    public interface SystemLoadedListener {
        void onSystemLoaded();
    }

    private static final String NAME = "brainiacSystemLoaded";
    private static final String JS_API = "exports.systemLoaded = function() { extension.postMessage(\"\"); };";

    public SystemLoadedExtension(Context context) {
        super(NAME,JS_API);
    }

    public void setSystemLoadedListener(SystemLoadedListener listener) {
        mListener = listener;
    }

    @Override
    public void onMessage(int i, String s) {
        if (mListener != null) {
            mListener.onSystemLoaded();
        }
    }

    @Override
    public String onSyncMessage(int i, String s) {
        return null;
    }
}
