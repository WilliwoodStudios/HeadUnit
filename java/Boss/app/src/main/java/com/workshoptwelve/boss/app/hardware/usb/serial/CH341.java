package com.workshoptwelve.boss.app.hardware.usb.serial;

import android.hardware.usb.UsbConstants;
import android.hardware.usb.UsbDeviceConnection;
import android.util.Log;

import com.workshoptwelve.brainiac.boss.common.error.BossError;
import com.workshoptwelve.brainiac.boss.common.error.BossException;

/**
 * Created by robwilliams on 15-05-07.
 */
public class CH341 extends AUSBSerial {
    @Override
    public void init() throws BossException {
        int result = ch341Configure();
        if (result != 0) {
            throw new BossException(BossError.USB_DRIVER_ERROR);
        }
    }

    int ch341_control_in(int command, int value, int index, byte[] buffer, int size) {
        int requestType = UsbConstants.USB_TYPE_VENDOR | UsbConstants.USB_DIR_IN;
        int r = mDeviceConnection.controlTransfer(requestType, command, value, index, buffer, size, 500); // TODO parameterise.
        return r;
    }

    int ch341_control_out(int request, int value, int index) {
        int requestType = UsbConstants.USB_TYPE_VENDOR | UsbConstants.USB_DIR_OUT; // TODO recip?
        int r = mDeviceConnection.controlTransfer(requestType, // requestType
                request, // SET_CONTROL_LINE_STATE
                value, // value
                index, // index
                null, // buffer
                0, // length
                500); // timeout // TODO parameterise.
        return r;
    }

    int ch341_set_baudrate() {
        int toUse = mBaudRate;

        int a, b;
        int r;

        switch (toUse) {
            case 2400:
                a = 0xd901;
                b = 0x0038;
                break;
            case 4800:
                a = 0x6402;
                b = 0x001f;
                break;
            case 9600:
                a = 0xb202;
                b = 0x0013;
                break;
            case 19200:
                a = 0xd902;
                b = 0x000d;
                break;
            case 38400:
                a = 0x6403;
                b = 0x000a;
                break;
            case 115200:
                a = 0xcc03;
                b = 0x0008;
                break;
            default:
                return -1;
        }

        r = ch341_control_out(0x9a, 0x1312, a);
        if (r == 0) {
            r = ch341_control_out(0x9a, 0x0f2c, b);
        }

        return r;
    }

    int ch341_get_status() {
        byte[] buffer = new byte[8];
        int size = 8;

        int r = ch341_control_in(0x95, 0x0706, 0, buffer, size);

	/* Not having the datasheet for the CH341, we ignore the bytes returned
     * from the device. Return error if the device did not respond in time.
	 */
        if (r < 0)
            return r;
        return 0;
    }

    int ch341_set_handshake() {
        boolean dtr = false;
        boolean rts = false;

        return ch341_control_out(0xa4,
                ~((dtr ? 1 << 5 : 0) | (rts ? 1 << 6 : 0)), 0);
    }


    int ch341Configure() {
        byte[] buffer = new byte[8];
        int size = buffer.length;

        Log.d("RPW", "ch341_configure()");

        int r;


        do {

	/* expect two bytes 0x27 0x00 */
            r = ch341_control_in(0x5f, 0, 0, buffer, size);
            if (r < 0)
                break;
            dump("5f", buffer, r);

            r = ch341_control_out(0xa1, 0, 0);
            if (r < 0)
                break;

            r = ch341_set_baudrate(); // dev, priv);
            if (r < 0)
                break;

	/* expect two bytes 0x56 0x00 */
            r = ch341_control_in(0x95, 0x2518, 0, buffer, size);
            if (r < 0)
                break;
            dump("0x95", buffer, r);

            r = ch341_control_out(0x9a, 0x2518, 0x0050);
            if (r < 0)
                break;

	/* expect 0xff 0xee */
            r = ch341_get_status();
            if (r < 0)
                break;

            r = ch341_control_out(0xa1, 0x501f, 0xd90a);
            if (r < 0)
                break;

            r = ch341_set_baudrate();
            if (r < 0)
                break;

            r = ch341_set_handshake();
            if (r < 0)
                break;

	/* expect 0x9f 0xee */
            r = ch341_get_status();
        } while (false);

        return r;
    }

    private void dump(String temp, byte[] temp2, int temp3) {
        // do nothing.
    }
}
