package com.workshoptwelve.brainiac.boss.common.log;

import java.io.ByteArrayOutputStream;
import java.io.PrintStream;

/**
 * Created by robwilliams on 15-04-10.
 */
public abstract class Logger {
    private final boolean mForceMultiLine;

    public void d(Object... toLog) {
        if (canD()) log(Log.Level.d, toLog);
    }

    public void i(Object... toLog) {
        if (canI()) log(Log.Level.i, toLog);
    }

    public void v(Object... toLog) {
        if (canV()) log(Log.Level.v, toLog);
    }

    public void w(Object... toLog) {
        if (canW()) log(Log.Level.w, toLog);
    }

    public void e(Object... toLog) {
        if (canE()) log(Log.Level.e, toLog);
    }

    protected abstract void rawLog(Log.Level level, StringBuilder toLog);
    protected abstract void getPrefix(Log.Level level, StringBuilder prefix);
    protected boolean forceMultiLine() { return true; }
    
    public Logger() {
        mForceMultiLine = forceMultiLine();
    }

    public Log.Level getLogLevel(String name) {
        return Log.Level.i; // d; // TODO make this programatic...
    }

    private synchronized void log(Log.Level level, Object... args) {
        StringBuilder prefix = new StringBuilder();
        getPrefix(level, prefix);

        StringBuilder allArgs = new StringBuilder();
        concatArgs(allArgs,args);

        int startFrom = 0;
        int lastNewLine;
        do {
            lastNewLine = mForceMultiLine ? allArgs.indexOf("\n", startFrom) : -1;
            if (lastNewLine == -1) {
                // We are destroying the prefix - this is the last iteration.
                prefix.append(allArgs.substring(startFrom));
                rawLog(level, prefix);
            } else {
                StringBuilder thisLine = new StringBuilder(prefix);
                thisLine.append(allArgs.substring(startFrom, lastNewLine));
                rawLog(level, thisLine);
            }
            startFrom = lastNewLine + 1;
        } while (startFrom < allArgs.length() && lastNewLine != -1);
    }

    protected void concatArgs(StringBuilder stringBuilder, Object... args) {
        for (Object a : args) {
            if (a instanceof Throwable) {
                getExceptionTrace((Throwable) a, stringBuilder);
            } else {
                stringBuilder.append(String.valueOf(a));
                stringBuilder.append(" ");
            }
        }
    }


    public boolean canI() {
        return true;
    }

    public boolean canV() {
        return true;
    }

    public boolean canD() {
        return true;
    }

    public boolean canE() {
        return true;
    }

    public boolean canW() {
        return true;
    }

    public static void getTrace(StringBuilder stringBuilder) {
        int state = 0;
        for (StackTraceElement ste : Thread.currentThread().getStackTrace()) {
            String className = ste.getClassName();
            if (state == 0) {
                if (className.contains("Log")) {
                    state = 1;
                }
            } else if (state == 1) {
                if (!className.contains("Log")) {
                    int lastDot = className.lastIndexOf('.');
                    className = className.substring(lastDot + 1);
                    stringBuilder.append(className);
                    stringBuilder.append(".");
                    stringBuilder.append(ste.getMethodName());
                    stringBuilder.append(":");
                    stringBuilder.append(ste.getLineNumber());
                    return;
                }
            }
        }
        stringBuilder.append("unknown");
    }

    public static void getExceptionTrace(Throwable t, StringBuilder stringBuilder) {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PrintStream ps = new PrintStream(baos);
        t.printStackTrace(ps);
        ps.flush();
        stringBuilder.append(new String(baos.toByteArray()));
    }
}
