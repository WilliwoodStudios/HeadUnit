package com.williwoodstudios.pureviews;

import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Canvas;
import android.graphics.Paint;
import android.graphics.RectF;
import android.view.MotionEvent;
import android.view.View;

/**
 * Created by robwilliams on 2015-10-18.
 */
public class CircleButton extends View {
    private final Paint mPaint;
    private final Paint mBlack;
    private final Paint mBitmapPaint;

    private static final float twoPI = (float) (2 * Math.PI);
    private final RectF mRect;
    private final RectF mBitmapRect = new RectF();
    private final Paint mText;
    private Paint mSelected;

    private boolean mTextShow = false;
    private Bitmap mBitmap;
    private boolean mEverDrawn;
    private boolean mTransparent = false;

    public CircleButton(Context context) {
        super(context);


//        setBackgroundColor(0xffff0000);
        mBlack = new Paint();
        mBlack.setAntiAlias(true);
        mBlack.setStyle(Paint.Style.FILL);
        mBlack.setColor(0x000000);
        mBlack.setAlpha(255);

        mPaint = new Paint();
        mPaint.setAntiAlias(true);
        mPaint.setStrokeWidth(2);
        mPaint.setStyle(Paint.Style.STROKE);
        mPaint.setColor(0xffffff);
        mPaint.setAlpha(255);

        mText = new Paint();
        mText.setAntiAlias(true);
        mText.setTextAlign(Paint.Align.CENTER);
        mText.setColor(0xffffff);
        mText.setAlpha(255);

        mSelected = new Paint();
        mSelected.setAntiAlias(true);
        mSelected.setColor(Theme.color);
        mSelected.setAlpha(255);
        mSelected.setStyle(Paint.Style.FILL);

        mBitmapPaint = new Paint();
        mBitmapPaint.setAntiAlias(true);

        mRect = new RectF(3, 3, 200, 200);
    }

    public void setImageResource(int resourceId) {
        mBitmap = BitmapFactory.decodeResource(getContext().getResources(), resourceId);
        if (mEverDrawn) {
            invalidate();
        }
    }

    public void clearImage() {
        mBitmap = null;
        invalidate();
    }

    public CircleButton(Context context, String title) {
        this(context);

        mTitle = title;
        mTextShow = true;
    }

    public CircleButton(Context context, int resourceId) {
        this(context);

        setImageResource(resourceId);
    }

    private String mTitle;

    /**
     * Controls if the CircleButton has a solid (black) background.
     * @param transparent
     */
    public void setTransparent(boolean transparent) {
        if (mTransparent != transparent) {
            mTransparent = transparent;
            if (mEverDrawn) {
                invalidate();
            }
        }
    }

    @Override
    protected void onDraw(Canvas canvas) {
        if (mIsActive) {
            canvas.drawArc(mRect, 0, 360, true, mSelected);
        } else if (!mTransparent) {
            canvas.drawArc(mRect, 0, 360, true, mBlack);
        }
        canvas.drawArc(mRect, 0, 360, false, mPaint);
        if (mTitle != null && mTextShow) {
            canvas.drawText(mTitle, (mRect.right - mRect.left) / 2, mRect.right + mText.getTextSize() * 1.125f, mText);
        }

        if (mBitmap != null) {
            canvas.drawBitmap(mBitmap, null, mBitmapRect, mBitmapPaint);
        }

        mEverDrawn = true;
    }

    private boolean mIsActive = false;

    @Override
    public boolean onTouchEvent(MotionEvent event) {
        boolean active = mIsActive;
        int action = event.getActionMasked();
        if (action == MotionEvent.ACTION_DOWN) {
            active = true;
        } else if (action == MotionEvent.ACTION_POINTER_DOWN || action == MotionEvent.ACTION_CANCEL || action == MotionEvent.ACTION_UP || action == MotionEvent.ACTION_OUTSIDE) {
            active = false;
        }

        if (active != mIsActive) {
            mIsActive = active;
            invalidate();
            if (mIsActive==false) {
                performClick();
            }
        }
        return true;
    }

    @Override
    protected void onLayout(boolean changed, int left, int top, int right, int bottom) {
        super.onLayout(changed, left, top, right, bottom);
        int width = right - left;

        mText.setTextSize(0.125f * width);
        mRect.set(1, 1, width - 1, width - 1);

        float bitmapL = width * 0.2f;
        float bitmapR = width - bitmapL;

        mBitmapRect.set(bitmapL, bitmapL, bitmapR, bitmapR);
    }
}
