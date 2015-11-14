package com.williwoodstudios.pureviews.controls;

import android.content.Context;
import android.graphics.Canvas;
import android.graphics.Paint;
import android.graphics.RectF;
import android.graphics.Typeface;
import android.view.View;

import com.williwoodstudios.pureviews.Theme;

/**
 * Created by robwilliams on 2015-11-14.
 */
public class RoundedRectButton extends View {
    private final Paint mBodyPaint;
    private final Paint mBorderPaint;
    private final RectF mBodyRect;
    private final RectF mBorderRect;
    private final Paint mTextPaint;
    private Paint.FontMetrics mFontMetrics;

    public RoundedRectButton(Context context) {
        super(context);

        setClickable(true);

        mBodyPaint = new Paint();
        mBodyPaint.setStyle(Paint.Style.FILL);
        mBodyPaint.setColor(Theme.color);
        mBodyPaint.setAlpha(255);
        mBodyPaint.setAntiAlias(true);

        mBorderPaint = new Paint();
        mBorderPaint.setStyle(Paint.Style.STROKE);
        mBorderPaint.setColor(0xffffffff);
        mBorderPaint.setAlpha(255);
        mBorderPaint.setStrokeWidth(2);
        mBorderPaint.setAntiAlias(true);

        mTextPaint = new Paint();
        mTextPaint.setStyle(Paint.Style.STROKE);
        mTextPaint.setColor(0xffffffff);
        mTextPaint.setAlpha(255);
        mTextPaint.setTypeface(Typeface.create(Typeface.SANS_SERIF,Typeface.BOLD));

        mBodyRect = new RectF();
        mBorderRect = new RectF();
    }

    @Override
    public void setPressed(boolean pressed) {
        super.setPressed(pressed);
        if (pressed) {
            setAlpha(0.7f);
        } else {
            setAlpha(1f);
        }
    }

    private String mText = "";

    public void setText(String text) {
        mText = text;
        mTextWidth = -1;
        invalidate();
    }

    private float mTextWidth = -1;

    @Override
    public void onDraw(Canvas canvas) {
        if (mTextWidth == -1) {
            mBodyRect.set(1,1,getWidth()-1,getHeight()-1);
            mBorderRect.set(1,1,getWidth()-1,getHeight()-1);

            mTextPaint.setTextSize(getHeight() * .5f);

            mTextWidth = mTextPaint.measureText(mText);

            mFontMetrics = mTextPaint.getFontMetrics();
        }

        int roundness = 8;

        canvas.drawRoundRect(mBodyRect,roundness,roundness,mBodyPaint);
        canvas.drawRoundRect(mBorderRect,roundness,roundness,mBorderPaint);

        canvas.drawText(mText,(getWidth()-mTextWidth)/2,(getHeight()-mFontMetrics.ascent)/2,mTextPaint);
    }

    @Override
    protected void onLayout(boolean changed, int left, int top, int right, int bottom) {
        super.onLayout(changed, left, top, right, bottom);
        mTextWidth = -1;
        invalidate();
    }
}
