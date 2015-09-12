package com.workshoptwelve.brainiac.localui.view;

import android.graphics.PointF;
import android.view.MotionEvent;
import android.view.View;

import com.workshoptwelve.brainiac.boss.common.log.Log;

/**
 * Created by robwilliams on 15-09-09.
 */
public abstract class DoubleSwipeGestureHandler implements GestureHandler {

    private GestureCoordinator mGestureCoordinator;

    protected abstract boolean isUpDown();

    public static class UpDownDoubleSwipeGestureHandler extends DoubleSwipeGestureHandler {
        public UpDownDoubleSwipeGestureHandler(View owner) {
            super(owner);
        }

        protected boolean isUpDown() {
            return true;
        }
    }

    public static class LeftRightDoubleSwipeGestureHandler extends DoubleSwipeGestureHandler {
        public LeftRightDoubleSwipeGestureHandler(View owner) {
            super(owner);
        }

        protected boolean isUpDown() {
            return false;
        }

    }

    @Override
    public void setGestureCoordinator(GestureCoordinator coordinator) {
        mGestureCoordinator = coordinator;
    }

    /**
     * State when we are waiting for our first touch.
     */
    private static final int WAITING_FOR_FIRST = 0;
    /**
     * State when we are waiting for our second touch.
     */
    private static final int WAITING_FOR_SECOND = 1;
    /**
     * State when we are waiting for the gesture to move far enough to believe its for us.
     */
    private static final int PROCESSING_MOTION = 2;
    /**
     * State when we are in the gesture.
     */
    private static final int IN_GESTURE = 3;
    private static Log log = Log.getLogger(GesturedXWalkView.class);
    protected final View mOwner;
    /**
     * Flags if a gesture has started.
     */
    private boolean mGestureStarted;
    protected GestureListener mGestureListener;
    /**
     * Current working width.
     */
    protected int mMinor;
    /**
     * Current working height.
     */
    protected int mMajor;
    /**
     * Track the current state.
     */
    private int state = WAITING_FOR_FIRST;
    /**
     * Keep the location of the start of the first touch.
     */
    protected PointF firstTouch = new PointF(0, 0);
    /**
     * Keep the location of the start of the second touch.
     */
    protected PointF secondTouch = new PointF(0, 0);
    /**
     * How far do you have to move in X before we are too far.
     */
    private int farMinor = 50;
    /**
     * How far do you have to move in Y before we are far enough.
     */
    private int farMajor = 100;
    public DoubleSwipeGestureHandler(View owner) {
        mOwner = owner;
    }
    /**
     * The listener tracking the output of this gesture handler.
     */

    /**
     * Check if an action is the start of a touch.
     *
     * @param action
     * @return
     */
    private boolean isStart(int action) {
        return action == MotionEvent.ACTION_DOWN || action == MotionEvent.ACTION_POINTER_DOWN;
    }

    /**
     * Check if an action is the end of a touch.
     *
     * @param action
     * @return
     */
    private boolean isEnd(int action) {
        return action == MotionEvent.ACTION_UP || action == MotionEvent.ACTION_POINTER_UP || action == MotionEvent.ACTION_CANCEL;
    }

    /**
     * Check if we have moved too far for this action to be a gesture.
     *
     * @param x0
     * @param x1
     * @return
     */
    protected final boolean movedFar(float x0, float x1, float y0, float y1) {
        float a0,a1;
        if (isUpDown()) {
            a0 = x0;
            a1 = x1;
        } else {
            a0 = y0;
            a1 = y1;
        }
        a0 = Math.abs(a0);
        a1 = Math.abs(a1);
        return a0 > farMinor || a1 > farMinor;
    }

    /**
     * Check if we have moved enough to trigger the gesture.
     *
     * @param y0
     * @param y1
     * @return
     */
    protected final boolean movedEnough(float x0, float x1, float y0, float y1) {
        float a0,a1;
        if (isUpDown()) {
            a0 = y0;
            a1 = y1;
        } else {
            a0 = x0;
            a1 = x1;
        }
        // Deliberately not making both positive - because we need them to both go in the same direction.
        // ie: we're avoiding trapping pinches...
        if (a0 < 0) {
            a0 = -a0;
            a1 = -a1;
        }
        return a0 > farMajor && a1 > farMajor;
    }

    /**
     * Set the <em>single</em> gesture listener for this instance.
     *
     * @param listener The listener.
     */
    public void setGestureListener(GestureListener listener) {
        mGestureListener = listener;
    }

    /**
     * Remove the <em>single</em> gesture listener from this instance.
     *
     * @param listener The listener to remove. (No change if it doesn't match the current).
     */
    public void removeGestureListener(GestureListener listener) {
        if (mGestureListener == listener) {
            mGestureListener = null;
        }
    }

    @Override
    public boolean onInterceptTouchEvent(MotionEvent ev) {
        log.e("on intercept, current state:",state);
        int action = ev.getActionMasked();
        int index = ev.getActionIndex();
        ev.getActionIndex();
        if (state == WAITING_FOR_FIRST) {
            if (action == MotionEvent.ACTION_DOWN) {
                firstTouch.set(ev.getX(index), ev.getY(index));
                state = WAITING_FOR_SECOND;
            }
        } else if (state == WAITING_FOR_SECOND) {
            if (action == MotionEvent.ACTION_POINTER_DOWN) {
                secondTouch.set(ev.getX(index), ev.getY(index));
                state = PROCESSING_MOTION;

                // Calculate how far we should allow for this gesture.
                setWidthHeight();

                farMinor = mMinor / 5;
                farMajor = mMajor / 10;

            } else if (isEnd(action)) {
                state = WAITING_FOR_FIRST;
            }
        } else if (state == PROCESSING_MOTION) {
            if (isEnd(action) || isStart(action)) {
                state = WAITING_FOR_FIRST;
            } else {
                float x0 = ev.getX(0);
                float y0 = ev.getY(0);
                float x1 = ev.getX(1);
                float y1 = ev.getY(1);

                float dx0 = x0 - firstTouch.x;
                float dy0 = y0 - firstTouch.y;

                float dx1 = x1 - secondTouch.x;
                float dy1 = y1 - secondTouch.y;

                if (movedFar(dx0, dx1, dy0, dy1)) {
                    state = WAITING_FOR_FIRST;
                } else if (movedEnough(dx0, dx1, dy0, dy1)) {
                    state = IN_GESTURE;
                }
            }
        } else if (state == IN_GESTURE) {
            // The IN_GESTURE state should be handled in #onTouchEvent
            log.e("Shouldn't be here...");
        } else {
            // This means there's a state we don't know about...
            log.e("Shouldn't be here");
        }

        if (state == IN_GESTURE) {
            if (mGestureListener != null) {
                mGestureStarted = true;
                mGestureCoordinator.onGestureStart(this);
                mGestureListener.onStart();
            }
            return true;
        }
        return false;
    }

    public void reset() {
        state = WAITING_FOR_FIRST;
    }

    @Override
    public boolean onTouchEvent(MotionEvent ev) {
        int action = ev.getActionMasked();

        if (isEnd(action) || isStart(action) || ev.getPointerCount() != 2) {
            if (mGestureListener != null && mGestureStarted) {
                mGestureStarted = false;
                mGestureListener.onEnd();
            }
            state = WAITING_FOR_FIRST;
        } else {
            handleDelta(ev);
        }

        return state != WAITING_FOR_FIRST;
    }

    final protected void handleDelta(MotionEvent ev) {
        float a0,a1;
        if (isUpDown()) {
            a0 = ev.getY(0);
            a1 = ev.getY(1);
        } else {
            a0 = ev.getX(0);
            a1 = ev.getX(1);
        }
        boolean isUpDown = isUpDown();

        float da0 = a0 - (isUpDown ? firstTouch.y : firstTouch.x);
        float da1 = a1 - (isUpDown ? secondTouch.y : secondTouch.x);

        float da = (da0 + da1) / 2;

        if (mGestureListener != null) {
            mGestureListener.onGestureChange(-da / mMajor);
        }
    }

    protected void setWidthHeight() {
        if (isUpDown()) {
            mMinor = mOwner.getWidth();
            mMajor = mOwner.getHeight();
        } else {
            mMinor = mOwner.getHeight();
            mMajor = mOwner.getWidth();
        }
    }
}
