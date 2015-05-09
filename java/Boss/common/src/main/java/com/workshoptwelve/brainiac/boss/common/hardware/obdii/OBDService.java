package com.workshoptwelve.brainiac.boss.common.hardware.obdii;

import com.workshoptwelve.brainiac.boss.common.error.BossError;
import com.workshoptwelve.brainiac.boss.common.error.BossException;
import com.workshoptwelve.brainiac.boss.common.server.AEndPoint;
import com.workshoptwelve.brainiac.boss.common.server.AService;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.HashMap;
import java.util.List;

/**
 * Created by robwilliams on 15-05-07.
 */
public class OBDService extends AService {
    private static OBDService sInstance = new OBDService();

    private AEndPoint mSendPID = new AEndPoint("sendPID") {
        @Override
        public JSONObject execute(List<String> headers, HashMap<String, String> params) throws BossException, JSONException {
            checkImplementation();
            int mode = getInt(params,"mode");
            int pid = getInt(params,"pid");
            return mOBDServiceImpl.sendPID(mode,pid);
        }
    };

    private AOBDServiceImpl mOBDServiceImpl;

    private AEndPoint mGetStatus = new AEndPoint("getStatus") {
        @Override
        public JSONObject execute(List<String> headers, HashMap<String, String> params) throws BossException, JSONException {
            checkImplementation();
            return mOBDServiceImpl.getStatus();
        }
    };

    public OBDService() {
        super("/brainiac/service/hardware/obd");

        addEndPoint(mSendPID);
        addEndPoint(mGetStatus);
    }

    public static OBDService getInstance() {
        return sInstance;
    }

    public void setOBDServiceImpl(AOBDServiceImpl impl) {
        mOBDServiceImpl = impl;
    }

    private void checkImplementation() throws BossException {
        if (mOBDServiceImpl == null) {
            throw new BossException(BossError.NOT_IMPLEMENTED);
        }
    }
}
