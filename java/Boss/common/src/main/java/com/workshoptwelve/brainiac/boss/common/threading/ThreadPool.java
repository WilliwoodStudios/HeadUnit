package com.workshoptwelve.brainiac.boss.common.threading;

import com.workshoptwelve.brainiac.boss.common.log.Log;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * Created by robwilliams on 15-05-06.
 */
public class ThreadPool {
    private static final Log log = Log.getLogger(ThreadPool.class);

    private final ExecutorService mThreadPool;

    public static ThreadPool getInstance() {
        return sInstance;
    }

    private static ThreadPool sInstance = new ThreadPool();

    protected ThreadPool() {
        mThreadPool = Executors.newCachedThreadPool();
    }

    public void run(final Runnable runnable) {
        mThreadPool.submit(new Runnable() {
            public void run() {
                try {
                    runnable.run();
                } catch (RuntimeException re) {
                    log.e("Near Fatal exception in runnable",re);
                }
            }
        });
    }
}
