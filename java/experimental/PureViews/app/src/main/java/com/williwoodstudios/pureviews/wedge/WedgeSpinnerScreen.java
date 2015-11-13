package com.williwoodstudios.pureviews.wedge;

import android.content.Context;
import android.util.AttributeSet;
import android.view.MotionEvent;
import android.view.View;
import android.view.animation.TranslateAnimation;

import com.williwoodstudios.pureviews.circle.CircleButton;

/**
 * Created by robwilliams on 2015-11-09.
 */
public class WedgeSpinnerScreen extends WedgeScreen {
    private WedgeSpinnerControl mWedgeSpinnerControl;

    public void setImageResource(int resource) {
        mCircleButton.setImageResource(resource);
    }

    public WedgeSpinnerScreen(Context context) {
        super(context);
        init();
    }

    public WedgeSpinnerScreen(Context context, AttributeSet attrs) {
        super(context, attrs);
        init();
    }

    public WedgeSpinnerScreen(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        init();
    }

    private void init() {
        mWedgeSpinnerControl = new WedgeSpinnerControl(getContext(), this);
        addView(mWedgeSpinnerControl);

        mCircleButton = new CircleButton(getContext(), "Done") {
            @Override
            protected void onAnimationStart() {
                super.onAnimationStart();
                setTranslationY(0);
            }
        };
        mCircleButton.setNormalColor(0x3f000000);
        mCircleButton.setPressedColor(0x7f000000);
        mCircleButton.setTitlePosition(CircleButton.TitlePosition.RIGHT);
        mCircleButton.setOnClickListener(mOnClickListener);
        addView(mCircleButton);
    }

    private OnClickListener mOnClickListener = new OnClickListener() {
        @Override
        public void onClick(View v) {
            popScreen();
        }
    };

    @Override
    protected void onAnimationEnd() {
        super.onAnimationEnd();

        TranslateAnimation animation = new TranslateAnimation(0, 0, mCircleButton.getTranslationY(), 0);
        animation.setDuration(250);
        animation.setFillAfter(true);
        mCircleButton.startAnimation(animation);
    }

    private CircleButton mCircleButton;

    private int mWidth, mHeight;

    @Override
    protected void onLayout(boolean changed, int l, int t, int r, int b) {
        super.onLayout(changed, l, t, r, b);

        int width = r - l;
        int height = b - t;
        if (width != mWidth || height != mHeight) {
            mWidth = width;
            mHeight = height;

            int sWidth = mWidth / 5;
            int sHeight = mHeight / 2;

            int x = (mWidth - sWidth) / 2;
            int y = (mHeight - sHeight) / 2;

            mWedgeSpinnerControl.layout(x, y, x + sWidth, y + sHeight);

            int mPadding = 20;

            int cRadius = (int) (height / 3.5f);
            int cL, cT, cR, cB;

            cT = height - cRadius - mPadding;
            cB = cT + cRadius;

            if (getWedgeMode() == WedgeMode.FORWARD_SLASH) {
                cL = mPadding;
                cR = (int) (mPadding + cRadius * 2.5f);
            } else {
                cL = (int) (width - mPadding - cRadius * 2.5f);
                cR = width - mPadding;
            }

            mCircleButton.layout(cL, cT, cR, cB);
            mCircleButton.setTranslationY(cRadius + mPadding);
        }
    }

    @Override
    public void setWedgeMode(WedgeMode wedgeMode) {
        super.setWedgeMode(wedgeMode);
        if (wedgeMode == WedgeMode.BACK_SLASH) {
            mCircleButton.setTitlePosition(CircleButton.TitlePosition.LEFT);
        } else {
            mCircleButton.setTitlePosition(CircleButton.TitlePosition.RIGHT);
        }
    }

    public interface OnValueChangeListener {
        void onValueChange(int oldValue, int newValue);
    }

    public void setOnValueChangedListener(OnValueChangeListener listener) {
        mOnValueChangeListener = listener;
    }

    private OnValueChangeListener mOnValueChangeListener;

    public void setValue(int value) {
        mWedgeSpinnerControl.setValue(value);
    }

    public int getValue() {
        return mWedgeSpinnerControl.getValue();
    }

    void valueChange(int oldValue, int newValue) {
        if (mOnValueChangeListener != null) {
            mOnValueChangeListener.onValueChange(oldValue, newValue);
        }
    }

    @Override
    protected void onPushFinished() {
        super.onPushFinished();
        // Animate the button.
        // Animate the button text.
    }
}
