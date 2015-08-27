package com.workshoptwelve.brainiac.boss.common.content;

import com.workshoptwelve.brainiac.boss.common.error.BossError;
import com.workshoptwelve.brainiac.boss.common.error.BossException;
import com.workshoptwelve.brainiac.boss.common.server.AEndPoint;
import com.workshoptwelve.brainiac.boss.common.server.AService;
import com.workshoptwelve.brainiac.boss.common.util.JSONUtils;
import com.workshoptwelve.brainiac.boss.common.util.MyTextUtils;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.json.JSONString;
import org.json.JSONTokener;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

/**
 * Created by robwilliams on 15-08-27.
 */
public class PropertyService extends AService {
    private static PropertyService sInstance = new PropertyService();
    private APropertyServiceImpl mPropertyServiceImpl;
    private AEndPoint mGetter = new AEndPoint("get") {
        @Override
        public JSONObject execute(List<String> headers, HashMap<String, String> params) throws BossException, JSONException {
            if (!params.containsKey("names")) {
                throw new BossException(BossError.PARAMETER_MISSING,"names");
            }

            List<String> names = JSONUtils.toList(JSONUtils.getJSONArray(params.get("names")));
            if (names.size()==0) {
                throw new BossException(BossError.PARAMETER_BAD,"names isn't a json array");
            }
            JSONObject defaultValues = JSONUtils.getJSONObject(params.get("defaultValues"));

            return mPropertyServiceImpl.get(names,defaultValues);
        }
    };
    private AEndPoint mSetter = new AEndPoint("set") {
        @Override
        public JSONObject execute(List<String> headers, HashMap<String, String> params) throws BossException, JSONException {
            if (!params.containsKey("values")) {
                throw new BossException(BossError.PARAMETER_MISSING,"values");
            }

            JSONObject values = new JSONObject(params.get("values"));
            return mPropertyServiceImpl.set(values);
        }
    };

    public PropertyService() {
        super("brainiac/service/data");

        addEndPoint(mGetter);
        addEndPoint(mSetter);
    }

    public static PropertyService getInstance() {
        return sInstance;
    }

    public void setPropertyServiceImpl(APropertyServiceImpl impl) {
        this.mPropertyServiceImpl = impl;
    }
}
