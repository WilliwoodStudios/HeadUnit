package com.williwoodstudios.android.brainiaconboardserver;

import android.content.Context;
import android.media.MediaPlayer;

import com.workshoptwelve.brainiac.server.common.multimedia.AMultiMediaServiceImpl;

import org.json.JSONException;
import org.json.JSONObject;

/**
 * Created by robwilliams on 15-05-05.
 */
public class AndroidMultiMediaService extends AMultiMediaServiceImpl {

    private final Context mContext;
    private MediaPlayer mMediaPlayer;

    public AndroidMultiMediaService(Context context) {
        mContext = context;
    }

    @Override
    public JSONObject play() throws JSONException {
        if (mMediaPlayer != null) {
            stop();
        }
        mMediaPlayer = MediaPlayer.create(mContext, R.raw.mickrippon_ruleroffairies);
        final MediaPlayer myMediaPlayer = mMediaPlayer;
        mMediaPlayer.setOnCompletionListener(new MediaPlayer.OnCompletionListener() {
            @Override
            public void onCompletion(MediaPlayer mp) {
                if (mMediaPlayer == myMediaPlayer) {
                    mMediaPlayer = null;
                }
            }
        });
        mMediaPlayer.start();
        new Thread() {
            public void run() {
                long position = Long.MIN_VALUE;
                while (mMediaPlayer == myMediaPlayer) {
                    long now = myMediaPlayer.getCurrentPosition();
                    long delta = now - position;
                    if (delta < 0) {
                        delta = -delta;
                    }
                    if (delta > 333) {
                        firePositionEvent(now);
                        position = now;
                    }

                    try {
                        Thread.sleep(300);
                    } catch (InterruptedException ie) {
                        // consume.
                    }
                }
            }
        }.start();
        return super.play();
    }

    @Override
    public JSONObject resume() throws JSONException {
        if (mMediaPlayer != null) {
            mMediaPlayer.start();
        }

        return super.resume();
    }

    @Override
    public JSONObject pause() throws JSONException {
        if (mMediaPlayer != null) {
            mMediaPlayer.pause();
            ;
        }
        return super.pause();
    }

    @Override
    public JSONObject stop() throws JSONException {
        if (mMediaPlayer != null) {
            mMediaPlayer.stop();
            mMediaPlayer.release();
            mMediaPlayer = null;
        }
        return super.stop();
    }

    @Override
    public JSONObject getStatus() throws JSONException {
        JSONObject toReturn = new JSONObject();
        toReturn.put("result", 1);

        if (mMediaPlayer == null) {
            toReturn.put("source", JSONObject.NULL);
        } else {
            try {
                toReturn.put("source", mMediaPlayer.getTrackInfo().toString());
                int duration = mMediaPlayer.getDuration();
                toReturn.put("duration", duration);
                toReturn.put("at", mMediaPlayer.getCurrentPosition());
            } catch (RuntimeException re) {
                // consume.
            }
        }

        return toReturn;
    }

    @Override
    public JSONObject getPosition() throws JSONException {
        return super.getPosition();
    }

    @Override
    public JSONObject seek(int to) throws JSONException {
        if (mMediaPlayer != null) {
            mMediaPlayer.seekTo(to);
        }
        return super.seek(to);
    }
}