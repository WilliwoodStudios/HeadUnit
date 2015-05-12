package com.workshoptwelve.brainiac.boss.common.hardware.obdii;

import com.workshoptwelve.brainiac.boss.common.error.BossError;
import com.workshoptwelve.brainiac.boss.common.error.BossException;
import com.workshoptwelve.brainiac.boss.common.server.AEndPoint;
import com.workshoptwelve.brainiac.boss.common.server.AService;
import com.workshoptwelve.brainiac.boss.common.util.BlockingFuture;
import com.workshoptwelve.brainiac.boss.common.util.Hex;
import com.workshoptwelve.brainiac.boss.common.util.MyTextUtils;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.HashMap;
import java.util.List;
import java.util.concurrent.TimeUnit;

/**
 * Created by robwilliams on 15-05-07.
 */
public class OBDService extends AService {
    private static final char[] sDTCFirstChar = "PCBU".toCharArray();
    private static final OBDService sInstance = new OBDService();
    private IOBDConnection sOBDConnection;
    private AEndPoint mSendPID = new AEndPoint("sendPID") {
        @Override
        public JSONObject execute(List<String> headers, HashMap<String, String> params) throws BossException, JSONException {
            checkConnection();

            int mode = getInt(params, "mode");
            int pid = getInt(params, "pid");

            checkVehicle();

            sOBDConnection.checkPIDSupport(mode, pid);

            final BlockingFuture<String> response = new BlockingFuture<String>();
            final String command = String.format("%02X%02X", mode, pid);

            sOBDConnection.sendCommand(command, response);
            String toSend = response.get(5, TimeUnit.SECONDS);

            JSONObject toReturn = new JSONObject();
            toReturn.put("result", 1);
            JSONObject obd = new JSONObject();
            toReturn.put("obd", obd);
            obd.put("response", toSend);
            return toReturn;
        }
    };
    private AEndPoint mGetStatus = new AEndPoint("getStatus") {
        @Override
        public JSONObject execute(List<String> headers, HashMap<String, String> params) throws BossException, JSONException {
            checkConnection();

            JSONObject toReturn = new JSONObject();
            JSONObject obd = new JSONObject();
            toReturn.put("result", 1);
            toReturn.put("obdii", obd);

            obd.put("vehicleConnected", sOBDConnection.isVehicleConnected());
            obd.put("deviceConnected", sOBDConnection.isDeviceConnected());
            String version = sOBDConnection.getDeviceVersion();
            if (!MyTextUtils.isEmpty(version)) {
                obd.put("deviceVersion", version);
            }

            return toReturn;
        }
    };

    private AEndPoint mGetDTC = new AEndPoint("getDTC") {
        @Override
        public JSONObject execute(List<String> headers, HashMap<String, String> params) throws BossException, JSONException {
            checkConnection();

            final BlockingFuture<String> response = new BlockingFuture<String>();
            sOBDConnection.sendCommand("03", response);

            String responseString = response.get(5, TimeUnit.SECONDS);
            JSONObject toReturn = new JSONObject();
            toReturn.put("TODO", responseString); // TODO make this better JSON.
            return toReturn;
        }
    };

    private AEndPoint mClearDTC = new AEndPoint("clearDTC") {
        @Override
        public JSONObject execute(List<String> headers, HashMap<String, String> params) throws BossException, JSONException {
            checkConnection();
            throw new BossException(BossError.NOT_IMPLEMENTED);
        }
    };

    public OBDService() {
        super("/brainiac/service/hardware/obd");

        addEndPoint(mSendPID);
        addEndPoint(mGetStatus);
        addEndPoint(mGetDTC);
        addEndPoint(mClearDTC);
    }

    public static OBDService getInstance() {
        return sInstance;
    }

    public void setOBDConnection(IOBDConnection connection) {
        sOBDConnection = connection;
    }

    private void checkConnection() throws BossException {
        if (sOBDConnection == null) {
            throw new BossException(BossError.NOT_IMPLEMENTED);
        }
    }

    /**
     * Convert two numeric bytes to a Diagnostic Trouble Code [DTC]. DTC typically look like: P0731
     *
     * @param bytes
     * @return
     */
    private String twoBytesToDTC(byte[] bytes) {
        StringBuilder toReturn = new StringBuilder();
        if (bytes == null || bytes.length != 2) {
            return "";
        }
        int first = bytes[0] & 0xff;
        int letter = first >> 6;

        toReturn.append(sDTCFirstChar[letter]);

        int second = first >> 4 & 0x3;
        toReturn.append(Hex.hexChars[second]);

        int third = first & 0xf;
        toReturn.append(Hex.hexChars[third]);

        int secondByte = bytes[1] & 0xff;
        toReturn.append(Hex.hexChars[secondByte >> 4]);
        toReturn.append(Hex.hexChars[secondByte & 0xf]);
        return toReturn.toString();
    }

    private void checkVehicle() throws BossException {
        if (!sOBDConnection.isVehicleConnected()) {
            throw new BossException(BossError.OBD_VEHICLE_NOT_DETECTED);
        }
        if (!sOBDConnection.isDeviceConnected()) {
            throw new BossException(BossError.OBD_NO_DEVICE_CONNECTED);
        }
    }
}
