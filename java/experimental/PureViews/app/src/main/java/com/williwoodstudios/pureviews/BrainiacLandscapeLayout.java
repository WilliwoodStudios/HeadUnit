package com.williwoodstudios.pureviews;

import android.app.Activity;
import android.graphics.Point;
import android.os.Handler;
import android.view.ViewGroup;

import com.williwoodstudios.pureviews.media.MainScreen;

/**
 * Created by robwilliams on 2015-10-18.
 */
public class BrainiacLandscapeLayout extends ViewGroup {

    private final CircleNavigationBar mNavBar;
    private final AppSpace mAppSpace;
    //    private final CircleMenu mCircleMenu;
    private MainScreen mMainScreen;
    private Activity mActivity;
    private Point mDisplaySize = new Point();

    public BrainiacLandscapeLayout(Activity activity) {
        super(activity);
        mActivity = activity;

        mNavBar = new CircleNavigationBar(activity);
        mAppSpace = new AppSpace(activity);

        mAppSpace.pushScreen(mMainScreen = new MainScreen(activity));
//        mCircleMenu = new CircleMenu(activity);

        setBackgroundColor(0xff000000);

        addView(mNavBar);
        addView(mAppSpace);

        final Handler mHandler = new Handler();
        mHandler.postDelayed(new Runnable() {
            public void run() {
                Runnable q = new Runnable() {
                    int at = 0;

                    public void run() {
                        String s = "" + (char) (at + 'a');
                        mMainScreen.setSong(s, s, s);
                        ++at;
                        if (at < 26) {
                            mHandler.postDelayed(this, 100);
                        }
                    }
                };

                mMainScreen.setSong("Rob Williams Jnr", "Alcatraz", "Unreleased");
                mHandler.postDelayed(q, 500);
            }
        }, 5000);
    }

    @Override
    protected void onLayout(boolean changed, int l, int t, int r, int b) {
        mActivity.getWindowManager().getDefaultDisplay().getSize(mDisplaySize);

        mNavBar.layout(0, 0, mDisplaySize.y / 4, mDisplaySize.y);
        mAppSpace.layout(mDisplaySize.y / 4, 0, mDisplaySize.x, mDisplaySize.y);
    }

}
