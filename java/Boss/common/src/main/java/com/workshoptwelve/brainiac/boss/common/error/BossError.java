package com.workshoptwelve.brainiac.boss.common.error;

/**
 * Created by robwilliams on 15-05-07.
 */
public enum BossError {
    /**
     * General errors.
     */
    UNSPECIFIED_ERROR(0, "Unspecified error"),
    UNHANDLED_EXCEPTION(1, "Unhandled exception"),

    PARAMETER_MISSING(2,"Missing parameter"),
    PARAMETER_BAD(3,"Bad parameter given"),

    /**
     * ODBII errors.
     */
    ODB_NO_DEVICE_CONNECTED(2000, "No device connected"),
    ODB_VEHICLE_NOT_DETECTED(2001, "No vehicle on / connected"),
    ODB_UNAVAILABLE(2002, "Device unavailable"),
    ODB_NO_RESPONSE(2003, "No response");

    private int mErrorCode;
    private String mDescription;

    BossError(int errorCode, String description) {
        mErrorCode = errorCode;
        mDescription = description;
    }

    public static BossError findErrorByCode(int errorCode) {
        for (BossError error : values()) {
            if (error.mErrorCode == errorCode) {
                return error;
            }
        }
        return UNSPECIFIED_ERROR;
    }

    public String getDescription() {
        return mDescription;
    }

    public int getErrorCode() {
        return mErrorCode;
    }
}
