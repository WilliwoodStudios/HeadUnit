package com.workshoptwelve.brainiac.boss.hardware.usb.serial;

import android.hardware.usb.UsbConstants;
import android.hardware.usb.UsbDevice;
import android.hardware.usb.UsbDeviceConnection;
import android.hardware.usb.UsbEndpoint;
import android.hardware.usb.UsbInterface;
import android.hardware.usb.UsbManager;
import android.hardware.usb.UsbRequest;

import com.workshoptwelve.brainiac.boss.hardware.usb.AUSBDeviceDriver;
import com.workshoptwelve.brainiac.boss.common.error.BossError;
import com.workshoptwelve.brainiac.boss.common.error.BossException;
import com.workshoptwelve.brainiac.boss.common.log.Log;
import com.workshoptwelve.brainiac.boss.common.util.CircularPipe;
import com.workshoptwelve.brainiac.boss.common.util.ForEachList;

import java.io.IOException;
import java.io.OutputStream;
import java.nio.ByteBuffer;

/**
 * Created by robwilliams on 15-05-07.
 */
public abstract class AUSBSerial extends AUSBDeviceDriver {
    private static final Log log = Log.getLogger(AUSBSerial.class);
    protected int mBaudRate = 9600;

    protected UsbInterface mInterface;
    protected UsbEndpoint mEndpointIn;
    protected UsbEndpoint mEndpointOut;

    private boolean mClosed = false;

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
                    log.v("Entering write");
                    while (count > 0) {
                        log.v("Writing",offset,count);
                        UsbEndpoint localEndpointOut = mEndpointOut;
                        UsbDeviceConnection localDeviceConnection = mDeviceConnection;
                        if (localEndpointOut == null || localDeviceConnection == null) {
                            throw new IOException("Resources missing");
                        }
                        int wrote = 0;
                        for (int i = 0; i < 5; ++i) {
                            wrote = localDeviceConnection.bulkTransfer(localEndpointOut, buffer, offset, count, 1000);
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

    @Override
    public void setConnected(boolean connected) {
        log.v("Set Connected",connected);
        super.setConnected(connected);
        if (!connected) {
            close();
        }
    }

    private void keepReading() {
        byte[] buffer = new byte[1024];
        long lastFail = -1;
        int failCount = 0;
        long failStarted = 0;
        ByteBuffer byteBuffer = ByteBuffer.allocate(1024);

        UsbRequest request = new UsbRequest();
        request.initialize(mDeviceConnection, mEndpointIn);
        try {
            while (!mClosed) {
                UsbDeviceConnection localDeviceConnection = mDeviceConnection;
                if (localDeviceConnection == null) {
                    log.v("Local device connection null");
                    break;
                }

                byteBuffer.position(0);
                byteBuffer.limit(byteBuffer.capacity());

                request.queue(byteBuffer,1024);
                UsbRequest pendingRequest = localDeviceConnection.requestWait();

                if (byteBuffer.position()>0) {
                    byteBuffer.flip();
                    int length = byteBuffer.limit();
                    byteBuffer.get(buffer,0,length);
                    mPipeOutputStream.write(buffer,0,length);
                }



                log.v("Buffer info",byteBuffer.position(),byteBuffer.remaining());
//
//                request.
//
//                int toReturn = localDeviceConnection.bulkTransfer(mEndpointIn, buffer, 0, buffer.length, 10000);
//                if (toReturn > 0) {
//                    lastFail = -1;
//                    failCount = 0;
//                    mPipeOutputStream.write(buffer, 0, toReturn);
//                } else if (toReturn == 0) {
//                    // do nothing.
//                } else {
//                    long now = SystemClock.uptimeMillis();
//                    if (lastFail == -1) {
//                        failStarted = now;
//                    } else {
//                        long delta = now - lastFail;
//                        log.v("Delta for fail checks",delta);
//                        if (delta < 300) {
//                            ++failCount;
//                        } else {
//                            failCount = 0;
//                        }
//                        log.v("Intermediate fail count:",failCount);
//                    }
//                    lastFail = now;
//
//////                    if (failCount > 5) {
////                    if (now - failStarted > 10000) {
////                        log.v("Fail count:",failCount);
////                        mPipeOutputStream.close();
////                        break;
////                    }
//                }
            }
            log.v("Leaving keep reading via while escape");
        } catch (IOException ioe) {
            log.v("Leaving keep reading thread via exception");
        }
        close();
    }

    /**
     * Close the serial device, releasing all resources.
     */
    public synchronized void close() {
        log.v("Close being called.");
        if (!mClosed) {
            log.v("Close doing something");
            mClosed = true;
            mDeviceConnection.close();
            mDeviceConnection = null;
            mEndpointIn = null;
            mEndpointOut = null;
            mSerialListeners.forEach(new ForEachList.ForEach<USBSerialListener>() {
                @Override
                public void go(USBSerialListener item) {
                    item.onClosed();
                }
            });
        }

        // RPW TODO.
    }

    private ForEachList<USBSerialListener> mSerialListeners = new ForEachList<>();

    public void addUSBSerialListener(USBSerialListener listener) {
        mSerialListeners.add(listener);
    }

    public void removeUSBSerialListener(USBSerialListener listener) {
        mSerialListeners.remove(listener);
    }

    public interface USBSerialListener {
        void onClosed();
    }
}
