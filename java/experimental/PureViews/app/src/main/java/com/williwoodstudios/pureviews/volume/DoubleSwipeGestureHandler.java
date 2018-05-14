package com.williwoodstudios.pureviews.volume;

import android.graphics.PointF;
import android.view.MotionEvent;
import android.view.View;

/**
 * Created by robwilliams on 15-09-09.
 */
public class DoubleSwipeGestureHandler {

    /**
     * The view that is using this handler.
     */
    protected final View mOwner;

    /**
     * The active handler. We don't report lefright & updown at the same time.
     */
    protected GestureListener mActiveGestureListener = null;

    /**
     * Track if we care about the ongoing gesture anymore.
     */
    protected boolean mKeepTracking = false;

    /**
     * Keep the location of the start of the first touch.
     */
    protected PointF firstTouch = new PointF(0, 0);
    /**
     * Keep the location of the start of the second touch.
     */
    protected PointF secondTouch = new PointF(0, 0);

    /**
     * Listener for up down direction.
     */
    private GestureListener mUpDownGestureListener;

    /**
     * Listener for left right direction.
     */
    private GestureListener mLeftRightGestureListener;

    /**
     * The observed with of the owning view.
     */
    private float mWidth;

    /**
     * The observed height of the owning view.
     */
    private float mHeight;

    /**
     * The axis that we care about tracking.
     */
    private Axis mActiveAxis;

    /**
     * The last value that we broadcast.
     */
    private float mLastGestureValue;

    /**
     * Create a double swipe gesture handler.
     *
     * @param owner The view who owns this handler. It is used to determine the current width and
     *              height to care about.
     */
    public DoubleSwipeGestureHandler(View owner) {
        mOwner = owner;
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
     * Currently capture as soon as the second touch is down.
     * <p>
     * This means that long term the handler would not work with controls that need pinch-to-zoom.
     *
     * @param ev The motion event.
     * @return true iff we should capture from now on.
     */
    public boolean onInterceptTouchEvent(MotionEvent ev) {
        int action = ev.getActionMasked();
        int index = ev.getActionIndex();
        ev.getActionIndex();
        if (action == MotionEvent.ACTION_DOWN) {
            firstTouch.set(ev.getX(index), ev.getY(index));
            return false;
        }
        if (action == MotionEvent.ACTION_POINTER_DOWN) {
            secondTouch.set(ev.getX(index), ev.getY(index));
            setWidthHeight();
            mKeepTracking = true;
            mActiveGestureListener = null;
            return true;
        }
        return false;
    }

    /**
     * Touch event handler.
     *
     * @param ev The touch event.
     * @return true iff the event was processed.
     */
    public boolean onTouchEvent(MotionEvent ev) {
        if (mKeepTracking) {
            int action = ev.getActionMasked();

            if (isEnd(action) || isStart(action) || ev.getPointerCount() != 2) {
                if (mActiveGestureListener != null) {
                    mActiveGestureListener.onEnd();
                    mActiveGestureListener = null;
                }
                mKeepTracking = false;
                return false;
            } else {
                handleMotion(ev);
            }
            return true;
        }
        return false;
    }

    /**
     * Find the quadrant the given point is in, compared to the origin.
     *
     * @param origin The origin (initial touch point)
     * @param x      of the current touch point.
     * @param y      of the current touch point.
     * @return
     */
    final private Quadrant findQuadrant(PointF origin, float x, float y) {
        float dx = x - origin.x;
        float dy = y - origin.y;
        float adx = Math.abs(dx);
        float ady = Math.abs(dy);
        if (dx > 0 && adx > ady) {
            return Quadrant.EAST;
        } else if (dx < 0 && adx > ady) {
            return Quadrant.WEST;
        } else if (dy < 0) {
            return Quadrant.NORTH;
        }
        return Quadrant.SOUTH;
    }

    /**
     * Find the distance between the two given points. (pythagorean)
     *
     * @param point
     * @param x
     * @param y
     * @return
     */
    final private float findDistance(PointF point, float x, float y) {
        float x2 = point.x - x;
        x2 *= x2;
        float y2 = point.y - y;
        y2 *= y2;
        return (float) Math.sqrt(x2 + y2);
    }

    /**
     * Find the average pythagorean distance between the two touch points in the event
     * and the first/second tracked touch.
     *
     * @param ev
     * @return
     */
    final private float averageDistance(MotionEvent ev) {
        float delta = findDistance(firstTouch, ev.getX(0), ev.getY(0));
        delta += findDistance(secondTouch, ev.getX(0), ev.getY(0));
        return delta / 2;
    }

    /**
     * Check if enough movement has happend in the given quadrant to initiate a gesture.
     *
     * @param delta
     * @param quadrant
     * @return
     */
    final private boolean isEnoughDistance(float delta, Quadrant quadrant) {
        if (quadrant.getAxis() == Axis.Y) {
            return delta > mHeight / 20;
        }
        return delta > mWidth / 20;
    }

    /**
     * Get a motion delta based on the {@link #mActiveAxis} from the {@link #firstTouch} and {@link #secondTouch} and the two points in the MotionEvent.
     *
     * @param ev
     * @return
     */
    final private float getDelta(MotionEvent ev) {
        if (mActiveAxis == Axis.X) {
            return (ev.getX(0) - firstTouch.x + ev.getX(1) - secondTouch.x) / 2 / mWidth;
        }
        return (ev.getY(0) - firstTouch.y + ev.getY(1) - secondTouch.y) / 2 / mHeight;
    }

    /**
     * Handle motion.
     *
     * @param ev
     */
    final protected void handleMotion(MotionEvent ev) {
        if (mActiveGestureListener == null) {
            // We haven't decided which direction the user is gesturing yet.
            Quadrant quadrantA = findQuadrant(firstTouch, ev.getX(0), ev.getY(0));
            Quadrant quadrantB = findQuadrant(secondTouch, ev.getX(1), ev.getY(1));
            if (quadrantA != quadrantB) {
                return;
            }
            float delta = averageDistance(ev);
            if (isEnoughDistance(delta, quadrantA)) {
                mActiveAxis = quadrantA.getAxis();
                mActiveGestureListener = mActiveAxis == Axis.X ? mLeftRightGestureListener : mUpDownGestureListener;
                if (mActiveGestureListener == null) {
                    // There was no listener for that axis - don't track anymore.
                    mKeepTracking = false;
                } else {
                    mActiveGestureListener.onStart();
                    mLastGestureValue = Float.NaN;
                }
            }
        } else {
            // They are gesturing.
            float delta = getDelta(ev);
            int deltaInt = (int) (delta * 100);
            delta = deltaInt / 100f;
            if (delta != mLastGestureValue) {
                mLastGestureValue = delta;
                mActiveGestureListener.onGestureChange(delta);
            }
        }
    }

    /**
     * Check the owner's width and height.
     */
    protected void setWidthHeight() {
        mWidth = mOwner.getWidth();
        mHeight = mOwner.getHeight();
    }

    /**
     * Set the up down (y axis) gesture listener.
     *
     * @param upDownGestureListener
     */
    public void setUpDownGestureListener(GestureListener upDownGestureListener) {
        this.mUpDownGestureListener = upDownGestureListener;
    }

    /**
     * Set the left right (x axis) gesture listener.
     *
     * @param leftRightGestureListener
     */
    public void setLeftRightGestureListener(GestureListener leftRightGestureListener) {
        this.mLeftRightGestureListener = leftRightGestureListener;
    }

    /**
     * Tracks which axis are we processing.
     */
    private enum Axis {
        X, Y
    }

    /**
     * Indicates a quadrant of pointer movement.
     */
    private enum Quadrant {
        NORTH(Axis.Y), SOUTH(Axis.Y), EAST(Axis.X), WEST(Axis.X);

        private final Axis mAxis;

        Quadrant(Axis axis) {
            mAxis = axis;
        }

        public Axis getAxis() {
            return mAxis;
        }
    }
}
