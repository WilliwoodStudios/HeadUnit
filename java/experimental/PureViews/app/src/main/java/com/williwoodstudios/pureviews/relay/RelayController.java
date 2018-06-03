package com.williwoodstudios.pureviews.relay;

import android.app.Activity;
import android.content.Context;
import android.content.SharedPreferences;
import android.util.Log;
import android.view.View;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.ArrayList;

/**
 * Created by brcewane on 2018-06-03.
 */

public class RelayController {
    private ArrayList<Relay> mRelays = new ArrayList<Relay>();
    private Activity mActivity;
    private String DEFAULT_RELAYS = "{\n" +
            "    \"relays\": [\n" +
            "        {\n" +
            "            \"name\": \"Relay 1\",\n" +
            "            \"icon\": \"core_power\"\n" +
            "        },\n" +
            "        {\n" +
            "            \"name\": \"Relay 2\",\n" +
            "            \"icon\": \"core_suspension_img_icon_256x256\"\n" +
            "        },\n" +
            "        {\n" +
            "            \"name\": \"Relay 3\",\n" +
            "            \"icon\": \"core_power\"\n" +
            "        },\n" +
            "        {\n" +
            "            \"name\": \"Relay 4\",\n" +
            "            \"icon\": \"core_power\"\n" +
            "        },\n" +
            "        {\n" +
            "            \"name\": \"Relay 5\",\n" +
            "            \"icon\": \"core_power\"\n" +
            "        },\n" +
            "        {\n" +
            "            \"name\": \"Relay 6\",\n" +
            "            \"icon\": \"core_power\"\n" +
            "        },\n" +
            "        {\n" +
            "            \"name\": \"Relay 7\",\n" +
            "            \"icon\": \"core_power\"\n" +
            "        },\n" +
            "        {\n" +
            "            \"name\": \"Relay 8\",\n" +
            "            \"icon\": \"core_power\"\n" +
            "        }\n" +
            "    ]\n" +
            "}";

    // Defines a specific relay
    public class Relay {
        private int mIndex;
        private int mResourceId;
        private String mLabel;
        private boolean isInOnPosition = false;
        public Relay(int index, int resourceId, String label) {
            super();
            mIndex = index;
            mResourceId = resourceId;
            mLabel = label;
        }
        public int getResourceId() {return mResourceId;}
        public int getIndex() {return mIndex; }
        public String getLabel() {return mLabel;}
    }

    public RelayController(Activity activity) {
        super();
        mActivity = activity;
        loadFromPreferences();
    }

    // Load all the relay information from JSON
    private void loadFromPreferences() {
        // Retrieve our relay preferences
        SharedPreferences prefs = mActivity.getPreferences(Context.MODE_PRIVATE);
        String relayJSON = prefs.getString("brainiac.relays", DEFAULT_RELAYS);
        try {
            JSONObject JSON = new JSONObject(relayJSON);
            // Retrieve all the relays
            JSONArray relays = JSON.getJSONArray("relays");
            for (int i = 0; i < relays.length(); i++) {
                JSONObject item = relays.getJSONObject(i);
                int resourceId = mActivity.getResources().getIdentifier(item.getString("icon"),"drawable", mActivity.getPackageName());
                Relay relay = new Relay(i, resourceId, item.getString("name"));
                mRelays.add(relay);
            }
        } catch (Exception e) {
            Log.d("BRAINIAC", "JSON parsing :" + e.getMessage());
        }
    }

    public void saveToPreferences() {
        //TODO: Serialize and save to preferences
    }

    public ArrayList<Relay> getRelays() {return mRelays;}

}
