package com.williwoodstudios.pureviews;

import android.app.Activity;
import android.graphics.Point;
import android.view.View;
import android.view.animation.AlphaAnimation;
import android.view.animation.Animation;

import com.williwoodstudios.pureviews.air.AirMainScreen;
import com.williwoodstudios.pureviews.circle.CircleMenu;
import com.williwoodstudios.pureviews.circle.CircleNavigationBar;
import com.williwoodstudios.pureviews.media.MediaMainScreen;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by robwilliams on 2015-10-18.
 */
public class BrainiacLandscapeLayout extends AppSpace {

    private final CircleNavigationBar mNavBar;
    private final AppSpace mAppSpace;
    private Activity mActivity;
    private Point mDisplaySize = new Point();

    private CircleMenu.Configuration mMenuConfiguration = new CircleMenu.Configuration() {
        private ArrayList<CircleMenu.CircleMenuItem> mItems;

        @Override
        public List<CircleMenu.CircleMenuItem> getItems() {
            if (mItems == null) {
                String[] names = new String[]{"music", "maps", "data logger", "phone", "suspension", "dashboard"};
                int[] ids = new int[]{
                        R.drawable.core_media_player_img_icon_256x256,
                        R.drawable.core_maps_img_icon_256x256,
                        R.drawable.core_datalogger_img_icon_256x256,
                        R.drawable.core_phone_img_icon_256x256,
                        R.drawable.core_suspension_img_icon_256x256,
                        R.drawable.core_dashboard_img_icon_256x256
                };
                OnClickListener[] mOnClickListeners = new OnClickListener[]{
                        new OnClickListener() {
                            @Override


                            public void onClick(View v) {
                                mAppSpace.pushScreen(new MediaMainScreen(getContext()));
                            }
                        }, null,
                        null,
                        null,
                        new OnClickListener() {
                            @Override


                            public void onClick(View v) {
                                mAppSpace.pushScreen(new AirMainScreen(getContext()));
                            }
                        }, null
                };

                mItems = new ArrayList<>();

                for (int i = 0; i < names.length; ++i) {
                    mItems.add(new CircleMenu.CircleMenuItem(names[i], ids[i], mOnClickListeners[i]));
                }

            }
            return mItems;
        }
    };

    public BrainiacLandscapeLayout(Activity activity) {
        super(activity);
        mActivity = activity;

        mNavBar = new CircleNavigationBar(activity, this);
        mAppSpace = new AppSpace(activity);
        mAppSpace.setFullScreenManager(this);
        mAppSpace.setOnTopChangedListener(mNavBar);

//        mAppSpace.pushScreen(new AirMainScreen(activity));
        mAppSpace.pushScreen(new CircleMenu(activity, mMenuConfiguration));

        setBackgroundColor(0xff000000);

        addView(mNavBar);
        addView(mAppSpace);
    }

    public void pushScreen(AppScreen screen) {
        addView(screen);
        screen.pushing(this);
        screen.layout(0, 0, getWidth(), getHeight());

        AlphaAnimation fadeIn = new AlphaAnimation(0, 1);
        fadeIn.setDuration(250);
        fadeIn.setFillAfter(true);
        screen.startAnimation(fadeIn);
    }

    public void popScreen(final AppScreen screen) {
        AlphaAnimation fadeOut = new AlphaAnimation(1,0);
        fadeOut.setAnimationListener(new Animation.AnimationListener() {
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
        fadeOut.setDuration(250);
        fadeOut.setFillAfter(true);
        screen.startAnimation(fadeOut);
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
