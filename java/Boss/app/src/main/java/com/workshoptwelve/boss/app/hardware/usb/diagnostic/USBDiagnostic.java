package com.workshoptwelve.boss.app.hardware.usb.diagnostic;

import android.hardware.usb.UsbDevice;
import android.hardware.usb.UsbDeviceConnection;
import android.hardware.usb.UsbInterface;
import android.hardware.usb.UsbManager;

import com.workshoptwelve.boss.app.hardware.usb.AUSBDeviceDriver;
import com.workshoptwelve.brainiac.boss.common.error.BossException;
import com.workshoptwelve.brainiac.boss.common.log.Log;

/**
 * Created by robwilliams on 15-07-24.
 */
public class USBDiagnostic extends AUSBDeviceDriver {
    private static Log log = Log.getLogger(USBDiagnostic.class);
    private UsbInterface mInterface;

    @Override
    public void setDevice(UsbManager manager, UsbDevice device) throws BossException {
        super.setDevice(manager, device);
        for (int i=0; i<device.getInterfaceCount(); ++i) {
            UsbInterface inter = device.getInterface(i);

            log.e("Interface class",inter.getInterfaceClass());
            log.e("Interface subclass", inter.getInterfaceSubclass());

            if (inter.getEndpointCount()==2) {
                mInterface = inter;
                mDeviceConnection = manager.openDevice(device);
                boolean claimed = mDeviceConnection.claimInterface(inter,true);
                log.e("Claimed:",claimed);
                new Thread() {
                    public void run() {
                        readFromDevice();
                    }
                }.start();
            }

            inter.getEndpointCount();
        }
    }
    
    protected void readFromDevice() {
//        ByteBuffer buffer = ByteBuffer.allocate(60);
//        UsbRequest request = new UsbRequest();
//        request.initialize(mDeviceConnection,mInterface.getEndpoint(0));
//
//        while(true) {
//            request.queue(buffer,60);
//            mDeviceConnection.requestWait();
//            log.e(buffer.position(),buffer.remaining(),buffer.limit());
//        }

        byte [] buffer = new byte[60];
        int result = mDeviceConnection.controlTransfer(129,6,21<<8 | 0, 0,null,0,10000);
        log.v("Result from control transfer",result);
    }

    private UsbDeviceConnection mDeviceConnection;

    @Override
    public void restart() throws BossException {

    }
}
