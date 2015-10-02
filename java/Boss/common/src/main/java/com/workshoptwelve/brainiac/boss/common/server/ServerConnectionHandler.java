package com.workshoptwelve.brainiac.boss.common.server;

import com.workshoptwelve.brainiac.boss.common.error.BossError;
import com.workshoptwelve.brainiac.boss.common.error.BossException;
import com.workshoptwelve.brainiac.boss.common.log.Log;
import com.workshoptwelve.brainiac.boss.common.log.Logger;
import com.workshoptwelve.brainiac.boss.common.server.stream.HttpInputStream;
import com.workshoptwelve.brainiac.boss.common.server.stream.HttpOutputStream;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.EOFException;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.Socket;
import java.net.SocketException;
import java.util.List;

/**
 * Created by robwilliams on 15-05-06.
 */
class ServerConnectionHandler implements Runnable {
    private static final Log log = Log.getLogger(ServerConnectionHandler.class.getName());
    private static final int CLIENT_READ_TIMEOUT_MS = 20000;
    private final AService mDefaultService;
    private final String mNonDefaultPath;
    private Socket mClient;
    private List<AService> mServices;

    private InputStream mRawInputStream;
    private OutputStream mRawOutputStream;

    private HttpOutputStream mHttpOutputStream;
    private HttpInputStream mHttpInputStream;
    private List<String> mHeaders;
    private String[] mHeaderZeroParts;

    public ServerConnectionHandler(AService defaultService, String nonDefaultPath, List<AService> services, Socket client) {
        mServices = services;
        mDefaultService = defaultService;
        mClient = client;
        mNonDefaultPath = nonDefaultPath;
//
//        log.setLogLevel(Log.Level.v);
    }

    private void configureSocket() throws SocketException {
        mClient.setSoTimeout(CLIENT_READ_TIMEOUT_MS);
    }

    private void obtainStreams() throws IOException {
        mRawInputStream = mClient.getInputStream();
        mRawOutputStream = mClient.getOutputStream();

        mHttpOutputStream = new HttpOutputStream();
        mHttpInputStream = new HttpInputStream();
    }


    private boolean mapToService() throws Exception {
        log.v();
        String path = mHeaderZeroParts[1];

        if (path.startsWith(mNonDefaultPath)) {
            boolean done = false;
            for (AService service : mServices) {
                String servicePath = service.getPath();
                int servicePathLength = servicePath.length();
                if (path.startsWith(servicePath)) {
                    if (path.length() == servicePathLength || isSlashOrQuestionMark(path.charAt(servicePathLength))) {
                        service.handleConnection(mClient, mHeaders, mHeaderZeroParts, mHttpInputStream, mHttpOutputStream);
                        done = true;
                        break;
                    }
                }
            }
            return done;
        }

        mDefaultService.handleConnection(mClient, mHeaders, mHeaderZeroParts, mHttpInputStream, mHttpOutputStream);
        return true;
    }

    private void showAllServices() throws JSONException, IOException {
        JSONObject knownServices = new JSONObject();
        knownServices.put("error", "Path not found");
        JSONArray services = new JSONArray();
        knownServices.put("services", services);
        for (AService service : mServices) {
            JSONObject entry = new JSONObject();
            entry.put("path", service.getPath());
            JSONArray entryEndPoints = new JSONArray();
            entry.put("endPoints", entryEndPoints);
            for (AEndPoint endPoint : service.getEndPoints()) {
                entryEndPoints.put(endPoint.getPath());
            }
            services.put(entry);
        }

        mHttpOutputStream.setResponse(404, "File not found");
        mHttpOutputStream.write(knownServices.toString(4).getBytes());
    }


    public void run() {
        log.v();
        try {
            configureSocket();
            obtainStreams();

            while (true) {
                mHttpOutputStream.setBase(mRawOutputStream);
                mHttpInputStream.setBase(mRawInputStream);

                mHeaders = mHttpInputStream.readHeaders();

                log.v("Headers:", mHeaders);

                if (mHeaders.size() == 0) {
                    throw new IOException("Not enough headers.");
                }

                mHeaderZeroParts = mHeaders.get(0).split(" ");

                if (mHeaderZeroParts.length != 3) {
                    throw new IOException("Wrong number of parts in header 0: " + mHeaders.get(0));
                }

                try {
                    try {
                        if (mapToService()) {
                            // good.
                        } else {
                            showAllServices();
                        }
                    } catch (JSONException je) {
                        throw new BossException(BossError.UNHANDLED_EXCEPTION, je);
                    } catch (RuntimeException re) {
                        throw new BossException(BossError.UNHANDLED_EXCEPTION, re);
                    }
                } catch (BossException bossException) {
                    handleBossException(bossException);
                } finally {
                    mHttpOutputStream.close();
                    mHttpInputStream.close();
                }
            }
        } catch (EOFException eof) {
            log.v("Connection appears closed by peer");
        } catch (Exception e) {
            log.e("Error handling connection", e);
        } finally {
            close();
        }
    }

    private void handleBossException(BossException bossException) throws JSONException, IOException {
        JSONObject response = new JSONObject();
        BossError bossError = bossException.getBossError();
        JSONObject jsonError = new JSONObject();
        response.put("error", jsonError);

        jsonError.put("description", bossError.getDescription());
        jsonError.put("code", bossError.getErrorCode());
        jsonError.put("enum", bossError.toString());

        String message = bossException.getMessage();
        if (message != null && message.length() > 0) {
            jsonError.put("message", bossException.getMessage());
        }

        Throwable cause = bossException.getCause();
        if (cause != null) {
            JSONObject jsonCause = new JSONObject();
            jsonError.put("errorCause", jsonCause);
            jsonCause.put("message", cause.getMessage());
            jsonCause.put("class", cause.getClass().getName());
            StringBuilder stackTrace = new StringBuilder();
            Logger.getExceptionTrace(cause, stackTrace);
            jsonCause.put("stackTrace", stackTrace);
        }

        mHttpOutputStream.setResponse(200, "OK");
        mHttpOutputStream.write(response.toString(3).getBytes());
    }

    private void close() {
        log.v();
        if (mClient != null) {
            try {
                mClient.shutdownInput();
            } catch (IOException ioe) {
                // ignore
            }
            try {
                mClient.shutdownOutput();
            } catch (IOException ioe) {
                // ignore
            }
            try {
                mClient.close();
            } catch (IOException ioe) {
                // ignore
            }
        }
    }

    private boolean isSlashOrQuestionMark(char c) {
        return c == '?' || c == '/';
    }
}
