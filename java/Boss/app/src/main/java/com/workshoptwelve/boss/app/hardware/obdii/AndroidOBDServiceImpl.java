package com.workshoptwelve.boss.app.hardware.obdii;

import android.os.Handler;
import android.os.Looper;
import android.text.TextUtils;

import com.workshoptwelve.boss.app.hardware.usb.AUSBDeviceDriver;
import com.workshoptwelve.boss.app.hardware.usb.BossUSBManager;
import com.workshoptwelve.boss.app.hardware.usb.serial.CH341;
import com.workshoptwelve.brainiac.boss.common.error.BossError;
import com.workshoptwelve.brainiac.boss.common.error.BossException;
import com.workshoptwelve.brainiac.boss.common.hardware.obdii.AOBDServiceImpl;
import com.workshoptwelve.brainiac.boss.common.log.Log;
import com.workshoptwelve.brainiac.boss.common.threading.ThreadPool;
import com.workshoptwelve.brainiac.boss.common.util.BlockingFuture;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.List;
import java.util.concurrent.TimeUnit;

/**
 * Created by robwilliams on 15-05-08.
 */
public class AndroidOBDServiceImpl extends AOBDServiceImpl {
    private static final Log log = Log.getLogger(AndroidOBDServiceImpl.class);
    private Handler mHandler;
    private Looper mLooper;
    private Runnable mInitRunnable = new Runnable() {
        public void run() {
            log.v();
        }
    };
    private boolean[] mSupportedPID = new boolean[257];

    private ThreadedObject mThreadedObject = new ThreadedObject();
    private boolean mVehicleConnected;
    private boolean mDeviceFound;
    private String mVersion;
    private BossUSBManager.BossUSBManagerListener mListener = new BossUSBManager.BossUSBManagerListener() {
        @Override
        public void onDeviceAvailable(final AUSBDeviceDriver deviceDriver) {
            log.v();
            if (deviceDriver instanceof CH341) {
                log.v("Is a CH341");
                mHandler.post(new Runnable() {
                    public void run() {
                        mThreadedObject.usbAvailable((CH341) deviceDriver);
                    }
                });
            }
        }
    };

    public AndroidOBDServiceImpl() {
        log.setLogLevel(Log.Level.v);
        log.v();
        final BlockingFuture<Boolean> threadStarted = new BlockingFuture<Boolean>();

        ThreadPool.getInstance().run(new Runnable() {
            public void run() {
                Looper.prepare();
                mLooper = Looper.myLooper();
                mHandler = new Handler();
                threadStarted.setResult(Boolean.TRUE);
                Looper.loop();
            }
        });

        try {
            threadStarted.get();
        } catch (Exception ignore) {
            // ignore
        }

        mHandler.post(mThreadedObject.mInitRunnable);
    }

    public void shutdown() {
        // TODO implement.
    }

    public boolean isVehicleConnected() {
        return mVehicleConnected;
    }

    public boolean isDeviceFound() {
        return mDeviceFound;
    }

    public JSONObject getStatus() throws JSONException {
        JSONObject toReturn = new JSONObject();
        JSONObject obd = new JSONObject();
        toReturn.put("result", 1);
        toReturn.put("obdii", obd);

        obd.put("vehicleConnected", mVehicleConnected);
        obd.put("deviceConnected", mDeviceFound);
        if (!TextUtils.isEmpty(mVersion)) {
            obd.put("version", mVersion);
        }

        return toReturn;
    }

    private void checkVehicle() throws BossException {
        checkConnection();
        if (!mVehicleConnected) {
            throw new BossException(BossError.OBD_VEHICLE_NOT_DETECTED);
        }
    }

    private void checkConnection() throws BossException {
        if (!mDeviceFound) {
            throw new BossException(BossError.OBD_NO_DEVICE_CONNECTED);
        }
    }

    @Override
    public JSONObject sendPID(int mode, int pid) throws JSONException, BossException {
        // Check vehicle before reporting about missing PID.
        checkVehicle();
        if (mode != 1) {
            throw new BossException(BossError.OBD_MODE_NOT_SUPPORTED);
        }
        if (pid < 0 || pid >= mSupportedPID.length || !mSupportedPID[pid]) {
            throw new BossException(BossError.OBD_PID_NOT_SUPPORTED);
        }

        final BlockingFuture<String> response = new BlockingFuture<String>();
        final String command = toCommand(mode, pid);
        mHandler.post(new Runnable() {
            public void run() {
                mThreadedObject.sendCommand(command, response);
            }
        });
        try {
            String toSend = response.get(5, TimeUnit.SECONDS);
            JSONObject toReturn = new JSONObject();
            toReturn.put("result", 1);
            JSONObject obd = new JSONObject();
            toReturn.put("obd", obd);
            obd.put("response", toSend);
            return toReturn;
        } catch (Exception ce) {
            // consume
        }
        checkVehicle();
        throw new BossException(BossError.OBD_NO_RESPONSE);
    }

    private String toCommand(int mode, int pid) {
        return String.format("%02X%02X", mode, pid);
    }

    private String hex(char c) {
        String toReturn = "0" + Integer.toString(c, 16);
        return toReturn.substring(toReturn.length() - 2);
    }

    private String hexDump(String in) {
        String result = "";
        for (int i = 0; i < in.length(); i += 16) {
            String chars = "";
            String hex = "";
            for (int j = 0; j < 16 && i + j < in.length(); ++j) {
                char c = in.charAt(j + i);
                hex += hex(c);
                if ((j % 2) == 1) {
                    hex += ' ';
                }
                if (c >= ' ' && c <= 127) {
                    chars += c;
                } else {
                    chars += '.';
                }
            }
            if (result.length() != 0) {
                result += "\n";
            }
            result += (hex + "                                                 ").substring(0, 50);
            result += chars;
        }
        return result;
    }

    private class ThreadedObject {
        byte[] mResponseBuffer = new byte[512];
        private CH341 mDeviceDriver;
        private OutputStream mOutputStream;
        private InputStream mInputStream;
        private Runnable mGetAvailablePIDRunnable = new Runnable() {
            public void run() {
                getAvailablePID();
            }
        };
        private Runnable mDisconnectedRunnable = new Runnable() {
            public void run() {
                mVehicleConnected = false;
                mDeviceDriver = null;
                mDeviceFound = false;
                mOutputStream = null;
                mInputStream = null;
            }
        };
        private Runnable mInitRunnable = new Runnable() {
            public void run() {
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

        private void usbAvailable(final CH341 deviceDriver) {
            log.v();


            mDeviceDriver = deviceDriver;
            mDeviceFound = true;

            deviceDriver.addUSBDeviceDriverListener(new AUSBDeviceDriver.USBDeviceDriverListener() {
                @Override
                public void onConnectedChanged(boolean connected) {
                    if (!connected) {
                        mHandler.post(mDisconnectedRunnable);
                    }
                }
            });

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
                    mVersion = response;
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
                        byte[] responseBytes = responseToBytes(response);

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

            } catch (IOException ioe) {
                log.d(ioe);
                noteVehicleGone();
            } catch (BossException be) {
                log.d(be);
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

        private boolean isHex(char c) {
            return (c >= '0' && c <= '9') || (c >= 'A' && c <= 'F') || (c >= 'a' && c <= 'f');
        }

        private byte[] responseToBytes(String response) {
            int nibbleCount = 0;
            for (int i = 0; i < response.length(); ++i) {
                if (isHex(response.charAt(i))) {
                    ++nibbleCount;
                }
            }
            byte[] toReturn = new byte[nibbleCount / 2];
            if (toReturn.length == 0) {
                return toReturn;
            }
            int offset = 0;
            int pos = 0;

            for (int i = 0; i < response.length(); ++i) {
                char c = response.charAt(i);
                if (isHex(c)) {
                    if (c > 'Z') {
                        c -= 32;
                    }
                    byte v = (byte) (c < 'A' ? c - '0' : c - 'A' + 10);
                    if (pos == 0) {
                        toReturn[offset] = (byte) (v << 4);
                        pos++;
                    } else if (pos == 1) {
                        pos = 0;
                        toReturn[offset++] |= v;
                        if (offset == toReturn.length) {
                            break;
                        }
                    }
                }
            }
            return toReturn;
        }

        private boolean isVehicleGoneResponse(String response) {
            if (response.contains("CONNECT") || response.contains("ERROR") || response.contains("NO DATA")) {
                return true;
            }
            return false;
        }

        private void noteVehicleGone() {
            log.v();
            mHandler.removeCallbacks(mGetAvailablePIDRunnable);
            if (mDeviceFound) {
                mHandler.postDelayed(mGetAvailablePIDRunnable, 15000);
            }
            mVehicleConnected = false;
        }

        private void noteVehicleFound() {
            log.v();
            mVehicleConnected = true;
        }

        private String startOf(String response) {
            if (response.length() < 3) {
                return "";
            }
            return response.substring(0, response.length() - 3);
        }

        private boolean looksBad(String string) {
            for (int i = 0; i < string.length(); ++i) {
                char c = string.charAt(i);
                if (c == 10 || c == 13 || c >= ' ' && c <= 127) {
                    // ok.
                } else {
                    return true;
                }
            }
            return false;
        }

        private void sendCommand(String command, BlockingFuture<String> responseFuture) {
            log.v(command);
            try {
                String response = sendCommand(command);
                if (isVehicleGoneResponse(response)) {
                    noteVehicleGone();
                    responseFuture.cancel(true);
                } else {
                    responseFuture.setResult(response);
                }
            } catch (Exception toIgnore) {
                log.v("Caught exception sending command");
                responseFuture.cancel(true);
            }
        }

        private String sendCommand(String command) throws IOException, BossException {
            checkConnection();
            log.v(command);
            mOutputStream.write(command.getBytes());
            mOutputStream.write(13);

            String toReturn = readResponse();
            if (log.canV()) {
                log.v("Response", hexDump(toReturn));
            }

            return toReturn;
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
    }
}
