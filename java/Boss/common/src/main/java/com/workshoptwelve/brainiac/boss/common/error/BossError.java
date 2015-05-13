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
    NOT_IMPLEMENTED(2,"The given feature is not currently implemented"),

    PARAMETER_MISSING(3,"Missing parameter"),
    PARAMETER_BAD(4,"Bad parameter given"),

    TIMEOUT(5,"Timeout"),

    /**
     * ODBII errors.
     */
    OBD_NO_DEVICE_CONNECTED(2000, "No device connected"),
    OBD_VEHICLE_NOT_DETECTED(2001, "No vehicle on / connected"),
    OBD_UNAVAILABLE(2002, "Device unavailable"),
    OBD_NO_RESPONSE(2003, "No response"),
    OBD_MODE_NOT_SUPPORTED(2004, "Mode not supported"),
    OBD_PID_NOT_SUPPORTED(2005, "PID not supported (yet)"),
    OBD_NOT_ENOUGH_DATA(2006,"Not enough data returned"),
    OBD_UNEXPECTED_RESPONSE(2007,"Unexpected response"),

    /**
     * USB errors
     */
    USB_DRIVER_ERROR(3000,"USB Driver Error");

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
