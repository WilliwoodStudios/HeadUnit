package com.workshoptwelve.boss.app.hardware.usb.serial;

import android.hardware.usb.UsbDeviceConnection;

import com.workshoptwelve.brainiac.boss.common.error.BossException;

/**
 * Created by robwilliams on 15-05-08.
 */
public class ArduinoUno extends AUSBSerial {
    @Override
    public void init() throws BossException {
        // for more info, search SET_LINE_CODING and
        // SET_CONTROL_LINE_STATE in the document:
        // "Universal Serial Bus Class Definitions for Communication Devices"
        // at http://adf.ly/dppFt
        final int RQSID_SET_LINE_CODING = 0x20;
        final int RQSID_SET_CONTROL_LINE_STATE = 0x22;

        int usbResult;
        usbResult = mDeviceConnection.controlTransfer(0x21, // requestType
                RQSID_SET_CONTROL_LINE_STATE, // SET_CONTROL_LINE_STATE
                0, // value
                0, // index
                null, // buffer
                0, // length
                0); // timeout

        // baud rate = 9600
        // 8 data bit
        // 1 stop bit
        byte[] encodingSetting = new byte[]{(byte) 0x80, 0x25, 0x00,
                0x00, 0x00, 0x00, 0x08};
        usbResult = mDeviceConnection.controlTransfer(0x21, // requestType
                RQSID_SET_LINE_CODING, // SET_LINE_CODING
                0, // value
                0, // index
                encodingSetting, // buffer
                7, // length
                0); // timeout
    }
}
