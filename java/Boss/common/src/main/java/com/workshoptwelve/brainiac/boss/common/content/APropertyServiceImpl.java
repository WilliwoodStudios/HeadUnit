package com.workshoptwelve.brainiac.boss.common.content;

import org.json.JSONException;
import org.json.JSONObject;

/**
 * Created by robwilliams on 15-08-27.
 */
public abstract class APropertyServiceImpl {
    public abstract JSONObject set(String name, String value) throws JSONException;
    public abstract JSONObject get(String name, String defaultValue) throws JSONException;
}
