package com.workshoptwelve.brainiac.server.common;

import com.workshoptwelve.brainiac.server.common.content.ContentService;
import com.workshoptwelve.brainiac.server.common.event.EventService;
import com.workshoptwelve.brainiac.server.common.log.Log;

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
    private static Server sInstance = new Server();
    private static final int CLIENT_READ_TIMEOUT_MS = 20000;

    private ArrayList<AService> mServices = new ArrayList<AService>();

    private Thread mListenThread;

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

    public synchronized void start() {
        Log.d();
        if (mListenThread == null) {
            mListenThread = new Thread() {
                public void run() {
                    Log.d();
                    listen();
                }
            };
            mListenThread.start();
        }
    }

    private void listen() {
        Log.d();
        try {
            mServerSocket = new ServerSocket(9876);
            while (true) {
                final Socket client = mServerSocket.accept();
                new Thread() {
                    public void run() {
                        handleConnection(client);
                    }
                }.start();
            }
        } catch (IOException ioe) {
            Log.e("Could not listen", ioe);
            stop();
        }
    }

    private void handleConnection(Socket client) {
        // Log.d();
        try {
            client.setSoTimeout(CLIENT_READ_TIMEOUT_MS);

            InputStream inputStream = client.getInputStream();
            OutputStream outputStream = client.getOutputStream();

            List<String> headers = readHeaders(inputStream);

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
                            service.handleConnection(client, headers, headerZeroParts, inputStream, outputStream);
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

                    AEndPoint.sendHeaders(404, "File not found", outputStream);
                    outputStream.write(knownServices.toString(4).getBytes());
                }
            } catch (RuntimeException re) {
                Log.e("Error handling connection", re);
                AEndPoint.sendHeaders(500, "Server Error", outputStream);
                outputStream.write(re.getMessage().getBytes());
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

    private List<String> readHeaders(InputStream inputStream) throws IOException {
        // Log.d();
        byte[] buffer = new byte[20000];
        int lineStart;
        int readLength;
        String lineInProgress = "";
        ArrayList<String> toReturn = new ArrayList<String>();
        do {
            readLength = inputStream.read(buffer);
            lineStart = 0;
            for (int i = 0; i < readLength; ++i) {
                if (i > 0 && buffer[i - 1] == '\r' && buffer[i] == '\n') {
                    int length = i - lineStart - 1;
                    if (length == 0) {
                        return toReturn;
                    } else {
                        if (lineInProgress.length() != 0) {
                            String newLine = lineInProgress + new String(buffer, lineStart, length);
                            toReturn.add(newLine);
                        } else {
                            toReturn.add(new String(buffer, lineStart, length));
                        }
                        lineStart = i + 1;
                    }
                }
            }
            if (lineStart < readLength) {
                lineInProgress += new String(buffer, lineStart, readLength - lineStart);
            } else {
                lineInProgress = "";
            }

        } while (lineInProgress.length() > 10000 || toReturn.size() > 100);

        throw new IOException("Corrupt headers.");
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

    }
}
