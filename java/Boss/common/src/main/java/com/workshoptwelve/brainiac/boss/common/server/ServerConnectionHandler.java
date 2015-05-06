package com.workshoptwelve.brainiac.boss.common.server;

import com.workshoptwelve.brainiac.boss.common.log.Log;
import com.workshoptwelve.brainiac.boss.common.server.stream.HttpInputStream;
import com.workshoptwelve.brainiac.boss.common.server.stream.HttpOutputStream;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

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
    private static final int CLIENT_READ_TIMEOUT_MS = 20000;
    private Socket mClient;
    private List<AService> mServices;

    private InputStream mRawInputStream;
    private OutputStream mRawOutputStream;

    private HttpOutputStream mHttpOutputStream;
    private HttpInputStream mHttpInputStream;
    private List<String> mHeaders;
    private String[] mHeaderZeroParts;

    public ServerConnectionHandler(List<AService> services, Socket client) {
        mServices = services;
        mClient = client;
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
        String path = mHeaderZeroParts[1];

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
        try {
            configureSocket();
            obtainStreams();

            while (true) {
                mHttpOutputStream.setBase(mRawOutputStream);
                mHttpInputStream.setBase(mRawInputStream);

                mHeaders = mHttpInputStream.readHeaders();

                Log.d("Headers:", mHeaders);

                if (mHeaders.size() == 0) {
                    throw new IOException("Not enough headers.");
                }

                mHeaderZeroParts = mHeaders.get(0).split(" ");

                if (mHeaderZeroParts.length != 3) {
                    throw new IOException("Wrong number of parts in header 0");
                }

                try {
                    if (mapToService()) {
                        // good.
                    } else {
                        showAllServices();
                    }

                } catch (RuntimeException re) {
                    Log.e("Error handling connection", re);

                    mHttpOutputStream.setResponse(500, "Server Error");
                    mHttpOutputStream.write(re.getMessage().getBytes());
                } finally {
                    mHttpOutputStream.close();
                    mHttpInputStream.close();
                }
            }
        } catch (Exception e) {
            Log.e("Error handling connection", e);
        } finally {
            close();
        }
    }

    private void close() {
        Log.d();
        if (mClient != null) {
            // Log.d();
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
