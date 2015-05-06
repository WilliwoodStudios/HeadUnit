package com.workshoptwelve.brainiac.server.common.event;

import com.workshoptwelve.brainiac.server.common.AEndPoint;
import com.workshoptwelve.brainiac.server.common.log.Log;
import com.workshoptwelve.brainiac.server.common.stream.HttpInputStream;
import com.workshoptwelve.brainiac.server.common.stream.HttpOutputStream;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.Socket;
import java.util.HashMap;
import java.util.List;

/**
 * Created by robwilliams on 15-04-12.
 */
public class EventEndPoint extends AEndPoint {
    private EventService mOwner;

    EventEndPoint(EventService owner) {
        super("listen");
        mOwner = owner;
    }

    @Override
    public void execute(Socket client, List<String> headers, String[] headerZeroParts, HttpInputStream inputStream, HttpOutputStream outputStream) {
        // Log.d();

        HashMap<String, String> params = getParams(headerZeroParts);

        String id = params.get("id");
        if (id == null) {
            try {
                outputStream.setResponse(400,"Missing ID");
                return;
            } catch (IOException ioe) {
                Log.d("Could not write to bad client", ioe);
            }
        }

        EventQueue eventQueue = mOwner.getEventQueue(id);

        try {
            outputStream.setResponse(200,"OK");

            byte[][] events = eventQueue.getNextEvent();

            if (events != null) {
                for (byte[] toSend : events) {
                    outputStream.write(toSend);
                }
            }
        } catch (IOException ioe) {
            Log.w("IOException from event connection", ioe);
        }
    }
}
