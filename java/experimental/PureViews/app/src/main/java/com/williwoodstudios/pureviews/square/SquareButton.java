package com.williwoodstudios.pureviews.square;

import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Canvas;
import android.graphics.ColorMatrix;
import android.graphics.ColorMatrixColorFilter;
import android.graphics.Paint;
import android.graphics.RectF;
import android.graphics.drawable.BitmapDrawable;
import android.graphics.drawable.Drawable;
import android.util.Log;
import android.view.ViewGroup;
import android.view.animation.AlphaAnimation;

import com.williwoodstudios.pureviews.R;
import com.williwoodstudios.pureviews.Theme;

/**
 * Created by brcewane on 2018-04-29.
 */

public class SquareButton extends ViewGroup {
    private static final String TAG = SquareButton.class.getName();
    private static int sCreationCount = 0;
    private final Paint mBackgroundPaint;
    private final Paint mBitmapPaint;
    private final RectF mRect;
    private final RectF mBitmapRect = new RectF();
    private Bitmap mBitmap;
    private int mResourceIndex = 0;
    private float mBitmapPad = 0.1f;
    private boolean mIsActive = false;
    private int mWidth, mHeight;
    private ViewGroup mButtonGroup;

    public SquareButton(Context context) {
        super(context);

        ++sCreationCount;
        Log.d(TAG, "Created new square button " + sCreationCount);

        mBackgroundPaint = new Paint();
        mBackgroundPaint.setAntiAlias(true);
        mBackgroundPaint.setStyle(Paint.Style.FILL);
        mBackgroundPaint.setColor(0x000000);
        mBackgroundPaint.setAlpha(255);

        mBitmapPaint = new Paint();
        mBitmapPaint.setAntiAlias(true);
        mBitmapPaint.setFilterBitmap(true);
        mBitmapPaint.setDither(true);

        mRect = new RectF(3, 3, 200, 200);

        setClickable(true);
    }

    public SquareButton(Context context, int resourceIndex,ViewGroup buttonGroup) {
        this(context);
        mButtonGroup = buttonGroup;
        setResourceIndex(resourceIndex);
    }


    public void setImageResource(int resourceId) {
        if (resourceId != -1) {
            mBitmap = BitmapFactory.decodeResource(getContext().getResources(), resourceId);
        } else if (mBitmap != null) {
            mBitmap.recycle();
            mBitmap = null;
        }
        invalidate();
    }

    public void setChecked(Boolean checked) {
        if (checked == true) {
            this.setImageResource(R.drawable.navigation_home);
        } else {
            this.setImageResource(-1);
        }
    }

    public int getResourceIndex() {
        return mResourceIndex;
    }

    public ViewGroup getButtonGroup() {return mButtonGroup;}

    public void setResourceIndex(int index) {
        mResourceIndex = index;
        mBackgroundPaint.setColor(Theme.colors[index]);
    }

    public void clearImage() {
        if (mBitmap != null) {
            mBitmap.recycle();
            mBitmap = null;
        }
        invalidate();
    }

    @Override
    protected void onAnimationEnd() {
        super.onAnimationEnd();
        AlphaAnimation animation = new AlphaAnimation(0, 1);
        animation.setDuration(250);
        animation.setFillAfter(true);
    }


    @Override
    protected void dispatchDraw(Canvas canvas) {
        super.dispatchDraw(canvas);
        canvas.drawRect(mRect,mBackgroundPaint);

        if (mBitmap != null) {
            canvas.drawBitmap(mBitmap, null, mBitmapRect, mBitmapPaint);
        }

    }

    @Override
    public void setPressed(boolean pressed) {
        super.setPressed(pressed);
        invalidate();
    }

    protected void doCalcs(int width, int height) {
        if (width == 0 || height == 0) {
            return;
        }
        int toUse = width < height ? width : height;
        mRect.set(1, 1, toUse - 1, toUse - 1);
        float bitmapPad = mRect.width() * mBitmapPad;
        mBitmapRect.set(mRect.left + bitmapPad, mRect.top + bitmapPad, mRect.right - bitmapPad, mRect.bottom - bitmapPad);
    }

    public void setBitmapPad(float paddingFraction) {
        mBitmapPad = paddingFraction;
    }

    @Override
    protected void onLayout(boolean changed, int left, int top, int right, int bottom) {
        int width = right - left;
        int height = bottom - top;
        if (width != mWidth || height != mHeight) {
            mWidth = width;
            mHeight = height;
            doCalcs(right - left, bottom - top);
        }
    }


}
