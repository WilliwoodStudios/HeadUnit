package com.workshoptwelve.server.desktop.log;

import com.workshoptwelve.brainiac.server.common.log.Log;
import com.workshoptwelve.brainiac.server.common.log.Logger;

/**
 * Created by robwilliams on 15-04-10.
 */
public class DesktopLogger implements Logger {
    @Override
    public void log(String toLog) {
        System.out.println(toLog);
    }

    @Override
    public boolean can(Log.Level level) {
        return true;
    }
}
