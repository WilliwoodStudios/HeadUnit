package com.workshoptwelve.brainiac.boss.common.server;

import com.workshoptwelve.brainiac.boss.common.content.ContentService;
import com.workshoptwelve.brainiac.boss.common.event.EventService;
import com.workshoptwelve.brainiac.boss.common.hardware.accessory.AccessoryService;
import com.workshoptwelve.brainiac.boss.common.hardware.obdii.OBDService;
import com.workshoptwelve.brainiac.boss.common.log.Log;
import com.workshoptwelve.brainiac.boss.common.log.LogService;
import com.workshoptwelve.brainiac.boss.common.threading.ThreadPool;

import java.io.IOException;
import java.net.ServerSocket;
import java.net.Socket;
import java.util.ArrayList;

/**
 * Created by robwilliams on 15-04-10.
 */
public class Server {
    private static final Log log = Log.getLogger(Server.class);

    private static Server sInstance = new Server();
    private ArrayList<AService> mServices = new ArrayList<AService>();

    private ServerSocket mServerSocket;
    private Runnable mListenRunnable;

    Server() {
        log.setLogLevel(Log.Level.v);
        log.v("Server instance created");
        addService(EventService.getInstance());
        addService(ContentService.getInstance());
        addService(LogService.getInstance());
        addService(OBDService.getInstance());
        addService(AccessoryService.getInstance());
    }

    public static Server getInstance() {
        log.d();
        return sInstance;
    }

    public void addService(AService service) {
        log.d();
        mServices.add(service);
    }

    public synchronized boolean start() {
        log.v("start()");
        log.d();
        if (mListenRunnable == null) {
            ThreadPool.getInstance().run(mListenRunnable = new Runnable() {
                public void run() {
                    log.d();
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
        log.d();
        try {
            mServerSocket = new ServerSocket(9876);
            while (true) {
                final Socket client = mServerSocket.accept();
                ThreadPool.getInstance().run(new ServerConnectionHandler(mServices,client));
            }
        } catch (IOException ioe) {
            log.e("Could not listen", ioe);
            stop();
        }
    }

    public synchronized void stop() {
        // TODO make it stop.
    }
}
