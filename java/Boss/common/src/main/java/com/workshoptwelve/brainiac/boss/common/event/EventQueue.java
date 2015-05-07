package com.workshoptwelve.brainiac.boss.common.event;

import com.workshoptwelve.brainiac.boss.common.log.Log;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by robwilliams on 15-04-12.
 */
public class EventQueue {
    private static final Log log = Log.getLogger(EventQueue.class.getName());

    private static final int TIMEOUT_MS = 10 * 1000;
    private static final int TIMEOUT_VARIANCE_MS = 10000;
    private List<byte[]> mQueue = new ArrayList<>();
    private boolean mIsShutdown = false;
    private Object mCountLock = new Object();
    private int mCount = 0;

    public synchronized void addEvent(byte[] toAdd) {
        // TODO need to strip redundants.
        mQueue.add(toAdd);
        notify();
    }

    public synchronized void shutdown() {
        mIsShutdown = true;
        notify();
    }

    public synchronized boolean isShutdown() {
        return mIsShutdown;
    }

    public byte[][] getNextEvent() {
        // TODO need to stagger when these happen.
        return getNextEventInternal();
    }

    public synchronized byte[][] getNextEventInternal() {
        if (mQueue.size() > 0) {
            return available();
        }
        try {
            long timeToWait = TIMEOUT_MS + (long)(Math.random() * TIMEOUT_VARIANCE_MS);
            wait(timeToWait);
        } catch (InterruptedException ie) {
            log.w("Timeout in wait", ie);
        }
        if (mQueue.size() > 0) {
            return available();
        }
        return null;
    }

    private byte[][] available() {
        try {
            wait(15); // in case there are any stragglers.
        } catch (InterruptedException ie) {
            // consume
        }
        byte[][] toReturn = new byte[mQueue.size()][];
        for (int i = 0; i < toReturn.length; ++i) {
            toReturn[i] = mQueue.remove(0);
        }
        return toReturn;
    }
}
