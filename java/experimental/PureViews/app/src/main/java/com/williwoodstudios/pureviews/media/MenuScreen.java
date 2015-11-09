package com.williwoodstudios.pureviews.media;

import android.content.Context;
import android.graphics.Canvas;
import android.graphics.Paint;
import android.util.AttributeSet;
import android.widget.ImageView;

import com.williwoodstudios.pureviews.AppScreen;
import com.williwoodstudios.pureviews.R;
import com.williwoodstudios.pureviews.Theme;

/**
 * Created by robwilliams on 2015-11-09.
 */
public class MenuScreen extends AppScreen {

    private ImageView mBackground;
    private int mWidth = -1;
    private int mHeight = -1;
    private Paint mLinePaint;

    public MenuScreen(Context context) {
        super(context);
        init();
    }

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
    }

    @Override
    public void onDraw(Canvas canvas) {
        super.onDraw(canvas);

        canvas.drawLine(0,40,mWidth,40, mLinePaint);
    }


}
