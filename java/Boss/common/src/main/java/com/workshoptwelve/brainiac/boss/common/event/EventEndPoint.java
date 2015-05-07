package com.workshoptwelve.brainiac.boss.common.event;

import com.workshoptwelve.brainiac.boss.common.log.Log;
import com.workshoptwelve.brainiac.boss.common.server.AEndPoint;
import com.workshoptwelve.brainiac.boss.common.server.stream.HttpInputStream;
import com.workshoptwelve.brainiac.boss.common.server.stream.HttpOutputStream;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.IOException;
import java.net.Socket;
import java.util.HashMap;
import java.util.List;

/**
 * Created by robwilliams on 15-04-12.
 */
public class EventEndPoint extends AEndPoint {
    private static final Log log = Log.getLogger(EventEndPoint.class.getName());
    private EventService mOwner;

    EventEndPoint(EventService owner) {
        super("listen");
        log.v();
        mOwner = owner;
    }

    @Override
    public void execute(Socket client, List<String> headers, String[] headerZeroParts, HttpInputStream inputStream, HttpOutputStream outputStream) {
        log.v();

        HashMap<String, String> params = getParams(headerZeroParts);

        String id = params.get("id");
        if (id == null) {
            try {
                log.v("Request missing ID");
                outputStream.setResponse(400,"Missing ID");
                return;
            } catch (IOException ioe) {
                log.w("Could not write to bad client", ioe);
            }
        }


        try {
            EventQueue eventQueue = mOwner.getEventQueue(id,false);

            if (eventQueue != null) {
                outputStream.setResponse(200, "OK");

                byte[][] events = eventQueue.getNextEvent();

                if (events != null) {
                    for (byte[] toSend : events) {
                        outputStream.write(toSend);
                    }
                }
            } else {
                log.v("No events registered for",id);
                outputStream.setResponse(409, "No events registered for that id");
                try {
                    JSONObject toReturn = new JSONObject();
                    toReturn.put("error", "No events registered for that id");
                    outputStream.write(toReturn.toString(4).getBytes());
                } catch (JSONException toIgnore) {
                    // ignore.
                }
            }
        } catch (IOException ioe) {
            log.w("IOException from event connection", ioe);
        }
    }
}
