package com.williwoodstudios.pureviews.air;

import android.content.Context;
import android.util.AttributeSet;

import com.williwoodstudios.pureviews.AppScreen;

/**
 * Created by robwilliams on 2015-11-09.
 */
public class AirMainScreen extends AppScreen {

    private PressureControl mPressureControl;


    public AirMainScreen(Context context) {
        super(context);
        init();
    }

    public AirMainScreen(Context context, AttributeSet attrs) {
        super(context, attrs);
        init();
    }

    public AirMainScreen(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        init();
    }

    private void init() {
        setBackgroundColor(0xff007f00);
        mPressureControl = new PressureControl(getContext(),this);
        addView(mPressureControl);
    }

    @Override
    protected void onLayout(boolean changed, int l, int t, int r, int b) {
        int width = r - l;
        int height = b - t;

        if (width != mWidth || height != mHeight) {
            mWidth = width;
            mHeight = height;

            mPressureControl.layout(width-height,0,width,height);
        }

    }

    private int mWidth, mHeight;
}
