package com.williwoodstudios.pureviews;

import android.graphics.RectF;
import android.os.Handler;
import android.os.SystemClock;

/**
 * Created by robwilliams on 2015-10-18.
 */
public abstract class RectangleAnimation {
    private Handler mHandler;
    private RectF mBase = new RectF();
    private float mDeltaTop;
    private float mDeltaLeft;
    private float mDeltaRight;
    private float mDeltaBottom;
    private long mStartTime;
    private long mEndTime;
    private RectF mActiveRect;
    private RectF mFinalRect;
    private long mDuration;

    public RectangleAnimation(Handler handler) {
        mHandler = handler;
    }

    public void start(RectF activeRect, RectF finalRect, long duration) {
        mActiveRect = activeRect;
        mFinalRect = finalRect;
        mStartTime = SystemClock.uptimeMillis();
        mEndTime = mStartTime + duration;
        mDuration = duration;
        mBase.set(activeRect);
        mDeltaTop = finalRect.top - activeRect.top;
        mDeltaLeft = finalRect.left - activeRect.left;
        mDeltaRight = finalRect.right - activeRect.right;
        mDeltaBottom = finalRect.bottom - activeRect.bottom;
        mHandler.removeCallbacks(mTick);
        mHandler.postDelayed(mTick, 10);
    }

    private float curve(float in) {
        float toReturn = (-(float)Math.sin(in * Math.PI + Math.PI / 2) + 1) / 2;
        return toReturn;
    }

    private Runnable mTick = new Runnable() {
        public void run() {
            long now = SystemClock.uptimeMillis();
            if (now >= mEndTime) {
                mActiveRect.set(mFinalRect);
            } else {
                float progress = (now - mStartTime) / 1f / mDuration;
                progress = curve(progress);
                mActiveRect.top = mBase.top + progress * mDeltaTop;
                mActiveRect.left = mBase.left + progress * mDeltaLeft;
                mActiveRect.right = mBase.right + progress * mDeltaRight;
                mActiveRect.bottom = mBase.bottom + progress * mDeltaBottom;
                mHandler.postDelayed(mTick, 0);
            }
            delta();
        }
    };

    protected abstract void delta();

}
