package com.workshoptwelve.brainiac.localui.extension;

import android.content.Context;

import com.workshoptwelve.brainiac.boss.common.log.Log;

import org.json.JSONException;
import org.json.JSONObject;
import org.xwalk.core.XWalkExtension;

/**
 * Created by robwilliams on 15-08-29.
 */
public class SystemThemeExtension extends XWalkExtension {
    private static final Log log = Log.getLogger(SystemThemeExtension.class);

    private static final String NAME = "brainiacSystemTheme";
    private static final String JS_API = "exports.adviseTheme = function(theme) { extension.postMessage(JSON.stringify({cmd:'adviseTheme', 'theme': theme})); };";
    private final Context mContext;

    public static JSONObject getSystemTheme() {
        return sTheme;
    }

    private static JSONObject sTheme = null;

    public SystemThemeExtension(Context context) {
        super(NAME,JS_API);
        mContext = context;
    }

    @Override
    public void onMessage(int i, String s) {
        try {
            JSONObject command = new JSONObject(s);
            if (command.has("theme")) {
                sTheme = command.getJSONObject("theme");
            }
            log.e(s);
        } catch (JSONException je) {
            log.e("Could not process SFX message",je);
        }
    }


    @Override
    public String onSyncMessage(int i, String s) {
        log.e("On Sync Message...");
        return "This does nothing yet.";
    }
}
