package com.williwoodstudios.pureviews.overlay;

import android.content.Context;
import android.graphics.Canvas;
import android.graphics.Paint;
import android.graphics.PixelFormat;
import android.graphics.Point;
import android.graphics.RectF;
import android.view.Gravity;
import android.view.MotionEvent;
import android.view.View;
import android.view.WindowManager;

import com.williwoodstudios.pureviews.Theme;

public class OverlayTargetView extends View {
    static final int EDGE_WIDTH = 15;
    private static final String TAG = OverlayTargetView.class.getName();
    private final Paint mPaint;
    private final OverlayManager.OverlayType mType;
    private final RectF mArcRect = new RectF();
    private WindowManager mWindowManager;
    private WindowManager.LayoutParams mParams;
    private Point mPoint = new Point();
    private boolean mDown = false;

    public OverlayTargetView(Context context, WindowManager windowManager, OverlayManager.OverlayType type) {
        super(context);
        mType = type;
        setBackgroundColor(0x00ff0000);
        mWindowManager = windowManager;

        mPaint = new Paint();
        mPaint.setARGB(255, 255, 0, 0);
        mPaint.setStrokeWidth(1);

        mParams = basicParams();

        mWindowManager.addView(this, mParams);
        doLayout();
    }

    public void doLayout() {
        mWindowManager.getDefaultDisplay().getSize(mPoint);

        if (isEnabled()) {
            mParams.width = 200;
            mParams.height = 200;

            switch (mType) {
                case BACK:
                    // right edge
                    mParams.width = EDGE_WIDTH;
                    mParams.height = mPoint.y / 2;

                    mParams.x = mPoint.x - mParams.width;
                    mParams.y = (mPoint.y - mParams.height) / 2;
                    break;
                case HOME:
                    mParams.width = mPoint.x / 2;
                    mParams.height = EDGE_WIDTH;
                    mParams.x = (mPoint.x - mParams.width) / 2;
                    mParams.y = mPoint.y - mParams.height;
                    break;
                case APP_SWITCH:
                    // left edge
                    mParams.width = EDGE_WIDTH;
                    mParams.height = mPoint.y / 2;
                    mParams.x = 0;
                    mParams.y = (mPoint.y - mParams.height) / 2;
                    break;
            }
        } else {
            mParams.width = 0;
            mParams.height = 0;
        }

        mWindowManager.updateViewLayout(this, mParams);
    }

    @Override
    public void setEnabled(boolean enabled) {
        super.setEnabled(enabled);
        doLayout();
    }

    private WindowManager.LayoutParams basicParams() {
        WindowManager.LayoutParams params = new WindowManager.LayoutParams(
                WindowManager.LayoutParams.WRAP_CONTENT, // match?,
                WindowManager.LayoutParams.WRAP_CONTENT, // MATCH_PARENT,
                WindowManager.LayoutParams.TYPE_SYSTEM_ERROR, // TYPE_PHONE, // TYPE_PHONE, // TYPE_PHONE,
                WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL |
                        WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE |
                        WindowManager.LayoutParams.FLAG_WATCH_OUTSIDE_TOUCH |
                        WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN, // >SPLIT_TOUCH, // NOT_TOUCH_MODAL, // 0, // WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL,
                PixelFormat.TRANSLUCENT);
        params.gravity = Gravity.TOP | Gravity.LEFT;
        return params;
    }

    @Override
    protected void onDraw(Canvas canvas) {
        super.onDraw(canvas);
        mPaint.setColor(Theme.getColor());
        mPaint.setAlpha(mDown ? 255 : 0);
        mArcRect.top = 0;
        mArcRect.left = 0;
        mArcRect.right = getWidth();
        mArcRect.bottom = getHeight();
        switch (mType) {
            case BACK:
                mArcRect.right *= 2;
                break;
            case HOME:
                mArcRect.bottom *= 2;
                break;
            case APP_SWITCH:
                mArcRect.left = -mArcRect.right;
                break;
        }
        float startAngle = 0;
        float sweepAngle = 360;
        canvas.drawArc(mArcRect, startAngle, sweepAngle, false, mPaint);
    }

    @Override
    public boolean onTouchEvent(MotionEvent event) {
        boolean oldDown = mDown;
        int action = event.getAction();
        switch (action) {
            case MotionEvent.ACTION_DOWN:
                mDown = true;
                break;
            case MotionEvent.ACTION_CANCEL:
            case MotionEvent.ACTION_OUTSIDE:
                mDown = false;
                break;
            case MotionEvent.ACTION_UP:
                if (mDown) {
                    mDown = false;
                    OverlayAccessibilityService.performActionForType(mType);
                }
                break;
        }

        if (oldDown != mDown) {
            invalidate();
        }

        return true;
    }
}
