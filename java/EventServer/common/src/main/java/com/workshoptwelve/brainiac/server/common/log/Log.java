package com.workshoptwelve.brainiac.server.common.log;

import java.io.ByteArrayOutputStream;
import java.io.PrintStream;

/**
 * Created by robwilliams on 15-04-10.
 */
public class Log {
    private static Logger sLogger;

    ;

    public static void setLogger(Logger logger) {
        sLogger = logger;
    }

    public static void i(Object... args) {
        log(Level.i, args);
    }

    public static void d(Object... args) {
        log(Level.d, args);
    }

    public static void e(Object... args) {
        log(Level.e, args);
    }

    public static void w(Object... args) {
        log(Level.w, args);
    }

    private static void log(Level level, Object... args) {
        if (sLogger.can(level)) {
            String linePrefix = "";
            linePrefix += System.currentTimeMillis();
            linePrefix += " [";
            linePrefix += Thread.currentThread().getId();
            linePrefix += "]:";
            linePrefix += getTrace();
            linePrefix += " ";

            String message = "";
            for (Object a : args) {
                if (a instanceof Throwable) {
                    message += getExceptionTrace((Throwable) a);
                } else {
                    message += a;
                    message += " ";
                }
            }

            for (String s : message.split("\n")) {
                sLogger.log(linePrefix + s);
            }
        }
    }

    private static String getTrace() {
        int state = 0;
        for (StackTraceElement ste : Thread.currentThread().getStackTrace()) {
            String className = ste.getClassName();
            if (state == 0) {
                if (className.contains("Log")) {
                    state = 1;
                }
            } else if (state == 1) {
                if (!className.contains("Log")) {
                    return className + "." + ste.getMethodName() + ":" + ste.getLineNumber();
                }
            }
        }
        return "unknown";
    }

    private static String getExceptionTrace(Throwable t) {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PrintStream ps = new PrintStream(baos);
        t.printStackTrace(ps);
        ps.flush();
        return new String(baos.toByteArray());
    }

    public enum Level {
        d, i, w, e
    }
}
