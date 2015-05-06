package com.workshoptwelve.server.desktop.log;

import com.workshoptwelve.brainiac.server.common.log.Log;
import com.workshoptwelve.brainiac.server.common.log.Logger;

/**
 * Created by robwilliams on 15-04-10.
 */
public class DesktopLogger extends Logger {
    @Override
    protected void rawLog(Level level, StringBuilder toLog) {
        System.out.println(toLog);
    }

    @Override
    protected void getPrefix(Level level, StringBuilder prefix) {
        prefix.append("DESKTOP LOGGER NEEDS WORK");
    }
}
