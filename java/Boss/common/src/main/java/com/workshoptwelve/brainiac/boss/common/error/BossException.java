package com.workshoptwelve.brainiac.boss.common.error;

/**
 * Created by robwilliams on 15-05-07.
 */
public class BossException extends Exception {
    private final BossError mBossError;

    public BossException(BossError error) {
        mBossError = error;
    }

    public BossException(BossError error, Throwable cause) {
        super(cause);
        mBossError = error;
    }

    public BossException(BossError error, String message) {
        super(message);
        mBossError = error;
    }

    @Override
    public String getMessage() {
        return String.valueOf(mBossError) + " " + super.getMessage();
    }

    public BossError getBossError() {
        return mBossError;
    }
}
