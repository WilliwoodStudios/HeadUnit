package com.workshoptwelve.brainiac.boss.hardware.obdii;

import android.os.Handler;
import android.os.Looper;

import com.workshoptwelve.brainiac.boss.common.error.BossError;
import com.workshoptwelve.brainiac.boss.common.error.BossException;
import com.workshoptwelve.brainiac.boss.common.hardware.obdii.IOBDConnection;
import com.workshoptwelve.brainiac.boss.common.hardware.obdii.IOBDListener;
import com.workshoptwelve.brainiac.boss.common.log.Log;
import com.workshoptwelve.brainiac.boss.common.util.BlockingFuture;
import com.workshoptwelve.brainiac.boss.common.util.ForEachList;
import com.workshoptwelve.brainiac.boss.common.util.Hex;
import com.workshoptwelve.brainiac.boss.hardware.usb.AUSBDeviceDriver;
import com.workshoptwelve.brainiac.boss.hardware.usb.BossUSBManager;
import com.workshoptwelve.brainiac.boss.hardware.usb.serial.CH341;
import com.workshoptwelve.brainiac.boss.util.VerboseHandler;
import com.workshoptwelve.brainiac.boss.util.VerboseRunnable;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

/**
 * Created by robwilliams on 15-05-11.
 */
public class AndroidOBDConnection implements IOBDConnection {
    private static final Log log = Log.getLogger(AndroidOBDConnection.class);

    byte[] mResponseBuffer = new byte[512];
    /**
     * Array storing which (mode 1) PID have been detected as supported.
     */
    private boolean[] mSupportedPID = new boolean[257];
    private CH341 mDeviceDriver;
    private OutputStream mOutputStream;
    private InputStream mInputStream;
    private boolean mVehicleConnected;
    private boolean mDeviceConnected;

    private class OBDListenerSet extends ForEachList<IOBDListener> {

    }

    private class UpdatingPIDs {
        private Integer mForEachEffectivePID;
        private String mForEachMessage;

        private ForEachList.ForEach<IOBDListener> mForEach = new ForEachList.ForEach<IOBDListener>() {
            @Override
            public void go(IOBDListener item) {
                item.onPIDUpdated(mForEachEffectivePID>>16,mForEachEffectivePID & 0xffff,mForEachMessage);

            }
        };

        private HashMap<Integer,OBDListenerSet> mListeners = new HashMap<>();
        private ArrayList<Integer> mPIDs = new ArrayList<>();

        private int mPollingPosition = 0;

        private IOBDListener [] mDummyArray = new IOBDListener[0];


        public void sendUpdate(Integer effectivePID, String message) {
            OBDListenerSet set;
            synchronized(this) {
                set = mListeners.get(effectivePID);
            }
            if (set != null) {
                mForEachEffectivePID = effectivePID;
                mForEachMessage = message;
                set.forEach(mForEach);
            }
        }

        public synchronized Integer getNextIDForPolling() {
            if (mPIDs.size() == 0) {
                return null;
            }
            mPollingPosition %= mPIDs.size();
            return mPIDs.get(mPollingPosition++);
        }

        public synchronized void addListener(Integer effectivePID, IOBDListener listener) {
            OBDListenerSet toReturn = mListeners.get(effectivePID);
            if (toReturn == null) {
                mPIDs.add(effectivePID);
                toReturn = new OBDListenerSet();
                mListeners.put(effectivePID, toReturn);
            }
            if (!toReturn.contains(listener)) {
                toReturn.add(listener);
            }
        }

        public synchronized void removeListener(Integer effectivePID, IOBDListener listener) {
            OBDListenerSet toUse = mListeners.get(effectivePID);
            if (toUse == null) {
                return;
            }
            toUse.remove(listener);
        }
    }

    private UpdatingPIDs mUpdatingPIDs = new UpdatingPIDs();

    @Override
    public void registerForPIDUpdates(Integer effectivePID, IOBDListener listener) {
        mUpdatingPIDs.addListener(effectivePID,listener);
        mHandler.removeCallbacks(mPIDPoller);
        mHandler.post(mPIDPoller);
    }

    @Override
    public void unregisterForPIDUpdates(Integer effectivePID, IOBDListener listener) {
        mUpdatingPIDs.removeListener(effectivePID,listener);
    }

    private VerboseRunnable mPIDPoller = new VerboseRunnable("mPIDPoller") {
        public void loggedRun() {
            pollPIDs();
        }
    };

    private VerboseRunnable mDisconnectedRunnable = new VerboseRunnable("disconnected runnable") {
        public void loggedRun() {
            log.v("Disconnected Runnable");
            mVehicleConnected = false;
            mDeviceDriver = null;
            mDeviceConnected = false;
            mOutputStream = null;
            mInputStream = null;
        }
    };

    private String mDeviceVersion;
    private Looper mLooper;
    private VerboseHandler mHandler;
    private VerboseRunnable mGetAvailablePIDRunnable = new VerboseRunnable("Get Available PID Runnable") {
        public void loggedRun() {
            getAvailablePID();
        }
    };
    private AUSBDeviceDriver.USBDeviceDriverListener mDeviceDriverListener = new AUSBDeviceDriver.USBDeviceDriverListener() {
        @Override
        public void onConnectedChanged(boolean connected) {
            log.v();
            if (!connected) {
                mHandler.post(mDisconnectedRunnable);
            }
        }
    };
    private BossUSBManager.BossUSBManagerListener mListener = new BossUSBManager.BossUSBManagerListener() {
        @Override
        public void onDeviceAvailable(final AUSBDeviceDriver deviceDriver) {
            log.v();
            if (deviceDriver instanceof CH341) {
                log.v("Is a CH341");
                mHandler.post(new VerboseRunnable("on device available") {
                    public void loggedRun() {
                        usbAvailable((CH341) deviceDriver);
                    }
                });
            } else {
                log.w("Was not a CH341");
            }
        }
    };
    private VerboseRunnable mInitRunnable = new VerboseRunnable("init runnable") {
        public void loggedRun() {
            log.v("InitRunnable");
            BossUSBManager.getInstance().addUSBManagerListener(mListener);
            List<AUSBDeviceDriver> availableDevices = BossUSBManager.getInstance().getAvailableDevices();
            for (AUSBDeviceDriver deviceDriver : availableDevices) {
                if (deviceDriver instanceof CH341) {
                    usbAvailable((CH341) deviceDriver);
                }
            }
        }
    };

    public AndroidOBDConnection() {
        final BlockingFuture<Boolean> threadStarted = new BlockingFuture<>();
        log.setLogLevel(Log.Level.v);

        ThreadPool.getInstance().run(new Runnable() {
            public void run() {
                Looper.prepare();
                mLooper = Looper.myLooper();
                mHandler = new VerboseHandler();
                mHandler.post(mInitRunnable);
                threadStarted.setResult(Boolean.TRUE);
                Looper.loop();
            }
        });

        try {
            threadStarted.get();
        } catch (Exception e) {
            // ignore.
        }
    }

    @Override
    public void checkPIDSupport(int mode, int pid) throws BossException {
        if (mode != 1) {
            throw new BossException(BossError.OBD_MODE_NOT_SUPPORTED);
        }
        if (pid < 0 || pid >= mSupportedPID.length) {
            throw new BossException(BossError.OBD_PID_NOT_SUPPORTED);
        }

        if (!mSupportedPID[pid]) {
            throw new BossException(BossError.OBD_PID_NOT_SUPPORTED);
        }
    }

    private Integer mLastPolledPID = null;

    private void pollPIDs() {
        if (isDeviceConnected() && isVehicleConnected()) {
            Integer effectivePID = mUpdatingPIDs.getNextIDForPolling();
            if (effectivePID != null) {
                int mode = effectivePID.intValue()>>16;
                int pid = effectivePID.intValue()& 0xffff;
                if (mode == 1 && !mSupportedPID[pid]) {
                    log.e("Attempting to poll a pid that the vehicle said isn't supported",mode,pid);
                    return;
                }

                String command = String.format("%02X%02X\n", mode, pid);
                try {
                    String response = sendCommand(command);
                    if (isVehicleGoneResponse(response)) {
                        noteVehicleGone();
                    } else {
                        mUpdatingPIDs.sendUpdate(effectivePID, response);
                    }
                    log.e("Response from polling pid", command, response);
                } catch (BossException be) {
                    log.e("not yet handled",be);
                    // TODO - do something.
                } catch (IOException e) {
                    log.e("not yet handled",e);
                    // TODO - do something.
                }
            }
        }
    }

    private void usbAvailable(final CH341 deviceDriver) {
        log.v();

        mDeviceDriver = deviceDriver;
        mDeviceConnected = true;

        deviceDriver.addUSBDeviceDriverListener(mDeviceDriverListener);

        try {
            deviceDriver.init();
            log.v("Device driver initialised");

            mOutputStream = deviceDriver.getOutputStream();
            mInputStream = deviceDriver.getInputStream();

            initDevice();
        } catch (BossException be) {
            log.e("Could not init device", be);
        }
    }

    public void checkVehicle() throws BossException {
        checkConnection();
        if (!isVehicleConnected()) {
            throw new BossException(BossError.OBD_VEHICLE_NOT_DETECTED);
        }
    }

    public void checkConnection() throws BossException {
        if (!isDeviceConnected()) {
            throw new BossException(BossError.OBD_NO_DEVICE_CONNECTED);
        }
    }

    private void initDevice() throws BossException {
        checkConnection();
        mDeviceDriver.setBaudRate(38400);
        mDeviceDriver.init();
//            String[] toSend = new String[]{"AT Z\r\n", "AT SP 00\r\n", "0100\r\n", "AT DP\r\n"};

        try {
            String response;
            for (int retryCount = 0; retryCount < 5; ++retryCount) {
                log.v("Retry count", 0);
                response = sendCommand("AT E0");
                if (!looksBad(response)) {
                    break;
                }
            }
            response = sendCommand("AT Z");
            if (!looksBad(response)) {
                mDeviceVersion = response;
            }

            sendCommand("AT E0"); // again - the ATZ resets the echo
            sendCommand("AT SP 00");

            mHandler.post(mGetAvailablePIDRunnable);
//                response = sendCommand("AT DP");
        } catch (IOException ioe) {
            // todo handle.
        }
    }

    private void getAvailablePID() {
        log.v();
        try {
            mSupportedPID[0] = true;
            for (int i = 1; i < mSupportedPID.length; ++i) {
                mSupportedPID[i] = false;
            }

            for (int group = 0; group < 0xf0; group += 0x20) {

                if (mSupportedPID[group]) {

                    String command = "01" + (group == 0 ? "00" : Integer.toString(group, 16));
                    log.v(command);
                    String response = sendCommand(command);

                    // response = "41 00 be 3E b8 13"; // TODO remove hard coded response.

                    if (isVehicleGoneResponse(response)) {
                        noteVehicleGone();
                        return;
                    }

                    int where = response.lastIndexOf('\r');
                    if (where != -1) {
                        response = response.substring(where + 1);
                    }
                    byte[] responseBytes = Hex.hexToBytes(response);

                    if (responseBytes.length == 6) {

                        int offset = 1 + group;

                        mSupportedPID[0] = true;

                        for (int i = 2; i < responseBytes.length; ++i) {
                            int mask = 128;
                            int current = responseBytes[i] & 0xff;
                            for (int j = 0; j < 8; ++j) {
                                mSupportedPID[offset++] = (current & mask) != 0;
                                mask >>= 1;
                            }
                        }
                    }
                }
            }
            noteVehicleFound();
            logSupportedPID();
        } catch (IOException | BossException ioe) {
            log.d(ioe);
            noteVehicleGone();
        }
    }

    private void logSupportedPID() {
        String message = "";
        for (int i = 1; i <= 256; ++i) {
            message += mSupportedPID[i] ? "1" : "0";
        }
        log.i("Supported PID", message);
    }

    private boolean isVehicleGoneResponse(String response) {
        return response.contains("CONNECT") || response.contains("ERROR") || response.contains("NO DATA");
    }

    private void noteVehicleGone() {
        log.v();
        mHandler.removeCallbacks(mGetAvailablePIDRunnable);
        if (mDeviceConnected) {
            // TODO make this delay when we know the vehicle is off.
            mHandler.postDelayed(mGetAvailablePIDRunnable, 15000);
        }
        mVehicleConnected = false;
    }

    private void noteVehicleFound() {
        log.v();
        mVehicleConnected = true;
        IOBDListener toAdd = new IOBDListener() {
            @Override
            public void onPIDUpdated(int mode, int pid, String value) {
                log.e("ON PID UPDATED", mode, pid, value);
            }
        };
        Integer a = (1<<16) + 0xd;
        Integer b = (1<<16) + 0xc;

        registerForPIDUpdates(a,toAdd);
        registerForPIDUpdates(b,toAdd);
    }

    private boolean looksBad(String string) {
        for (int i = 0; i < string.length(); ++i) {
            char c = string.charAt(i);
            if (!(c == 10 || c == 13 || c >= ' ' && c <= 127)) {
                return true;
            }
        }
        return false;
    }

    public void sendCommand(final String command, final BlockingFuture<String> responseFuture) throws BossException {
        log.v(command);
        mHandler.post(new VerboseRunnable("send command with future") {
            public void loggedRun() {
                try {
                    log.v("send command proper thread", command);
                    checkVehicle();
                    String response = sendCommand(command);
                    if (isVehicleGoneResponse(response)) {
                        noteVehicleGone();
                        throw new BossException(BossError.OBD_VEHICLE_NOT_DETECTED);
                    }
                    responseFuture.setResult(response);
                } catch (BossException be) {
                    log.v("Boss Exception", be);
                    responseFuture.setException(be);
                } catch (IOException ioe) {
                    log.v("IOException", ioe);
                    responseFuture.setException(new BossException(BossError.OBD_NO_RESPONSE, ioe));
                    try {
                        mDeviceDriver.restart();
                    } catch (BossException bossException) {
                        log.d("Send -> ioexception -> restart -> bossException", bossException);
                    }
                }
            }
        });
    }

    private String sendCommand(String command) throws IOException, BossException {
        try {
            checkConnection();
            log.v(command);
            mOutputStream.write(command.getBytes());
            mOutputStream.write(13);

            String toReturn = readResponse();
            if (log.canV()) {
                log.v("Response", "\n" + Hex.dump(toReturn));
            }

            return toReturn;
        } finally {
            mHandler.removeCallbacks(mPIDPoller);
            mHandler.postDelayed(mPIDPoller, 0);
        }
    }

    private String readResponse() throws IOException {
        int offset = 0;
        do {
            int length = mInputStream.read(mResponseBuffer, offset, mResponseBuffer.length - offset);
            if (length == -1) {
                log.v("-1 from read");
                return new String(mResponseBuffer, 0, offset);
            }
            offset += length;
            if (offset > 2) {
                if (mResponseBuffer[offset - 1] == '>' && mResponseBuffer[offset - 2] == 13 && mResponseBuffer[offset - 3] == 13) {
                    log.v("response ends with \\r\\r>");
                    return new String(mResponseBuffer, 0, offset - 3);
                }
            }
        } while (true);
    }

    public boolean isVehicleConnected() {
        return mVehicleConnected;
    }

    public boolean isDeviceConnected() {
        return mDeviceConnected;
    }

    public String getDeviceVersion() {
        return mDeviceVersion;
    }
}
