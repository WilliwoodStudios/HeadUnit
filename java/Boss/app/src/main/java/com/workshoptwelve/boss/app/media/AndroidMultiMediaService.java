package com.workshoptwelve.boss.app.media;

import android.content.Context;
import android.media.MediaPlayer;

import com.workshoptwelve.boss.app.R;
import com.workshoptwelve.boss.app.media.jdo.Album;
import com.workshoptwelve.boss.app.media.jdo.Artist;
import com.workshoptwelve.boss.app.media.jdo.Genre;
import com.workshoptwelve.boss.app.media.jdo.Song;
import com.workshoptwelve.brainiac.boss.common.log.Log;
import com.workshoptwelve.brainiac.boss.common.multimedia.AMultiMediaServiceImpl;
import com.workshoptwelve.brainiac.boss.common.threading.ThreadPool;

import org.json.JSONException;
import org.json.JSONObject;

/**
 * Created by robwilliams on 15-05-05.
 */
public class AndroidMultiMediaService extends AMultiMediaServiceImpl {

    private static Log log = Log.getLogger(AndroidMultiMediaService.class);

    private final Context mContext;
    private final MediaScanner mScanner;
    private MediaPlayer mMediaPlayer;
    private Runnable mPollingRunnable;

    public AndroidMultiMediaService(Context context) {
        log.setLogLevel(Log.Level.v);
        mContext = context;
        mScanner = new MediaScanner(context);
        mScanner.startScan();
    }

    @Override
    public JSONObject getLibrary() throws JSONException {
        JSONObject toReturn = new JSONObject();
        JSONObject media = new JSONObject();
        toReturn.put("media", media);
        JSONObject library = new JSONObject();
        media.put("library", library);

        library.put("songs", Song.getAllSongAsJSON());
        library.put("genres", Genre.getAllGenreAsJSON());
        library.put("artists", Artist.getAllArtistAsJSON());
        library.put("albums", Album.getAllAlbumAsJSON());
        // media.put("currentSong", null);

        return toReturn;
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
                    stopPolling();
                    mMediaPlayer = null;
                }
            }
        });
        mMediaPlayer.start();
        startPolling();
        return super.play();
    }


    private synchronized void stopPolling() {
        mPollingRunnable = null;
    }

    private synchronized void startPolling() {

        if (mPollingRunnable == null && mMediaPlayer != null) {
            final MediaPlayer myMediaPlayer = mMediaPlayer;

            mPollingRunnable = new Runnable() {
                public void run() {
                    long position = Long.MIN_VALUE;
                    while (mMediaPlayer == myMediaPlayer && mPollingRunnable == this) {
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
            };
            ThreadPool.getInstance().run(mPollingRunnable);
        }
    }

    @Override
    public JSONObject resume() throws JSONException {
        if (mMediaPlayer != null) {
            mMediaPlayer.start();
            startPolling();
        }

        return super.resume();
    }

    @Override
    public JSONObject pause() throws JSONException {
        if (mMediaPlayer != null) {
            mMediaPlayer.pause();
            stopPolling();
        }
        return super.pause();
    }

    @Override
    public JSONObject stop() throws JSONException {
        if (mMediaPlayer != null) {
            mMediaPlayer.stop();
            mMediaPlayer.release();
            mMediaPlayer = null;
            stopPolling();
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
