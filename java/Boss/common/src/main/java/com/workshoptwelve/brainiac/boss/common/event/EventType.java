package com.workshoptwelve.brainiac.boss.common.event;

import org.json.JSONException;
import org.json.JSONObject;

/**
 * Created by robwilliams on 15-04-10.
 */
public class EventType {
    private final String mName;
    private final String mCodeAsString;
    private final byte[] mCode;
    private JSONObject mAsJSON;

    public EventType(String prettyName, String code) {
        mName = prettyName;
        while (code.endsWith("|")) {
            code = code.substring(0, code.length() - 1);
        }
        mCodeAsString = code;
        mCode = (code + "|").getBytes();
    }

    public byte[] getEventCode() {
        return mCode;
    }

    public String getEventCodeAsString() {
        return mCodeAsString;
    }

    public String getEventName() {
        return mName;
    }

    public JSONObject toJSON() throws JSONException {
        if (mAsJSON != null) {
            return mAsJSON;
        }
        JSONObject toReturn = new JSONObject();
        toReturn.put("name", mName);
        toReturn.put("code", mCodeAsString);
        mAsJSON = toReturn;
        return toReturn;
    }
}
