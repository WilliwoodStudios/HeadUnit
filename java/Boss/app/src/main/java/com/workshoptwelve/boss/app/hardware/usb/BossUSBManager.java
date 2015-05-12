package com.workshoptwelve.boss.app.hardware.usb;

import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.hardware.usb.UsbDevice;
import android.hardware.usb.UsbDeviceConnection;
import android.hardware.usb.UsbManager;

import com.workshoptwelve.boss.app.hardware.usb.serial.ArduinoUno;
import com.workshoptwelve.boss.app.hardware.usb.serial.CH341;
import com.workshoptwelve.brainiac.boss.common.error.BossException;
import com.workshoptwelve.brainiac.boss.common.log.Log;
import com.workshoptwelve.brainiac.boss.common.util.ForEachList;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;

/**
 * Created by robwilliams on 15-05-08.
 */
public class BossUSBManager {

    private static final String ACTION_USB_PERMISSION = "com.workshoptwelve.boss.app.hardware.usb.permission";
    private static final Log log = Log.getLogger(BossUSBManager.class);
    private static BossUSBManager sInstance = new BossUSBManager();
    private HashMap<String, Class<? extends AUSBDeviceDriver>> mDeviceImpl = new HashMap<String, Class<? extends AUSBDeviceDriver>>();
    private HashMap<String, List<AUSBDeviceDriver>> mConnectedDevices = new HashMap<String, List<AUSBDeviceDriver>>();
    private PendingIntent mPermissionIntent;
    private Context mContext;
    private final BroadcastReceiver mUsbConnectionReceiver = new BroadcastReceiver() {

        @Override
        public void onReceive(Context context, Intent intent) {
            log.v();
            String action = intent.getAction();
            if (UsbManager.ACTION_USB_DEVICE_ATTACHED.equals(action)) {
                log.v("Device attached");
                // ignoring which device was found - just scanning all.
                scanForDevices();
            } else if (UsbManager.ACTION_USB_DEVICE_DETACHED.equals(action)) {
                log.v("Device detached");

                UsbDevice device = (UsbDevice) intent
                        .getParcelableExtra(UsbManager.EXTRA_DEVICE);

                if (device != null) {
                    String vendorProduct = makeVendorProduct(device);
                    List<AUSBDeviceDriver> devices = mConnectedDevices.get(vendorProduct);
                    if (devices != null) {
                        int deviceId = device.getDeviceId();
                        for (Iterator<AUSBDeviceDriver> iterator = devices.iterator(); iterator.hasNext(); ) {
                            AUSBDeviceDriver driver = iterator.next();
                            if (driver.getDevice().getDeviceId() == deviceId) {
                                driver.setConnected(false);
                                iterator.remove();
                            }
                        }
                    }
                }
            }
        }
    };
    private final BroadcastReceiver mUsbPermissionReceiver = new BroadcastReceiver() {

        @Override
        public void onReceive(Context context, Intent intent) {
            log.v();
            String action = intent.getAction();
            if (ACTION_USB_PERMISSION.equals(action)) {
                log.v("ACTION_USB_PERMISSION");

                UsbDevice device = (UsbDevice) intent
                        .getParcelableExtra(UsbManager.EXTRA_DEVICE);

                if (intent.getBooleanExtra(
                        UsbManager.EXTRA_PERMISSION_GRANTED, false)) {
                    // ignoring which device we got permission for - scanning all anyway.
                    log.v("Permission granted for", device);
                    if (device != null) {
                        scanForDevices();
                    }
                } else {
                    log.w("Permission denied for", device);
                }
            }
        }
    };
    private BossUSBManager() {
        log.setLogLevel(Log.Level.v);
        log.v();
        mDeviceImpl.put(makeVendorProductId(6790, 29987), CH341.class);
        mDeviceImpl.put(makeVendorProductId(9025, 67), ArduinoUno.class);
    }

    public static BossUSBManager getInstance() {
        return sInstance;
    }

    public synchronized List<AUSBDeviceDriver> getAvailableDevices() {
        ArrayList<AUSBDeviceDriver> toReturn = new ArrayList<AUSBDeviceDriver>();
        for (String vendorProduct : mConnectedDevices.keySet()) {
            for (AUSBDeviceDriver deviceDriver : mConnectedDevices.get(vendorProduct)) {
                toReturn.add(deviceDriver);
            }
        }
        return toReturn;
    }

    private String makeVendorProductId(int a, int b) {
        return String.format("%d:%d", a, b);
    }

    public synchronized void startup(Context context) {
        if (mContext == null) {
            mContext = context;
            registerReceivers();
            scanForDevices();
        }
    }

    private void registerReceivers() {
        // register the broadcast receiver
        mPermissionIntent = PendingIntent.getBroadcast(mContext, 0, new Intent(ACTION_USB_PERMISSION), 0);

        IntentFilter filter = new IntentFilter(ACTION_USB_PERMISSION);
        mContext.registerReceiver(mUsbPermissionReceiver, filter);

        mContext.registerReceiver(mUsbConnectionReceiver, new IntentFilter(UsbManager.ACTION_USB_DEVICE_ATTACHED));
        mContext.registerReceiver(mUsbConnectionReceiver, new IntentFilter(UsbManager.ACTION_USB_DEVICE_DETACHED));
    }

    public void shutdown() throws BossException {
        // TODO - do something.
    }

    private synchronized void scanForDevices() {
        UsbManager manager = (UsbManager) mContext.getSystemService(Context.USB_SERVICE);
        HashMap<String, UsbDevice> devices = manager.getDeviceList();

        outer:
        for (String name : devices.keySet()) {
            UsbDevice device = devices.get(name);
            String vendorProduct = makeVendorProduct(device);

            log.d("Device info:", vendorProduct, device.getDeviceClass(), device.getDeviceSubclass(), device.getDeviceId(), device.getDeviceName(), device.getDeviceProtocol());

            List<AUSBDeviceDriver> connections = mConnectedDevices.get(vendorProduct);
            if (connections == null) {
                // not in use.
            } else {
                for (AUSBDeviceDriver driver : connections) {
                    if (driver.getDevice().getDeviceId() == device.getDeviceId()) {
                        // already in use.
                        log.v("Device is already in use.");
                        continue outer;
                    }
                }
            }

            // TODO check if already in use.
            // if device already in use.. { } else

            Class<? extends AUSBDeviceDriver> impl = mDeviceImpl.get(vendorProduct);
            if (impl == null) {
                log.v("No usb implementation available for", vendorProduct);
                continue;
            }

            // Check if we have permission to read this device.
            if (!manager.hasPermission(device)) {
                log.v("Requesting permission to access", device);
                manager.requestPermission(device, mPermissionIntent);
                continue;
            }

            try {
                UsbDeviceConnection connection = manager.openDevice(device);
                final AUSBDeviceDriver driver = impl.newInstance();
                driver.setDevice(manager, device);
                if (connections == null) {
                    connections = new ArrayList<AUSBDeviceDriver>();
                    mConnectedDevices.put(vendorProduct, connections);
                }
                connections.add(driver);

                mUsbManagerListeners.forEach(new ForEachList.ForEach<BossUSBManagerListener>() {
                    @Override
                    public void go(BossUSBManagerListener item) {
                        item.onDeviceAvailable(driver);
                    }
                });
            } catch (BossException be) {
                log.e(be);
            } catch (InstantiationException e) {
                log.e(e);
            } catch (IllegalAccessException e) {
                log.e(e);
            }
        }
    }

    private String makeVendorProduct(UsbDevice device) {
        return String.format("%d:%d", device.getVendorId(), device.getProductId());
    }

    public interface BossUSBManagerListener {
        void onDeviceAvailable(AUSBDeviceDriver deviceDriver);
    }

    public synchronized void addUSBManagerListener(BossUSBManagerListener listener) {
        mUsbManagerListeners.add(listener);
    }

    public synchronized void removeUSBManagerListener(BossUSBManagerListener listener) {
        mUsbManagerListeners.remove(listener);
    }

    private ForEachList<BossUSBManagerListener> mUsbManagerListeners = new ForEachList<BossUSBManagerListener>();
}
