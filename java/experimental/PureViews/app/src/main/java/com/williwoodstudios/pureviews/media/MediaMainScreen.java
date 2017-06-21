package com.williwoodstudios.pureviews.media;

import android.content.Context;
import android.graphics.Canvas;
import android.os.Handler;
import android.util.AttributeSet;
import android.util.Log;
import android.view.View;
import android.widget.ImageView;
import android.widget.TextView;

import com.williwoodstudios.pureviews.AppScreen;
import com.williwoodstudios.pureviews.circle.CircleButton;
import com.williwoodstudios.pureviews.R;
import com.williwoodstudios.pureviews.networking.NetworkService;

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

    private List<DummySongList.Song> mSongList;

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


    private void init() {
        mHandler = new Handler();

        mSongList = new DummySongList().getSongList();

        mAlbumArt = makeImageView(-1);
        mAlbumArt.setScaleType(ImageView.ScaleType.CENTER_CROP);
        mAlbumArt.setAlpha(0.3f);

        mRepeatLabel = makeTextView("Repeat Off");
        mSourceLabel = makeTextView("Source");
        mShuffleLabel = makeTextView("Shuffle Off");

        mPreviousButton = makeImageView(R.drawable.media_button_previous);
        mPlayPauseButton = makeImageView(R.drawable.media_button_play);
        mNextButton = makeImageView(R.drawable.media_button_next);

        mArtistLabel = makeTextView("Artist");
        mSongLabel = makeTextView("Song");
        mAlbumLabel = makeTextView("Album");

        mMenuButton = new CircleButton(getContext(),R.drawable.hamburger);
        addView(mMenuButton);
        mMenuButton.setOnClickListener(mMenuOnClickListener);

        setBackgroundColor(0xff000000);

        Collections.sort(mSongList);

        setSong();

        mCheckCommand.run();

    }

    private Runnable mCheckCommand = new Runnable() {
        public void run() {
            Log.e("MediaMainScreen","Checking data");
            Byte command = NetworkService.getNextCommand();
            if (command != null) {
                byte c = command.byteValue();
                if (c=='p') {
                    previous();
                } else if (c=='n') {
                    next();
                } else if (c=='s') {
                    playPause();
                }
            }
            mHandler.postDelayed(this,100);
        }
    };

    private Handler mHandler;

    private OnClickListener mMenuOnClickListener = new OnClickListener() {
        @Override
        public void onClick(View v) {
            Log.e("MainScreen","On click");
            if (isTopScreen()) {
                pushScreen(new MenuScreen(getContext()));
            }
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
        ++mSongIndex;
        while(mSongIndex >= mSongList.size()) {
            --mSongIndex;
        }
        setSong();
    }

    public void previous() {
        --mSongIndex;
        while(mSongIndex < 0) {
            ++mSongIndex;
        }
        setSong();
    }

    protected void setSong() {
        DummySongList.Song current = mSongList.get(mSongIndex);
        mArtistLabel.setText(current.mArtist);
        mSongLabel.setText(current.mName);
        mAlbumLabel.setText(current.mAlbum);
        mAlbumArt.setImageResource(current.mAlbumArt);
        updateSongLabels(getWidth(), getHeight());
    }


//    public void setSong(String artist, String song, String album) {
//        mArtistLabel.setText(artist);
//        mSongLabel.setText(song);
//        mAlbumLabel.setText(album);
//        updateSongLabels(getWidth(),getHeight());
//    }

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

        float textSize = height / 14f / 35; // 35 is from px size in web app.
        float artistSize = textSize * 40;
        float songSize = textSize * 60;
        float albumSize = textSize * 30;
        float labelSize = textSize * 35;

        mRepeatLabel.setTextSize(labelSize);
        mRepeatLabel.measure(0, 0);
        mRepeatLabel.layout(marginX, height - marginY - mRepeatLabel.getMeasuredHeight(), mRepeatLabel.getMeasuredWidth() + marginX, b);

        mSourceLabel.setTextSize(labelSize);
        mSourceLabel.measure(0, 0);
        mSourceLabel.layout((width - mSourceLabel.getMeasuredWidth()) / 2, height - marginY - mSourceLabel.getMeasuredHeight(), width / 2 + mSourceLabel.getMeasuredWidth(), b);

        mShuffleLabel.setTextSize(labelSize);
        mShuffleLabel.measure(0, 0);
        mShuffleLabel.layout(width - mShuffleLabel.getMeasuredWidth() - marginX, height - marginY - mShuffleLabel.getMeasuredHeight(), r, b);

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

        int menuSize = 55;
        int menuL = width - marginX - menuSize;
        int menuT = marginY;
        int menuR = menuL + menuSize;
        int menuB = menuT + menuSize;

        mMenuButton.layout(menuL, menuT, menuR, menuB);

        mAlbumArt.layout(0,0,width,height);
    }

    private void updateSongLabels(int width, int height) {
        if (width <=0 || height <= 0) {
            return;
        }
        float textSize = height / 13f / 35; // 35 is from px size in web app.
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
        y -= albumSize;

        centre(mAlbumLabel,width, y);

        y-= songSize;
        centre(mSongLabel,width, y);

        y-= artistSize;
        centre(mArtistLabel,width,y);
    }

    private void centre(View v, int width, int y) {
        int t = y;
        int b = y + v.getMeasuredHeight();

        int l = (width - v.getMeasuredWidth())/2;
        int r = l + v.getMeasuredWidth();

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
