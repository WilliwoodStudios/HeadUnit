package com.williwoodstudios.pureviews.media;

import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.graphics.Canvas;
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
import com.williwoodstudios.pureviews.circle.CircleButton;
import com.williwoodstudios.pureviews.R;

import java.util.Collections;
import java.util.List;

/**
 * Created by robwilliams on 2015-11-09.
 */
public class MediaMainScreen extends AppScreen {

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

    private CircleButton mMenuButton;
    private CircleButton mMaxMinButton;

    private MediaSessionManager mMediaSessionManager;
    private MediaController mMediaController;


    public MediaMainScreen(Context context) {
        super(context);
        init();
    }

    public MediaMainScreen(Context context, AttributeSet attrs) {
        super(context, attrs);
        init();
//test
    }

    public MediaMainScreen(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        init();
    }


    private void init() {
        mHandler = new Handler();

        // Create our session manager.  TODO: Attach callback to change in active sessions
        mMediaSessionManager = (MediaSessionManager)getContext().getSystemService(Context.MEDIA_SESSION_SERVICE);
        try {
            List<MediaController> controllers = mMediaSessionManager.getActiveSessions(null);
            if (controllers.size() > 0 ) {
                mMediaController = controllers.get(0);
            }
        } catch (SecurityException exception) {
            Log.w("Error:", "Failed to start media controller: " + exception.getMessage());
        }

        mAlbumArt = makeImageView(-1);
        mAlbumArt.setScaleType(ImageView.ScaleType.CENTER_CROP);
        mAlbumArt.setAlpha(0.3f);

        mPreviousButton = makeImageView(R.drawable.media_button_previous);
        mPlayPauseButton = makeImageView(R.drawable.media_button_play);
        mNextButton = makeImageView(R.drawable.media_button_next);

        mArtistLabel = makeTextView("Artist");
        mSongLabel = makeTextView("Song");
        mAlbumLabel = makeTextView("Album");

        mMenuButton = new CircleButton(getContext(),R.drawable.hamburger);
        addView(mMenuButton);
        mMenuButton.setOnClickListener(mMenuOnClickListener);

        mMaxMinButton = new CircleButton(getContext(),R.drawable.minimize);
        addView(mMaxMinButton);
        mMaxMinButton.setOnClickListener(mMinMaxOnClickListener);

        setBackgroundColor(0xff000000);

    }

    private Handler mHandler;

    private OnClickListener mMenuOnClickListener = new OnClickListener() {
        @Override
        public void onClick(View v) {
            Log.e("MainScreen","On click");
            if (isTopScreen()) {
                Context context = getContext();
                Intent intent = context.getPackageManager().getLaunchIntentForPackage("com.google.android.music");
                context.startActivity(intent);
                //pushScreen(new MenuScreen(getContext()));
            }
        }
    };

    private OnClickListener mMinMaxOnClickListener = new OnClickListener() {
        @Override
        public void onClick(View v) {
            Log.e("MainScreen","MinMax On click");
            // TODO.. make the bottom media area be 25% of the height of the total screen
            //setTop(height - (height/4));
        }
    };

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
                previous();
            } else if (v== mPlayPauseButton) {
                playPause();
            } else if (v==mNextButton) {
                next();
            }
        }
    };

    private void playPause() {
        playing ^= true;

        if (playing) {
            mPlayPauseButton.setImageResource(R.drawable.media_button_pause);
        } else {
            mPlayPauseButton.setImageResource(R.drawable.media_button_play);
        }

        try {
            long eventtime = android.os.SystemClock.uptimeMillis();

            KeyEvent downEvent = new KeyEvent(eventtime, eventtime,
                    KeyEvent.ACTION_DOWN, KeyEvent.KEYCODE_MEDIA_PLAY_PAUSE, 0);
            mMediaController.dispatchMediaButtonEvent(downEvent);

            KeyEvent upEvent = new KeyEvent(eventtime, eventtime,
                    KeyEvent.ACTION_UP, KeyEvent.KEYCODE_MEDIA_PLAY_PAUSE, 0);
            mMediaController.dispatchMediaButtonEvent(upEvent);
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

    public void next() {
        try {
            long eventtime = android.os.SystemClock.uptimeMillis();

            KeyEvent downEvent = new KeyEvent(eventtime, eventtime,
                    KeyEvent.ACTION_DOWN, KeyEvent.KEYCODE_MEDIA_NEXT, 0);
            mMediaController.dispatchMediaButtonEvent(downEvent);

            KeyEvent upEvent = new KeyEvent(eventtime, eventtime,
                    KeyEvent.ACTION_UP, KeyEvent.KEYCODE_MEDIA_NEXT, 0);
            mMediaController.dispatchMediaButtonEvent(upEvent);
        } catch (SecurityException exception) {
            Log.w("Error:", "Failed to contact media controller: " + exception.getMessage());
        }
    }

    public void previous() {
        try {
            long eventtime = android.os.SystemClock.uptimeMillis();

            KeyEvent downEvent = new KeyEvent(eventtime, eventtime,
                    KeyEvent.ACTION_DOWN, KeyEvent.KEYCODE_MEDIA_PREVIOUS, 0);
            mMediaController.dispatchMediaButtonEvent(downEvent);

            KeyEvent upEvent = new KeyEvent(eventtime, eventtime,
                    KeyEvent.ACTION_UP, KeyEvent.KEYCODE_MEDIA_PREVIOUS, 0);
            mMediaController.dispatchMediaButtonEvent(upEvent);
        } catch (SecurityException exception) {
            Log.w("Error:", "Failed to contact media controller: " + exception.getMessage());
        }
    }



    @Override
    protected void onDraw(Canvas canvas) {
        super.onDraw(canvas);
    }

    @Override
    protected void onLayout(boolean changed, int l, int t, int r, int b) {
        int height = b - t;
        int width = r - l;
        int marginX = 20;
        int marginY = 20;

        float textSize = height / 14f / 35 / 4; // 35 is from px size in web app.
        float artistSize = textSize * 40;
        float songSize = textSize * 60;
        float albumSize = textSize * 30;
        float labelSize = textSize * 35;


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

        updateSongLabels(width, height);

        int menuSize = 150;
        int menuL = width - marginX - menuSize;
        int menuT = marginY;
        int menuR = menuL + menuSize;
        int menuB = menuT + menuSize;

        mMenuButton.layout(menuL, menuT, menuR, menuB);

        mMaxMinButton.layout(marginX, menuT, marginX + menuSize, menuB);

        mAlbumArt.layout(0,0,width,height);
    }

    private void updateSongLabels(int width, int height) {
        if (width <=0 || height <= 0) {
            return;
        }
        float textSize = height / 13f / 35 / 2; // 35 is from px size in web app.
        float artistSize = textSize * 40;
        float songSize = textSize * 60;
        float albumSize = textSize * 30;

        mArtistLabel.setTextSize(artistSize);
        mSongLabel.setTextSize(songSize);
        mAlbumLabel.setTextSize(albumSize);

        mArtistLabel.measure(0,0);
        mSongLabel.measure(0,0);
        mAlbumLabel.measure(0,0);

        int y = height / 2;
        y -= mAlbumLabel.getHeight(); // albumSize;

        centre(mAlbumLabel,width, y);

        y-= mSongLabel.getHeight();
        centre(mSongLabel,width, y);

        y-= mArtistLabel.getHeight();
        centre(mArtistLabel,width,y);
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
