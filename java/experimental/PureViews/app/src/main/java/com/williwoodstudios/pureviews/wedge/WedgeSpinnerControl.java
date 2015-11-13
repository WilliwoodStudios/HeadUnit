package com.williwoodstudios.pureviews.wedge;

import android.content.Context;
import android.util.AttributeSet;
import android.view.View;
import android.view.ViewGroup;

/**
 * Created by robwilliams on 2015-11-09.
 */
public class WedgeSpinnerControl extends ViewGroup {

    private WedgeArrowControl mUpArrow;
    private WedgeArrowControl mDownArrow;
    private WedgeValueView mValueView;
    private WedgeSpinnerScreen mOwner;

    public WedgeSpinnerControl(Context context, WedgeSpinnerScreen owner) {
        super(context);
        mOwner = owner;
        init();
    }

    public WedgeSpinnerControl(Context context, AttributeSet attrs) {
        super(context, attrs);
        init();
    }

    public WedgeSpinnerControl(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        init();
    }

    private int mWidth, mHeight;
    private int mValue;

    @Override
    protected void onLayout(boolean changed, int l, int t, int r, int b) {
        int width = r - l;
        int height = b - t;
        if (width != mWidth || height != mHeight) {
            mWidth = width;
            mHeight = height;

            int height4 = height / 4;
            int height34 = 3 * height / 4;

            mUpArrow.layout(0, 0, width, height4);
            mDownArrow.layout(0, height34, width, height);

            mValueView.layout(0, height4, width, height34);
        }
    }

    public void setValue(int value) {
        if (value != mValue) {
            if (value < mMin) {
                value = mMin;
            }
            if (value > mMax) {
                value = mMax;
            }
            mValue = value;
            mValueView.setValue(value);
        }
    }

    public int getValue() {
        return mValue;
    }

    private int mMin = 0;
    private int mMax = 160;

    private void init() {
        mUpArrow = new WedgeArrowControl(getContext());
        mUpArrow.setIsPressedListener(mIsPressedListener);
        addView(mUpArrow);

        mDownArrow = new WedgeArrowControl(getContext());
        mDownArrow.setDirection(WedgeArrowControl.Direction.DOWN);
        mDownArrow.setIsPressedListener(mIsPressedListener);
        addView(mDownArrow);

        mValueView = new WedgeValueView(getContext());
        mValueView.setValue(mValue);
        addView(mValueView);
    }

    private WedgeArrowControl.IsPressedListener mIsPressedListener = new WedgeArrowControl.IsPressedListener() {
        @Override
        public void isPressed(View view) {
            if (view == mUpArrow) {
                setValueInternal(mValue + 1);
            } else {
                setValueInternal(mValue - 1);
            }
        }
    };

    private void setValueInternal(int newValue) {
        if (newValue != mValue) {
            int temp = mValue;
            setValue(newValue);
            int asSet = mValue;
            if (temp != asSet) {
                mOwner.valueChange(temp, asSet);
            }
        }
    }
}
