package com.workshoptwelve.brainiac.boss.common.util;

import com.workshoptwelve.brainiac.boss.common.error.BossError;
import com.workshoptwelve.brainiac.boss.common.error.BossException;

import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

/**
 * Created by robwilliams on 15-05-08.
 */
public class BlockingFuture<T> {
    private T mResult;
    private boolean mDone;
    private BossException mException;

    public boolean isDone() {
        return false;
    }

    public T getNoExeption(T defaultValue) {
        try {
            return get();
        } catch (BossException be) {
            return defaultValue;
        }
    }

    public synchronized T get() throws BossException {
        do {
            if (mDone) {
                if (mException != null) {
                    throw mException;
                }
                return mResult;
            }
            try {
                wait();
            } catch (InterruptedException ie) {
                // consume.
            }
        } while (true);
    }

    public synchronized T get(long timeout, TimeUnit unit) throws BossException {
        boolean alreadyWaited = false;
        do {
            if (mDone) {
                if (mException != null) {
                    throw mException;
                }
                return mResult;
            }
            long millis = unit.toMillis(timeout);
            if (alreadyWaited) {
                throw new BossException(BossError.TIMEOUT);
            }
            try {
                wait(millis);
            } catch (InterruptedException ie) {
                //consume.
            }
            alreadyWaited = true;
        } while (true);
    }

    public synchronized void setResult(T result) {
        if (mDone) {
            // ignore - already done.
        } else {
            mDone = true;
            mResult = result;
        }
        notifyAll();
    }

    public synchronized void setException(BossException bossException) {
        if (mDone) {
            // ignore - already done.
        } else {
            mDone = true;
            mException = bossException;
        }
        notifyAll();
    }
}
