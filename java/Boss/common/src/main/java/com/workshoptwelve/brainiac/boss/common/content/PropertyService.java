package com.workshoptwelve.brainiac.boss.common.content;

import com.workshoptwelve.brainiac.boss.common.error.BossError;
import com.workshoptwelve.brainiac.boss.common.error.BossException;
import com.workshoptwelve.brainiac.boss.common.server.AEndPoint;
import com.workshoptwelve.brainiac.boss.common.server.AService;

import org.json.JSONException;
import org.json.JSONObject;

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
            if (!params.containsKey("name")) {
                throw new BossException(BossError.PARAMETER_MISSING,"name");
            }
            String name = params.get("name");
            String defaultValue = params.get("value"); // may not exist.

            return mPropertyServiceImpl.get(name,defaultValue);
        }
    };
    private AEndPoint mSetter = new AEndPoint("set") {
        @Override
        public JSONObject execute(List<String> headers, HashMap<String, String> params) throws BossException, JSONException {
            if (!params.containsKey("name")) {
                throw new BossException(BossError.PARAMETER_MISSING,"name");
            }
            if (!params.containsKey("value")) {
                throw new BossException(BossError.PARAMETER_MISSING,"value");
            }
            String name = params.get("name");
            String value = params.get("value");
            return mPropertyServiceImpl.set(name,value);
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
