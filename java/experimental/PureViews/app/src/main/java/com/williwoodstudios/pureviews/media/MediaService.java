package com.williwoodstudios.pureviews.media;

import android.content.Context;
import android.media.AudioManager;
import android.util.Log;
import android.view.KeyEvent;

/**
 * Created by Owner on 5/6/2018.
 */

/**
 * Not really an Android Service - but a helper that holds commonly used media functions.
 */
public class MediaService {
    private static Context sContext;
    private static AudioManager sAudioManager;

    public static void init(Context context) {
        sContext = context;
        sAudioManager = (AudioManager) sContext.getSystemService(Context.AUDIO_SERVICE);
    }

    public static void next() {
        try {
            long eventtime = android.os.SystemClock.uptimeMillis();

            KeyEvent downEvent = new KeyEvent(eventtime, eventtime,
                    KeyEvent.ACTION_DOWN, KeyEvent.KEYCODE_MEDIA_NEXT, 0);
            sAudioManager.dispatchMediaKeyEvent(downEvent);

            KeyEvent upEvent = new KeyEvent(eventtime, eventtime,
                    KeyEvent.ACTION_UP, KeyEvent.KEYCODE_MEDIA_NEXT, 0);
            sAudioManager.dispatchMediaKeyEvent(upEvent);
        } catch (SecurityException exception) {
            Log.w("Error:", "Failed to contact media controller: " + exception.getMessage());
        }
    }

    public static void previous() {
        try {
            long eventtime = android.os.SystemClock.uptimeMillis();

            KeyEvent downEvent = new KeyEvent(eventtime, eventtime,
                    KeyEvent.ACTION_DOWN, KeyEvent.KEYCODE_MEDIA_PREVIOUS, 0);
            sAudioManager.dispatchMediaKeyEvent(downEvent);

            KeyEvent upEvent = new KeyEvent(eventtime, eventtime,
                    KeyEvent.ACTION_UP, KeyEvent.KEYCODE_MEDIA_PREVIOUS, 0);
            sAudioManager.dispatchMediaKeyEvent(upEvent);
        } catch (SecurityException exception) {
            Log.w("Error:", "Failed to contact media controller: " + exception.getMessage());
        }
    }


}
