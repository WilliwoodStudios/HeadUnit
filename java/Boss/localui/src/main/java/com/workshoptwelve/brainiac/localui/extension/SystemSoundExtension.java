package com.workshoptwelve.brainiac.localui.extension;

import android.content.Context;
import android.content.res.AssetFileDescriptor;
import android.content.res.AssetManager;
import android.media.MediaPlayer;

import com.workshoptwelve.brainiac.boss.common.log.Log;

import org.json.JSONException;
import org.json.JSONObject;
import org.xwalk.core.XWalkExtension;

import java.io.IOException;
import java.util.HashMap;

/**
 * Created by robwilliams on 15-08-29.
 */
public class SystemSoundExtension extends XWalkExtension {
    private static final Log log = Log.getLogger(SystemSoundExtension.class);

    private static final String NAME = "brainiacSystemSound";
    private static final String JS_API = "exports.playSoundEffect = function(sound) { extension.postMessage(JSON.stringify({cmd:'pse', sound: sound})); };";
    private final Context mContext;
    private final AssetManager mAssetsManager;
    private HashMap<Integer, String> mSoundEffectsMap = new HashMap<>();
    private HashMap<Integer, MediaPlayer> mSoundEffectsPlayers = new HashMap<>();

    public SystemSoundExtension(Context context) {
        super(NAME,JS_API);
        mContext = context;
        mAssetsManager = mContext.getAssets();
        initSoundEffects();
    }

    @Override
    public void onMessage(int i, String s) {
        try {
            JSONObject message = new JSONObject(s);
            if (message.has("cmd")) {
                String command = message.getString("cmd");
                if ("pse".equals(command)) {
                    playSoundEffect(message);
                }
            }
        } catch (JSONException je) {
            log.e("Could not process SFX message",je);
        }
    }

    private void initSoundEffects() {
        AssetManager assets = mContext.getAssets();
        mSoundEffectsMap = new HashMap<Integer,String>();
        addSounfEffect(SoundEffect.BLIP, "sounds/blip.mp3");
        addSounfEffect(SoundEffect.HORN, "sounds/horn.mp3");
        addSounfEffect(SoundEffect.TOUCH, "sounds/Touch.ogg");
        addSounfEffect(SoundEffect.TONE0, "sounds/tones/0.wav");
        addSounfEffect(SoundEffect.TONE1, "sounds/tones/1.wav");
        addSounfEffect(SoundEffect.TONE2, "sounds/tones/2.wav");
        addSounfEffect(SoundEffect.TONE3, "sounds/tones/3.wav");
        addSounfEffect(SoundEffect.TONE4, "sounds/tones/4.wav");
        addSounfEffect(SoundEffect.TONE5, "sounds/tones/5.wav");
        addSounfEffect(SoundEffect.TONE6, "sounds/tones/6.wav");
        addSounfEffect(SoundEffect.TONE7, "sounds/tones/7.wav");
        addSounfEffect(SoundEffect.TONE8, "sounds/tones/8.wav");
        addSounfEffect(SoundEffect.TONE9, "sounds/tones/9.wav");
        addSounfEffect(SoundEffect.TONE_POUND, "sounds/tones/p.wav");
        addSounfEffect(SoundEffect.TONE_ASTERISK, "sounds/tones/s.wav");
    }

    private void addSounfEffect(SoundEffect which, String name) {
        mSoundEffectsMap.put(which.ordinal(),name);
        MediaPlayer mp = buildMediaPlayer(name);
        mSoundEffectsPlayers.put(which.ordinal(),mp);
    }

    private MediaPlayer buildMediaPlayer(String name) {
        MediaPlayer mediaPlayer = new MediaPlayer();
        try {
            AssetFileDescriptor afd = mAssetsManager.openFd(name);
            log.e("Resource summary", afd.getStartOffset(), afd.getLength());
            mediaPlayer.setDataSource(afd.getFileDescriptor(), afd.getStartOffset(), afd.getLength());
            mediaPlayer.setOnCompletionListener(mCompletionListener);
            mediaPlayer.prepare();
            return mediaPlayer;
        } catch (Exception e) {
            log.w("Could not build player",name,e);
        }
        return null;
    }

    private void playSoundEffect(JSONObject message) throws JSONException {
        if (message.has("sound")) {
            int sound = message.getInt("sound");
            log.e("Want to play sound",sound);

            MediaPlayer mp = mSoundEffectsPlayers.get(sound);
            if (mp!=null) {
                try {
                    mp.start();
                } catch (RuntimeException re) {
                    log.w("Could not play sound",re);
                }
            }
        }
    }

    private MediaPlayer.OnCompletionListener mCompletionListener = new MediaPlayer.OnCompletionListener() {
        @Override
        public void onCompletion(MediaPlayer mp) {
            // Media players are currently cached - so never released.
        }
    };

    enum SoundEffect {
        BLIP,
        HORN,
        TOUCH,
        TONE0,
        TONE1,
        TONE2,
        TONE3,
        TONE4,
        TONE5,
        TONE6,
        TONE7,
        TONE8,
        TONE9,
        TONE_POUND,
        TONE_ASTERISK
    }

    @Override
    public String onSyncMessage(int i, String s) {
        log.e("On Sync Message...");
        return "This does nothing yet.";
    }
}
