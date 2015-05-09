package com.workshoptwelve.boss.app.hardware.usb.serial;

import android.hardware.usb.UsbConstants;
import android.hardware.usb.UsbDevice;
import android.hardware.usb.UsbEndpoint;
import android.hardware.usb.UsbInterface;
import android.hardware.usb.UsbManager;

import com.workshoptwelve.boss.app.hardware.usb.AUSBDeviceDriver;
import com.workshoptwelve.brainiac.boss.common.error.BossError;
import com.workshoptwelve.brainiac.boss.common.error.BossException;
import com.workshoptwelve.brainiac.boss.common.log.Log;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;

/**
 * Created by robwilliams on 15-05-07.
 */
public abstract class AUSBSerial extends AUSBDeviceDriver {
    private static final Log log = Log.getLogger(AUSBSerial.class);
    protected int mBaudRate = 9600;

    protected UsbInterface mInterface;
    protected UsbEndpoint mEndpointIn;
    protected UsbEndpoint mEndpointOut;
    private OutputStream mOutputStream;
    private InputStream mInputStream;

    public void setDevice(UsbManager manager, UsbDevice device) throws BossException {
        super.setDevice(manager, device);
        log.v();

        // Need to find an interface that has bulk in and out end points.
        for (int i = 0; i < device.getInterfaceCount(); ++i) {
            UsbInterface usbInterface = device.getInterface(i);

            UsbEndpoint out = null;
            UsbEndpoint in = null;

            for (int j = 0; j < usbInterface.getEndpointCount(); ++j) {
                UsbEndpoint endPoint = usbInterface.getEndpoint(j);
                if (endPoint.getType() == UsbConstants.USB_ENDPOINT_XFER_BULK) {
                    int direction = endPoint.getDirection();
                    if (direction == UsbConstants.USB_DIR_OUT) {
                        out = endPoint;
                    } else if (direction == UsbConstants.USB_DIR_IN) {
                        in = endPoint;
                    }
                }
            }

            if (out != null && in != null) {
                mInterface = usbInterface;
                mEndpointIn = in;
                mEndpointOut = out;
                break;
            }
        }

        if (mInterface == null) {
            throw new BossException(BossError.USB_DRIVER_ERROR, "Not compatible - could not find interfaces");
        }

        mDeviceConnection = manager.openDevice(device);
        if (mDeviceConnection == null) {
            throw new BossException(BossError.USB_DRIVER_ERROR, "Could not connect");
        }

        boolean claimed = mDeviceConnection.claimInterface(mInterface, false);
        if (!claimed) {
            throw new BossException(BossError.USB_DRIVER_ERROR, "Could not claim USB interface");
        }
    }

    public void setBaudRate(int rate) {
        mBaudRate = rate;
    }

    public OutputStream getOutputStream() {
        if (mOutputStream == null) {
            mOutputStream = new OutputStream() {
                private byte[] mDummyByte = new byte[1];

                @Override
                public void write(int oneByte) throws IOException {
                    mDummyByte[0] = (byte) oneByte;
                    write(mDummyByte, 0, mDummyByte.length);
                }

                @Override
                public void write(byte[] buffer) throws IOException {
                    write(buffer, 0, buffer.length);
                }

                @Override
                public void write(byte[] buffer, int offset, int count) throws IOException {
                    while (count > 0) {
                        int wrote = mDeviceConnection.bulkTransfer(mEndpointOut, buffer, offset, count, 1000);
                        if (wrote < 0) {
                            // TODO handle.
                            throw new IOException("Not handled properly yet.");
                        }
                        count -= wrote;
                        offset += wrote;
                    }
                }
            };
        }
        return mOutputStream;
    }

    public InputStream getInputStream() {
        if (mInputStream == null) {
            mInputStream = new InputStream() {
                byte [] mDummyByte = new byte[1];
                @Override
                public int read() throws IOException {
                    int howMany = read(mDummyByte);
                    if (howMany == 1) {
                        return mDummyByte[0] & 0xff;
                    }
                    return -1;
                }

                @Override
                public int read(byte[] buffer) throws IOException {
                    return read(buffer,0,buffer.length);
                }

                @Override
                public int read(byte[] buffer, int byteOffset, int byteCount) throws IOException {
                    int toReturn = mDeviceConnection.bulkTransfer(mEndpointIn,buffer,byteOffset,byteCount, 10000);
                    return toReturn;
                }
            };
        }
        return mInputStream;
    }

    public abstract void init() throws BossException;
}
