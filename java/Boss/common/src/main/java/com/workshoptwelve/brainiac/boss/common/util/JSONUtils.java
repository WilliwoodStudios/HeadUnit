package com.workshoptwelve.brainiac.boss.common.util;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.json.JSONTokener;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by robwilliams on 15-08-27.
 */
public class JSONUtils {
    public static JSONObject getJSONObject(String source) {
        if (!MyTextUtils.isEmpty(source)) {
            try {
                JSONTokener token = new JSONTokener(source);
                Object toReturn = token.nextValue();
                if (toReturn instanceof JSONObject) {
                    return (JSONObject) toReturn;
                }
            } catch (JSONException toIgnore) {
                // ignoring.
            }
        }
        return null;
    }

    public static List<String> toList(JSONArray array) throws JSONException {
        ArrayList<String> toReturn = new ArrayList<>();
        for (int i=0; array!= null && i<array.length(); ++i) {
            toReturn.add(array.getString(i));
        }
        return toReturn;
    }

    public static JSONArray getJSONArray(String source) {
        if (!MyTextUtils.isEmpty(source)) {
            try {
                JSONTokener token = new JSONTokener(source);
                Object toReturn = token.nextValue();
                if (toReturn instanceof JSONArray) {
                    return (JSONArray) toReturn;
                }
            } catch (JSONException toIgnore) {
                // ignoring.
            }
        }
        return null;
    }
}
