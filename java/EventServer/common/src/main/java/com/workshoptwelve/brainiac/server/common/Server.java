package com.workshoptwelve.brainiac.server.common;

import com.workshoptwelve.brainiac.server.common.content.ContentService;
import com.workshoptwelve.brainiac.server.common.event.EventService;
import com.workshoptwelve.brainiac.server.common.log.Log;
import com.workshoptwelve.brainiac.server.common.stream.HttpInputStream;
import com.workshoptwelve.brainiac.server.common.stream.HttpOutputStream;
import com.workshoptwelve.brainiac.server.common.threading.ThreadPool;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.ServerSocket;
import java.net.Socket;
import java.util.ArrayList;
import java.util.List;

/**
 * Created by robwilliams on 15-04-10.
 */
public class Server {
    private static final int CLIENT_READ_TIMEOUT_MS = 20000;
    private static Server sInstance = new Server();
    private ArrayList<AService> mServices = new ArrayList<AService>();

    private ServerSocket mServerSocket;

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

    private Runnable mListenRunnable;

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
                ThreadPool.getInstance().run(new Runnable() {
                    public void run() {
                        handleConnection(client);
                    }
                });
            }
        } catch (IOException ioe) {
            Log.e("Could not listen", ioe);
            stop();
        }
    }

    private void handleConnection(Socket client) {
        try {
            client.setSoTimeout(CLIENT_READ_TIMEOUT_MS);

            InputStream realInputStream = client.getInputStream();
            OutputStream realOutputStream = client.getOutputStream();

            HttpOutputStream httpOutputStream = new HttpOutputStream();

            HttpInputStream httpInputStream = new HttpInputStream();

            while (true) {
                httpOutputStream.setBase(realOutputStream);
                httpInputStream.setBase(realInputStream);

                List<String> headers = httpInputStream.readHeaders();

                Log.d("Headers:", headers);

                if (headers.size() == 0) {
                    throw new IOException("Not enough headers.");
                }

                String[] headerZeroParts = headers.get(0).split(" ");
                if (headerZeroParts.length != 3) {
                    throw new IOException("Wrong number of parts in header 0");
                }

                String path = headerZeroParts[1];

                try {
                    boolean done = false;
                    for (AService service : mServices) {
                        String servicePath = service.getPath();
                        int servicePathLength = servicePath.length();
                        if (path.startsWith(servicePath)) {
                            if (path.length() == servicePathLength || isSlashOrQuestionMark(path.charAt(servicePathLength))) {
                                service.handleConnection(client, headers, headerZeroParts, httpInputStream, httpOutputStream);
                                done = true;
                                break;
                            }
                        }
                    }
                    if (!done) {
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

                        httpOutputStream.setResponse(404, "File not found");
                        httpOutputStream.write(knownServices.toString(4).getBytes());
                    }

                    httpOutputStream.close();
                    httpInputStream.close();

                } catch (RuntimeException re) {
                    Log.e("Error handling connection", re);

                    httpOutputStream.setResponse(500, "Server Error");
                    httpOutputStream.write(re.getMessage().getBytes());
                }
            }
        } catch (Exception e) {
            Log.e("Error handling connection", e);
        } finally {
            close(client);
        }
    }

    private boolean isSlashOrQuestionMark(char c) {
        return c == '?' || c == '/';
    }

    private void close(Socket client) {
        // Log.d();
        try {
            client.shutdownInput();
        } catch (IOException ioe) {
            // ignore
        }
        try {
            client.shutdownOutput();
        } catch (IOException ioe) {
            // ignore
        }
        try {
            client.close();
        } catch (IOException ioe) {
            // ignore
        }
    }

    public synchronized void stop() {
        // TODO make it stop.
    }
}
