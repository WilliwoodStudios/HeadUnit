package com.williwoodstudios.pureviews.circle;

import android.content.Context;
import android.graphics.Canvas;
import android.graphics.Paint;
import android.graphics.RectF;
import android.os.Handler;
import android.util.Log;

/**
 * Created by robwilliams on 2015-11-14.
 */
public class TimerCircleButton extends CircleButton {
    private Paint mArcPaint;
    private long mStart;
    private long mEnd;

    public TimerCircleButton(Context context) {
        super(context);
        init();
    }

    public TimerCircleButton(Context context, String label) {
        super(context, label);
        init();
    }

    private void init() {
        mArcPaint = new Paint();
        mArcPaint.setColor(0xffffffff);
        mArcPaint.setAlpha(127);
        mHandler = new Handler();
        setTitlePosition(TitlePosition.RIGHT);
    }

    public void setDuration(long durationMs) {
        mStart = System.currentTimeMillis();
        mEnd = mStart + durationMs;
        mHandler.removeCallbacks(mTick);
        mTick.run();
    }

    private float mProgress = 0;

    private Runnable mTick = new Runnable() {
        public void run() {
            if (mStopped) {
                return;
            }
//            Log.e("TimerCircleButton","Tick");
            long now = System.currentTimeMillis();
            if (now > mEnd) {
                mProgress = 1;
                invalidate();
                performClick();
            } else {
                mProgress = 1f * (now - mStart) / (mEnd - mStart);
                invalidate();
                mHandler.postDelayed(this,10);
            }
        }
    };

    private Handler mHandler;

    private RectF mArcRect = new RectF();

    @Override
    protected void dispatchDraw(Canvas canvas) {
        super.dispatchDraw(canvas);

//        Log.e("TimerCircleButton","DD " + mProgress);

        if (mArcRect.width()==0) {
            mArcRect.set(0,0,getHeight(),getHeight());
        }

        canvas.drawArc(mArcRect,270,360*mProgress,true,mArcPaint);
    }

    private boolean mStopped = false;

    public void stop() {
        mStopped = true;
    }
}
