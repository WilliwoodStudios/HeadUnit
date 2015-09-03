package com.workshoptwelve.brainiac.boss.common.multimedia;

import com.workshoptwelve.brainiac.boss.common.error.BossError;
import com.workshoptwelve.brainiac.boss.common.error.BossException;
import com.workshoptwelve.brainiac.boss.common.server.AEndPoint;
import com.workshoptwelve.brainiac.boss.common.server.AService;
import com.workshoptwelve.brainiac.boss.common.event.EventType;
import com.workshoptwelve.brainiac.boss.common.log.Log;
import com.workshoptwelve.brainiac.boss.common.server.WebSocketDispatcher;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;

/**
 * Created by robwilliams on 15-04-10.
 */
public class MultiMediaService extends AService {
    private static final Log log = Log.getLogger(MultiMediaService.class);
    private static MultiMediaService sInstance = new MultiMediaService();
    protected EventType mPositionEventType = new EventType("Multi Media Position", "B:SYS:MM:POS"); // TODO manage in single file?
    private List<AEndPoint> mEndPoints;
    private AMultiMediaServiceImpl mMultiMediaServiceImpl;
    private AEndPoint mPlay = new AEndPoint("play") {
        @Override
        public JSONObject execute(List<String> headers, HashMap<String, String> params) throws JSONException, BossException {
            log.d("Play");
            return mMultiMediaServiceImpl.play();
        }
    };
    private AEndPoint mGetLibrary = new AEndPoint("getLibrary") {
        @Override
        public JSONObject execute(List<String> headers, HashMap<String,String> params) throws JSONException, BossException {
            log.d("Get Library");
            try {
                return mMultiMediaServiceImpl.getLibrary();
            } catch (IOException ioe) {
                throw new BossException(BossError.UNSPECIFIED_ERROR,ioe);
            }
        }
    };
    private AEndPoint mPause = new AEndPoint("pause") {
        @Override
        public JSONObject execute(List<String> headers, HashMap<String, String> params) throws JSONException, BossException {
            log.d("Pause");
            return mMultiMediaServiceImpl.pause();
        }
    };
    private AEndPoint mGetStatus = new AEndPoint("getStatus") {
        @Override
        public JSONObject execute(List<String> headers, HashMap<String, String> params) throws JSONException, BossException {
            log.d("getStatus");
            return mMultiMediaServiceImpl.getStatus();
        }
    };

    private AEndPoint mPlayWithContext = new AEndPoint("playWithContext") {
        @Override
        public JSONObject execute(List<String> headers, HashMap<String, String> params) throws BossException, JSONException {
            String uid = params.get("uid");
            String context = params.get("context");
            String contextId = params.get("contextId");
            if (uid == null || context == null || contextId == null) {
                throw new BossException(BossError.PARAMETER_MISSING);
            }
            return mMultiMediaServiceImpl.playWithContext(uid, context, contextId);
        }
    };

    private AEndPoint mSkip = new AEndPoint("skip") {
        @Override
        public JSONObject execute(List<String> headers, HashMap<String, String> params) throws BossException, JSONException {
            String direction = params.get("direction");
            boolean back = direction.equalsIgnoreCase("back");
            return mMultiMediaServiceImpl.skip(back);
        }
    };

    private AEndPoint mShuffle = new AEndPoint("shuffle") {
        @Override
        public JSONObject execute(List<String> headers, HashMap<String, String> params) throws BossException, JSONException {
            return mMultiMediaServiceImpl.toggleShuffle();
        }
    };

    private AEndPoint mRepeat = new AEndPoint("repeat") {
        @Override
        public JSONObject execute(List<String> headers, HashMap<String, String> params) throws BossException, JSONException {
            return mMultiMediaServiceImpl.toggleRepeat();
        }
    };

    MultiMediaService() {
        super("/brainiac/service/mm");

        addEndPoint(mShuffle);
        addEndPoint(mRepeat);
        addEndPoint(mPlay);
        addEndPoint(mPause);
        addEndPoint(mPlayWithContext);
        addEndPoint(mSkip);
        addEndPoint(mGetStatus);
        addEndPoint(mGetLibrary);

        addEventType(mPositionEventType);

        setWebSocketDispatcher(mWebSocketDispatcher);
    }

    private WebSocketDispatcher mWebSocketDispatcher = new WebSocketDispatcher();

    public static MultiMediaService getInstance() {
        return sInstance;
    }

    public EventType getPositionEventType() {
        return mPositionEventType;
    }

    public void setMultiMediaServiceImpl(AMultiMediaServiceImpl impl) {
        mMultiMediaServiceImpl = impl;
        impl.setWebSocketDispatcher(mWebSocketDispatcher);
    }
}
