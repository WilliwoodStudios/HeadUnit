package com.workshoptwelve.brainiac.boss.common.server;

import com.workshoptwelve.brainiac.boss.common.content.ContentService;
import com.workshoptwelve.brainiac.boss.common.error.BossException;
import com.workshoptwelve.brainiac.boss.common.event.EventService;
import com.workshoptwelve.brainiac.boss.common.hardware.accessory.AccessoryService;
import com.workshoptwelve.brainiac.boss.common.hardware.obdii.OBDService;
import com.workshoptwelve.brainiac.boss.common.log.Log;
import com.workshoptwelve.brainiac.boss.common.log.LogService;
import com.workshoptwelve.brainiac.boss.common.threading.ThreadPool;
import com.workshoptwelve.brainiac.boss.common.util.BlockingFuture;

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
    private final AService mDefaultService;
    private ArrayList<AService> mServices = new ArrayList<AService>();

    private ServerSocket mServerSocket;
    private Runnable mListenRunnable;
    private String mNonDefaultPath;

    Server() {
        log.setLogLevel(Log.Level.v);
        log.v("Server instance created");
        addService(EventService.getInstance());
        addService(LogService.getInstance());
        addService(OBDService.getInstance());
        addService(AccessoryService.getInstance());
        mDefaultService = ContentService.getInstance();
    }

    public static Server getInstance() {
        log.d();
        return sInstance;
    }

    public void addService(AService service) {
        log.d();
        mServices.add(service);
        mNonDefaultPath = null;
        for (AService s : mServices) {
            if (mNonDefaultPath == null) {
                mNonDefaultPath = s.getPath();
            } else {
                mNonDefaultPath = common(mNonDefaultPath,s.getPath());
            }
        }
    }

    public int getPort() {
        return mServerPort;
    }

    private int mServerPort = -1;

    private String common(String a, String b) {
        for (int i=0; i<a.length() && i<b.length(); ++i) {
            if (a.charAt(i) != b.charAt(i)) {
                return a.substring(0,i);
            }
        }
        if (a.length() < b.length()) {
            return a;
        } else {
            return b;
        }
    }

    public synchronized boolean start() {
        log.v("start()");
        log.d();
        if (mListenRunnable == null) {
            final BlockingFuture<Integer> serverPort = new BlockingFuture<>();
            ThreadPool.getInstance().run(mListenRunnable = new Runnable() {
                public void run() {
                    log.d();
                    listen(serverPort);
                    if (mListenRunnable == this) {
                        mListenRunnable = null;
                    }
                }
            });
            mServerPort = serverPort.getNoExeption(-1);
            return true;
        }
        return false;
    }

    private void listen(BlockingFuture<Integer> port) {
        log.d();
        for (int i=9000; i<10000; ++i) {
            try {
                mServerSocket = new ServerSocket(i);
                mServerPort = i;
                port.setResult(i);
                while (true) {
                    final Socket client = mServerSocket.accept();
                    ThreadPool.getInstance().run(new ServerConnectionHandler(mDefaultService, mNonDefaultPath, mServices, client));
                }
            } catch (IOException ioe) {
                log.e("Could not listen", ioe);
                stop();
            }
        }
    }

    public synchronized void stop() {
        // TODO make it stop.
    }
}
