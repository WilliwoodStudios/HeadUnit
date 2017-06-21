package com.williwoodstudios.pureviews.wedge;

import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Canvas;
import android.graphics.Matrix;
import android.graphics.Paint;
import android.graphics.RectF;
import android.os.Handler;
import android.util.AttributeSet;
import android.view.View;

import com.williwoodstudios.pureviews.R;

/**
 * Created by robwilliams on 2015-11-09.
 */
public class WedgeArrowControl extends View {

    private Paint mBitmapPaint;
    private Handler mHandler;

    public enum Direction {UP, DOWN}

    private Direction mDirection = Direction.UP;

    public void setDirection(Direction direction) {
        if (direction != null && direction != mDirection) {
            mDirection = direction;
            invalidate();
        }
    }

    public WedgeArrowControl(Context context) {
        super(context);
        init();
    }

    public WedgeArrowControl(Context context, AttributeSet attrs) {
        super(context, attrs);
        init();
    }

    public WedgeArrowControl(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        init();
    }

    @Override
    public void setPressed(boolean pressed) {
        super.setPressed(pressed);
        invalidate();
        mHandler.removeCallbacks(mStillPressedCheck);
        if (pressed) {
            mStillPressedCheck.run();
        }
    }

    public interface IsPressedListener {
        void isPressed(View view);
    }

    private IsPressedListener mPressedListener;

    public void setIsPressedListener(IsPressedListener listener) {
        mPressedListener = listener;
    }

    private Runnable mStillPressedCheck = new Runnable() {
        public void run() {
            if (isPressed()) {
                if (mPressedListener!=null) {
                    mPressedListener.isPressed(WedgeArrowControl.this);
                }
                mHandler.postDelayed(mStillPressedCheck, 100);
            } else {
                // do nothing.
            }
        }
    };

    private void init() {
        mHandler = new Handler();
        setClickable(true);
        getBitmaps(getContext());
        mBitmapPaint = new Paint();
        mBitmapPaint.setAlpha(255);
        mBitmapPaint.setAntiAlias(true);
        mBitmapPaint.setFilterBitmap(true);
        mBitmapPaint.setDither(true);
    }

    private static Bitmap sBitmap;
    private static Bitmap sBitmapUp;
    private static Bitmap sBitmapDown;

    private static void getBitmaps(Context context) {
        if (sBitmap == null) {
            sBitmap = BitmapFactory.decodeResource(context.getResources(), R.drawable.wedge_spinner_arrow);
            Matrix jenny = new Matrix();
            jenny.postRotate(-90);
            sBitmapUp = Bitmap.createBitmap(sBitmap, 0, 0, sBitmap.getWidth(), sBitmap.getHeight(), jenny, true);
            jenny.reset();
            jenny.postRotate(90);
            sBitmapDown = Bitmap.createBitmap(sBitmap, 0, 0, sBitmap.getWidth(), sBitmap.getHeight(), jenny, true);
        }
    }

    private RectF mDrawRect = new RectF();

    public void onDraw(Canvas canvas) {
        int width = getWidth();
        int height = getHeight();

        Bitmap toUse = mDirection == Direction.UP ? sBitmapUp : sBitmapDown;

        int bWidth = toUse.getWidth();
        int bHeight = toUse.getHeight();

        float sRatio = 1f * width / height;
        float bRatio = 1f * bWidth / bHeight;

        if (sRatio == bRatio) {
            mDrawRect.set(0, 0, width, height);
        } else if (bRatio < sRatio) {
            float useHeight = height;
            float useWidth = useHeight * bRatio;
            float offset = (width - useWidth) / 2;
            mDrawRect.set(offset, 0, offset + useWidth, useHeight);
        } else {
            float useWidth = width;
            float useHeight = useWidth / bRatio;
            float offset = (height - useHeight) / 2;
            mDrawRect.set(0, offset, useWidth, useHeight + offset);
        }

        if (isPressed()) {
            mBitmapPaint.setAlpha(127);
        } else {
            mBitmapPaint.setAlpha(255);
        }
        canvas.drawBitmap(toUse, null, mDrawRect, mBitmapPaint);
    }
}
