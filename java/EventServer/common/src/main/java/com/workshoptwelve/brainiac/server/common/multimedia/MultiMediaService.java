package com.workshoptwelve.brainiac.server.common.multimedia;

import com.workshoptwelve.brainiac.server.common.AEndPoint;
import com.workshoptwelve.brainiac.server.common.AService;
import com.workshoptwelve.brainiac.server.common.event.EventType;
import com.workshoptwelve.brainiac.server.common.log.Log;

import org.json.JSONObject;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;

/**
 * Created by robwilliams on 15-04-10.
 */
public class MultiMediaService extends AService {
    public static MultiMediaService getInstance() {
        return sInstance;
    }

    private static MultiMediaService sInstance = new MultiMediaService();

    private List<AEndPoint> mEndPoints;

    MultiMediaService() {
        super("/brainiac/service/mm");

        addEndPoint(mPlay);
        addEndPoint(mPause);
        addEndPoint(mResume);
        addEndPoint(mStop);
        addEndPoint(mSeek);
        addEndPoint(mGetStatus);
        addEndPoint(mGetPosition);

        addEventType(mPositionEventType);
    }

    protected EventType mPositionEventType = new EventType("Multi Media Position","B:SYS:MM:POS");
    public EventType getPositionEventType() {
        return mPositionEventType;
    }

    private AMultiMediaServiceImpl mMultiMediaServiceImpl;

    public void setMultiMediaServiceImpl(AMultiMediaServiceImpl impl) {
        mMultiMediaServiceImpl = impl;
    }

    private AEndPoint mPlay = new AEndPoint("play") {
        @Override
        public JSONObject execute(List<String> headers, HashMap<String, String> params) throws Exception {
            Log.d("Play");
            return mMultiMediaServiceImpl.play();
        }
    };

    private AEndPoint mPause = new AEndPoint("pause") {
        @Override
        public JSONObject execute(List<String> headers, HashMap<String, String> params) throws Exception {
            Log.d("Pause");
            return mMultiMediaServiceImpl.pause();
        }
    };

    private AEndPoint mResume = new AEndPoint("resume") {
        @Override
        public JSONObject execute(List<String> headers, HashMap<String, String> params) throws Exception {
            Log.d("resume");
            return mMultiMediaServiceImpl.resume();
        }
    };

    private AEndPoint mStop = new AEndPoint("stop") {
        @Override
        public JSONObject execute(List<String> headers, HashMap<String, String> params) throws Exception {
            Log.d("stop");
            return mMultiMediaServiceImpl.stop();
        }
    };

    private AEndPoint mSeek = new AEndPoint("seek") {
        @Override
        public JSONObject execute(List<String> headers, HashMap<String, String> params) throws Exception {
            Log.d("seek");
            int to = getInt(params, "to");
            return mMultiMediaServiceImpl.seek(to);
        }
    };

    private AEndPoint mGetStatus = new AEndPoint("getStatus") {
        @Override
        public JSONObject execute(List<String> headers, HashMap<String, String> params) throws Exception {
            Log.d("getStatus");
            return mMultiMediaServiceImpl.getStatus();
        }
    };

    private AEndPoint mGetPosition = new AEndPoint("getPosition") {
        @Override
        public JSONObject execute(List<String> headers, HashMap<String, String> params) throws Exception {
            Log.d("getPosition");
            return mMultiMediaServiceImpl.getStatus();
        }
    };
}
