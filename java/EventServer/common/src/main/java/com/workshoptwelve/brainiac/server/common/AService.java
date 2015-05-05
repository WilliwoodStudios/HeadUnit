package com.workshoptwelve.brainiac.server.common;

import com.workshoptwelve.brainiac.server.common.event.EventType;
import com.workshoptwelve.brainiac.server.common.log.Log;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.InputStream;
import java.io.OutputStream;
import java.net.Socket;
import java.util.ArrayList;
import java.util.List;

/**
 * Created by robwilliams on 15-04-11.
 */
public abstract class AService {
    protected String mPath;
    protected List<AEndPoint> mEndPoints = new ArrayList<>();
    protected List<EventType> mEventTypes = new ArrayList<>();

    public AService(String path) {
        if (!path.startsWith("/")) {
            path = "/" + path;
        }
        while (path.endsWith("/")) {
            path = path.substring(0, path.length() - 1);
        }
        mPath = path;
    }

    public final String getPath() {
        return mPath;
    }

    public final List<AEndPoint> getEndPoints() {
        return mEndPoints;
    }

    protected final void addEndPoint(AEndPoint endPoint) {
        mEndPoints.add(endPoint);
    }

    protected final void addEventType(EventType eventType) {
        mEventTypes.add(eventType);
    }

    public void handleConnection(Socket connection, List<String> headers, String[] headerZero, InputStream inputStream, OutputStream outputStream) throws Exception {
        // Log.d();
        int length = getPath().length();
        String remainingPath = headerZero[1].substring(length);
        for (AEndPoint endPoint : mEndPoints) {
            String endPointPath = endPoint.getPath();
            if (remainingPath.startsWith(endPointPath)) {
                if (remainingPath.length() == endPointPath.length() || remainingPath.charAt(endPointPath.length()) == '?') {
                    endPoint.execute(connection, headers, headerZero, inputStream, outputStream);
                    return;
                }
            }
        }

        if (remainingPath.equals("?events")) {
            JSONObject events = new JSONObject();
            events.put("result",1);
            JSONArray array = new JSONArray();
            events.put("events",array);
            for (EventType eventType: mEventTypes) {
                array.put(eventType.toJSON());
            }
            AEndPoint.sendHeaders(200,"OK",outputStream);
            outputStream.write(events.toString(4).getBytes());
        } else {
            JSONObject help = new JSONObject();
            JSONArray array = new JSONArray();
            help.put("error", "file not found");
            help.put("path", getPath());
            help.put("endPoints", array);
            for (AEndPoint endPoint : mEndPoints) {
                array.put(endPoint.getPath());
            }
            AEndPoint.sendHeaders(404,"File not found",outputStream);
            outputStream.write(help.toString(4).getBytes());
        }
    }
}
