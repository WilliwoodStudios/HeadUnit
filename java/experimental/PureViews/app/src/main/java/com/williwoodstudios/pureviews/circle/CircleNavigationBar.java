package com.williwoodstudios.pureviews.circle;

import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Canvas;
import android.graphics.Paint;
import android.graphics.RectF;
import android.os.Handler;
import android.view.MotionEvent;
import android.view.View;

import com.williwoodstudios.pureviews.AppScreen;
import com.williwoodstudios.pureviews.AppSpace;
import com.williwoodstudios.pureviews.R;
import com.williwoodstudios.pureviews.RectangleAnimation;
import com.williwoodstudios.pureviews.ScreenManager;
import com.williwoodstudios.pureviews.Theme;

import java.util.Calendar;
import java.util.GregorianCalendar;

/**
 * Created by robwilliams on 2015-10-18.
 */
public class CircleNavigationBar extends View implements AppSpace.OnTopChangedListener {
    private final Paint mSpacer;
    private final Handler mHandler;
    private final GregorianCalendar mCalendar;
    private final Paint mTime;
    private final RectF mTopRect;
    private final RectF mMidRect;
    private final RectF mMidBitmapRect;
    private final RectF mBotRect;

    private final Bitmap mTopBitmap;
    private Bitmap mMidBitmap;
    private Bitmap mBotBitmap;

    private final ScreenManager mScreenManager;
    private RectF mActiveRect = new RectF();
    private final Paint mCirclePaint;
    private final Paint mCircleFill;
    private final Paint mActiveCircleFill;
    private final Paint mBitmapPaint;
    private float mDateStringY;
    private int mActiveCircle = 0;
    private boolean mShowMiddleCircle = true;

    private Bitmap mBitmapBlackCircle;
    private Bitmap mBitmapOutlineCircle;
    private Bitmap mBitmapSelectedCircle;

    private RectangleAnimation mAnimateSelection;

    public CircleNavigationBar(Context context, ScreenManager screenManager) {
        super(context);
        mScreenManager = screenManager;

        setBackgroundColor(0xff000000);

        mSpacer = new Paint();
        mSpacer.setColor(Theme.color);
        mSpacer.setAlpha(255);
        mSpacer.setStrokeWidth(2);
        mSpacer.setStyle(Paint.Style.STROKE);

        mTime = new Paint();
//        mTime.setTextSize();
        mTime.setColor(Theme.color);
        mTime.setAlpha(255);
        mTime.setAntiAlias(true);
        mTime.setTextAlign(Paint.Align.CENTER);

        mCirclePaint = new Paint();
        mCirclePaint.setAntiAlias(true);
        mCirclePaint.setColor(0xffffff);
        mCirclePaint.setAlpha(255);
        mCirclePaint.setStrokeWidth(2);
        mCirclePaint.setStyle(Paint.Style.STROKE);

        mCircleFill = new Paint();
        mCircleFill.setAntiAlias(true);
        mCircleFill.setColor(0x000000);
        mCircleFill.setAlpha(255);
        mCircleFill.setStyle(Paint.Style.FILL);

        mActiveCircleFill = new Paint();
        mActiveCircleFill.setAntiAlias(true);
        mActiveCircleFill.setColor(Theme.color);
        mActiveCircleFill.setAlpha(255);
        mActiveCircleFill.setStyle(Paint.Style.FILL);

        mBitmapPaint = new Paint();
        mBitmapPaint.setAntiAlias(true);
        mBitmapPaint.setAntiAlias(true);
        mBitmapPaint.setFilterBitmap(true);
        mBitmapPaint.setDither(true);

        mHandler = new Handler();
        mHandler.post(mCheckTimeRunnable);

        mAnimateSelection
                = new RectangleAnimation(mHandler) {
            @Override
            protected void delta() {
                invalidate();
            }
        };

        mCalendar = new GregorianCalendar();

        mDateString = new char[5];

        mTopRect = new RectF();
        mMidRect = new RectF();
        mMidBitmapRect = new RectF();
        mBotRect = new RectF();

        mTopBitmap = BitmapFactory.decodeResource(getResources(), R.drawable.navigation_home);
        mBotBitmap = BitmapFactory.decodeResource(getResources(), R.drawable.settings_icon);
    }

    private char[] mDateString;
    private int mDateStringLength;

    private int mHour, mMinute;

    private Runnable mCheckTimeRunnable = new Runnable() {
        public void run() {
            mCalendar.setTimeInMillis(System.currentTimeMillis());
            int hour = mCalendar.get(Calendar.HOUR);
            int minute = mCalendar.get(Calendar.MINUTE);

            if (hour != mHour || minute != mMinute) {
                mHour = hour;
                mMinute = minute;

                int offset = 0;
                if (mHour >= 10) {
                    mDateString[offset++] = (char) ('0' + mHour / 10);
                }
                mDateString[offset++] = (char) ('0' + mHour % 10);
                mDateString[offset++] = ':';
                mDateString[offset++] = (char) ('0' + mMinute / 10);
                mDateString[offset++] = (char) ('0' + mMinute % 10);

                mDateStringLength = offset;
                invalidate();

            }
            mHandler.postDelayed(this, 500);
        }
    };

    @Override
    protected void onLayout(boolean changed, int left, int top, int right, int bottom) {
        super.onLayout(changed, left, top, right, bottom);
        mTime.setTextSize(0.06f * (bottom - top));
        mDateStringY = mTime.getTextSize() * 1f;

        int width = right - left;
        int height = bottom - top;

        float circleWidth = width / 6f * 4;

        for (int i = -1; i <= 1; ++i) {
            RectF toUse = i == -1 ? mTopRect : i == 0 ? mMidRect : mBotRect;
            toUse.left = (width - circleWidth) / 2f;
            toUse.right = toUse.left + circleWidth;
            toUse.top = (height - circleWidth) / 2f + i * 1.75f * circleWidth;
            toUse.bottom = toUse.top + circleWidth;
        }

        if (mActiveCircle == 0) {
            mActiveRect.set(mTopRect);
        } else if (mActiveCircle == 1) {
            mActiveRect.set(mMidRect);
        } else {
            mActiveRect.set(mBotRect);
        }

        RectF sratch = new RectF();

        mBitmapBlackCircle = Bitmap.createBitmap((int) circleWidth + 2, (int) circleWidth + 2, Bitmap.Config.ARGB_8888);
        Canvas canvas = new Canvas(mBitmapBlackCircle);
        sratch.set(1, 1, mBitmapBlackCircle.getWidth() - 1, mBitmapBlackCircle.getHeight() - 1);
        canvas.drawArc(sratch, 0, 360, true, mCircleFill);

        mBitmapOutlineCircle = Bitmap.createBitmap(mBitmapBlackCircle.getWidth(), mBitmapBlackCircle.getHeight(), Bitmap.Config.ARGB_8888);
        canvas = new Canvas(mBitmapOutlineCircle);
        canvas.drawArc(sratch, 0, 360, true, mCirclePaint);

        mBitmapSelectedCircle = Bitmap.createBitmap(mBitmapBlackCircle.getWidth(), mBitmapBlackCircle.getHeight(), Bitmap.Config.ARGB_8888);
        canvas = new Canvas(mBitmapSelectedCircle);
        canvas.drawArc(sratch, 0, 360, true, mActiveCircleFill);
    }

    @Override
    protected void onDraw(Canvas canvas) {
        super.onDraw(canvas);

        // Draw border line
        canvas.drawLine(getWidth() - 1, 0, getWidth() - 1, getHeight(), mSpacer);

        // Draw clock
        canvas.drawText(mDateString, 0, mDateStringLength, getWidth() / 2, mDateStringY, mTime);

        // Draw Line
        float midX = (mTopRect.left + mTopRect.right) / 2;
        canvas.drawLine(midX, mTopRect.top + 5, midX, mBotRect.bottom - 5, mCirclePaint);

        // Draw Circles
        canvas.drawBitmap(mBitmapBlackCircle, mTopRect.left, mTopRect.top, null);
        if (mActiveCircle > 0) {
            canvas.drawBitmap(mBitmapBlackCircle, mMidRect.left, mMidRect.top, null);
        }
        canvas.drawBitmap(mBitmapBlackCircle, mBotRect.left, mBotRect.top, null);

        // Draw active circle
        canvas.drawBitmap(mBitmapSelectedCircle, mActiveRect.left, mActiveRect.top, null);

        // Draw borders
        canvas.drawBitmap(mBitmapOutlineCircle, mTopRect.left, mTopRect.top, null);
        if (mActiveCircle > 0) {
            canvas.drawBitmap(mBitmapOutlineCircle, mMidRect.left, mMidRect.top, null);
        }
        canvas.drawBitmap(mBitmapOutlineCircle, mBotRect.left, mBotRect.top, null);

        // Draw icons
        canvas.drawBitmap(mTopBitmap, null, mTopRect, mBitmapPaint);
        if (mMidBitmap != null) {
            canvas.drawBitmap(mMidBitmap, null, mMidBitmapRect, mBitmapPaint);
        }
        if (mBotBitmap != null) {
            canvas.drawBitmap(mBotBitmap, null, mBotRect, mBitmapPaint);
        }
    }

    @Override
    public boolean onTouchEvent(MotionEvent event) {
        int action = event.getActionMasked();
        if (action == MotionEvent.ACTION_UP) {
            float x = event.getX();
            float y = event.getY();
            int newActiveCircle = mActiveCircle;
            if (mTopRect.contains(x, y)) {
                newActiveCircle = 0;
                mScreenManager.popToFirstScreen();
            } else if (mMidRect.contains(x, y)) {
                newActiveCircle = 1;
            } else if (mBotRect.contains(x, y)) {
                newActiveCircle = 2;
            }
            if (newActiveCircle != mActiveCircle) {
                mActiveCircle = newActiveCircle;
                mAnimateSelection.start(mActiveRect, mActiveCircle == 0 ? mTopRect : mActiveCircle == 1 ? mMidRect : mBotRect, 350);
            }
        }
        return true;
    }

    private void freeMidBitmap() {
        if (mMidBitmap != null) {
            mMidBitmap.recycle();
            mMidBitmap = null;
        }
        mMidBitmapId = -1;
    }

    private int mMidBitmapId = -1;

    @Override
    public void onTopChanged(AppScreen screen) {
        if (screen.getNavigationLevel() == 0) {
            // update the layout.
            freeMidBitmap();
            invalidate();
        } else if (screen.getNavigationLevel() == 1) {
            int id = screen.getNavigationIconResourceID();
            if (id != -1) {
                if (id != mMidBitmapId) {
                    freeMidBitmap();

                    float trim = screen.getNavigationIconResourcePadding();
                    float width = mMidRect.width();
                    float delta = width * trim;

                    mMidBitmapRect.set(mMidRect.left + delta, mMidRect.top + delta, mMidRect.right - delta, mMidRect.bottom - delta);
                    mMidBitmapId = id;
                    mMidBitmap = BitmapFactory.decodeResource(getResources(), id);
                    invalidate();
                }
            }
            // update the icon and layout...
        } else {
            // Show the settings tab.
        }

        if (mActiveCircle != screen.getNavigationLevel()) {
            int newActiveCircle = screen.getNavigationLevel();
            mActiveCircle = newActiveCircle;
            mAnimateSelection.start(mActiveRect, mActiveCircle == 0 ? mTopRect : mActiveCircle == 1 ? mMidRect : mBotRect, 350);
        }
    }
}
