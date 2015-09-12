package com.workshoptwelve.brainiac.localui.view;

import android.app.Activity;
import android.content.Context;
import android.util.AttributeSet;
import android.util.Log;
import android.view.MotionEvent;

import org.xwalk.core.XWalkView;

import java.util.ArrayList;
import java.util.List;

/**
 * A version of the XWalkView that traps our volume gesture.
 */
public class GesturedXWalkView extends XWalkView {
    private List<GestureHandler> mGestureHandlers = new ArrayList<GestureHandler>();
    private GestureHandler mActiveHandler = null;

    public GesturedXWalkView(Context context, AttributeSet attrs) {
        super(context, attrs);
    }

    public GesturedXWalkView(Context context, Activity activity) {
        super(context, activity);
    }

    /**
     * Monitor touch events - until we intercept them.
     *
     * @param ev
     * @return
     */
    @Override
    public boolean onInterceptTouchEvent(MotionEvent ev) {
        for (GestureHandler g : mGestureHandlers) {
            if (g.onInterceptTouchEvent(ev)) {
                Log.e("GESTURED", "true for on intercept touch");
                mActiveHandler = g;
                return true;
            }
        }
        Log.e("GESTURED", "false for on intercept touch " + ev);
        return super.onInterceptTouchEvent(ev);
    }

    /**
     * This one only happens after we've done the capture.
     *
     * @param ev
     * @return
     */
    @Override
    public boolean onTouchEvent(MotionEvent ev) {
        if (mActiveHandler != null) {
            boolean toReturn = mActiveHandler.onTouchEvent(ev);
            if (!toReturn) {
                mActiveHandler = null;
            }
            return toReturn;
        }
        Log.e("GESTURED", "Not handling...");
        return false;
    }

    public void addGestureHandler(GestureHandler handler) {
        if (!mGestureHandlers.contains(handler)) {
            mGestureHandlers.add(handler);
            handler.setGestureCoordinator(mGestureCoordinator);
        }
    }

    private GestureCoordinator mGestureCoordinator = new GestureCoordinator() {
        @Override
        public void onGestureStart(GestureHandler gestureHandler) {
            for (GestureHandler g : mGestureHandlers) {
                if (g != gestureHandler)
                g.reset();
            }
        }
    };
}
