package com.williwoodstudios.pureviews.media;

import android.content.Context;
import android.graphics.Canvas;
import android.util.AttributeSet;
import android.util.Log;
import android.view.View;
import android.widget.ImageView;
import android.widget.TextView;

import com.williwoodstudios.pureviews.AppScreen;
import com.williwoodstudios.pureviews.CircleButton;
import com.williwoodstudios.pureviews.R;

/**
 * Created by robwilliams on 2015-11-09.
 */
public class MainScreen extends AppScreen {

    private TextView mRepeatLabel;
    private TextView mSourceLabel;
    private TextView mShuffleLabel;
    private TextView mArtistLabel;
    private TextView mSongLabel;
    private TextView mAlbumLabel;

    private ImageView mPreviousButton;
    private ImageView mPlayPauseButton;
    private ImageView mNextButton;

    private CircleButton mMenuButton;

    public MainScreen(Context context) {
        super(context);
        init();
    }

    public MainScreen(Context context, AttributeSet attrs) {
        super(context, attrs);
        init();
    }

    public MainScreen(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        init();
    }


    private void init() {
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

        setBackgroundColor(0xff007f7f);
    }

    private OnClickListener mMenuOnClickListener = new OnClickListener() {
        @Override
        public void onClick(View v) {
            Log.e("MainScreen","On click");
            if (isTopScreen()) {
                pushScreen(new MenuScreen(getContext()));
            }
        }
    };

    private ImageView makeImageView(int resourceId) {
        ImageView toReturn = new ImageView(getContext());
        toReturn.setImageResource(resourceId);
        toReturn.setScaleType(ImageView.ScaleType.CENTER_INSIDE);
        addView(toReturn);
        return toReturn;
    }

    private TextView makeTextView(String label) {
        TextView toReturn = new TextView(getContext());
        toReturn.setText(label);
        toReturn.setTextAppearance(getContext(), R.style.mediaButtonFont);
        addView(toReturn);
        return toReturn;
    }

    public void setSong(String artist, String song, String album) {
        mArtistLabel.setText(artist);
        mSongLabel.setText(song);
        mAlbumLabel.setText(album);
        updateSongLabels(getWidth(),getHeight());
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
    }

    private void updateSongLabels(int width, int height) {
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
}
