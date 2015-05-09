package com.workshoptwelve.boss.app.hardware.usb;

import android.hardware.usb.UsbDevice;
import android.hardware.usb.UsbDeviceConnection;
import android.hardware.usb.UsbManager;

import com.workshoptwelve.brainiac.boss.common.error.BossException;

/**
 * Created by robwilliams on 15-05-08.
 */
public abstract class AUSBDeviceDriver {
    protected UsbDevice mDevice;
    protected UsbDeviceConnection mDeviceConnection;

    public void setDevice(UsbManager manager, UsbDevice device) throws BossException {
        mDevice = device;
    }

    public UsbDevice getDevice() {
        return mDevice;
    }
}
