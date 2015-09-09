package com.workshoptwelve.brainiac.localui.view;

import android.view.MotionEvent;

/**
 * Created by robwilliams on 15-09-09.
 */
public interface GestureHandler {
    boolean onInterceptTouchEvent(MotionEvent ev);

    boolean onTouchEvent(MotionEvent ev);
}
