package com.williwoodstudios.pureviews.media;

import android.content.Context;
import android.graphics.Canvas;
import android.graphics.Paint;
import android.util.AttributeSet;
import android.widget.ImageView;

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

    public MenuScreen(Context context) {
        super(context);
        init();
    }

    private String [] mNames = new String[] { "albums", "playlist","genre","artist","songs" };
    private int [] mResourceIds = new int [] { R.drawable.core_media_player_img_ic_albums, R.drawable.core_media_player_img_ic_playlist,
    R.drawable.core_media_player_img_ic_genre, R.drawable.core_media_player_img_ic_artist, R.drawable.core_media_player_img_icon_128x128};

    private CircleMenu.Configuration mConfiguration = new CircleMenu.Configuration() {
        private ArrayList<CircleMenu.CircleMenuItem> mItems = new ArrayList<>();

        @Override
        public List<CircleMenu.CircleMenuItem> getItems() {
            if (mItems.size()==0) {
                for (int i=0; i<mNames.length; ++i) {
                    mItems.add(new CircleMenu.CircleMenuItem(mNames[i],mResourceIds[i],null));
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

        mCircleMenu = new CircleMenu(getContext(),mConfiguration);
        addView(mCircleMenu);
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
    }

    @Override
    public void onDraw(Canvas canvas) {
        super.onDraw(canvas);

        canvas.drawLine(0,40,mWidth,40, mLinePaint);
    }

    @Override
    public int getNavigationLevel() {
        return 1;
    }
}
