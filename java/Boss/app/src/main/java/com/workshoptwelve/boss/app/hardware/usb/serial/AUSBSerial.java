package com.workshoptwelve.boss.app.hardware.usb.serial;

import android.hardware.usb.UsbConstants;
import android.hardware.usb.UsbDevice;
import android.hardware.usb.UsbEndpoint;
import android.hardware.usb.UsbInterface;
import android.hardware.usb.UsbManager;
import android.os.SystemClock;

import com.workshoptwelve.boss.app.hardware.usb.AUSBDeviceDriver;
import com.workshoptwelve.brainiac.boss.common.error.BossError;
import com.workshoptwelve.brainiac.boss.common.error.BossException;
import com.workshoptwelve.brainiac.boss.common.log.Log;
import com.workshoptwelve.brainiac.boss.common.util.CircularPipe;

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
    private CircularPipe mPipe;
    private OutputStream mPipeOutputStream;
    private CircularPipe.InputStream mInputStream;
    private Thread mReadThread;

    public AUSBSerial() {
        log.setLogLevel(Log.Level.v);
        mPipe = new CircularPipe(2048);
        mPipeOutputStream = mPipe.getOutputStream();
        mInputStream = mPipe.getInputStream();
    }

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

        boolean claimed = mDeviceConnection.claimInterface(mInterface, true);
        if (!claimed) {
            throw new BossException(BossError.USB_DRIVER_ERROR, "Could not claim USB interface");
        }

        setConnected(true);
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
                    log.v("Write", count);

                    while (count > 0) {
                        int wrote = 0;
                        for (int i = 0; i < 5; ++i) {
                            long started = SystemClock.elapsedRealtime();
                            wrote = mDeviceConnection.bulkTransfer(mEndpointOut, buffer, offset, count, 1000);
                            long finished = SystemClock.elapsedRealtime();
                            if (wrote >= 0) {
                                break;
                            }
                            log.v("Going to retry.");
                        }
                        if (wrote < 0) {
                            log.v("Could not write! Ummar!");
                            throw new IOException("Could not write.");
                        }
                        count -= wrote;
                        offset += wrote;
                        log.v("Write while", count);
                    }
                }
            };
        }
        return mOutputStream;
    }

    public CircularPipe.InputStream getInputStream() {
        return mInputStream;
    }

    @Override
    public void restart() throws BossException {
        mDeviceConnection.releaseInterface(mInterface);

        mInterface = null;
        mEndpointIn = null;
        mEndpointOut = null;
        mConnected = false;

        setDevice(mManager, mDevice);
    }

    public abstract void init() throws BossException;

    protected synchronized void postInit() {
        if (mReadThread == null) {
            mReadThread = new Thread("USB Read Thread") {
                public void run() {
                    keepReading();
                }
            };
            mReadThread.start();
        }
    }


    private void keepReading() {
        byte[] buffer = new byte[1024];
        long lastFail = -1;
        int failCount = 0;
        try {
            while (true) {
                int toReturn = mDeviceConnection.bulkTransfer(mEndpointIn, buffer, 0, buffer.length, 10000);
                log.v("Just Read:",toReturn,toReturn > 0 ? new String(buffer,0,toReturn) : "");
                if (toReturn > 0) {
                    lastFail = -1;
                    failCount = 0;
                    mPipeOutputStream.write(buffer, 0, toReturn);
                } else if (toReturn == 0) {
                    // do nothing.
                } else {
                    long now = SystemClock.uptimeMillis();
                    if (lastFail == -1) {
                    } else {
                        long delta = now - lastFail;
                        if (delta < 300) {
                            ++failCount;
                        } else {
                            failCount = 0;
                        }
                    }
                    lastFail = now;

                    if (failCount > 5) {
                        mPipeOutputStream.close();
                        break;
                    }
                }
            }
        } catch (IOException ioe) {
            log.v("Closing keep reading thread");
        }
    }
}
