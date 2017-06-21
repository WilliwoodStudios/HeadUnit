package com.williwoodstudios.pureviews.wedge;

import android.content.Context;
import android.graphics.Canvas;
import android.graphics.Paint;
import android.util.AttributeSet;
import android.view.View;

/**
 * Created by robwilliams on 2015-11-10.
 */
public class WedgeValueView extends View {

    private Paint mTextPaint;

    public WedgeValueView(Context context) {
        super(context);
        init();
    }

    public WedgeValueView(Context context, AttributeSet attrs) {
        super(context, attrs);
        init();
    }

    public WedgeValueView(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        init();
    }

    private void init() {
        mTextPaint = new Paint();
        mTextPaint.setColor(0xffffffff);
        mTextPaint.setAlpha(255);
    }

    private int mHeight;

    private int mValue = -1;
    private char [] mValueChars = new char[60];
    private int mValueLength = 0;

    public void onDraw(Canvas canvas) {
        if (mHeight != getHeight()) {
            mHeight = getHeight();
            mTextPaint.setTextSize(mHeight / 2.5f);
        }

        float width = mTextPaint.measureText(mValueChars,0,mValueLength);
        canvas.drawText(mValueChars,0,mValueLength,(getWidth()-width)/2,(mHeight+mTextPaint.getTextSize())/2,mTextPaint);
    }

    public void setValue(int value) {
        if (value != mValue) {
            mValue = value;

            int count = 0;
            while(value != 0) {
                ++count;
                value /= 10;
            }

            if (count < 1) {
                count = 1;
            }

            value = mValue;

            mValueLength = count;
            for (int i=count-1; i>=0; --i) {
                mValueChars[i] = (char)('0' + (value % 10));
                value /= 10;
            }

            invalidate();
        }
    }
}
