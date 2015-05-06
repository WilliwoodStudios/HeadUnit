package com.williwoodstudios.android.brainiaconboardserver.log;

import com.workshoptwelve.brainiac.server.common.log.Log;
import com.workshoptwelve.brainiac.server.common.log.Logger;

/**
 * Created by robwilliams on 15-05-05.
 */
public class AndroidLogger implements Logger {
    @Override
    public void log(String toLog) {
        android.util.Log.e("BOSS", toLog);
    }

    @Override
    public boolean can(Log.Level level) {
        return true;
    }
}
