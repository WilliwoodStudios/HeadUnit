package com.workshoptwelve.brainiac.boss.common.server;

import com.workshoptwelve.brainiac.boss.common.log.Log;

import org.java_websocket.WebSocket;
import org.java_websocket.handshake.ClientHandshake;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Created by robwilliams on 15-09-03.
 */
public class WebSocketDispatcher {
    private List<WebSocket> mSockets = Collections.synchronizedList(new ArrayList<WebSocket>());
    private WebSocket[] mDummyArray = new WebSocket[0];
    private static final Log log = Log.getLogger(WebSocketDispatcher.class);

    public void sendMessage(String message) {
        WebSocket[] toSendOn = mSockets.toArray(mDummyArray);
        for (WebSocket webSocket : toSendOn) {
            try {
                webSocket.send(message);
            } catch (Exception e) {
                log.e("Could not send", e);
            }
        }
    }

    public void onClose(WebSocket conn, int code, String reason, boolean remote) {
        mSockets.remove(conn);
    }

    public void onOpen(WebSocket conn, ClientHandshake handshake) {
        mSockets.add(conn);
    }

    public void onMessage(WebSocket conn, String message) {
        log.e("This method should be overridden...");
    }

    public void onError(WebSocket conn, Exception ex) {
        mSockets.remove(conn);
    }
}
