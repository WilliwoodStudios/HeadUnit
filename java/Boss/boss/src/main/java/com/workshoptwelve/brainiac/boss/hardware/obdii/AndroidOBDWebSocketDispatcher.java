package com.workshoptwelve.brainiac.boss.hardware.obdii;

import android.os.Handler;

import com.workshoptwelve.brainiac.boss.common.hardware.obdii.IOBDListener;
import com.workshoptwelve.brainiac.boss.common.hardware.obdii.OBDService;
import com.workshoptwelve.brainiac.boss.common.hardware.obdii.OBDWebSocketDispatcher;
import com.workshoptwelve.brainiac.boss.common.log.Log;

import org.java_websocket.WebSocket;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.HashMap;

/**
 * Created by robwilliams on 15-09-25.
 */
public class AndroidOBDWebSocketDispatcher extends OBDWebSocketDispatcher {
    private static Log log = Log.getLogger(AndroidOBDWebSocketDispatcher.class);

    private PIDMap mRegistrations = new PIDMap();

    public AndroidOBDWebSocketDispatcher(OBDService service) {
        super(service);
    }

    @Override
    public void onMessage(WebSocket conn, String message) {
        try {
            JSONObject asJson = new JSONObject(message);
            if (asJson.has("action")) {
                String action = asJson.getString("action");
                if ("register".equals(action)) {
                    int mode = asJson.getInt("mode");
                    int pid = asJson.getInt("pid");

                    mRegistrations.register(conn, mode, pid);
                    log.e("Registering for",mode,pid);
                } else if ("unregister".equals(action)) {
                    int mode = asJson.getInt("mode");
                    int pid = asJson.getInt("pid");

                    mRegistrations.unregister(conn, mode, pid);
                    log.e("Unregistering for",mode,pid);
                }
            }
        } catch (JSONException je) {
            // TODO log.
        }
    }

    private void forget(WebSocket conn) {
        mRegistrations.socketGone(conn);
    }

    @Override
    public void onError(WebSocket conn, Exception ex) {
        forget(conn);
        super.onError(conn, ex);
    }

    @Override
    public void onClose(WebSocket conn, int code, String reason, boolean remote) {
        forget(conn);
        super.onClose(conn, code, reason, remote);
    }

    public class WebSocketList {
        private Integer mEffectivePID;
        private ArrayList<WebSocket> mConnections = new ArrayList<>();

        public WebSocketList(Integer effectivePID) {
            mEffectivePID = effectivePID;
        }

        public Integer getEffectivePID() {
            return mEffectivePID;
        }

        /**
         * @param socket
         * @return true iff this add did something - and the size is now 1.
         */
        public boolean add(WebSocket socket) {
            synchronized (mConnections) {
                if (mConnections.contains(socket)) {
                    return false;
                }
            }
            mConnections.add(socket);
            return mConnections.size() == 1;
        }

        /**
         * @return true iff this remove did something - and the size is now 0.
         */
        public synchronized boolean remove(WebSocket socket) {
            synchronized (mConnections) {
                return mConnections.remove(socket) && mConnections.size() == 0;
            }
        }

        private WebSocket[] mDummyArray = new WebSocket[0];

        public void onPIDUpdated(Integer effectivePID, String value) {
            int pid = effectivePID.intValue();
            String toSend = String.format("==pidUpdate,%d,%d,%s",pid >> 16, pid & 0xffff,value);

            WebSocket[] connections;
            synchronized (mConnections) {
                connections = mConnections.toArray(mDummyArray);
            }
            for (WebSocket connection : connections) {
                connection.send(toSend);
            }
        }
    }

    public class PIDMap {
        private class HandlerIOBDListener implements IOBDListener {
            private final Handler mHandler;

            public HandlerIOBDListener() {
                mHandler = new Handler();
            }

            @Override
            public void onPIDUpdated(final int mode, final int pid, final String value) {
                mHandler.post(new Runnable() {
                    public void run() {
                        PIDMap.this.onPIDUpdated(pid(mode, pid), value);
                    }
                });
            }
        }

        private HandlerIOBDListener mListener = new HandlerIOBDListener();

        protected void onPIDUpdated(Integer pid, String value) {
            WebSocketList webSocketList = mWebSocketsByPID.get(pid);
            webSocketList.onPIDUpdated(pid, value);
        }

        class WebSocketMap {
            private HashMap<Integer, WebSocketList> mWebSocketsByPID = new HashMap<>();

            public WebSocketList get(Integer pid) {
                WebSocketList toReturn = mWebSocketsByPID.get(pid);
                if (toReturn == null) {
                    toReturn = new WebSocketList(pid);
                    mWebSocketsByPID.put(pid, toReturn);
                }
                return toReturn;
            }

            public void remove(WebSocket conn) {
                for (WebSocketList current : mWebSocketsByPID.values()) {
                    if (current.remove(conn)) {
                        mService.unregisterForPIDUpdate(mListener, current.getEffectivePID());
                    }
                }
            }
        }

        private WebSocketMap mWebSocketsByPID = new WebSocketMap();

        /**
         * Register the given websocket for interest in the give mode+pid.
         *
         * @param conn
         * @param mode
         * @param pid
         */
        public synchronized void register(final WebSocket conn, final int mode, final int pid) {
            Integer effectivePID = pid(mode, pid);
            WebSocketList current = mWebSocketsByPID.get(effectivePID);

            if (current.add(conn)) {
                mService.registerForPIDUpdate(mListener, effectivePID);
            }

            new Thread() {
                public void run() {
                    try {
                        Thread.sleep(5000);
                    } catch (InterruptedException ie) {

                    }
                    try {
                        String toSend = "==connected";
                        conn.send(toSend);
                    } catch (Exception e) {
                        log.e("Damn", e);
                    }
                }
            }.start();
        }

        /**
         * Unregister the given websocket for interest in the given mode+pid.
         *
         * @param conn
         * @param mode
         * @param pid
         */
        public void unregister(WebSocket conn, int mode, int pid) {
            Integer effectivePID = pid(mode, pid);
            WebSocketList current = mWebSocketsByPID.get(effectivePID);
            if (current.remove(conn)) {
                mService.unregisterForPIDUpdate(mListener, effectivePID);
            }
        }

        public void socketGone(WebSocket conn) {
            mWebSocketsByPID.remove(conn);
        }

    }

    protected Integer pid(int mode, int pid) {
        return new Integer(((mode & 0xff) << 16) | (pid & 0xff));
    }
}
