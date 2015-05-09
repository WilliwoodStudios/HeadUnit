package com.workshoptwelve.brainiac.boss.common.hardware.obdii;

import com.workshoptwelve.brainiac.boss.common.error.BossException;

import org.json.JSONException;
import org.json.JSONObject;

/**
 * Created by robwilliams on 15-05-07.
 */
public abstract class AOBDServiceImpl {
    public abstract JSONObject getStatus() throws BossException, JSONException;
    public abstract JSONObject sendPID(int mode, int pid) throws BossException, JSONException;
}
