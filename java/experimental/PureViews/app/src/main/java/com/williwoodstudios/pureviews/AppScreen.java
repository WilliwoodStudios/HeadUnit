package com.williwoodstudios.pureviews;

import android.content.Context;
import android.util.AttributeSet;
import android.util.Log;
import android.view.MotionEvent;
import android.view.ViewGroup;

/**
 * Created by robwilliams on 2015-11-09.
 */
public abstract class AppScreen extends ViewGroup {

    private ScreenManager mScreenManager;

    public AppScreen(Context context) {
        super(context);
    }

    public AppScreen(Context context, AttributeSet attrs) {
        super(context, attrs);
    }

    public AppScreen(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
    }

    public final void pushing(ScreenManager screenManager) {
        mScreenManager = screenManager;
        onPushing();
    }

    public boolean isFullScreen() {
        return false;
    }

    protected void onPushing() {
        // do nothing.
    }

    public void onPopped() {

    }

    public void pushScreen(AppScreen screen) {
        Log.e("AppScreen", "Pushing screen " + screen);
        if (mScreenManager != null) {
            mScreenManager.pushScreen(screen);
        }
    }
    
    public void popScreen() {
        Log.e("AppScreen","Pop screen");
        if (mScreenManager != null) {
            mScreenManager.popScreen(this);
        }
    }

    public boolean isTopScreen() {
        if (mScreenManager != null) {
            return mScreenManager.isTopScreen(this);
        }
        return false;
    }

    private int mWidth;
    private int mHeight;
    private int mStartX;
    private int mStartY;
    private int mEndX;
    private int mEndY;

    private int mOffsetX;
    private int mOffsetY;

    private long mAnimationStart;
    private long mAnimationEnd;
    private long mAnimationDuration;

    private boolean mAnimationRunning;

    public boolean startScreenAnimate(int width, int height, int startX, int startY, int endX, int endY, long duration) {
        mAnimationRunning = true;

        mWidth = width;
        mHeight = height;

        mStartX = startX;
        mStartY = startY;

        mEndX = endX;
        mEndY = endY;

        mAnimationStart = System.currentTimeMillis();
        mAnimationEnd = mAnimationStart + duration;
        mAnimationDuration = duration;

        mOffsetX = startX;
        mOffsetY = startY;

        layout(mOffsetX, mOffsetY, mOffsetX + width, mOffsetY + height);

        return true;
    }

    public boolean screenAnimate() {
        if (!mAnimationRunning) {
            return false;

        }
        long now = System.currentTimeMillis();
        if (now < mAnimationStart) {
            return true;
        }
        if (now > mAnimationEnd) {
            layout(mEndX, mEndY, mEndX + mWidth, mEndY + mHeight);
            mAnimationRunning = false;
            return false;
        }

        long delta = now - mAnimationStart;

        float f = 1f * delta / mAnimationDuration;

        int offsetX = mStartX + (int)(f * (mEndX - mStartX));
        int offsetY = mStartY + (int)(f * (mEndY - mStartY));

        if (offsetX != mOffsetX || offsetY != mOffsetY) {
            mOffsetX = offsetX;
            mOffsetY = offsetY;
            layout(mOffsetX,mOffsetY,mOffsetX + mWidth, mOffsetY + mHeight);
        }

        return true;
    }

    public final void pushFinished() {
        onPushFinished();
    }

    protected void onPushFinished() {
    }

    public int getNavigationIconResourceID() {
        return -1;
    }

    public float getNavigationIconResourcePadding() {
        return 0;
    }

    public int getNavigationLevel() {
        return 0;
    }

    public boolean isScreenAnimationRunning() {
        return mAnimationRunning;
    }

    @Override
    public boolean onTouchEvent(MotionEvent event) {
        // don't let clicks go through the background.
        return true;
    }


}
