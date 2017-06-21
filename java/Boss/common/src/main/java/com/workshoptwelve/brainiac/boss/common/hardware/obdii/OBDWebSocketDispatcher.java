package com.workshoptwelve.brainiac.boss.common.hardware.obdii;

import com.workshoptwelve.brainiac.boss.common.server.WebSocketDispatcher;

/**
 * Created by robwilliams on 15-09-18.
 */
public class OBDWebSocketDispatcher extends WebSocketDispatcher {
    protected OBDService mService;

    public OBDWebSocketDispatcher(OBDService service) {
        mService = service;
    }
}
