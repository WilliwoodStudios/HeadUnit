package com.workshoptwelve.brainiac.boss.common.util;

import java.util.concurrent.CancellationException;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

/**
 * Created by robwilliams on 15-05-08.
 */
public class BlockingFuture<T> implements Future<T> {
    private boolean mCancelled;
    private T mResult;
    private boolean mDone;

    @Override
    public synchronized boolean cancel(boolean mayInterruptIfRunning) {
        mCancelled = true;
        notifyAll();
        return false;
    }

    @Override
    public boolean isCancelled() {
        return mCancelled;
    }

    @Override
    public boolean isDone() {
        return false;
    }

    @Override
    public synchronized T get() throws InterruptedException, ExecutionException {
        do {
            if (mDone) {
                return mResult;
            }
            if (mCancelled) {
                throw new CancellationException();
            }
            wait();
        } while (true);
    }

    @Override
    public synchronized T get(long timeout, TimeUnit unit) throws InterruptedException, ExecutionException, TimeoutException {
        boolean alreadyWaited = false;
        do {
            if (mDone) {
                return mResult;
            }
            if (mCancelled) {
                throw new CancellationException();
            }
            long millis = unit.toMillis(timeout);
            if (alreadyWaited) {
                throw new TimeoutException();
            }
            wait(millis);
            alreadyWaited = true;
        } while (true);
    }

    public synchronized void setResult(T result) {
        if (mDone) {
            // ignore - already done.
        } else if (mCancelled) {
            // ignore - already cancelled.
        } else {
            mDone = true;
            mResult = result;
        }
        notifyAll();
    }
}
