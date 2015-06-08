package com.workshoptwelve.boss.desktop;

import com.workshoptwelve.brainiac.boss.common.error.BossError;
import com.workshoptwelve.brainiac.boss.common.error.BossException;
import com.workshoptwelve.brainiac.boss.common.multimedia.AMultiMediaServiceImpl;

import org.json.JSONException;
import org.json.JSONObject;

import javafx.beans.value.ChangeListener;
import javafx.beans.value.ObservableValue;
import javafx.scene.media.Media;
import javafx.scene.media.MediaPlayer;
import javafx.util.Duration;

/**
 * Created by robwilliams on 15-04-10.
 */
public class DesktopMultiMediaService extends AMultiMediaServiceImpl {
    private Media mMedia;
    private MediaPlayer mMediaPlayer;
    private ChangeListener<Duration> mCurrentTimeListener = new ChangeListener<Duration>() {
        @Override
        public void changed(ObservableValue<? extends Duration> observable, Duration oldValue, Duration newValue) {
            double delta;
            double wouldReport = newValue.toMillis();
            if ((delta = (wouldReport - oldValue.toMillis())) < 333) {
                // do nothing.
            }
            firePositionEvent((long)wouldReport);
        }
    };

    public DesktopMultiMediaService() {
    }

    @Override
    public JSONObject play() throws JSONException {
        if (mMediaPlayer != null) {
            mMediaPlayer.stop();
            mMediaPlayer = null;
            mMedia = null;
        }
        mMedia = new Media("file:///Users/robwilliams/Downloads/mickrippon_ruleroffairies.mp3");
        mMediaPlayer = new MediaPlayer(mMedia);
        mMediaPlayer.play();
        mMediaPlayer.currentTimeProperty().addListener(mCurrentTimeListener);
        return getStatus();
    }

    @Override
    public JSONObject resume() throws JSONException {
        if (mMediaPlayer != null) {
            mMediaPlayer.play();
        }
        return getStatus();
    }

    @Override
    public JSONObject pause() throws JSONException {
        if (mMediaPlayer != null) {
            mMediaPlayer.pause();
        }
        return getStatus();
    }

    @Override
    public JSONObject stop() throws JSONException {
        if (mMediaPlayer != null) {
            mMediaPlayer.stop();
        }
        return getStatus();
    }

    @Override
    public JSONObject seek(int to) throws JSONException {
        if (mMediaPlayer != null) {
            mMediaPlayer.seek(Duration.millis(to));
        }
        return getStatus();
    }

    @Override
    public JSONObject getPosition() throws JSONException {
        return super.getPosition();
    }

    @Override
    public JSONObject getStatus() throws JSONException {
        JSONObject toReturn = new JSONObject();
        toReturn.put("result",1);

        if (mMediaPlayer == null) {
            toReturn.put("source", JSONObject.NULL);
        } else {
            toReturn.put("source", mMedia.getSource());
            double duration = mMedia.getDuration().toMillis();
            if (Double.isInfinite(duration) || Double.isNaN(duration)) {
                toReturn.put("duration",JSONObject.NULL);
            } else {
                toReturn.put("duration", duration);
            }
            toReturn.put("at", mMediaPlayer.getCurrentTime().toMillis());
        }

        return toReturn;
    }

    @Override
    public JSONObject getLibrary() throws JSONException, BossException {
        throw new BossException(BossError.NOT_IMPLEMENTED);
    }
}
