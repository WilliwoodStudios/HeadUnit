package com.williwoodstudios.pureviews.air;

import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.DashPathEffect;
import android.graphics.Paint;
import android.util.Log;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;

import com.williwoodstudios.pureviews.R;
import com.williwoodstudios.pureviews.Theme;
import com.williwoodstudios.pureviews.wedge.WedgeScreen;
import com.williwoodstudios.pureviews.wedge.WedgeSpinnerScreen;

/**
 * Created by robwilliams on 2015-11-09.
 */
public class PressureControl extends ViewGroup {

    private final AirMainScreen mScreen;
    private PressureDisplay mFrontLeft;
    private PressureDisplay mFrontRight;
    private PressureDisplay mBackLeft;
    private PressureDisplay mBackRight;
    private PressureDisplay mTank;

    private ImageView mCarTop;
    private ImageView mRedLines;

    public PressureControl(Context context, AirMainScreen screen) {
        super(context);
        mScreen = screen;
        init();
    }

    private void init() {
        setBackgroundColor(0xff000000);

        mCarTop = new ImageView(getContext());
        mCarTop.setImageResource(R.drawable.cartop);
        addView(mCarTop);

        mRedLines = new ImageView(getContext());
        addView(mRedLines);

        mFrontLeft = createPressureDisplay();
        mFrontRight = createPressureDisplay();
        mBackLeft = createPressureDisplay();
        mBackRight = createPressureDisplay();

        mTank = createPressureDisplay();
        mTank.setTank(true);
    }

    @Override
    public boolean shouldDelayChildPressedState() {
        return false;
    }

    private PressureDisplay createPressureDisplay() {
        PressureDisplay toReturn = new PressureDisplay(getContext());
        addView(toReturn);
        toReturn.setOnClickListener(mOnClickListener);
        return toReturn;
    }

    private OnClickListener mOnClickListener = new OnClickListener() {
        @Override
        public void onClick(final View v) {
            Log.e("PressureControl", "Clicked: " + v);
            WedgeSpinnerScreen spinnerScreen = new WedgeSpinnerScreen(getContext());
            spinnerScreen.setImageResource(R.drawable.suspension);
            spinnerScreen.setWedgeMode(v == mFrontLeft || v == mBackLeft ? WedgeScreen.WedgeMode.FORWARD_SLASH : WedgeScreen.WedgeMode.BACK_SLASH);
            spinnerScreen.setValue(((PressureDisplay)v).getValue());
            spinnerScreen.setOnValueChangedListener(new WedgeSpinnerScreen.OnValueChangeListener() {
                @Override
                public void onValueChange(int oldValue, int newValue) {
                    Log.e("PressureControl","Value changed: " + newValue);
                    ((PressureDisplay)v).setValue(newValue);
                }
            });

            mScreen.pushScreen(spinnerScreen);

        }
    };

    public void setPressures(int [] pressures) {
        if (pressures.length!=5) {
            return;
        }

        mFrontLeft.setValue(pressures[0]);
        mFrontRight.setValue(pressures[1]);
        mBackLeft.setValue(pressures[2]);
        mBackRight.setValue(pressures[3]);
        mTank.setValue(pressures[4]);
    }

    private int mWidth, mHeight;

    @Override
    protected void onLayout(boolean changed, int l, int t, int r, int b) {
        int width = r - l;
        int height = b - t;

        if (width != mWidth || height != mHeight) {

            int h3 = height / 3;
            int h23 = h3 * 2;

            mWidth = width;
            mHeight = height;

            mFrontLeft.layout(0, 0, h3, h3);
            mFrontRight.layout(h23, 0, height, h3);
            mBackLeft.layout(0, h23, h3, height);
            mBackRight.layout(h23, h23, height, height);
            mTank.layout(h3, h3, h23, h23);

            int carMargin = 25;

            mCarTop.layout(carMargin, carMargin, width - carMargin, height - carMargin);

            Bitmap bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888);
            Canvas mCanvas = new Canvas(bitmap);

            Paint lines = new Paint();
            lines.setStyle(Paint.Style.STROKE);
            lines.setStrokeWidth(1);
            lines.setColor(Theme.color);
            lines.setAlpha(255);
            lines.setPathEffect(new DashPathEffect(new float[]{2.5f, 2.5f}, 0));

            mCanvas.drawLine(0, h3, width, h3, lines);
            mCanvas.drawLine(0, h23, width, h23, lines);
            mCanvas.drawLine(h3, 0, h3, height, lines);
            mCanvas.drawLine(h23, 0, h23, height, lines);

            mRedLines.setImageBitmap(bitmap);
            mRedLines.layout(0, 0, width, height);
        }
    }
}
