package com.williwoodstudios.pureviews;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

import com.williwoodstudios.pureviews.media.MediaMainScreen;


/**
 * Created by brcewane on 2018-03-02.
 */

public class RemoteControlReceiver extends BroadcastReceiver {
    private MediaMainScreen mScreen;

    public RemoteControlReceiver(MediaMainScreen screen) {
        super();
        mScreen = screen;
    }

    @Override
    public void onReceive (Context context, Intent intent) {
        //String action = intent.getAction();
        boolean playing = intent.getBooleanExtra("playing", false);
        String artist = intent.getStringExtra("artist");
        String album = intent.getStringExtra("album");
        String track = intent.getStringExtra("track");
        mScreen.setArtist(artist);
        mScreen.setAlbum(album);
        mScreen.setTrack(track);
        mScreen.setPlayState(playing);
    }
}
