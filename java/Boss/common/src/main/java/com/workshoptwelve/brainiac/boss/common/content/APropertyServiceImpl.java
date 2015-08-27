package com.workshoptwelve.brainiac.boss.common.content;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.List;

/**
 * Created by robwilliams on 15-08-27.
 */
public abstract class APropertyServiceImpl {
    public abstract JSONObject set(JSONObject values) throws JSONException;
    public abstract JSONObject get(List<String> names, JSONObject defaultValues) throws JSONException;
}
