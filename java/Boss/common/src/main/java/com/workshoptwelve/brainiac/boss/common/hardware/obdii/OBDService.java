package com.workshoptwelve.brainiac.boss.common.hardware.obdii;

import com.workshoptwelve.brainiac.boss.common.error.BossError;
import com.workshoptwelve.brainiac.boss.common.error.BossException;
import com.workshoptwelve.brainiac.boss.common.log.Log;
import com.workshoptwelve.brainiac.boss.common.server.AEndPoint;
import com.workshoptwelve.brainiac.boss.common.server.AService;
import com.workshoptwelve.brainiac.boss.common.util.BlockingFuture;
import com.workshoptwelve.brainiac.boss.common.util.Hex;
import com.workshoptwelve.brainiac.boss.common.util.MyTextUtils;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.HashMap;
import java.util.List;
import java.util.concurrent.TimeUnit;

/**
 * Created by robwilliams on 15-05-07.
 */
public class OBDService extends AService {
    public static final String TEST_AC_REFRIGERANT = "acRefrigerant";
    public static final String TEST_BOOST_PRESSURE = "boostPressure";
    public static final String TEST_CATALYST = "catalyst";
    public static final String TEST_EGR_SYSTEM = "egrSystem";
    public static final String TEST_EGR_VVT_SYSTEM = "egrVvtSystem";
    public static final String TEST_EVAPORATIVE_SYSTEM = "evaporativeSystem";
    public static final String TEST_EXHAUST_GAS_SENSOR = "exhaustGasSensor";
    public static final String TEST_HEATED_CATALYST = "headetCatalyst";
    public static final String TEST_NMHC_CATALYST = "nmhcCatalyst";
    public static final String TEST_NOX_SCR_MONITOR = "noxScrMonitor";
    public static final String TEST_OXYGEN_SENSOR = "oxygenSensor";
    public static final String TEST_OXYGEN_SENSOR_HEATER = "oxygenSensorHeater";
    public static final String TEST_PM_FILTER_MONITORING = "pmFilterMonitoring";
    public static final String TEST_SECONDARY_AIR_SYSTEM = "secondaryAirSystem";

    static final Log log = Log.getLogger(OBDService.class);
    static final String[] sSparkTestNames = new String[]{
            TEST_CATALYST,
            TEST_HEATED_CATALYST,
            TEST_EVAPORATIVE_SYSTEM,
            TEST_SECONDARY_AIR_SYSTEM,
            TEST_AC_REFRIGERANT,
            TEST_OXYGEN_SENSOR,
            TEST_OXYGEN_SENSOR_HEATER,
            TEST_EGR_SYSTEM
    };
    static final String[] sCompressionTestNames = new String[]{
            TEST_NMHC_CATALYST,
            TEST_NOX_SCR_MONITOR,
            null,
            TEST_BOOST_PRESSURE,
            null,
            TEST_EXHAUST_GAS_SENSOR,
            TEST_PM_FILTER_MONITORING,
            TEST_EGR_VVT_SYSTEM
    };

    private static final char[] sDTCFirstChar = "PCBU".toCharArray();
    private static final OBDService sInstance = new OBDService();
    private static final String KEY_AVAILABLE = "available";
    private static final String KEY_COMPONENTS = "components";
    private static final String KEY_DEVICE_CONNECTED = "deviceConnected";
    private static final String KEY_DEVICE_VERSION = "deviceVersion";
    private static final String KEY_DTC_CODES = "dtcCodes";
    private static final String KEY_DTC_COUNT = "dtcCount";
    private static final String KEY_ENGINE_IGNITION_TYPE = "engineIgnitionType";
    private static final String KEY_FUEL_SYSTEM = "fuelSystem";
    private static final String KEY_INCOMPLETE = "incomplete";
    private static final String KEY_MIL_ON = "milOn";
    private static final String KEY_MISFIRE = "misfire";
    private static final String KEY_OBD = "obd";
    private static final String KEY_RESPONSE = "response";
    private static final String KEY_SINCE_DTC_CLEARED = "sinceDtcCleared";
    private static final String KEY_TESTS = "tests";
    private static final String KEY_THIS_DRIVE_CYCLE = "thisDriveCycle";
    private static final String KEY_VEHICLE_CONNECTED = "vehicleConnected";
    private static final String PARAM_MODE = "mode";
    private static final String PARAM_PID = "pid";
    private static final String PATH = "/brainiac/service/hardware/obd";
    private static final String PATH_CLEAR_DTC = "clearDtc";
    private static final String PATH_GET_DTC = "getDtc";
    private static final String PATH_GET_OBD_STATUS = "getObdStatus";
    private static final String PATH_GET_TEST_STATUS = "getTestStatus";
    private static final String PATH_SEND_PID = "sendPid";
    private static final String VALUE_COMPRESSION = "compression";
    private static final String VALUE_SPARK = "spark";

    /**
     * This is the connection to the device.
     */
    private IOBDConnection sOBDConnection;

    private OBDWebSocketDispatcher mWebSocketDispatcher = new OBDWebSocketDispatcher(this);

    /**
     * Constructor registers end points.
     */
    public OBDService() {
        super(PATH);

        log.setLogLevel(Log.Level.v);

        addEndPoint(new SendPID());
        addEndPoint(new GetOBDStatus());
        addEndPoint(new GetDTC());
        addEndPoint(new ClearDTC());
        addEndPoint(new GetTestStatus());

        setWebSocketDispatcher(mWebSocketDispatcher);
    }

    /**
     * Get the singleton.
     * @return
     */
    public static OBDService getInstance() {
        return sInstance;
    }

    /**
     * Set the @{IOBDConnection} to use.
     * @param connection
     */
    public void setOBDConnection(IOBDConnection connection) {
        sOBDConnection = connection;
    }

    /**
     * Get the in use @{IOBDConnection}.
     * @return The in use connection.
     */
    public IOBDConnection getOBDConnection() {
        return sOBDConnection;
    }

    /**
     * Check if the connection is been set.
     * @throws BossException if the connection has not been set.
     */
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
    private String twoBytesToDTC(byte[] bytes, int offset) {
        StringBuilder toReturn = new StringBuilder();
        if (bytes == null || bytes.length <= offset + 1) {
            return "";
        }
        int first = bytes[offset] & 0xff;
        int letter = first >> 6;

        toReturn.append(sDTCFirstChar[letter]);

        int second = first >> 4 & 0x3;
        toReturn.append(Hex.hexChars[second]);

        int third = first & 0xf;
        toReturn.append(Hex.hexChars[third]);

        int secondByte = bytes[offset + 1] & 0xff;
        toReturn.append(Hex.hexChars[secondByte >> 4]);
        toReturn.append(Hex.hexChars[secondByte & 0xf]);
        return toReturn.toString();
    }

    /**
     * Check if the device is connected and if a vehicle is connected.
     * @throws BossException
     */
    private void checkVehicle() throws BossException {
        if (!sOBDConnection.isDeviceConnected()) {
            throw new BossException(BossError.OBD_NO_DEVICE_CONNECTED);
        }
        if (!sOBDConnection.isVehicleConnected()) {
            throw new BossException(BossError.OBD_VEHICLE_NOT_DETECTED);
        }
    }

    /**
     * Create a @{JSONObject} representing the given test.
     * @param available The byte to look in.
     * @param availablePosition The bit position to look in. 7 == MSB, 0 == LSB.
     * @param incomplete The byte to look in for the incomplete flag.
     * @param incompletePosition The bit position to look in.
     * @return @{JSONObject}
     * @throws JSONException
     */
    private JSONObject makeTest(int available, int availablePosition, int incomplete, int incompletePosition) throws JSONException {
        JSONObject toReturn = new JSONObject();
        boolean isAvailable = (available & (1 << availablePosition)) != 0;
        boolean isIncomplete = (incomplete & (1 << incompletePosition)) != 0;
        toReturn.put(KEY_AVAILABLE, isAvailable);
        if (isAvailable) {
            toReturn.put(KEY_INCOMPLETE, isIncomplete);
        }
        return toReturn;
    }

    public void registerForPIDUpdate(IOBDListener mListener, Integer effectivePID) {
        sOBDConnection.registerForPIDUpdates(effectivePID,mListener);
    }

    public void unregisterForPIDUpdate(IOBDListener mListener, Integer effectivePID) {
        sOBDConnection.unregisterForPIDUpdates(effectivePID,mListener);
    }

    public void setWebSocketDispatcher(OBDWebSocketDispatcher dispatcher) {
        super.setWebSocketDispatcher(dispatcher);
    }

    private class GetOBDStatus extends AEndPoint {
        public GetOBDStatus() {
            super(PATH_GET_OBD_STATUS);
        }

        @Override
        public JSONObject execute(List<String> headers, HashMap<String, String> params) throws BossException, JSONException {
            checkConnection();

            JSONObject toReturn = new JSONObject();
            JSONObject obd = buildResultOne();

            toReturn.put(KEY_OBD, obd);

            obd.put(KEY_VEHICLE_CONNECTED, sOBDConnection.isVehicleConnected());
            obd.put(KEY_DEVICE_CONNECTED, sOBDConnection.isDeviceConnected());
            String version = sOBDConnection.getDeviceVersion();
            if (!MyTextUtils.isEmpty(version)) {
                obd.put(KEY_DEVICE_VERSION, version);
            }

            return toReturn;
        }
    }

    private class GetTestStatus extends AEndPoint {
        public GetTestStatus() {
            super(PATH_GET_TEST_STATUS);
        }

        @Override
        public JSONObject execute(List<String> headers, HashMap<String, String> params) throws BossException, JSONException {
            log.v();
            checkConnection();
            checkVehicle();

            sOBDConnection.checkPIDSupport(1, 1);

            JSONObject toReturn = buildResultOne();

            JSONObject obd = new JSONObject();
            toReturn.put(KEY_OBD, obd);

            JSONObject tests = new JSONObject();
            obd.put(KEY_TESTS, tests);


            boolean isSpark = true;

            for (int mode = 0; mode < 2; ++mode) {
                try {
                    int pid = mode == 0 ? 1 : 0x41;

                    if (mode == 1) {
                        try {
                            sOBDConnection.checkPIDSupport(1, pid);
                        } catch (BossException be) {
                            log.v("Not trying to get drive cycle tests - unsupported");
                            continue;
                        }
                    }

                    final BlockingFuture<String> response = new BlockingFuture<>();

                    String command = String.format("01 %02X", pid);
                    sOBDConnection.sendCommand(command, response);
                    String responseString = response.get(5, TimeUnit.SECONDS);
                    log.v("Response from OBD", responseString);

                    byte[] bytes = Hex.hexToBytes(responseString);

                    if (bytes.length < 6) {
                        throw new BossException(BossError.OBD_NOT_ENOUGH_DATA);
                    }

                    if (bytes[0] != 0x41 || bytes[1] != pid) {
                        throw new BossException(BossError.OBD_UNEXPECTED_RESPONSE);
                    }

                    int a = bytes[2] & 0xff;
                    int b = bytes[3] & 0xff;
                    int c = bytes[4] & 0xff;
                    int d = bytes[5] & 0xff;

                    if (mode == 0) {

                        boolean milOn = (a & 0x80) != 0;
                        int dtcCount = a & 0x7f;
                        isSpark = (b & (1 << 3)) == 0;

                        obd.put(KEY_MIL_ON, milOn);
                        obd.put(KEY_DTC_COUNT, dtcCount);
                        obd.put(KEY_ENGINE_IGNITION_TYPE, isSpark ? VALUE_SPARK : VALUE_COMPRESSION);
                    }

                    String name = mode == 0 ? KEY_SINCE_DTC_CLEARED : KEY_THIS_DRIVE_CYCLE;

                    JSONObject testResults = new JSONObject();
                    tests.put(name, testResults);

                    buildResults(isSpark, testResults, b, c, d);
                } catch (BossException be) {
                    log.v("Caught exception", be);
                    if (mode == 1) {
                        continue;
                    } else {
                        log.v("rethrowing");
                        throw be;
                    }
                }
            }
            return toReturn;
        }

        private void buildResults(boolean isSpark, JSONObject results, int b, int c, int d) throws JSONException {
            results.put(KEY_MISFIRE, makeTest(b, 0, b, 4));
            results.put(KEY_FUEL_SYSTEM, makeTest(b, 1, b, 5));
            results.put(KEY_COMPONENTS, makeTest(b, 2, b, 6));

            String[] testNames;
            if (isSpark) {
                testNames = sSparkTestNames;
            } else {
                testNames = sCompressionTestNames;
            }

            for (int i = 0; i < testNames.length; ++i) {
                if (testNames[i] != null) {
                    results.put(testNames[i], makeTest(c, i, d, i));
                }
            }

        }
    }

    private class SendPID extends AEndPoint {
        public SendPID() {
            super(PATH_SEND_PID);
        }

        @Override
        public JSONObject execute(List<String> headers, HashMap<String, String> params) throws BossException, JSONException {
            checkConnection();

            int mode = getInt(params, PARAM_MODE);
            int pid = getInt(params, PARAM_PID);

            checkVehicle();

            sOBDConnection.checkPIDSupport(mode, pid);

            final BlockingFuture<String> response = new BlockingFuture<String>();
            final String command = String.format("%02X%02X", mode, pid);

            sOBDConnection.sendCommand(command, response);
            String toSend = response.get(5, TimeUnit.SECONDS);

            JSONObject toReturn = buildResultOne();

            JSONObject obd = new JSONObject();
            toReturn.put(KEY_OBD, obd);
            obd.put(KEY_RESPONSE, toSend);

            return toReturn;
        }
    }

    private class ClearDTC extends AEndPoint {
        public ClearDTC() {
            super(PATH_CLEAR_DTC);
        }

        @Override
        public JSONObject execute(List<String> headers, HashMap<String, String> params) throws BossException, JSONException {
            checkConnection();

            final BlockingFuture<String> response = new BlockingFuture<>();
            sOBDConnection.sendCommand("04", response);
            String toSend = response.get(5, TimeUnit.SECONDS);

            JSONObject toReturn = buildResultOne();

            JSONObject obd = new JSONObject();
            toReturn.put(KEY_OBD, obd);
            obd.put(KEY_RESPONSE, toSend);

            return toReturn;
        }
    }

    private class GetDTC extends AEndPoint {
        public GetDTC() {
            super(PATH_GET_DTC);
        }

        @Override
        public JSONObject execute(List<String> headers, HashMap<String, String> params) throws BossException, JSONException {
            checkConnection();

            final BlockingFuture<String> response = new BlockingFuture<String>();
            sOBDConnection.sendCommand("03", response);
            String responseString = response.get(5, TimeUnit.SECONDS);
            JSONObject toReturn = buildResultOne();

            JSONObject obd = new JSONObject();
            toReturn.put(KEY_OBD, obd);

            JSONArray dtcCodes = new JSONArray();
            toReturn.put(KEY_DTC_CODES, dtcCodes);

            int where43 = responseString.indexOf("43");
            // TODO handle not found case.
            String codes = responseString.substring(where43 + 2);
            byte[] codeBytes = Hex.hexToBytes(codes);

            for (int i = 0; i < codeBytes.length - 1; i += 2) {
                if (codeBytes[i] == 0 && codeBytes[i + 1] == 0) {
                    // ignore.
                } else {
                    String code = twoBytesToDTC(codeBytes, i);
                    dtcCodes.put(code);
                }
            }

            return toReturn;
        }
    }
}
