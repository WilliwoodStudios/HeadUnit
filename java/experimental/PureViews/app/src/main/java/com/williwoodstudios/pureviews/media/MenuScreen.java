package com.williwoodstudios.pureviews.media;

import android.content.Context;
import android.graphics.Canvas;
import android.graphics.Paint;
import android.util.AttributeSet;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;

import com.williwoodstudios.pureviews.AppScreen;
import com.williwoodstudios.pureviews.R;
import com.williwoodstudios.pureviews.Theme;
import com.williwoodstudios.pureviews.circle.CircleMenu;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by robwilliams on 2015-11-09.
 */
public class MenuScreen extends AppScreen {

    private ImageView mBackground;
    private int mWidth = -1;
    private int mHeight = -1;
    private Paint mLinePaint;
    private CircleMenu mCircleMenu;
    private BackView mBackView;

    public MenuScreen(Context context) {
        super(context);
        init();
    }

    private String[] mNames = new String[]{"albums", "playlist", "genre", "artist", "songs"};
    private int[] mResourceIds = new int[]{R.drawable.core_media_player_img_ic_albums, R.drawable.core_media_player_img_ic_playlist,
            R.drawable.core_media_player_img_ic_genre, R.drawable.core_media_player_img_ic_artist, R.drawable.core_media_player_img_icon_128x128};

    private CircleMenu.Configuration mConfiguration = new CircleMenu.Configuration() {
        private ArrayList<CircleMenu.CircleMenuItem> mItems = new ArrayList<>();

        @Override
        public List<CircleMenu.CircleMenuItem> getItems() {
            if (mItems.size() == 0) {
                for (int i = 0; i < mNames.length; ++i) {
                    mItems.add(new CircleMenu.CircleMenuItem(mNames[i], mResourceIds[i], null));
                }
            }
            return mItems;
        }
    };

    public MenuScreen(Context context, AttributeSet attrs) {
        super(context, attrs);
        init();
    }

    public MenuScreen(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        init();
    }

    private void init() {
        setBackgroundColor(0xff000000);
        mBackground = new ImageView(getContext());
        mBackground.setImageResource(R.drawable.background_pomegranate);
        addView(mBackground);

        mLinePaint = new Paint();
        mLinePaint.setAntiAlias(true);
        mLinePaint.setColor(Theme.color);
        mLinePaint.setAlpha(255);
        mLinePaint.setStrokeWidth(2);
        mLinePaint.setStyle(Paint.Style.STROKE);

        mCircleMenu = new CircleMenu(getContext(), mConfiguration);
        addView(mCircleMenu);

        mBackView = new BackView(getContext());
        addView(mBackView);
        mBackView.setClickable(true);
        mBackView.setOnClickListener(new OnClickListener() {
            @Override
            public void onClick(View v) {
                popScreen();
            }
        });
    }

    @Override
    protected void onLayout(boolean changed, int l, int t, int r, int b) {
        int width = r - l;
        int height = b - t;

        if (width != mWidth || height != mHeight) {
            mBackground.layout(0, 0, width, height);
        }

        mWidth = width;
        mHeight = height;

        mCircleMenu.layout(0, 40, width, height);
        mBackView.layout(0, 0, width, 40);
    }

    @Override
    public void onDraw(Canvas canvas) {
        super.onDraw(canvas);

        canvas.drawLine(0, 40, mWidth, 40, mLinePaint);
    }

    public class BackView extends ViewGroup {
        private ImageView mImageView;
        private TextView mTextView;

        public BackView(Context context) {
            super(context);

            mImageView = new ImageView(context);
            mImageView.setImageResource(R.drawable.back_arrow);
            mImageView.setScaleType(ImageView.ScaleType.FIT_CENTER);
            addView(mImageView);

            mTextView = new TextView(context);
            mTextView.setText("Back");
            mTextView.setTextAppearance(context, R.style.mediaButtonFont);
            mTextView.setTextSize(30f);
            addView(mTextView);
        }

        @Override
        public void setPressed(boolean pressed) {
            super.setPressed(pressed);
            if (pressed) {
                setAlpha(0.7f);
            } else {
                setAlpha(1f);
            }
        }

        @Override
        protected void onLayout(boolean changed, int l, int t, int r, int b) {
            int width = r - l;
            int height = b - t;
            if (width != mWidth || height != mHeight) {
                mWidth = width;
                mHeight = height;
            }

            int padding = 5;
            int imageMargin = 6;
            int textTopMargin = 3;
            mImageView.layout(padding + imageMargin, 0 + imageMargin, padding + height - imageMargin, height - imageMargin);
            mTextView.layout(2 * padding + height, 0 + textTopMargin, width, height);
        }
    }

    @Override
    public int getNavigationLevel() {
        return 1;
    }
}
