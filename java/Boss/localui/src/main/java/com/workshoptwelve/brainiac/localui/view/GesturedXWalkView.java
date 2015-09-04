package com.workshoptwelve.brainiac.localui.view;

import android.app.Activity;
import android.content.Context;
import android.graphics.PointF;
import android.util.AttributeSet;
import android.view.MotionEvent;

import com.workshoptwelve.brainiac.boss.common.log.Log;

import org.xwalk.core.XWalkView;

/**
 * A version of the XWalkView that traps our volume gesture.
 */
public class GesturedXWalkView extends XWalkView {
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
    /**
     * Current working width.
     */
    private int mWidth;
    /**
     * Current working height.
     */
    private int mHeight;
    /**
     * Track the current state.
     */
    private int state = WAITING_FOR_FIRST;
    /**
     * Keep the location of the start of the first touch.
     */
    private PointF firstTouch = new PointF(0, 0);
    /**
     * Keep the location of the start of the second touch.
     */
    private PointF secondTouch = new PointF(0, 0);
    /**
     * How far do you have to move in X before we are too far.
     */
    private int farX = 50;
    /**
     * How far do you have to move in Y before we are far enough.
     */
    private int farY = 100;
    /**
     * The listener tracking the output of this gesture handler.
     */
    private GestureListener mGestureListener;
    /**
     * Falgs if a gesture has started.
     */
    private boolean mGestureStarted;

    public GesturedXWalkView(Context context, AttributeSet attrs) {
        super(context, attrs);
    }

    public GesturedXWalkView(Context context, Activity activity) {
        super(context, activity);
    }

    /**
     * Monitor touch events - until we intercept them.
     * @param ev
     * @return
     */
    @Override
    public boolean onInterceptTouchEvent(MotionEvent ev) {
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
                mWidth = getWidth();
                mHeight = getHeight();
                farX = mWidth / 5;
                farY = mHeight / 10;

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

                if (movedFar(dx0, dx1)) {
                    state = WAITING_FOR_FIRST;
                } else if (movedEnough(dy0, dy1)) {
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
                mGestureListener.onStart();
            }
            return true;
        }
        return super.onInterceptTouchEvent(ev);
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
     * @param a
     * @param b
     * @return
     */
    private boolean movedFar(float a, float b) {
        if (a < 0) a = -a;
        if (b < 0) b = -b;
        return a > farX || b > farX;
    }

    /**
     * Check if we have moved enough to trigger the gesture.
     *
     * @param a
     * @param b
     * @return
     */
    private boolean movedEnough(float a, float b) {
        // Deliberately not making both positive - because we need them to both go in the same direction.
        // ie: we're avoiding trapping pinches...
        if (a < 0) {
            a = -a;
            b = -b;
        }
        return a > farY && b > farY;
    }

    /**
     * This one only happens after we've done the capture.
     *
     * @param ev
     * @return
     */
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
            float y0 = ev.getY(0);
            float y1 = ev.getY(1);

            float dy0 = y0 - firstTouch.y;
            float dy1 = y1 - secondTouch.y;

            float dy = (dy0 + dy1) / 2;

            if (mGestureListener != null) {
                mGestureListener.onGestureChange(-dy / mHeight);
            }
        }

        return state != WAITING_FOR_FIRST;
    }

    /**
     * Listener for hearing the output of the gesture.
     */
    public interface GestureListener {
        /**
         * Called when a new gesture has started.
         */
        void onStart();

        /**
         * Measure how much swipe has happened, as a fraction of the screen; number will be between -1 and +1 - and if you move up and down, could be 0...
         *
         * @param delta
         */
        void onGestureChange(float delta);

        /**
         * Called when the gesture has finished.
         */
        void onEnd();
    }
}
