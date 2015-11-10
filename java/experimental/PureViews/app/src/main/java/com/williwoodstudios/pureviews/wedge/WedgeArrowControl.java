package com.williwoodstudios.pureviews.wedge;

import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Canvas;
import android.graphics.Paint;
import android.util.AttributeSet;
import android.view.View;

import com.williwoodstudios.pureviews.R;

/**
 * Created by robwilliams on 2015-11-09.
 */
public class WedgeArrowControl extends View {

    private Paint mBitmapPaint;

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
    }

    private void init() {
        setClickable(true);
        mBitmap = getBitmap(getContext());
        mBitmapPaint = new Paint();
        mBitmapPaint.setAlpha(255);
    }

    private static Bitmap sBitmap;
    private Bitmap mBitmap;

    private static Bitmap getBitmap(Context context) {
        if (sBitmap == null) {
            sBitmap = BitmapFactory.decodeResource(context.getResources(), R.drawable.wedge_spinner_arrow);
        }
        return sBitmap;
    }

    public void onDraw(Canvas canvas) {
        if (isPressed()) {
            mBitmapPaint.setAlpha(127);
        } else {
            mBitmapPaint.setAlpha(255);
        }
        canvas.drawBitmap(mBitmap,0,0,mBitmapPaint);
    }
}
