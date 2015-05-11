package com.workshoptwelve.boss.app.hardware.usb;

import android.hardware.usb.UsbDevice;
import android.hardware.usb.UsbDeviceConnection;
import android.hardware.usb.UsbManager;

import com.workshoptwelve.brainiac.boss.common.error.BossException;
import com.workshoptwelve.brainiac.boss.common.util.ForEachList;

/**
 * Created by robwilliams on 15-05-08.
 */
public abstract class AUSBDeviceDriver {
    public interface USBDeviceDriverListener {
        void onConnectedChanged(boolean connected);
    }
    protected ForEachList<USBDeviceDriverListener> mListeners = new ForEachList<USBDeviceDriverListener>();
    protected UsbDevice mDevice;
    protected UsbDeviceConnection mDeviceConnection;
    private boolean mConnected = true;

    public void setDevice(UsbManager manager, UsbDevice device) throws BossException {
        mDevice = device;
    }

    public UsbDevice getDevice() {
        return mDevice;
    }

    public void setConnected(final boolean connected) {
        if (connected != mConnected) {
            mConnected = connected;
            mListeners.forEach(new ForEachList.ForEach<USBDeviceDriverListener>() {
                @Override
                public void go(USBDeviceDriverListener item) {
                    item.onConnectedChanged(connected);
                }
            });
        }
    }

    public void addUSBDeviceDriverListener(USBDeviceDriverListener listener) {
        mListeners.add(listener);
    }
}
