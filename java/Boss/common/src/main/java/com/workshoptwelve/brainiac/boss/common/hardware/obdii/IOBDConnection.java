package com.workshoptwelve.brainiac.boss.common.hardware.obdii;

import com.workshoptwelve.brainiac.boss.common.error.BossException;
import com.workshoptwelve.brainiac.boss.common.util.BlockingFuture;

/**
 * Created by robwilliams on 15-05-11.
 */
public interface IOBDConnection {

    boolean isVehicleConnected();
    boolean isDeviceConnected();
    String getDeviceVersion();

    void checkPIDSupport(int mode, int pid) throws BossException;

    void sendCommand(String command, BlockingFuture<String> response) throws BossException;
}
