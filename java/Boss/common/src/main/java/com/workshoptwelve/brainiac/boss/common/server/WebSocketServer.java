package com.workshoptwelve.brainiac.boss.common.server;

import com.workshoptwelve.brainiac.boss.common.log.Log;

import org.java_websocket.WebSocket;
import org.java_websocket.handshake.ClientHandshake;

import java.net.InetSocketAddress;
import java.net.UnknownHostException;
import java.util.HashMap;

/**
 * Created by robwilliams on 15-09-03.
 */
public class WebSocketServer extends org.java_websocket.server.WebSocketServer {

    private static final Log log = Log.getLogger(WebSocketServer.class);

    private final Server mServer;

    private final HashMap<WebSocket,WebSocketDispatcher> mSocketDispatchers = new HashMap<>();

    public WebSocketServer(Server server, InetSocketAddress address) throws UnknownHostException {
        super(address);
        mServer = server;
        start();
        log.e("Listening on",address);
    }

    @Override
    public void onClose(WebSocket conn, int code, String reason, boolean remote) {
        log.e("on close",code,reason,remote);
        WebSocketDispatcher dis = null;
        synchronized (mSocketDispatchers) {
            dis = mSocketDispatchers.get(conn);
            if (dis!= null) {
                mSocketDispatchers.remove(dis);
            }
        }
        if (dis!=null) {
            dis.onClose(conn,code,reason,remote);
        }
    }

    @Override
    public void onOpen(WebSocket conn, ClientHandshake handshake) {
        log.e("On Open",handshake.getResourceDescriptor());
        WebSocketDispatcher dis = mServer.getWebSocketDispatcher(handshake.getResourceDescriptor());
        if (dis != null) {
            synchronized(mSocketDispatchers) {
                mSocketDispatchers.put(conn,dis);
            }
            dis.onOpen(conn,handshake);
        } else {
            log.e("Closing due to no dispatcher");
            try {
                conn.close();
            } catch (Exception e) {
                // consume.
            }
        }
    }

    @Override
    public void onMessage(WebSocket conn, String message) {
        log.e("on Message",message);
        WebSocketDispatcher dis = null;
        synchronized (mSocketDispatchers) {
            dis = mSocketDispatchers.get(conn);
        }
        if (dis != null) {
            dis.onMessage(conn,message);
        }
    }

    @Override
    public void onError(WebSocket conn, Exception ex) {
        log.e("onerror",ex);
        WebSocketDispatcher dis = null;
        synchronized (mSocketDispatchers) {
            dis = mSocketDispatchers.get(conn);
            if (dis != null) {
                mSocketDispatchers.remove(dis);
            }
        }
        if (dis != null) {
            dis.onError(conn,ex);
        }
    }
}
