package com.workshoptwelve.brainiac.boss.common.hardware.obdii;

/**
 * Created by robwilliams on 15-09-25.
 */
public interface IOBDListener {
    void onPIDUpdated(int mode, int pid, String value);
}
