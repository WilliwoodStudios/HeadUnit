package com.williwoodstudios.pureviews.circle;

import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Canvas;
import android.graphics.Paint;
import android.graphics.RectF;
import android.graphics.drawable.Drawable;
import android.graphics.drawable.BitmapDrawable;
import android.graphics.ColorMatrix;
import android.graphics.ColorMatrixColorFilter;
import android.util.Log;
import android.view.ViewGroup;
import android.view.animation.AlphaAnimation;
import com.williwoodstudios.pureviews.AppScreen;

import com.williwoodstudios.pureviews.Theme;
import com.williwoodstudios.pureviews.ThemeListener;

/**
 * Created by robwilliams on 2015-10-18.
 */
public class CircleButton extends ViewGroup implements ThemeListener {
    private static final String TAG = CircleButton.class.getName();
    private static int sCreationCount = 0;
    private final Paint mBorderPaint;
    private final Paint mBlackPaint;
    private final Paint mBitmapPaint;
    private final Paint mTitlePaint;
    private final RectF mRect;
    private final RectF mBitmapRect = new RectF();
    private final RectF mTitleRect = new RectF();
    private CircleMenu mCircleMenu;
    //    private final Paint mText;
    private Paint mPressedPaint;
    private Bitmap mBitmap;
    private String mPackageName;
    private float mBitmapPad = 0.1f;
    private float mTitleWidth = 0;
    private TitlePosition mTitlePosition = TitlePosition.BELOW;
    private String mTitle;
    private String mTitleToShow;
    private boolean mMaintainsState = false;
    private boolean mSelectedState = false;
    private int mWidth, mHeight;
    private int mIndex = -1;

    public CircleButton(Context context) {
        super(context);
        mTitle = "";

        ++sCreationCount;
        Log.d(TAG, "Created new circle button " + sCreationCount);

        mBlackPaint = new Paint();
        mBlackPaint.setAntiAlias(true);
        mBlackPaint.setStyle(Paint.Style.FILL);
        mBlackPaint.setColor(0x000000);
        mBlackPaint.setAlpha(255);

        mBorderPaint = new Paint();
        mBorderPaint.setAntiAlias(true);
        mBorderPaint.setStrokeWidth(2);
        mBorderPaint.setStyle(Paint.Style.STROKE);
        mBorderPaint.setColor(0xffffff);
        mBorderPaint.setAlpha(255);

        mPressedPaint = new Paint();
        mPressedPaint.setAntiAlias(true);
        mPressedPaint.setColor(Theme.getColor());
        mPressedPaint.setAlpha(255);
        mPressedPaint.setStyle(Paint.Style.FILL);

        mBitmapPaint = new Paint();
        mBitmapPaint.setAntiAlias(true);
        mBitmapPaint.setFilterBitmap(true);
        mBitmapPaint.setDither(true);

        mTitlePaint = new Paint();
        mTitlePaint.setAntiAlias(true);
        mTitlePaint.setStrokeWidth(1);
        mTitlePaint.setColor(0xffffff);
        mTitlePaint.setAlpha(255);
        mTitlePaint.setStyle(Paint.Style.FILL_AND_STROKE);

        mRect = new RectF(3, 3, 200, 200);

        setClickable(true);
        setLongClickable(true);
    }

    public void themeUpdated() {
        mPressedPaint.setColor(Theme.getColor());
    }

    /**
     * These prefixes will be stripped from title names.
     */
    static String sToStrip[] = { "google ", "samsung " };

    public CircleButton(Context context, String title) {
        this(context);
        mTitle = title;

        String lower = title.toLowerCase();

        for (String s : sToStrip) {
            if (lower.startsWith(s)) {
                mTitle = mTitle.substring(s.length());
            }
        }

        mTitleToShow = mTitle;
    }

    public CircleButton(Context context, int resourceId) {
        this(context);

        setImageResource(resourceId);
    }

    public boolean getSelectedState() {
        return mSelectedState;
    }

    public void setSelectedState(boolean value) {
        mSelectedState = value;
        invalidate();
    }

    public void setmCircleMenu(CircleMenu value){
        mCircleMenu = value;
    }

    public CircleMenu getmCircleMenu() {return mCircleMenu;}

    public boolean getMaintainsState() {
        return mMaintainsState;
    }

    public void setMaintainsState(boolean value) {
        mMaintainsState = value;
    }

    public void setIndex(int value) {
        mIndex = value;
    }

    public int getIndex(){
        return mIndex;
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

    public String getPackageName() {
        return mPackageName;
    }

    public void setPackageName(String packageName) {
        mPackageName = packageName;
    }

    public void setAppIcon(Drawable appIcon) {
        if (appIcon != null) {
            // We are going to grayscale the Bitmap
            // TODO: This crashes on Android O.
            Bitmap bmpOriginal = ((BitmapDrawable) appIcon).getBitmap();
            int width, height;
            height = bmpOriginal.getHeight();
            width = bmpOriginal.getWidth();
            Bitmap bmpGrayscale = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888);
            Canvas c = new Canvas(bmpGrayscale);
            Paint paint = new Paint();
            ColorMatrix cm = new ColorMatrix();
            cm.setSaturation(0);
            ColorMatrixColorFilter f = new ColorMatrixColorFilter(cm);
            paint.setColorFilter(f);
            c.drawBitmap(bmpOriginal, 0, 0, paint);
            mBitmap = bmpGrayscale;
        } else {
            clearImage();
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
//        Log.e("CircleButton", "Animation End");
        AlphaAnimation animation = new AlphaAnimation(0, 1);
        animation.setDuration(250);
        animation.setFillAfter(true);
    }

    public void setTitlePosition(TitlePosition position) {
        if (position != null && position != mTitlePosition) {
            mTitlePosition = position;
            doCalcs(getWidth(), getHeight());
        }
    }

    @Override
    protected void dispatchDraw(Canvas canvas) {
        super.dispatchDraw(canvas);
        Paint highlightPaint = mBlackPaint;
        // Determine if we are supposed to be drawing the menu in a highlighted state
        if (isPressed()) {
            highlightPaint = mPressedPaint;
        } else if (mMaintainsState && getSelectedState()) {
            highlightPaint = mPressedPaint;
        } else {
            highlightPaint = mBlackPaint;
        }
        // Draw our circles
        canvas.drawArc(mRect, 0, 360, true, highlightPaint);
        canvas.drawArc(mRect, 0, 360, false, mBorderPaint);
        // Draw the Icon
        if (mBitmap != null) {
            canvas.drawBitmap(mBitmap, null, mBitmapRect, mBitmapPaint);
        }
        // Draw the title
        if (mTitle != null) {
            float left = mTitleRect.width() / 2 - mTitleWidth / 2 + mTitleRect.left;
            canvas.drawText(mTitleToShow, left, mTitleRect.bottom - mTitleRect.height() / 4, mTitlePaint);
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

        float size = Theme.CIRCLE_BUTTON_TEXT_SIZE;

        if (mTitlePosition == TitlePosition.NONE) {
            int toUse = width < height ? width : height;
            mRect.set(1, 1, toUse - 1, toUse - 1);
        } else if (mTitlePosition == TitlePosition.RIGHT) {
            mRect.set(1, 1, height - 1, height - 1);
        } else if (mTitlePosition == TitlePosition.LEFT) {
            mRect.set(width - height - 1, 1, width - 1, height - 1);
        } else if (mTitlePosition == TitlePosition.BELOW) {
            mRect.set(1, 1, width - 1, width - 1);
        }

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
                mTitleWidth = mTitlePaint.measureText(mTitleToShow);
                if (mTitleWidth <= width) {
                    break;
                }
                ++crop;
            } while(mTitleToShow.length()>2);
        }

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

            if (mTitle != null && mTitlePosition != TitlePosition.NONE) {
                if (mTitlePosition == TitlePosition.BELOW) {
                    int textPad = 10;
                    mTitleRect.set(0, width + textPad, width, height);
                } else {
                    mTitleRect.set(0, 0, width, height);
                }
            }
        }
    }

    public enum TitlePosition {
        NONE, BELOW, LEFT, RIGHT
    }
}
