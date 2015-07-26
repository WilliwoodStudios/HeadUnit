package com.workshoptwelve.brainiac.boss.hardware.accessory;

import android.os.Handler;
import android.os.Looper;

import com.workshoptwelve.brainiac.boss.hardware.usb.AUSBDeviceDriver;
import com.workshoptwelve.brainiac.boss.hardware.usb.serial.AUSBSerial;
import com.workshoptwelve.brainiac.boss.hardware.usb.serial.ArduinoUno;
import com.workshoptwelve.brainiac.boss.common.error.BossError;
import com.workshoptwelve.brainiac.boss.common.error.BossException;
import com.workshoptwelve.brainiac.boss.common.log.Log;
import com.workshoptwelve.brainiac.boss.common.util.BlockingFuture;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;

/**
 * Created by robwilliams on 15-06-29.
 */
public class AccessoryConnection {
    private static final Log log = Log.getLogger(AccessoryConnection.class);
    private final ArduinoUno mUno;
    private Handler mHandler;
    private InputStream mInputStream;
    private OutputStream mOutputStream;
    private Looper mLooper;

    private boolean mReady = false;
    private boolean mClosed = false;

    private byte[] mBuffer = new byte[1024];
    private String mId;
    private String mSerialNumber;
    private String mModel;
    private String mFamily;
    private String mVersion;
    private JSONObject mIdJson;
    private Runnable mInitRunnable = new Runnable() {
        public void run() {
            init();
        }
    };

    /**
     * Construct a new accessory connection connected to the given arduino (serial port).
     *
     * @param uno
     * @throws BossException
     */
    public AccessoryConnection(ArduinoUno uno) throws BossException {
        mUno = uno;
        mUno.addUSBDeviceDriverListener(mDeviceDriverListener);
        mUno.addUSBSerialListener(mSerialListener);
        final BlockingFuture<Boolean> threadStarted = new BlockingFuture<>();
        log.setLogLevel(Log.Level.v);

        Thread t = new Thread("AccessoryConnection thread") {
            //
//        }
//
//        ThreadPool.getInstance().run(new Runnable() {
            public void run() {
                Looper.prepare();
                mLooper = Looper.myLooper();
                mHandler = new Handler();
                mHandler.post(mInitRunnable);
                threadStarted.setResult(Boolean.TRUE);
                Looper.loop();
            }
        };
        t.start();

        threadStarted.get();
    }

    private AUSBSerial.USBSerialListener mSerialListener = new AUSBSerial.USBSerialListener() {
        @Override
        public void onClosed() {
            // Closing because we identified a software issue.
            close();
        }
    };

    private AUSBDeviceDriver.USBDeviceDriverListener mDeviceDriverListener = new AUSBDeviceDriver.USBDeviceDriverListener() {
        @Override
        public void onConnectedChanged(boolean connected) {
            if (connected == false) {
                // Closing because the device was unplugged.
                close();
            }
        }
    };

    protected void init() {
        log.v("init", mUno.getDevice().getVendorId(), mUno.getDevice().getProductId());
        try {
            mUno.setBaudRate(9600);
            mUno.init();
            mInputStream = mUno.getInputStream();
            mOutputStream = mUno.getOutputStream();

            for (int i = 0; i < 10; ++i) {
                mOutputStream.write('\n');
                mOutputStream.flush();
                try {
                    Thread.sleep(100);
                } catch (InterruptedException ie) {
                    // consume
                }
            }

            readResponse();

            String id = sendCommand("id",true);

            for (int i = 0; i < 5 && !mReady; ++i) {

                if (id.startsWith("id\n")) {
                    String[] parts = id.split("\n");
                    if (parts.length < 2) {
                        log.e("Not a valid ID", id);
                    } else {
                        mId = parts[1];
                        String[] idParts = mId.split(" ");
                        if (idParts.length != 4) {
                            log.e("ID not formatted correctly");
                        } else {
                            mModel = idParts[0];
                            mFamily = idParts[1];
                            mVersion = idParts[2];
                            mSerialNumber = idParts[3];

                            mIdJson = new JSONObject();
                            try {
                                mIdJson.put("model", mModel);
                                mIdJson.put("family", mFamily);
                                mIdJson.put("version", mVersion);
                                mIdJson.put("serialNumber", mSerialNumber);
                            } catch (JSONException je) {
                                // consume
                            }

                            mReady = true;
                            log.v("Serial number is", mSerialNumber);

                            AndroidAccessoryManager.getInstance().recordSerialNumber(this, mSerialNumber);
                        }
                    }
                } else {
                    log.e("Not a valid ID");
                }
            }
        } catch (BossException boss) {
            log.e("Could not init device", boss);
        } catch (IOException e) {
            log.e("Could not communicate with device", e);
        }

        if (!mReady) {
            close();
        }
    }

    /**
     * Close the connection and associated USB resources.
     */
    public synchronized void close() {
        log.v("Close being called");
        if (!mClosed) {
            mClosed = true;
            AndroidAccessoryManager.getInstance().accessoryConnectionClosed(this);
            mUno.close();
            mLooper.quitSafely();
        }
    }

    private String readResponse() throws IOException {
        int offset = 0;
        for (int i = 0; i < mBuffer.length; ++i) {
            mBuffer[i] = ' ';
        }
        do {
            int length = mInputStream.read(mBuffer, offset, mBuffer.length - offset);
            if (length == -1) {
                log.v("-1 from read");
                return new String(mBuffer, 0, offset);
            }
            if (length == 0) {
                log.v("Read 0 bytes");
            }
            offset += length;

            String dump = "";
            for (int i = 0; i < offset; ++i) {
                dump += mBuffer[i] & 0xff;
                dump += ",";
            }

            if (offset > 2) {
                if (mBuffer[offset - 2] == '$' && mBuffer[offset - 1] == ' ') {
                    String toReturn = new String(mBuffer, 0, offset - 2);
                    toReturn = toReturn.replaceAll("\r", "");
                    log.v("Going to return response:", toReturn);
                    return toReturn;
                }
            }
        } while (true);
    }

    /**
     * Get the serial number of this accessory - if it's ready. If it's not ready (or not valid)
     * empty string will be returned.
     *
     * @return The serial number of the accessory - if it's ready. "" otherwise.
     */
    public String getSerialNumber() {
        if (mReady) {
            return mSerialNumber;
        }
        return "";
    }

    public boolean isReady() {
        return mReady;
    }

    private String sendCommand(String command, boolean evenIfNotReady) throws IOException, BossException {
        if (evenIfNotReady || mReady) {
            mOutputStream.write(command.getBytes());
            mOutputStream.write('\n');
            mOutputStream.flush();
        } else {
            throw new BossException(BossError.USB_DRIVER_ERROR);
        }
        String response = readResponse();
        if (response.indexOf("> ") != -1) {
            String[] responses = response.split("> .*\n");
            return responses[responses.length - 1];
        }
        return response;
    }

    public JSONObject getIdJson() {
        return mIdJson;
    }

    public void sendCommand(final String command, final BlockingFuture<String> result) {
        mHandler.post(new Runnable() {
            public void run() {
                try {
                    try {
                        result.setResult(sendCommand(command,false));
                    } catch (IOException ioe) {
                        throw new BossException(BossError.UNSPECIFIED_ERROR, ioe.getMessage());
                    }
                } catch (BossException e) {
                    result.setException(e);
                }
            }
        });
    }
}
