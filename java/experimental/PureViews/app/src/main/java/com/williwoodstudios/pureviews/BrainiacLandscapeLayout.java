package com.williwoodstudios.pureviews;

import android.app.Activity;
import android.graphics.Point;
import android.os.Handler;
import android.view.ViewGroup;

import com.williwoodstudios.pureviews.air.AirMainScreen;
import com.williwoodstudios.pureviews.media.MainScreen;

/**
 * Created by robwilliams on 2015-10-18.
 */
public class BrainiacLandscapeLayout extends ViewGroup {

    private final CircleNavigationBar mNavBar;
    private final AppSpace mAppSpace;
    private Activity mActivity;
    private Point mDisplaySize = new Point();

    public BrainiacLandscapeLayout(Activity activity) {
        super(activity);
        mActivity = activity;

        mNavBar = new CircleNavigationBar(activity);
        mAppSpace = new AppSpace(activity);
        mAppSpace.setBrainiacLandscapeLayout(this);

        mAppSpace.pushScreen(new AirMainScreen(activity));

        setBackgroundColor(0xff000000);

        addView(mNavBar);
        addView(mAppSpace);
    }

    public void pushScreen(AppScreen screen) {
        addView(screen);
        screen.layout(0,0,getWidth(),getHeight());
    }

    @Override
    protected void onLayout(boolean changed, int l, int t, int r, int b) {
        mActivity.getWindowManager().getDefaultDisplay().getSize(mDisplaySize);

        mNavBar.layout(0, 0, mDisplaySize.y / 4, mDisplaySize.y);
        mAppSpace.layout(mDisplaySize.y / 4, 0, mDisplaySize.x, mDisplaySize.y);
    }

}
