package com.workshoptwelve.brainiac.boss.util;

import android.os.Handler;

/**
 * Created by robwilliams on 2015-10-13.
 */
public class VerboseHandler {
    private final Handler mImpl;

    public VerboseHandler() {
        this(new Handler());
    }

    public VerboseHandler(Handler impl) {
        mImpl = impl;
    }

    public void removeCallbacks(VerboseRunnable r) {
        mImpl.removeCallbacks(r);
    }

    public void post(VerboseRunnable r) {
        mImpl.post(r);
    }

    public void postDelayed(VerboseRunnable runnable, int i) {
        mImpl.postDelayed(runnable, i);
    }
}
