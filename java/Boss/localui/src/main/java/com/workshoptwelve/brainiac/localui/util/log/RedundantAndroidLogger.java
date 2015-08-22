package com.workshoptwelve.brainiac.localui.util.log;

import com.workshoptwelve.brainiac.boss.common.log.Log;
import com.workshoptwelve.brainiac.boss.common.log.Logger;

public class RedundantAndroidLogger extends Logger {
    private final String mTag;
    private AndroidLoggerListener mListener;

    public RedundantAndroidLogger(String tag) {
        mTag = tag;
    }

    public void setAndroidLoggerListener(AndroidLoggerListener listener) {
        mListener = listener;
    }

    @Override
    protected void rawLog(Log.Level level, StringBuilder toLog) {
        switch (level) {
            case d:
                android.util.Log.d(mTag, toLog.toString());
                break;
            case i:
                android.util.Log.i(mTag, toLog.toString());
                break;
            case v:
                android.util.Log.v(mTag, toLog.toString());
                break;
            case w:
                android.util.Log.w(mTag, toLog.toString());
                break;
            case e:
                android.util.Log.e(mTag, toLog.toString());
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
    protected void getPrefix(Log.Level level, StringBuilder prefix) {
        getTrace(prefix);
        prefix.append(": ");
    }

    public interface AndroidLoggerListener {
        void onLogAvailable(Log.Level level, StringBuilder toLog);
    }
}
