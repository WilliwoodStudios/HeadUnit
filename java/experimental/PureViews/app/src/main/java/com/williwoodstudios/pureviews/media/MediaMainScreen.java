package com.williwoodstudios.pureviews.media;

import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.graphics.Canvas;
import android.graphics.Paint;
import android.media.AudioManager;
import android.media.session.MediaSession;
import android.media.session.MediaController;
import android.media.session.MediaSessionManager;
import android.os.Handler;
import android.text.TextUtils;
import android.util.AttributeSet;
import android.util.Log;
import android.util.TypedValue;
import android.util.DisplayMetrics;
import android.view.View;
import android.view.KeyEvent;
import android.widget.ImageView;
import android.widget.TextView;

import com.williwoodstudios.pureviews.AppScreen;
import com.williwoodstudios.pureviews.RemoteControlReceiver;
import com.williwoodstudios.pureviews.Theme;
import com.williwoodstudios.pureviews.circle.CircleButton;
import com.williwoodstudios.pureviews.R;


import java.util.Collections;
import java.util.List;

/**
 * Created by robwilliams on 2015-11-09.
 */
public class MediaMainScreen extends AppScreen {
    private static String UNKNOWN_ARTIST = "Unknown Artist";
    private static String UNKNOWN_ALBUM = "Unknown Album";
    private static String UNKNOWN_TRACK = "Unknown Track";

    private Boolean mPlaying;
    private TextView mRepeatLabel;
    private TextView mSourceLabel;
    private TextView mShuffleLabel;
    private TextView mArtistLabel;
    private TextView mSongLabel;
    private TextView mAlbumLabel;

    private ImageView mPreviousButton;
    private ImageView mPlayPauseButton;
    private ImageView mNextButton;
    private ImageView mAlbumArt;

    private AudioManager mAudioManager;
    private RemoteControlReceiver mRemoteControlReceiver;

    private Paint mSpacer;

    public MediaMainScreen(Context context) {
        super(context);
        init();
    }

    public MediaMainScreen(Context context, AttributeSet attrs) {
        super(context, attrs);
        init();
    }

    public MediaMainScreen(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        init();
    }

    public boolean showCircleMenuIcon() {return false;}

    private void init() {
        mSpacer = new Paint();
        mSpacer.setColor(Theme.getColor());
        mSpacer.setAlpha(255);
        mSpacer.setStrokeWidth(2);
        mSpacer.setStyle(Paint.Style.STROKE);

        mAlbumArt = makeImageView(-1);
        mAlbumArt.setScaleType(ImageView.ScaleType.CENTER_CROP);
        mAlbumArt.setAlpha(0.3f);

        mPreviousButton = makeImageView(R.drawable.media_button_previous);
        mPlayPauseButton = makeImageView(R.drawable.media_button_play);
        mNextButton = makeImageView(R.drawable.media_button_next);

        mArtistLabel = makeTextView(UNKNOWN_ARTIST);
        mSongLabel = makeTextView(UNKNOWN_TRACK);
        mAlbumLabel = makeTextView(UNKNOWN_ALBUM);

        setBackgroundColor(0xff000000);

        mAudioManager = (AudioManager) getContext().getSystemService(Context.AUDIO_SERVICE);
        if (!mAudioManager.isMusicActive()) {
            Log.v("MediaMainScreen","Music Not Active");
            mPlayPauseButton.setImageResource(R.drawable.media_button_play);
            mPlaying = false;
        } else {
            Log.v("MediaMainScreen","Music IS Active");
            mPlayPauseButton.setImageResource(R.drawable.media_button_pause);
            mPlaying = true;
        }
        // Register our Receiver for Media events
        mRemoteControlReceiver = new RemoteControlReceiver(this);
        IntentFilter iF = new IntentFilter();
        iF.addAction("com.android.music.metachanged");
        iF.addAction("com.android.music.playstatechanged");
        getContext().registerReceiver(mRemoteControlReceiver,iF);
    }

    public void themeUpdated() {
        mSpacer.setColor(Theme.getColor());
        invalidate();
    }

    public void setArtist(String value) {
        if (value == null) {
            mArtistLabel.setText(UNKNOWN_ARTIST);
        } else {
            mArtistLabel.setText(value);
        }
        updateSongLabels();
    }

    public void setAlbum(String value) {
        if (value == null) {
            mAlbumLabel.setText(UNKNOWN_ALBUM);
        } else {
            mAlbumLabel.setText(value);
        }
        updateSongLabels();
    }

    public void setTrack(String value) {
        if (value == null) {
            mSongLabel.setText(UNKNOWN_TRACK);
        } else {
            mSongLabel.setText(value);
        }
        updateSongLabels();
    }

    public void setPlayState(Boolean value) {
        mPlaying = value;
        if (mPlaying) {
            mPlayPauseButton.setImageResource(R.drawable.media_button_pause);
        } else {
            mPlayPauseButton.setImageResource(R.drawable.media_button_play);
        }
    }

    private ImageView makeImageView(final int resourceId) {
        ImageView toReturn = new ImageView(getContext()) {
            @Override
            public void setPressed(boolean pressed) {
                super.setPressed(pressed);
                if (pressed && resourceId!=-1) {
                    setAlpha(0.7f);
                } else {
                    setAlpha(1f);
                }
            }
        };
        if (resourceId!=-1) {
            toReturn.setImageResource(resourceId);
            toReturn.setClickable(true);
            toReturn.setOnClickListener(mControlClickListener);
        }
        toReturn.setScaleType(ImageView.ScaleType.CENTER_INSIDE);
        addView(toReturn);
        return toReturn;
    }

    private boolean playing = false;

    private OnClickListener mControlClickListener = new OnClickListener() {
        @Override
        public void onClick(View v) {
            if (v == mPreviousButton) {
                MediaService.previous();
            } else if (v== mPlayPauseButton) {
                playPause();
            } else if (v==mNextButton) {
                MediaService.next();
            }
        }
    };

    private void playPause() {
        try {
            long eventtime = android.os.SystemClock.uptimeMillis();
            // Key Down emulation
            KeyEvent downEvent = new KeyEvent(eventtime, eventtime,
                    KeyEvent.ACTION_DOWN, KeyEvent.KEYCODE_MEDIA_PLAY_PAUSE, 0);
            mAudioManager.dispatchMediaKeyEvent(downEvent);
            // Key Up emulation
            KeyEvent upEvent = new KeyEvent(eventtime, eventtime,
                    KeyEvent.ACTION_UP, KeyEvent.KEYCODE_MEDIA_PLAY_PAUSE, 0);
            mAudioManager.dispatchMediaKeyEvent(upEvent);
        } catch (SecurityException exception) {
            Log.w("Error:", "Failed to contact media controller: " + exception.getMessage());
        }
    }

    private TextView makeTextView(String label) {
        TextView toReturn = new TextView(getContext());
        toReturn.setText(label);
        toReturn.setTextAppearance(getContext(), R.style.mediaButtonFont);
        addView(toReturn);
        return toReturn;
    }

    private int mSongIndex = 0;

    @Override
    protected void onDraw(Canvas canvas) {
        super.onDraw(canvas);
        // Draw border line
        canvas.drawLine(0, 0, getWidth(), 0, mSpacer);
    }

    @Override
    protected void onLayout(boolean changed, int l, int t, int r, int b) {
        int height = b - t;
        int width = r - l;

        int buttonWidth = (int) (width * 0.15f);

        int buttonT = height / 2;
        int buttonB = buttonT + buttonWidth;

        int previousL = width / 2 - 2 * buttonWidth - buttonWidth / 2;
        int previousR = previousL + buttonWidth;
        mPreviousButton.layout(previousL, buttonT, previousR, buttonB);

        int playPauseL = (width - buttonWidth) / 2;
        int playPauseR = playPauseL + buttonWidth;
        mPlayPauseButton.layout(playPauseL, buttonT, playPauseR, buttonB);

        int nextL = width / 2 + buttonWidth + buttonWidth / 2;
        int nextR = nextL + buttonWidth;
        mNextButton.layout(nextL, buttonT, nextR, buttonB);

        updateSongLabels();

        mAlbumArt.layout(0,0,width,height);
    }

    private void updateSongLabels() {
        int width = this.getWidth();
        int height = this.getHeight();

        if (width <=0 || height <= 0) {
            return;
        }
        Log.v("MediaMainScreen","updateSongLabels width:" + width);

        float textSize = 2;
        float songSize = textSize * 20;
        float albumSize = textSize * 15;
        float artistSize = textSize * 10;

        mArtistLabel.setTextSize(artistSize);
        mSongLabel.setTextSize(songSize);
        mAlbumLabel.setTextSize(albumSize);

        mArtistLabel.measure(0,0);
        mSongLabel.measure(0,0);
        mAlbumLabel.measure(0,0);

        int y = height / 3;
        centre(mSongLabel,width, y - 90);
        centre(mAlbumLabel,width, y - 45);
        centre(mArtistLabel,width,y - 5);
    }

    private void centre(View v, int width, int y) {
        int workingWidth = v.getMeasuredWidth();

        if (v.getMeasuredWidth() > width) {
            if (v instanceof TextView) {
                TextView t = (TextView) v;
                do {
                    t.setTextSize(TypedValue.COMPLEX_UNIT_PX , t.getTextSize()-0.5f);
                    t.measure(0,0);
                } while((workingWidth = t.getMeasuredWidth())>width);
            }
        }
        int t = y;
        int b = y + v.getMeasuredHeight();

        int l = (width - workingWidth)/2;
        int r = l + workingWidth;

        v.layout(l,t,r,b);
    }

    @Override
    public int getNavigationIconResourceID() {
        return R.drawable.core_media_player_img_icon_128x128;
    }

    @Override
    public int getNavigationLevel() {
        return 1;
    }
}
