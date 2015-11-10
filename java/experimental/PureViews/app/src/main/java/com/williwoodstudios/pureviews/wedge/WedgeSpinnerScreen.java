package com.williwoodstudios.pureviews.wedge;

import android.content.Context;
import android.util.AttributeSet;

/**
 * Created by robwilliams on 2015-11-09.
 */
public class WedgeSpinnerScreen extends WedgeScreen {
    private WedgeSpinnerControl mWedgeSpinnerControl;

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
        mWedgeSpinnerControl = new WedgeSpinnerControl(getContext());
        addView(mWedgeSpinnerControl);
    }

    @Override
    protected void onLayout(boolean changed, int l, int t, int r, int b) {
        super.onLayout(changed, l, t, r, b);

        mWedgeSpinnerControl.layout(0,0,300,300);
    }
}
