package com.williwoodstudios.pureviews.control;

import android.content.Context;
import android.view.MotionEvent;
import android.widget.ScrollView;

/**
 * Created by Owner on 5/6/2018.
 */

/**
 * This deceptively named control is a scroll view that ignores double touch.
 *
 * The default control will capture double touch before the top level gesture handler agrees to
 * capture double touch.
 */
public class ScrollViewThatIgnoresDoubleTouch extends ScrollView {
    public ScrollViewThatIgnoresDoubleTouch(Context owner) {
        super(owner);
    }

    @Override
    public boolean onTouchEvent(MotionEvent ev) {
        // Ignore any events if there is more than 1 contact point.
        if (ev.getPointerCount() > 1) {
            return false;
        }
        return super.onTouchEvent(ev);
    }

    @Override
    public boolean onInterceptTouchEvent(MotionEvent ev) {
        // Capture (to ignore) if there is more than 1 contact point.
        if (ev.getPointerCount() > 1) {
            return true;
        }
        return super.onInterceptTouchEvent(ev);
    }
}

