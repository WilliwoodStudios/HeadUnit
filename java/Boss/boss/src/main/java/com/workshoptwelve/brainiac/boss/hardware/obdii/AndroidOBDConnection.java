package com.workshoptwelve.brainiac.boss.hardware.obdii;

import android.os.Handler;
import android.os.Looper;

import com.workshoptwelve.brainiac.boss.hardware.usb.AUSBDeviceDriver;
import com.workshoptwelve.brainiac.boss.hardware.usb.BossUSBManager;
import com.workshoptwelve.brainiac.boss.hardware.usb.serial.CH341;
import com.workshoptwelve.brainiac.boss.common.error.BossError;
import com.workshoptwelve.brainiac.boss.common.error.BossException;
import com.workshoptwelve.brainiac.boss.common.hardware.obdii.IOBDConnection;
import com.workshoptwelve.brainiac.boss.common.log.Log;
import com.workshoptwelve.brainiac.boss.common.threading.ThreadPool;
import com.workshoptwelve.brainiac.boss.common.util.BlockingFuture;
import com.workshoptwelve.brainiac.boss.common.util.Hex;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
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

    private Runnable mDisconnectedRunnable = new Runnable() {
        public void run() {
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
    private Handler mHandler;
    private Runnable mGetAvailablePIDRunnable = new Runnable() {
        public void run() {
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
                mHandler.post(new Runnable() {
                    public void run() {
                        usbAvailable((CH341) deviceDriver);
                    }
                });
            } else {
                log.w("Was not a CH341");
            }
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

    public AndroidOBDConnection() {
        final BlockingFuture<Boolean> threadStarted = new BlockingFuture<>();
        log.setLogLevel(Log.Level.v);

        ThreadPool.getInstance().run(new Runnable() {
            public void run() {
                Looper.prepare();
                mLooper = Looper.myLooper();
                mHandler = new Handler();
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
        mHandler.post(new Runnable() {
            public void run() {
                try {
                    log.v("send command proper thread",command);
                    checkVehicle();
                    String response = sendCommand(command);
                    if (isVehicleGoneResponse(response)) {
                        noteVehicleGone();
                        throw new BossException(BossError.OBD_VEHICLE_NOT_DETECTED);
                    }
                    responseFuture.setResult(response);
                } catch (BossException be) {
                    log.v("Boss Exception",be);
                    responseFuture.setException(be);
                } catch (IOException ioe) {
                    log.v("IOException",ioe);
                    responseFuture.setException(new BossException(BossError.OBD_NO_RESPONSE, ioe));
                    try {
                        mDeviceDriver.restart();
                    } catch (BossException bossException) {
                        log.d("Send -> ioexception -> restart -> bossException",bossException);
                    }
                }
            }
        });
    }

    private String sendCommand(String command) throws IOException, BossException {
        checkConnection();
        log.v(command);
        mOutputStream.write(command.getBytes());
        mOutputStream.write(13);

        String toReturn = readResponse();
        if (log.canV()) {
            log.v("Response", "\n" + Hex.dump(toReturn));
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
