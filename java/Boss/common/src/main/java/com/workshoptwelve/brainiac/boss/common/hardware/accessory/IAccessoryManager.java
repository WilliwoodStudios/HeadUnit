package com.workshoptwelve.brainiac.boss.common.hardware.accessory;

import com.workshoptwelve.brainiac.boss.common.error.BossException;

import org.json.JSONArray;

import java.util.List;

/**
 * Created by robwilliams on 15-06-29.
 */
public interface IAccessoryManager {
    /**
     * Get a list of accessory IDs.
     * @return
     * @throws BossException
     */
    JSONArray getConnectedAccessories() throws BossException;

    String sendCommandToAccessory(String serialNumber, String command) throws BossException;
}
