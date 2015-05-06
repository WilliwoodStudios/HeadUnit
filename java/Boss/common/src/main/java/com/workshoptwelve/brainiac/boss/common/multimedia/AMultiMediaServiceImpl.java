package com.workshoptwelve.brainiac.boss.common.multimedia;

import com.workshoptwelve.brainiac.boss.common.event.Event;
import com.workshoptwelve.brainiac.boss.common.event.EventService;
import com.workshoptwelve.brainiac.boss.common.event.EventType;
import com.workshoptwelve.brainiac.boss.common.log.Log;

import org.json.JSONException;
import org.json.JSONObject;

/**
 * Created by robwilliams on 15-04-11.
 */
public abstract class AMultiMediaServiceImpl {
    private EventType mPositionEventType;

    public JSONObject play() throws JSONException {
        Log.d();
        return getStatus();
    }

    public JSONObject resume() throws JSONException {
        Log.d();
        return getStatus();
    }

    public JSONObject pause() throws JSONException {
        Log.d();
        return getStatus();
    }

    public JSONObject stop() throws JSONException {
        Log.d();
        return getStatus();
    }

    public JSONObject getStatus() throws JSONException {
        Log.d();
        JSONObject toReturn = new JSONObject();
        toReturn.put("result", 1);

        return toReturn;
    }

    public JSONObject getPosition() throws JSONException {
        Log.d();
        return getStatus();
    }

    public JSONObject seek(int to) throws JSONException {
        Log.d(to);
        return getStatus();
    }

    protected void firePositionEvent(long position) {
        if (mPositionEventType == null) {
            mPositionEventType = MultiMediaService.getInstance().getPositionEventType();
        }
        Event toSend = new Event(mPositionEventType, String.valueOf(position));
        EventService.getInstance().sendEvent(toSend);
        if (Log.canD()) {
            Log.d("Sending position", position);
        }
    }
}
