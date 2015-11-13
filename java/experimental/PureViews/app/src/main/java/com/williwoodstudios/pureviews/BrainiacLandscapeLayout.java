package com.williwoodstudios.pureviews;

import android.app.Activity;
import android.graphics.Point;
import android.view.ViewGroup;
import android.view.animation.AlphaAnimation;

import com.williwoodstudios.pureviews.air.AirMainScreen;
import com.williwoodstudios.pureviews.circle.CircleMenu;
import com.williwoodstudios.pureviews.circle.CircleNavigationBar;

/**
 * Created by robwilliams on 2015-10-18.
 */
public class BrainiacLandscapeLayout extends AppSpace {

    private final CircleNavigationBar mNavBar;
    private final AppSpace mAppSpace;
    private Activity mActivity;
    private Point mDisplaySize = new Point();

    public BrainiacLandscapeLayout(Activity activity) {
        super(activity);
        mActivity = activity;

        mNavBar = new CircleNavigationBar(activity,this);
        mAppSpace = new AppSpace(activity);
        mAppSpace.setFullScreenManager(this);
        mAppSpace.setOnTopChangedListener(mNavBar);

//        mAppSpace.pushScreen(new AirMainScreen(activity));
        mAppSpace.pushScreen(new CircleMenu(activity));

        setBackgroundColor(0xff000000);

        addView(mNavBar);
        addView(mAppSpace);
    }

    public void pushScreen(AppScreen screen) {
        addView(screen);
        screen.pushing(this);
        screen.layout(0,0,getWidth(),getHeight());

        AlphaAnimation fadeIn = new AlphaAnimation(0,1);
        fadeIn.setDuration(250);
        fadeIn.setFillAfter(true);
        screen.startAnimation(fadeIn);
    }

    public void popScreen(AppScreen screen) {
        removeView(screen);
    }

    @Override
    protected void onLayout(boolean changed, int l, int t, int r, int b) {
        mActivity.getWindowManager().getDefaultDisplay().getSize(mDisplaySize);

        mNavBar.layout(0, 0, mDisplaySize.y / 4, mDisplaySize.y);
        mAppSpace.layout(mDisplaySize.y / 4, 0, mDisplaySize.x, mDisplaySize.y);
    }

    @Override
    public void popToFirstScreen() {
        mAppSpace.popToFirstScreen();
    }

}
