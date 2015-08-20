package com.workshoptwelve.brainiac.boss.common.multimedia;

import com.workshoptwelve.brainiac.boss.common.error.BossException;
import com.workshoptwelve.brainiac.boss.common.event.Event;
import com.workshoptwelve.brainiac.boss.common.event.EventService;
import com.workshoptwelve.brainiac.boss.common.event.EventType;
import com.workshoptwelve.brainiac.boss.common.log.Log;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.IOException;

/**
 * Created by robwilliams on 15-04-11.
 */
public abstract class AMultiMediaServiceImpl {
    protected final static Log log = Log.getLogger(AMultiMediaServiceImpl.class);

    private EventType mPositionEventType;

    public JSONObject play() throws JSONException, BossException {
        log.v();
        return getStatus();
    }

    public JSONObject toggleShuffle() throws JSONException, BossException {
        log.v();
        return getStatus();
    }

    public JSONObject toggleRepeat() throws JSONException, BossException {
        log.v();
        return getStatus();
    }

    public JSONObject pause() throws JSONException, BossException {
        log.v();
        return getStatus();
    }

    public JSONObject getStatus() throws JSONException, BossException {
        log.v();
        JSONObject toReturn = new JSONObject();
        toReturn.put("result", 1);

        return toReturn;
    }

    public JSONObject skip(boolean isBack) throws JSONException, BossException {
        log.v();
        return getStatus();
    }

    public JSONObject playWithContext(String uid, String context, String contextId) throws JSONException, BossException {
        log.v();
        return getStatus();
    }

    public JSONObject getLibrary() throws JSONException, IOException, BossException {
        log.v("get library");
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
