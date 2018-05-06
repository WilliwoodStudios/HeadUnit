package com.williwoodstudios.pureviews.volume;

import android.content.Context;
import android.graphics.Canvas;
import android.graphics.Paint;
import android.graphics.Path;
import android.graphics.Rect;
import android.graphics.RectF;
import android.os.Handler;
import android.text.TextPaint;
import android.util.AttributeSet;
import android.view.View;
import android.view.animation.AlphaAnimation;

import com.williwoodstudios.pureviews.Theme;

/**
 * Created by robwilliams on 15-09-09.
 */
public class VolumeView extends View {
    private static final float SHOWN_ALPHA = 0.8f;
    private static final long FADE_DURATION_MS = 500;
    private static final long HIDE_DELAY_MS = 1500;
    private Paint mPaint;
    private Paint mFill;
    private TextPaint mText;
    private Paint mLine;
    private Handler mHandler;
    private int mCurrent = 5;
    private int mMax = 15;
    private String mMessage = "5";
    private boolean mSkipIsForward;
    private Paint mPaintArrow;
    private Mode mMode = Mode.SKIP;

    private Runnable mHide = new Runnable() {
        public void run() {
            AlphaAnimation fade = new AlphaAnimation(SHOWN_ALPHA, 0);
            fade.setDuration(FADE_DURATION_MS);
            fade.setFillAfter(true);
            startAnimation(fade);
        }
    };

    private Runnable mHideComplete = new Runnable() {
        public void run() {
            mMode = null;
            invalidate();
        }
    };

    public VolumeView(Context context) {
        super(context);
        init();
    }

    public VolumeView(Context context, AttributeSet attrs) {
        super(context, attrs);
        init();
    }

    public VolumeView(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        init();
    }

    public void setSkip(boolean isForward) {
        mMode = Mode.SKIP;

        mSkipIsForward = isForward;

        checkThemeColor();

        scheduleFade();
    }

    public void setVolume(int current, int max) {
        if (mCurrent != current || mMax != max || mMode != Mode.VOLUME) {
            mCurrent = current;
            mMax = max;
            mMessage = "" + current;
            if (mMax == 0) {
                mMax = 1;
            }

            mMode = Mode.VOLUME;
            scheduleFade();
        }
    }

    private void scheduleFade() {
        mHandler.removeCallbacks(mHide);
        mHandler.removeCallbacks(mHideComplete);

        checkThemeColor();

        clearAnimation();
        setAlpha(SHOWN_ALPHA);

        mHandler.postDelayed(mHide, HIDE_DELAY_MS);
        mHandler.postDelayed(mHideComplete, FADE_DURATION_MS + HIDE_DELAY_MS);

        invalidate();
    }

    private void checkThemeColor() {
        mLine.setColor(Theme.getColor());
        mLine.setAlpha(255);
    }

    private void init() {
        mPaint = new Paint();
        mPaint.setColor(0xff0000);
        mPaint.setAlpha(255);
        mPaint.setStrokeWidth(0);
        mPaint.setStyle(Paint.Style.FILL);

        mFill = new Paint();
        mFill.setColor(0x0);
        mFill.setAlpha(127);
        mFill.setStyle(Paint.Style.FILL);

        mText = new TextPaint();
        mText.setColor(0xffffff);
        mText.setAlpha(255);

        mLine = new Paint();
        mLine.setColor(0xffffff);
        mLine.setAlpha(255);
        mLine.setStyle(Paint.Style.STROKE);

        mPaintArrow = new Paint();
        mPaintArrow.setStyle(Paint.Style.FILL);
        mPaintArrow.setColor(0xffffff);
        mPaintArrow.setAlpha(255);

        mHandler = new Handler();

        setAlpha(0);
    }

    @Override
    protected void onDraw(Canvas canvas) {
        if (mMode != null) {
            int width = getWidth();
            int height = getHeight();

            int hWidth = width / 2;
            int hHeight = height / 2;

            int radius = Math.min(width, height) / 2;
            radius = (int) (radius * 0.8);

            mLine.setStrokeWidth(radius / 8);

            super.onDraw(canvas);

            canvas.drawCircle(width / 2, height / 2, radius + radius / 8, mFill);

            if (mMode == Mode.SKIP) {
                int totalTriangleWidth = (int) (radius * 2 * 0.8);
                int triangleHeight = (int) (radius * 0.75);
                int triangleWidth = (int) (triangleHeight * 0.75);

                Path path = new Path();
                if (mSkipIsForward) {
                    path.moveTo(0, 0);
                    path.lineTo(0, triangleHeight);
                    path.lineTo(triangleWidth, triangleHeight / 2);
                    path.close();
                } else {
                    path.moveTo(0, triangleHeight / 2);
                    path.lineTo(triangleWidth, triangleHeight);
                    path.lineTo(triangleWidth, 0);
                    path.close();
                }

                Path left = new Path();
                Path right = new Path();
                path.offset(hWidth - triangleWidth, hHeight - triangleHeight / 2, left);
                path.offset(hWidth, hHeight - triangleHeight / 2, right);

                if (mSkipIsForward) {
                    left.offset(triangleWidth / 8, 0);
                    right.offset(triangleWidth / 8, 0);
                } else {
                    left.offset(-triangleWidth / 8, 0);
                    right.offset(-triangleWidth / 8, 0);
                }

                canvas.drawPath(left, mPaintArrow);
                canvas.drawPath(right, mPaintArrow);

                RectF rectF = new RectF(hWidth - radius, hHeight - radius, hWidth + radius, hHeight + radius);
                canvas.drawArc(rectF, 0, 360, false, mLine);

            } else if (mMode == Mode.VOLUME) {
                mText.setTextSize(radius);


                Rect bounds = new Rect();
                mText.getTextBounds(mMessage, 0, mMessage.length(), bounds);
                canvas.drawText(mMessage, width / 2 - bounds.exactCenterX(), height / 2 - bounds.exactCenterY(), mText);

                int angle = 300 * mCurrent;
                if (mMax != 0) {
                    angle /= mMax;
                }

                RectF rectF = new RectF(hWidth - radius, hHeight - radius, hWidth + radius, hHeight + radius);
                canvas.drawArc(rectF, 120, angle, false, mLine);
            }
        }
    }

    /**
     * Holds the modes for display.
     */
    private enum Mode {
        VOLUME,
        SKIP
    }
}
