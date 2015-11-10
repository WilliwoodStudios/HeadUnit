package com.williwoodstudios.pureviews.wedge;

import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Canvas;
import android.util.AttributeSet;
import android.view.ViewGroup;

import com.williwoodstudios.pureviews.R;

/**
 * Created by robwilliams on 2015-11-09.
 */
public class WedgeSpinnerControl extends ViewGroup {

    private WedgeArrowControl mUpArrow;
    private WedgeArrowControl mDownArrow;

    public WedgeSpinnerControl(Context context) {
        super(context);
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

    @Override
    protected void onLayout(boolean changed, int l, int t, int r, int b) {
        mUpArrow.layout(0,0,100,100);
        mDownArrow.layout(0,100,100,200);
    }

    private void init() {
        mUpArrow = new WedgeArrowControl(getContext());
        addView(mUpArrow);

        mDownArrow = new WedgeArrowControl(getContext());
        addView(mDownArrow);
    }
}
