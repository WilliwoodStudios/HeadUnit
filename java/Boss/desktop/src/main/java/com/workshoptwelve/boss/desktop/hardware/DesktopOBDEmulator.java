package com.workshoptwelve.boss.desktop.hardware;

import com.workshoptwelve.brainiac.boss.common.error.BossError;
import com.workshoptwelve.brainiac.boss.common.error.BossException;
import com.workshoptwelve.brainiac.boss.common.hardware.obdii.IOBDConnection;
import com.workshoptwelve.brainiac.boss.common.util.BlockingFuture;
import com.workshoptwelve.brainiac.boss.common.util.Hex;

/**
 * Created by robwilliams on 15-05-13.
 */
public class DesktopOBDEmulator implements IOBDConnection{
    @Override
    public boolean isVehicleConnected() {
        return true;
    }

    @Override
    public boolean isDeviceConnected() {
        return true;
    }

    @Override
    public String getDeviceVersion() {
        return "Desktop Emulator";
    }

    @Override
    public void checkPIDSupport(int mode, int pid) throws BossException {
        // ok.
    }

    @Override
    public void sendCommand(String command, BlockingFuture<String> response) throws BossException {
        command = command.replaceAll(" ","");
        if (command.startsWith("0101") || command.startsWith("0141")) {
            StringBuilder toReturn = new StringBuilder();
            byte [] requestBytes = Hex.hexToBytes(command);

            toReturn.append(String.format("41 %02X",requestBytes[1]&0xff));

            toReturn.append(" 00 07 e5 00");

//            for (int i = 0; i < 4; ++i) {
//                Hex.intToHex((int) (Math.random() * 256), 2, toReturn);
//            }
            response.setResult(toReturn.toString());
        } else if (command.equalsIgnoreCase("010d")) {
            response.setResult("410d21");
        } else {
            response.setException(new BossException(BossError.NOT_IMPLEMENTED));
        }
    }
}
