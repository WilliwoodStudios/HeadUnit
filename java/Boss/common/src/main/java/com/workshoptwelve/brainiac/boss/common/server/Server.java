package com.workshoptwelve.brainiac.boss.common.server;

import com.workshoptwelve.brainiac.boss.common.content.ContentService;
import com.workshoptwelve.brainiac.boss.common.event.EventService;
import com.workshoptwelve.brainiac.boss.common.log.Log;
import com.workshoptwelve.brainiac.boss.common.threading.ThreadPool;

import java.io.IOException;
import java.net.ServerSocket;
import java.net.Socket;
import java.util.ArrayList;

/**
 * Created by robwilliams on 15-04-10.
 */
public class Server {
    private static Server sInstance = new Server();
    private ArrayList<AService> mServices = new ArrayList<AService>();

    private ServerSocket mServerSocket;
    private Runnable mListenRunnable;

    Server() {
        addService(EventService.getInstance());
        addService(ContentService.getInstance());
    }

    public static Server getInstance() {
        Log.d();
        return sInstance;
    }

    public void addService(AService service) {
        Log.d();
        mServices.add(service);
    }

    public synchronized boolean start() {
        Log.d();
        if (mListenRunnable == null) {
            ThreadPool.getInstance().run(mListenRunnable = new Runnable() {
                public void run() {
                    Log.d();
                    listen();
                    if (mListenRunnable == this) {
                        mListenRunnable = null;
                    }
                }
            });
            return true;
        }
        return false;
    }

    private void listen() {
        Log.d();
        try {
            mServerSocket = new ServerSocket(9876);
            while (true) {
                final Socket client = mServerSocket.accept();
                ThreadPool.getInstance().run(new ServerConnectionHandler(mServices,client));
            }
        } catch (IOException ioe) {
            Log.e("Could not listen", ioe);
            stop();
        }
    }

    public synchronized void stop() {
        // TODO make it stop.
    }
}
