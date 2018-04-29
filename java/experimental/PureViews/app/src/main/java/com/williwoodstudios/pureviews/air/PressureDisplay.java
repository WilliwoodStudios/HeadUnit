package com.williwoodstudios.pureviews.air;

import android.content.Context;
import android.graphics.Canvas;
import android.graphics.Paint;
import android.graphics.Rect;
import android.util.AttributeSet;
import android.util.Log;
import android.view.View;

import com.williwoodstudios.pureviews.Theme;

/**
 * Created by robwilliams on 2015-11-09.
 */
public class PressureDisplay extends View {
    private int mHeight;
    private int mWidth;

    private boolean mTank = false;

    private Paint mTopPaint, mBottomPaint;

    public PressureDisplay(Context context) {
        super(context);
        init();
    }

    public PressureDisplay(Context context, AttributeSet attrs) {
        super(context, attrs);
        init();
    }

    public PressureDisplay(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        init();
    }

    public void setValue(int value) {
        if (value != mValue) {
            mValue = value;
            mValueString = String.valueOf(value);
            invalidate();
        }
    }

    public int getValue() {
        return mValue;
    }

    private int mValue = 0;
    private String mValueString = "0";

    private void init() {
        mTopPaint = new Paint();
        mTopPaint.setTextAlign(Paint.Align.CENTER);

        mBottomPaint = new Paint();
        mBottomPaint.setTextAlign(Paint.Align.CENTER);

        mTank = false;
        setClickable(true);
    }

    private Rect mBounds = new Rect();

    @Override
    public void setPressed(boolean pressed) {
        Log.e("PressureDisplay", "Pressed: " + pressed);
        super.setPressed(pressed);
        invalidate();
    }

    @Override
    protected void onDraw(Canvas canvas) {
        super.onDraw(canvas);

        checkColor();

        int width = getWidth();
        int height = getHeight();

        mTopPaint.setTextSize(height / (mTank ? 8f : 2.5f));
        mBottomPaint.setTextSize(height / (mTank ? 15f : 8f));

        int textPad = 5;
        int tankPad = 5 + (int)(-mTopPaint.getTextSize() / 5);

        float textHeight;

        if (mTank) {
            textHeight = (-mTopPaint.ascent()) * 2 + textPad + tankPad + (-mBottomPaint.ascent());
        } else {
            textHeight = -mTopPaint.ascent() + textPad + (-mBottomPaint.ascent());
        }

        float start = (height - textHeight) / 2;
        if (mTank) {
            start = 4 * height / 9;
        }
        start += -mTopPaint.ascent();

        if (mTank) {
            canvas.drawText("TANK",width/2,start, mTopPaint);
            start += tankPad;
            start += -mTopPaint.ascent();
        }

        canvas.drawText(mValueString, width / 2, start, mTopPaint);
//        canvas.drawLine(0, start, width, start, mTopPaint);
//        canvas.drawLine(0, start + mTopPaint.ascent(),width,start+mTopPaint.ascent(),mTopPaint);

        start += textPad;
        start += -mBottomPaint.ascent();

        canvas.drawText("PSI", width / 2, start, mBottomPaint);
//        canvas.drawLine(0,start,width,start,mBottomPaint);
//        canvas.drawLine(0,start+mBottomPaint.ascent(),width,start+mBottomPaint.ascent(),mBottomPaint);

//
//        mPressure.layout(0, 0, width, height / 2);
//        mPressure.setTextSize(height / (mTank ? 4f : 2f));
//
//        mPSI.layout(0, height / 2, width, height);
//        mPSI.setTextSize(height / 8f);
//
//        mPressure.measure(0, 0);
//        mPSI.measure(0, 0);
//
//        Log.e("PressureDisplay",mPressure.getMeasuredHeight() + " " + mPressure.getTextSize());
//
//        int pL = (mWidth - mPressure.getMeasuredWidth())/2;
//        int pR = pL + mPressure.getMeasuredWidth();
//
//        int h = (int)(mPressure.getTextSize() + textPad + mPSI.getTextSize());
//
//        int pT = (mWidth - h) / 2;
////        if (mTank) {
////            pT += mWidth / 8;
////        }
//        int pB = (int)(pT + mPressure.getTextSize() + textPad);
//
//        mPressure.layout(pL,pT,pR,pB);
//
//        pL = (mWidth - mPSI.getMeasuredWidth())/2;
//        pR = pL + mPSI.getMeasuredWidth();
//
//        pT = pB;
//        pB = pT + mPSI.getMeasuredHeight();
//
//        mPSI.layout(pL,pT,pR,pB);
//
    }

//    private TextView createTextView() {
//        TextView toReturn = new TextView(getContext());
//        toReturn.setTextAppearance(getContext(), R.style.mediaButtonFont);
//        toReturn.setTextColor(Theme.color);
//        toReturn.setGravity(Gravity.CENTER);
//        addView(toReturn);
//        return toReturn;
//    }

    protected void checkColor() {
        int color;
        int alpha = 255;
        if (!mTank && !isPressed()) {
            //color = Theme.color; // TODO need to update this
            color = 0xffffff;
        } else {
            color = 0xffffff;
        }
//        if (isPressed()) {
//            alpha = 127;
//        } else {
//            alpha = 255;
//        }
        mTopPaint.setColor(color);
        mTopPaint.setAlpha(alpha);
        mBottomPaint.setColor(color);
        mBottomPaint.setAlpha(alpha);
    }

    public void setTank(boolean isTank) {
        if (mTank != isTank) {
            mTank = isTank;
            setClickable(!mTank);
        }
    }
}
