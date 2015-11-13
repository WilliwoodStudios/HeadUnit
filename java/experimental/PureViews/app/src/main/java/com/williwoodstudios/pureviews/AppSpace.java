package com.williwoodstudios.pureviews;

import android.content.Context;
import android.os.Handler;
import android.util.AttributeSet;
import android.util.Log;
import android.view.ViewGroup;
import android.view.animation.Animation;
import android.view.animation.TranslateAnimation;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by robwilliams on 2015-11-09.
 */
public class AppSpace extends ViewGroup implements ScreenManager {

    private ScreenManager mFullScreenManager;

    public void setFullScreenManager(ScreenManager fullScreenManager) {
        mFullScreenManager = fullScreenManager;
    }

    private Handler mHandler;

    public AppSpace(Context context) {
        super(context); init();
    }

    public AppSpace(Context context, AttributeSet attrs) {
        super(context, attrs); init();
    }

    public AppSpace(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        init();
    }

    private void init() {
        mHandler = new Handler();
    }

    private List<AppScreen> mScreens = new ArrayList<>();

    public void popScreen(final AppScreen screen) {
        mScreens.remove(screen);
        TranslateAnimation ta = new TranslateAnimation(0,getWidth(),0,0);
        ta.setDuration(250);
        ta.setAnimationListener(new Animation.AnimationListener() {
            @Override
            public void onAnimationStart(Animation animation) {
            }

            @Override
            public void onAnimationEnd(Animation animation) {
                removeView(screen);
            }

            @Override
            public void onAnimationRepeat(Animation animation) {

            }
        });
        screen.startAnimation(ta);
    }

    public void pushScreen(AppScreen screen) {
        if (screen.isFullScreen()) {
            if (mFullScreenManager != null) {
                mFullScreenManager.pushScreen(screen);
            }
        } else {
            if (mScreens.size() == 0) {
                screen.pushFinished();
            } else {
                if (screen.startScreenAnimate(getWidth(), getHeight(), getWidth(), 0, 0, 0, 200)) {
                    mHandler.postDelayed(mAnimate, 10);
                }
                screen.layout(getWidth(), 0, getWidth(), getHeight());
            }
            Log.e("AppSpace", "Width: " + getWidth());
            mScreens.add(screen);
            notifyTopChanged();
            addView(screen);
            screen.pushing(this);
        }
    }

    private Runnable mAnimate = new Runnable() {
        public void run() {
            if (mScreens.size()!=0) {
                AppScreen screen = mScreens.get(mScreens.size()-1);
                if (screen != null && screen.isScreenAnimationRunning()) {
                    if (screen.screenAnimate()) {
                        mHandler.postDelayed(mAnimate, 5);
                    } else {
                        screen.pushFinished();
                    }
                }
            }

        }
    };

    @Override
    protected void onLayout(boolean changed, int l, int t, int r, int b) {
        int width = r - l;
        int height = b - t;
        getChildCount();
        for (int i = 0; i < getChildCount(); ++i) {
            getChildAt(i).layout(0,0,width,height);
        }
    }

    public boolean isTopScreen(AppScreen appScreen) {
        if (mScreens.size()!=0) {
            return mScreens.get(mScreens.size()-1)==appScreen;
        }
        return false;
    }

    @Override
    public void popToFirstScreen() {
        if (mScreens.size()>1) {
            while (mScreens.size() > 1) {
                removeView(mScreens.get(mScreens.size() - 1));
                mScreens.remove(mScreens.size() - 1);
            }
            notifyTopChanged();
        }
    }

    private void notifyTopChanged() {
        if (mOnTopChangedListener!= null && mScreens.size()>=0) {
            mOnTopChangedListener.onTopChanged(mScreens.get(mScreens.size()-1));
        }
    }

    public interface OnTopChangedListener {
        void onTopChanged(AppScreen screen);
    }

    public void setOnTopChangedListener(OnTopChangedListener otcl) {
        mOnTopChangedListener = otcl;
    }

    private OnTopChangedListener mOnTopChangedListener;
}
