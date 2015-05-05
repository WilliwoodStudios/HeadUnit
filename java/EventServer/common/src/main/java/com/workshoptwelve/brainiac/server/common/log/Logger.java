package com.workshoptwelve.brainiac.server.common.log;

/**
 * Created by robwilliams on 15-04-10.
 */
public interface Logger {
    void log(String toLog);

    boolean can(Log.Level level);
}
