package com.williwoodstudios.pureviews.circle;

import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Canvas;
import android.graphics.Paint;
import android.graphics.RectF;
import android.util.Log;
import android.view.View;
import android.view.ViewGroup;
import android.view.animation.AlphaAnimation;
import android.widget.TextView;

import com.williwoodstudios.pureviews.R;
import com.williwoodstudios.pureviews.Theme;

/**
 * Created by robwilliams on 2015-10-18.
 */
public class CircleButton extends ViewGroup {
    private final Paint mPaint;
    private final Paint mBlack;
    private final Paint mBitmapPaint;

    private static final float twoPI = (float) (2 * Math.PI);
    private final RectF mRect;
    private final RectF mBitmapRect = new RectF();

    //    private final Paint mText;
    private Paint mSelected;

    private Bitmap mBitmap;

    private TextView mLabelTextView;
    private float mBitmapPad = 0.1f;

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

//        mText = new Paint();
//        mText.setAntiAlias(true);
//        mText.setColor(0xffffff);
//        mText.setAlpha(255);
//
        mSelected = new Paint();
        mSelected.setAntiAlias(true);
        mSelected.setColor(Theme.color);
        mSelected.setAlpha(255);
        mSelected.setStyle(Paint.Style.FILL);

        mBitmapPaint = new Paint();
        mBitmapPaint.setAntiAlias(true);
        mBitmapPaint.setFilterBitmap(true);
        mBitmapPaint.setDither(true);

        mRect = new RectF(3, 3, 200, 200);

        setClickable(true);

        mLabelTextView = new TextView(getContext()) {
            @Override
            protected void onAnimationStart() {
                super.onAnimationStart();
                setAlpha(1);
            }
        };
        mLabelTextView.setTextAppearance(getContext(), R.style.mediaButtonFont);
        mLabelTextView.setAlpha(0);
        addView(mLabelTextView);
    }

    public void setNormalColor(int color) {
        mBlack.setColor(color);
        mBlack.setAlpha(color >> 24);
        clearBitmaps();
    }

    public void setPressedColor(int color) {
        mSelected.setColor(color);
        mSelected.setAlpha(color >> 24);
        clearBitmaps();
    }

    //    public void setTitleColor(int color) {
//        mText.setColor(color);
//        mText.setAlpha(color >> 24);
//        clearBitmaps();
//    }
//
    public void setImageResource(int resourceId) {
        if (resourceId != -1) {
            mBitmap = BitmapFactory.decodeResource(getContext().getResources(), resourceId);
        } else if (mBitmap != null) {
            mBitmap.recycle();
            mBitmap = null;
        }
        clearBitmaps();
    }

    public void clearImage() {
        mBitmap = null;
        clearBitmaps();
    }

    public CircleButton(Context context, String title) {
        this(context);

        mTitle = title;
        mLabelTextView.setText(mTitle);
    }

    @Override
    protected void onAnimationEnd() {
        super.onAnimationEnd();
        Log.e("CircleButton", "Animation End");
        AlphaAnimation animation = new AlphaAnimation(0, 1);
        animation.setDuration(250);
        animation.setFillAfter(true);
        mLabelTextView.startAnimation(animation);
    }

    public enum TitlePosition {
        NONE, BELOW, LEFT, RIGHT
    }

    private TitlePosition mTitlePosition = TitlePosition.BELOW;

    public void setTitlePosition(TitlePosition position) {
        if (position != null && position != mTitlePosition) {
            mTitlePosition = position;
            doCalcs(getWidth(), getHeight());
            clearBitmaps();
        }
    }

    public CircleButton(Context context, int resourceId) {
        this(context);

        setImageResource(resourceId);
    }

    private boolean mRedrawBitmaps = false;

    public void clearBitmaps() {
        mRedrawBitmaps = true;
        invalidate();
    }

    private String mTitle;

    @Override
    protected void dispatchDraw(Canvas canvas) {
        Log.e("CircleButton", "Draw");
        if (mRedrawBitmaps || mPressedBitmap == null || mDefaultBitmap == null) {
            generateBitmaps();
        }
        if (mPressedBitmap == null || mDefaultBitmap == null) {
            return;
        }
        if (isPressed()) {
            canvas.drawBitmap(mPressedBitmap, 0, 0, null);
        } else {
            canvas.drawBitmap(mDefaultBitmap, 0, 0, null);
        }
        super.dispatchDraw(canvas);
    }

    private Bitmap mPressedBitmap, mDefaultBitmap;

    private void generateBitmaps() {
        if (getWidth() < 1 || getHeight() < 1) {
            return;
        }

        if (mPressedBitmap == null || mPressedBitmap.getWidth() != getWidth() || mPressedBitmap.getHeight() != getHeight()) {
            mPressedBitmap = Bitmap.createBitmap(getWidth(), getHeight(), Bitmap.Config.ARGB_8888);
            mDefaultBitmap = Bitmap.createBitmap(getWidth(), getHeight(), Bitmap.Config.ARGB_8888);
        } else {
            mPressedBitmap.eraseColor(0x00ffffff);
            mDefaultBitmap.eraseColor(0x00ffffff);
        }

        mRedrawBitmaps = false;

        for (int i = 0; i < 2; ++i) {
            Canvas canvas = new Canvas(i == 0 ? mDefaultBitmap : mPressedBitmap);
            if (i == 0) {
                canvas.drawArc(mRect, 0, 360, true, mBlack);
            } else {
                canvas.drawArc(mRect, 0, 360, true, mSelected);
            }

            canvas.drawArc(mRect, 0, 360, false, mPaint);

            if (mBitmap != null) {
                canvas.drawBitmap(mBitmap, null, mBitmapRect, mBitmapPaint);
            }
        }
    }

    private boolean mIsActive = false;

    @Override
    public void setPressed(boolean pressed) {
        super.setPressed(pressed);
        invalidate();
    }

    protected void doCalcs(int width, int height) {
        if (width == 0 || height == 0) {
            return;
        }
        if (mTitlePosition == TitlePosition.NONE) {
            int toUse = width < height ? width : height;
            mRect.set(1, 1, toUse - 1, toUse - 1);
        } else if (mTitlePosition == TitlePosition.RIGHT) {
            mRect.set(1, 1, height - 1, height - 1);
            mLabelTextView.setTextSize(0.25f * height);
        } else if (mTitlePosition == TitlePosition.LEFT) {
            mRect.set(width - height - 1, 1, width - 1, height - 1);
            mLabelTextView.setTextSize(0.25f * height);
        } else if (mTitlePosition == TitlePosition.BELOW) {
            mRect.set(1, 1, width - 1, width - 1);
            mLabelTextView.setTextSize(0.125f * height);
        }

        float bitmapPad = mRect.width() * mBitmapPad;

        mBitmapRect.set(mRect.left + bitmapPad, mRect.top + bitmapPad, mRect.right - bitmapPad, mRect.bottom - bitmapPad);
    }

    public void setBitmapPad(float paddingFraction) {
        mBitmapPad = paddingFraction;
    }

    private int mWidth, mHeight;

    @Override
    protected void onLayout(boolean changed, int left, int top, int right, int bottom) {
        int width = right - left;
        int height = bottom - top;
        if (width != mWidth || height != mHeight) {
            mWidth = width;
            mHeight = height;
            doCalcs(right - left, bottom - top);

            if (mTitle != null && mTitlePosition != TitlePosition.NONE) {
                if (mTitlePosition == TitlePosition.BELOW) {
//                    canvas.drawText(mTitle, (mRect.right - mRect.left) / 2, mRect.right + mText.getTextSize() * 1.125f, mText);
                    int textPad = 10;
                    mLabelTextView.measure(0, 0);
                    mLabelTextView.layout((width - mLabelTextView.getMeasuredWidth()) / 2, width + textPad, width, height);

                    Log.e("CircleButton",0 + " " + (width+textPad) + " " + width + " " + height);

                    Log.e("CircleButton",mLabelTextView.getMeasuredHeight() + " " + mLabelTextView.getMeasuredWidth());

                } else if (mTitlePosition == TitlePosition.RIGHT) {
                    int textPad = 10;

                    mLabelTextView.measure(0, 0);
                    mLabelTextView.layout(height + textPad, (height - mLabelTextView.getMeasuredHeight()) / 2, width, height);
                } else if (mTitlePosition == TitlePosition.LEFT) {
                    int textPad = 10;

                    mLabelTextView.measure(0, 0);
                    mLabelTextView.layout(width - height - textPad - mLabelTextView.getMeasuredWidth(), (height - mLabelTextView.getMeasuredHeight()) / 2, width - height, height);
                }
            }
            clearBitmaps();
        }
    }
}
