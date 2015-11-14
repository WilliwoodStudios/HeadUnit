package com.workshoptwelve.brainiac.boss.util;

import com.workshoptwelve.brainiac.boss.common.log.Log;

/**
 * Created by robwilliams on 2015-10-13.
 */
public abstract class VerboseRunnable implements Runnable {
    private static Log log = Log.getLogger(VerboseRunnable.class);

    public VerboseRunnable(String name) {
        mName = name;
    }

    public final void run() {
//        try {
//            log.e("}}}}}} Entering",mName);
            loggedRun();
//        } finally {
//            log.e("{{{{{{ Exitting",mName);
//        }
    }

    private String mName;

    public abstract void loggedRun();
}
