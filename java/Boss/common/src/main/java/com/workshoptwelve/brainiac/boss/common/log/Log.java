package com.workshoptwelve.brainiac.boss.common.log;

/**
 * Created by robwilliams on 15-05-06.
 */
public class Log {
    private static final int sVOrd = Logger.Level.v.ordinal();
    private static final int sDOrd = Logger.Level.d.ordinal();
    private static final int sIOrd = Logger.Level.i.ordinal();
    private static final int sWOrd = Logger.Level.w.ordinal();
    private static final int sEOrd = Logger.Level.e.ordinal();
    private static Logger sLogger;
    private Logger.Level mLevel;
    private int mLevelOrd;

    public Log(String name) {
        setLogLevel(Logger.Level.d);
    }

    public static Log getLogger(String name) {
        // TODO cache.
        return new Log(name);
    }

    public static Log getLogger(Class klass) {
        return getLogger(klass.getName());
    }

    public static void setLogger(Logger logger) {
        sLogger = logger;
    }

    public static void setLogLevel(String name, Logger.Level level) {
        // TODO
    }

    public void setLogLevel(Logger.Level level) {
        if (level != null) {
            mLevel = level;
            mLevelOrd = level.ordinal();
        }
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
}
