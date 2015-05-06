package com.workshoptwelve.brainiac.server.common.log;

/**
 * Created by robwilliams on 15-04-10.
 */
public class Log {
    private static Logger sLogger;

    public static void setLogger(Logger logger) {
        sLogger = logger;
    }

    public static void d(Object... args) {
        sLogger.d(args);
    }

    public static void i(Object... args) {
        sLogger.i(args);
    }

    public static void v(Object... args) {
        sLogger.v(args);
    }

    public static void w(Object... args) {
        sLogger.w(args);
    }

    public static void e(Object... args) {
        sLogger.e(args);
    }

    public static boolean canD() {
        return sLogger.canD();
    }

    public static boolean canV() {
        return sLogger.canV();
    }

    public static boolean canI() {
        return sLogger.canI();
    }

    public static boolean canW() {
        return sLogger.canW();
    }

    public static boolean canE() {
        return sLogger.canE();
    }

}
