package com.williwoodstudios.pureviews.air;

import android.content.Context;
import android.os.Handler;
import android.util.Log;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;

import com.williwoodstudios.pureviews.R;
import com.williwoodstudios.pureviews.Theme;

/**
 * Created by robwilliams on 2015-11-10.
 */
public class PresetItemView extends ViewGroup {

    private final View mSpacerLine;
    private final ImageView mImageView;
    private final TextView mTextView;
    private final Handler mHandler;

    public void setText(String text) {
        mTextView.setText(text);
    }

    public PresetItemView(Context context) {
        super(context);

        mImageView = new ImageView(getContext());
        mImageView.setImageResource(R.drawable.air_preset);
        addView(mImageView);

        mTextView = new TextView(getContext());
        mTextView.setText("Hello");
        mTextView.setTextAppearance(getContext(), R.style.mediaButtonFont);
        mTextView.setTextSize(30);
        addView(mTextView);

        mSpacerLine = new View(getContext());
        mSpacerLine.setBackgroundColor(0xff7f7f7f);
        addView(mSpacerLine);

        mHandler = new Handler();

        setClickable(true);
    }

    class ColorAnimation implements Runnable {
        private int mOrigin;
        private int mDestination;
        private int mCurrent = 0xff000000;
        private long mDuration = 250;
        private long mStartTime;
        private long mEndTime;

        public ColorAnimation() {
        }

        public void setDesiredColor(int desired) {
            if (desired==mCurrent) {
                mHandler.removeCallbacks(this);
            } else {
                mOrigin = mCurrent;
                mDestination = desired;
                mStartTime = System.currentTimeMillis();
                mEndTime = mStartTime + mDuration;
                run();
            }
        }

        public void run() {
            long now = System.currentTimeMillis();
            if (now > mEndTime) {
                setBackgroundColor(mDestination);
                mCurrent = mDestination;
            } else {
                float progress = 1f * (now - mStartTime) / mDuration;
                setBackgroundColor(mCurrent = mixColor(progress));
                mHandler.postDelayed(this, 10);
            }
        }

        private int mixColor(float progress) {
            int mask = 0xff;
            int shift = 24;
            int result = 0;
            for (int i = 0; i < 4; ++i) {
                result <<= 8;
                int a = (mOrigin >> shift) & mask;
                int b = (mDestination >> shift) & mask;
                int d = b - a;
                int c = (int) (a + (progress * d));
                if (c < 0) {
                    c = 0;
                }
                if (c > 255) {
                    c = 255;
                }
                result |= c;
                shift -= 8;
            }
            return result;
        }
    }

    public void setSelected(boolean selected) {
        Log.e("PresetItemView", "Set selected " + selected);
        super.setSelected(selected);
        checkBackgroundColor();
    }

    @Override
    public void setPressed(boolean pressed) {
        super.setPressed(pressed);
        checkBackgroundColor();
    }


    private void checkBackgroundColor() {
        int desiredColor;
        if (isSelected() || isPressed()) {
            desiredColor = Theme.color;
        } else {
            desiredColor = 0xff000000;
        }

        mColorAnimation.setDesiredColor(desiredColor);
    }

    private ColorAnimation mColorAnimation = new ColorAnimation();

    @Override
    protected void onMeasure(int widthMeasureSpec, int heightMeasureSpec) {
        mTextView.measure(0, 0);
        int height = mTextView.getMeasuredHeight() + 20;
        setMeasuredDimension(ViewGroup.LayoutParams.MATCH_PARENT/*mTextView.getMeasuredWidth() + height + 20*/, mTextView.getMeasuredHeight() + 20);
    }

    @Override
    protected void onLayout(boolean changed, int l, int t, int r, int b) {
        mTextView.layout(b - t + 5, 10, r - l, b - t - 10);
        mImageView.layout(0, 0, b - t, b - t);
        mSpacerLine.layout(0,b-t-1,r-l,b-t);
    }
}
