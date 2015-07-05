package com.workshoptwelve.brainiac.boss.common.hardware.accessory;

import com.workshoptwelve.brainiac.boss.common.error.BossError;
import com.workshoptwelve.brainiac.boss.common.error.BossException;
import com.workshoptwelve.brainiac.boss.common.server.AEndPoint;
import com.workshoptwelve.brainiac.boss.common.server.AService;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.HashMap;
import java.util.List;

/**
 * Created by robwilliams on 15-06-29.
 */
public class AccessoryService extends AService {
    private static final String PATH = "/brainiac/service/hardware/acc";
    private IAccessoryManager mAccessoryManager;

    public static AccessoryService getInstance() {
        return sInstance;
    }

    private static final AccessoryService sInstance = new AccessoryService();

    private AccessoryService() {
        super(PATH);

        addEndPoint(mDeviceListEndPoint);
        addEndPoint(mDeviceCommandEndPoint);
    }

    class DeviceListEndPoint extends AEndPoint {
        public DeviceListEndPoint() {
            super("list");
        }

        @Override
        public JSONObject execute(List<String> headers, HashMap<String, String> params) throws BossException, JSONException {
            if (mAccessoryManager == null) {
                throw new BossException(BossError.UNSPECIFIED_ERROR);
            }
            JSONObject toReturn = buildResultOne();
            toReturn.put("accessories",mAccessoryManager.getConnectedAccessories());
            return toReturn;
        }
    };
    private DeviceListEndPoint mDeviceListEndPoint = new DeviceListEndPoint();

    class DeviceCommandEndPoint extends AEndPoint {
        public DeviceCommandEndPoint() {
            super("command");
        }

        @Override
        public JSONObject execute(List<String> headers, HashMap<String, String> params) throws BossException, JSONException {
            if (mAccessoryManager == null) {
                throw new BossException(BossError.UNSPECIFIED_ERROR);
            }
            String serialNumber = params.get("serialNumber");
            String command = params.get("command");
            if (serialNumber == null || command == null) {
                throw new BossException(BossError.PARAMETER_MISSING);
            }
            String response = mAccessoryManager.sendCommandToAccessory(serialNumber,command);

            JSONObject toReturn = buildResultOne();
            toReturn.put("response",response);
            return toReturn;
        }
    }

    private DeviceCommandEndPoint mDeviceCommandEndPoint = new DeviceCommandEndPoint();

    public void setAccessoryManager(IAccessoryManager manager) {
        mAccessoryManager = manager;
    }

}
