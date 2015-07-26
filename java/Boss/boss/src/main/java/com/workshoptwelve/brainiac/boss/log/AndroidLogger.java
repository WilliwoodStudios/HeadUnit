package com.workshoptwelve.brainiac.boss.log;

import android.util.Log;

import com.workshoptwelve.brainiac.boss.common.log.Log.Level;
import com.workshoptwelve.brainiac.boss.common.log.Logger;

/**
 * Created by robwilliams on 15-05-05.
 */
public class AndroidLogger extends Logger {
    private final String mTag;
    private AndroidLoggerListener mListener;

    public AndroidLogger(String tag) {
        mTag = tag;
    }

    public void setAndroidLoggerListener(AndroidLoggerListener listener) {
        mListener = listener;
    }

    @Override
    protected void rawLog(Level level, StringBuilder toLog) {
        switch (level) {
            case d:
                Log.d(mTag, toLog.toString());
                break;
            case i:
                Log.i(mTag, toLog.toString());
                break;
            case v:
                Log.v(mTag, toLog.toString());
                break;
            case w:
                Log.w(mTag, toLog.toString());
                break;
            case e:
                Log.e(mTag, toLog.toString());
                break;
        }
        try {
            if (mListener != null) {
                mListener.onLogAvailable(level, toLog);
            }
        } catch (Exception e) {

        }
    }

    @Override
    protected void getPrefix(Level level, StringBuilder prefix) {
        getTrace(prefix);
        prefix.append(": ");
    }

    public interface AndroidLoggerListener {
        void onLogAvailable(Level level, StringBuilder toLog);
    }
}
