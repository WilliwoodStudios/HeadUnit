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
    private final static Log log = Log.getLogger(AMultiMediaServiceImpl.class);

    private EventType mPositionEventType;

    public JSONObject play() throws JSONException {
        log.v();
        return getStatus();
    }

    public JSONObject resume() throws JSONException {
        log.v();
        return getStatus();
    }

    public JSONObject pause() throws JSONException {
        log.v();
        return getStatus();
    }

    public JSONObject stop() throws JSONException {
        log.v();
        return getStatus();
    }

    public JSONObject getStatus() throws JSONException {
        log.v();
        JSONObject toReturn = new JSONObject();
        toReturn.put("result", 1);

        return toReturn;
    }

    public JSONObject getPosition() throws JSONException {
        log.v();
        return getStatus();
    }

    public JSONObject seek(int to) throws JSONException {
        log.v(to);
        return getStatus();
    }

    protected void firePositionEvent(long position) {
        if (mPositionEventType == null) {
            mPositionEventType = MultiMediaService.getInstance().getPositionEventType();
        }
        Event toSend = new Event(mPositionEventType, String.valueOf(position));
        EventService.getInstance().sendEvent(toSend);
        if (log.canD()) {
            log.d("Sending position", position);
        }
    }
}
