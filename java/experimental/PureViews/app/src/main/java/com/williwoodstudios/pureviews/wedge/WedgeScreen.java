package com.williwoodstudios.pureviews.wedge;

import android.content.Context;
import android.graphics.Canvas;
import android.graphics.Paint;
import android.util.AttributeSet;

import com.williwoodstudios.pureviews.AppScreen;
import com.williwoodstudios.pureviews.Theme;

/**
 * Created by robwilliams on 2015-11-09.
 */
public class WedgeScreen extends AppScreen {

    public enum WedgeMode {
        FORWARD_SLASH, BACK_SLASH
    }

    private Paint mLinePaint;

    private WedgeMode mWedgeMode = WedgeMode.FORWARD_SLASH;

    public WedgeScreen(Context context) {
        super(context);
        init();
    }

    public WedgeScreen(Context context, AttributeSet attrs) {
        super(context, attrs);
        init();
    }

    public WedgeScreen(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        init();
    }

    private void init() {
        setBackgroundColor(0xaf000000);
        mLinePaint = new Paint();
        mLinePaint.setAntiAlias(true);
    }

    @Override
    public boolean isFullScreen() {
        return true;
    }

    @Override
    protected void onLayout(boolean changed, int l, int t, int r, int b) {
    }

    @Override
    public void onDraw(Canvas canvas) {
        mLinePaint.setColor(Theme.color);
        mLinePaint.setAlpha(255);
        mLinePaint.setStrokeWidth(max(getHeight() / 3, getWidth() / 3));

        if (mWedgeMode == WedgeMode.BACK_SLASH) {
            canvas.drawLine(0, 0, getWidth(), getHeight(), mLinePaint);
        } else {
            canvas.drawLine(0, getHeight(), getWidth(), 0, mLinePaint);
        }
    }

    public void setWedgeMode(WedgeMode wedgeMode) {
        if (wedgeMode != null && wedgeMode != mWedgeMode) {
            mWedgeMode = wedgeMode;
            invalidate();
        }
    }

    public WedgeMode getWedgeMode() {
        return mWedgeMode;
    }

    private int max(int a, int b) {
        return a > b ? a : b;
    }

    @Override
    public boolean shouldDelayChildPressedState() {
        return false;
    }


}
