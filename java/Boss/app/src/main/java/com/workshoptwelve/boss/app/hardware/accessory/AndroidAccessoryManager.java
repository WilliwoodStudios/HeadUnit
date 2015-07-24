package com.workshoptwelve.boss.app.hardware.accessory;

import android.os.Handler;

import com.workshoptwelve.boss.app.hardware.usb.AUSBDeviceDriver;
import com.workshoptwelve.boss.app.hardware.usb.BossUSBManager;
import com.workshoptwelve.boss.app.hardware.usb.serial.ArduinoUno;
import com.workshoptwelve.brainiac.boss.common.error.BossError;
import com.workshoptwelve.brainiac.boss.common.error.BossException;
import com.workshoptwelve.brainiac.boss.common.hardware.accessory.IAccessoryManager;
import com.workshoptwelve.brainiac.boss.common.log.Log;
import com.workshoptwelve.brainiac.boss.common.util.BlockingFuture;

import org.json.JSONArray;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

/**
 * Created by robwilliams on 15-06-29.
 */
public class AndroidAccessoryManager implements IAccessoryManager {
    private static Log log = Log.getLogger(AndroidAccessoryManager.class);
    private static AndroidAccessoryManager sInstance = new AndroidAccessoryManager();
    protected List<AccessoryConnection> mAccessoryConnections = new ArrayList<>();
    protected Map<String, AccessoryConnection> mAccessoryConnectionsBySerialNumber = new HashMap<String, AccessoryConnection>();
    private Handler mHandler;
    BossUSBManager.BossUSBManagerListener mUsbListener = new BossUSBManager.BossUSBManagerListener() {
        @Override
        public void onDeviceAvailable(final AUSBDeviceDriver deviceDriver) {
            log.v("Found a device");
            if (deviceDriver instanceof ArduinoUno) {
                mHandler.post(new Runnable() {
                    public void run() {
                        usbAvailable((ArduinoUno) deviceDriver);
                    }
                });
            }
        }
    };

    private AndroidAccessoryManager() {
        log.setLogLevel(Log.Level.v);
        mHandler = new Handler();
        BossUSBManager.getInstance().addUSBManagerListener(mUsbListener);
        List<AUSBDeviceDriver> availableDevices = BossUSBManager.getInstance().getAvailableDevices();
        for (AUSBDeviceDriver deviceDriver : availableDevices) {
            if (deviceDriver instanceof ArduinoUno) {
                usbAvailable((ArduinoUno) deviceDriver);
            }
        }
    }

    public static AndroidAccessoryManager getInstance() {
        return sInstance;
    }

    @Override
    public JSONArray getConnectedAccessories() throws BossException {
        JSONArray toReturn = new JSONArray();
        for (AccessoryConnection connection : mAccessoryConnections) {
            if (connection.isReady()) {
                toReturn.put(connection.getIdJson());
            }
        }
        return toReturn;
    }

    protected void usbAvailable(ArduinoUno device) {
        log.v("Device connected");
        try {
            mAccessoryConnections.add(new AccessoryConnection(device));
        } catch (Exception e) {
            log.e("Could not connect to accessory", e);
        }
    }

    protected void accessoryConnectionClosed(AccessoryConnection connection) {
        log.v("Accessory connection has been closed");
        synchronized(mAccessoryConnections) {
            mAccessoryConnections.remove(connection);
        }
        synchronized(mAccessoryConnectionsBySerialNumber) {
            if (mAccessoryConnectionsBySerialNumber.containsKey(connection.getSerialNumber())) {
                mAccessoryConnectionsBySerialNumber.remove(connection.getSerialNumber());
            }
        }
        mAccessoryConnections.remove(connection);
    }

    protected void recordSerialNumber(AccessoryConnection connection, String serialNumber) {
        synchronized(mAccessoryConnectionsBySerialNumber) {
            mAccessoryConnectionsBySerialNumber.put(serialNumber, connection);
        }
    }

    private static int commandsInProgress = 0;

    @Override
    public String sendCommandToAccessory(String serialNumber, String command) throws BossException {
        synchronized(AndroidAccessoryManager.class) {
            commandsInProgress++;
            log.v("> Accessory commands in progress:",commandsInProgress);
        }
        try {
            AccessoryConnection toUse = null;
            synchronized (mAccessoryConnections) {
                for (AccessoryConnection ac : mAccessoryConnections) {
                    if (ac.getSerialNumber().equals(serialNumber)) {
                        toUse = ac;
                        break;
                    }
                }
            }
            if (toUse == null || toUse.isReady() == false) {
                throw new BossException(BossError.USB_DEVICE_NOT_FOUND);
            }

            BlockingFuture<String> result = new BlockingFuture<>();
            toUse.sendCommand(command, result);
            return result.get(10000, TimeUnit.MILLISECONDS);
        } finally {
            synchronized(AndroidAccessoryManager.class) {
                --commandsInProgress;
                log.v("< Accessory commands in progress:",commandsInProgress);
            }
        }
    }
}
