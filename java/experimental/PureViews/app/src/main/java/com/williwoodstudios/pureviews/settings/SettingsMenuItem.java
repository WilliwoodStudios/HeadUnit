package com.williwoodstudios.pureviews.settings;

import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.ColorMatrix;
import android.graphics.ColorMatrixColorFilter;
import android.graphics.Paint;
import android.graphics.RectF;
import android.graphics.drawable.BitmapDrawable;
import android.graphics.drawable.Drawable;
import android.util.Log;
import android.view.ViewGroup;
import android.view.animation.AlphaAnimation;

import com.williwoodstudios.pureviews.Theme;

/**
 * Created by brcewane on 2018-06-09.
 */

public class SettingsMenuItem extends ViewGroup {
    private final Paint mBorderPaint;
    private final Paint mBlackPaint;
    private final Paint mBitmapPaint;
    private final Paint mTitlePaint;
    private final RectF mRect;
    private final RectF mBitmapRect = new RectF();
    private final RectF mTitleRect = new RectF();
    private Paint mPressedPaint;
    private Bitmap mBitmap;
    private String mTitle;
    private String mTitleToShow;
    private int mWidth, mHeight;
    private int mTextSize;


    public SettingsMenuItem(Context context, String title, int resourceId) {
        super(context);
        mTitle = title;
        mTitleToShow = mTitle;
        setImageResource(resourceId);
        // Background fill
        mBlackPaint = new Paint();
        mBlackPaint.setAntiAlias(true);
        mBlackPaint.setStyle(Paint.Style.FILL);
        mBlackPaint.setColor(0x000000);
        mBlackPaint.setAlpha(255);
        // Border
        mBorderPaint = new Paint();
        mBorderPaint.setAntiAlias(true);
        mBorderPaint.setStrokeWidth(2);
        mBorderPaint.setStyle(Paint.Style.STROKE);
        mBorderPaint.setColor(0xffffff);
        mBorderPaint.setAlpha(255);
        // Pressed state
        mPressedPaint = new Paint();
        mPressedPaint.setAntiAlias(true);
        mPressedPaint.setColor(Theme.getColor());
        mPressedPaint.setAlpha(255);
        mPressedPaint.setStyle(Paint.Style.FILL);
        // Menu item image
        mBitmapPaint = new Paint();
        mBitmapPaint.setAntiAlias(true);
        mBitmapPaint.setFilterBitmap(true);
        mBitmapPaint.setDither(true);
        // Menu text
        mTitlePaint = new Paint();
        mTitlePaint.setAntiAlias(true);
        mTitlePaint.setStrokeWidth(1);
        mTitlePaint.setColor(0xffffff);
        mTitlePaint.setAlpha(255);
        mTitlePaint.setStyle(Paint.Style.FILL_AND_STROKE);

        mRect = new RectF(3, 3, 200, 200);

        setClickable(true);
    }

    public void themeUpdated() {
        mPressedPaint.setColor(Theme.getColor());
    }

    public void setNormalColor(int color) {
        mBlackPaint.setColor(color);
        mBlackPaint.setAlpha(color >> 24);
    }

    public void setPressedColor(int color) {
        mPressedPaint.setColor(color);
        mPressedPaint.setAlpha(color >> 24);
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
        Paint highlightPaint = isPressed() ? mPressedPaint : mBlackPaint;
        // Draw our Highlight and line
        canvas.drawRect(mRect, highlightPaint);
        canvas.drawLine(mRect.left, mRect.bottom, mRect.right, mRect.bottom, mBorderPaint);
        // Draw the Icon
        if (mBitmap != null) {
            canvas.drawBitmap(mBitmap, null, mBitmapRect, mBitmapPaint);
        }
        // Draw the title
        if (mTitle != null) {
            canvas.drawText(mTitleToShow, mTitleRect.left, mTitleRect.top, mTitlePaint);
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
        float titleWidth = 0;
        mTextSize = height/3;
        float size = mTextSize;
        mRect.set(1, 1, width - 1, height - 1);
        // Figure out our text
        mTitlePaint.setTextSize(size);
        if (size != 0) {
            mTitleToShow = mTitle;
            int crop = 0;
            do {
                mTitleToShow = mTitle.substring(0,mTitle.length()-crop);
                mTitleToShow = mTitleToShow.replaceAll(" $","");
                if (crop>0) {
                    mTitleToShow += "..";
                }
                titleWidth = mTitlePaint.measureText(mTitleToShow);
                if (titleWidth <= width) {
                    break;
                }
                ++crop;
            } while(mTitleToShow.length()>2);
        }

        float bitmapPad = 10;
        mBitmapRect.set(mRect.left + bitmapPad, mRect.top + bitmapPad, height - (2*bitmapPad), height - (2*bitmapPad));
    }


    @Override
    protected void onLayout(boolean changed, int left, int top, int right, int bottom) {
        int width = right - left;
        int height = bottom - top;
        if (width != mWidth || height != mHeight) {
            mWidth = width;
            mHeight = height;
            doCalcs(right - left, bottom - top);

            int textPad = 10;
            mTitleRect.set(height, height/2 + mTextSize/2, width, height);
        }
    }

}
