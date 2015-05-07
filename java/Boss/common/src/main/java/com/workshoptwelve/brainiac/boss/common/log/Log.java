package com.workshoptwelve.brainiac.boss.common.log;

import java.util.Collection;
import java.util.HashMap;
import java.util.Map;

/**
 * Created by robwilliams on 15-05-06.
 */
public class Log {
    private static final int sVOrd = Level.v.ordinal();
    private static final int sDOrd = Level.d.ordinal();
    private static final int sIOrd = Level.i.ordinal();
    private static final int sWOrd = Level.w.ordinal();
    private static final int sEOrd = Level.e.ordinal();
    private static Logger sLogger;
    private Level mLevel;
    private int mLevelOrd;
    private String mName;

    public Log(String name) {
        setLogLevel(Level.d);
        mName = name;
    }

    public String getName() {
        return mName;
    }

    private static Map<String,Log> sKnownLoggers = new HashMap<String, Log>();

    public static synchronized Log getLogger(String name) {
        Log toReturn = sKnownLoggers.get(name);
        if (toReturn == null) {
            sKnownLoggers.put(name,toReturn = new Log(name));
            toReturn.setLogLevel(sLogger.getLogLevel(name));
        }

        return toReturn;
    }

    public static synchronized Log [] getKnownLogs() {
        Collection<Log> entrySet = sKnownLoggers.values();
        Log [] toReturn = new Log[entrySet.size()];
        return entrySet.toArray(toReturn);
    }

    public static Log getLogger(Class klass) {
        return getLogger(klass.getName());
    }

    public static void setLogger(Logger logger) {
        sLogger = logger;
    }

    public static synchronized void setLogLevel(String name, Level level) {
        Log log = sKnownLoggers.get(name);
        if (log != null) {
            log.setLogLevel(level);
        }
    }

    public void setLogLevel(Level level) {
        if (level != null) {
            mLevel = level;
            mLevelOrd = level.ordinal();
        }
    }

    public Level getLogLevel() {
        return mLevel;
    }

    public void d(Object... args) {
        if (sDOrd >= mLevelOrd) {
            sLogger.d(args);
        }
    }

    public void i(Object... args) {
        if (sIOrd >= mLevelOrd) {
            sLogger.i(args);
        }
    }

    public void v(Object... args) {
        if (sVOrd >= mLevelOrd) {
            sLogger.v(args);
        }
    }

    public void w(Object... args) {
        if (sWOrd >= mLevelOrd) {
            sLogger.w(args);
        }
    }

    public void e(Object... args) {
        if (sEOrd >= mLevelOrd) {
            sLogger.e(args);
        }
    }

    public boolean canD() {
        return mLevelOrd >= sDOrd && sLogger.canD();
    }

    public boolean canI() {
        return mLevelOrd >= sIOrd && sLogger.canI();
    }

    public boolean canV() {
        return mLevelOrd >= sVOrd && sLogger.canV();
    }

    public boolean canW() {
        return mLevelOrd >= sWOrd && sLogger.canW();
    }

    public boolean canE() {
        return mLevelOrd >= sEOrd && sLogger.canE();
    }

    public enum Level {
        v, d, i, w, e
    }
}
