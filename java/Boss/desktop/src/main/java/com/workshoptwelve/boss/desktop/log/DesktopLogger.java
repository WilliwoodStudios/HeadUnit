package com.workshoptwelve.boss.desktop.log;

import com.workshoptwelve.brainiac.boss.common.log.Log;
import com.workshoptwelve.brainiac.boss.common.log.Logger;

/**
 * Created by robwilliams on 15-04-10.
 */
public class DesktopLogger extends Logger {
    @Override
    protected void rawLog(Log.Level level, StringBuilder toLog) {
        System.out.println(toLog);
    }

    @Override
    protected void getPrefix(Log.Level level, StringBuilder prefix) {
        prefix.append(System.currentTimeMillis());
        prefix.append(" ");
        prefix.append(level.toString());
        prefix.append(" ");
        getTrace(prefix);
        prefix.append(":");
    }
}
