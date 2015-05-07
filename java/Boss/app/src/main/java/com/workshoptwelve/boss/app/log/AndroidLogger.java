package com.workshoptwelve.boss.app.log;

import android.util.Log;

import com.workshoptwelve.brainiac.boss.common.log.Logger;
import com.workshoptwelve.brainiac.boss.common.log.Log.Level;

/**
 * Created by robwilliams on 15-05-05.
 */
public class AndroidLogger extends Logger {
    private final String mTag;

    public AndroidLogger(String tag) {
        mTag = tag;
    }
    
    @Override
    protected void rawLog(Level level, StringBuilder toLog) {
        switch(level) {
            case d:
                Log.d(mTag,toLog.toString());
                break;
            case i:
                Log.e(mTag,toLog.toString());
                break;
            case v:
                Log.v(mTag,toLog.toString());
                break;
            case w:
                Log.w(mTag,toLog.toString());
                break;
            case e:
                Log.e(mTag,toLog.toString());
                break;
        }
    }

    @Override
    protected void getPrefix(Level level, StringBuilder prefix) {
        getTrace(prefix);
        prefix.append(": ");
    }
}
