package com.workshoptwelve.brainiac.boss.common.multimedia;

import com.workshoptwelve.brainiac.boss.common.AEndPoint;
import com.workshoptwelve.brainiac.boss.common.AService;
import com.workshoptwelve.brainiac.boss.common.event.EventType;
import com.workshoptwelve.brainiac.boss.common.log.Log;

import org.json.JSONObject;

import java.util.HashMap;
import java.util.List;

/**
 * Created by robwilliams on 15-04-10.
 */
public class MultiMediaService extends AService {
    private static MultiMediaService sInstance = new MultiMediaService();
    protected EventType mPositionEventType = new EventType("Multi Media Position", "B:SYS:MM:POS");
    private List<AEndPoint> mEndPoints;
    private AMultiMediaServiceImpl mMultiMediaServiceImpl;
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

    public static MultiMediaService getInstance() {
        return sInstance;
    }

    public EventType getPositionEventType() {
        return mPositionEventType;
    }

    public void setMultiMediaServiceImpl(AMultiMediaServiceImpl impl) {
        mMultiMediaServiceImpl = impl;
    }
}
