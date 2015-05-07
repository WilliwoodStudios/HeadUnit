package com.workshoptwelve.brainiac.boss.common.log;

import com.workshoptwelve.brainiac.boss.common.server.AEndPoint;
import com.workshoptwelve.brainiac.boss.common.server.AService;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.HashMap;
import java.util.List;

/**
 * Created by robwilliams on 15-05-07.
 */
public class LogService extends AService {

    public static LogService getInstance() {
        return sInstance;
    }
    private static LogService sInstance = new LogService();

    protected LogService() {
        super("/brainiac/util/log");
        addEndPoint(mLogLevels);
        addEndPoint(mSetLogLevel);
    }

    private AEndPoint mLogLevels = new AEndPoint("getLogLevels") {
        @Override
        public JSONObject execute(List<String> headers, HashMap<String, String> params) throws Exception {
            Log [] getKnownLogs = Log.getKnownLogs();
            JSONObject toReturn = buildResultOne();
            JSONArray array = new JSONArray();
            toReturn.put("logs",array);
            for (Log log : getKnownLogs) {
                JSONObject toAdd = new JSONObject();
                toAdd.put("name",log.getName());
                toAdd.put("level",String.valueOf(log.getLogLevel()));
                array.put(toAdd);
            }
            return toReturn;
        }
    };

    private AEndPoint mSetLogLevel = new AEndPoint("setLogLevel") {
        @Override
        public JSONObject execute(List<String> headers, HashMap<String, String> params) throws Exception {
            String name = getString(params,"name");
            String level = getString(params,"logLevel");

            Log.Level logLevel = Log.Level.valueOf(level);

            Log.setLogLevel(name,logLevel);

            return buildResultOne();
        }
    };

}
