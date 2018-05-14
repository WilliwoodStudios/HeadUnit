package com.williwoodstudios.pureviews;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.res.Configuration;
import android.graphics.Point;
import android.media.AudioManager;
import android.view.MotionEvent;
import android.view.View;
import android.view.animation.AlphaAnimation;
import android.content.pm.PackageManager;
import android.content.pm.ApplicationInfo;
import android.util.Log;
import android.graphics.drawable.Drawable;

import com.williwoodstudios.pureviews.air.AirMainScreen;
import com.williwoodstudios.pureviews.circle.CircleButton;
import com.williwoodstudios.pureviews.circle.CircleMenu;
import com.williwoodstudios.pureviews.circle.CircleNavigationBar;
import com.williwoodstudios.pureviews.media.MediaMainScreen;
import com.williwoodstudios.pureviews.media.MediaService;
import com.williwoodstudios.pureviews.volume.DoubleSwipeGestureHandler;
import com.williwoodstudios.pureviews.volume.GestureListener;
import com.williwoodstudios.pureviews.volume.VolumeView;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by robwilliams on 2015-10-18.
 */
public class BrainiacLayout extends AppSpace {
    private final CircleNavigationBar mNavBar;
    private final AppSpace mAppSpace;
    private final AppSpace mMediaAppSpace;
    private final VolumeView mVolumeView;

    private Activity mActivity;
    private Point mDisplaySize = new Point();

    private DoubleSwipeGestureHandler mGestureHandler;

    private CircleMenu.Configuration mMenuConfiguration = new CircleMenu.Configuration() {
        private ArrayList<CircleMenu.CircleMenuItem> mItems;

        @Override
        public List<CircleMenu.CircleMenuItem> getItems() {
            if (mItems == null) {
                String[] names;
                int[] ids;
                if (getResources().getConfiguration().orientation == Configuration.ORIENTATION_LANDSCAPE) { // Portrait view
                    //names = new String[]{"music", "data logger", "suspension", "dashboard"};
                    names = new String[]{"music"};
                    ids = new int[]{
                            R.drawable.core_media_player_img_icon_256x256
                            //R.drawable.core_datalogger_img_icon_256x256,
                            //R.drawable.core_suspension_img_icon_256x256,
                            // R.drawable.core_dashboard_img_icon_256x256
                    };
                } else {
                    names = new String[]{};
                    ids = new int[]{};
                    /*names = new String[]{"data logger", "suspension", "dashboard"};
                    ids = new int[]{
                            R.drawable.core_datalogger_img_icon_256x256,
                            R.drawable.core_suspension_img_icon_256x256,
                            R.drawable.core_dashboard_img_icon_256x256};*/
                }
                OnClickListener[] mOnClickListeners = new OnClickListener[]{
                        new OnClickListener() {
                            @Override


                            public void onClick(View v) {
                                mAppSpace.pushScreen(new MediaMainScreen(getContext()));
                            }
                        },
                        null,
                        new OnClickListener() {
                            @Override


                            public void onClick(View v) {
                                mAppSpace.pushScreen(new AirMainScreen(getContext()));
                            }
                        }, null
                };

                mItems = new ArrayList<>();

                // Load our default apps
                for (int i = 0; i < names.length; ++i) {
                    mItems.add(new CircleMenu.CircleMenuItem(names[i], ids[i], mOnClickListeners[i]));
                }

                // Generic OnClickListener to launch app
                OnClickListener mAppOnClickListener = new OnClickListener() {
                    @Override
                    public void onClick(View view) {
                        CircleButton button = (CircleButton) view;
                        Context context = getContext();
                        Intent intent = context.getPackageManager().getLaunchIntentForPackage(button.getPackageName());
                        context.startActivity(intent);
                    }
                };

                // Get a list of installed apps.
                final PackageManager pm = getContext().getPackageManager();
                Intent launchActivity;
                String packageName;
                String appName;
                int stringId;
                Drawable icon;
                List<ApplicationInfo> packages = pm.getInstalledApplications(PackageManager.GET_META_DATA);

                for (ApplicationInfo packageInfo : packages) {
                    launchActivity = pm.getLaunchIntentForPackage(packageInfo.packageName);
                    packageName = packageInfo.packageName;
                    appName = getContext().getPackageManager().getApplicationLabel(packageInfo).toString();
                    Log.d("BRAINIAC", "Installed package :" + packageName);
                    Log.d("BRAINIAC", "Source dir : " + packageInfo.sourceDir);
                    Log.d("BRAINIAC", "Launch Activity :" + launchActivity);
                    Log.d("BRAINIAC", "Launch Activity :" + appName);
                    icon = getContext().getPackageManager().getApplicationIcon(packageInfo);
                    if (launchActivity != null) {
                        mItems.add(new CircleMenu.CircleMenuItem(appName, icon, packageName, mAppOnClickListener));
                    }
                }

            }
            return mItems;
        }
    };

    public BrainiacLayout(Activity activity) {
        super(activity);
        mActivity = activity;

        mAudioManager = (AudioManager) activity.getSystemService(Context.AUDIO_SERVICE);

        mGestureHandler = new DoubleSwipeGestureHandler(this);

        mGestureHandler.setUpDownGestureListener(mUpDownGestureListener);
        mGestureHandler.setLeftRightGestureListener(mLeftRightGestureListener);

        mVolumeView = new VolumeView(activity);
        mNavBar = new CircleNavigationBar(activity, this);
        mAppSpace = new AppSpace(activity);
        mAppSpace.setFullScreenManager(this);
        mAppSpace.setOnTopChangedListener(mNavBar);
        mMediaAppSpace = new AppSpace(activity);
        // Only used in portrait
        // Create our menu items
        mAppSpace.pushScreen(new CircleMenu(activity, mMenuConfiguration));

        setBackgroundColor(0xff000000);

        addView(mNavBar);
        addView(mAppSpace);

        mActivity.getWindowManager().getDefaultDisplay().getSize(mDisplaySize);
        if (mDisplaySize.y > mDisplaySize.x) { // portrait
            mMediaAppSpace.setFullScreenManager(this);
            mMediaAppSpace.setOnTopChangedListener(mNavBar);
            mMediaAppSpace.pushScreen(new MediaMainScreen(getContext()));
            addView(mMediaAppSpace);
        }

        addView(mVolumeView);
    }

    public void pushScreen(AppScreen screen) {
        addView(screen);
        screen.pushing(this);
        screen.layout(0, 0, getWidth(), getHeight());

        AlphaAnimation fadeIn = new AlphaAnimation(0, 1);
        fadeIn.setDuration(250);
        fadeIn.setFillAfter(true);
        screen.startAnimation(fadeIn);
        removeView(mVolumeView);
        addView(mVolumeView);
    }

    public void popScreen(AppScreen screen) {
        removeView(screen);
    }

    @Override
    protected void onLayout(boolean changed, int l, int t, int r, int b) {
        mActivity.getWindowManager().getDefaultDisplay().getSize(mDisplaySize);

        if (mDisplaySize.x > mDisplaySize.y) { // This is landscape
            mNavBar.layout(0, 0, mDisplaySize.y / 4, mDisplaySize.y);
            mAppSpace.layout(mDisplaySize.y / 4, 0, mDisplaySize.x, mDisplaySize.y);

        } else { // This is portrait
            int navBarHeight = mDisplaySize.y / 10;
            mNavBar.layout(0, 0, mDisplaySize.x, navBarHeight);
            int topHeight = (int) (mDisplaySize.y * 0.6);

            mAppSpace.layout(0, navBarHeight, mDisplaySize.x, topHeight + navBarHeight);
            mMediaAppSpace.layout(0, topHeight + navBarHeight, mDisplaySize.x, mDisplaySize.y);
        }

        mVolumeView.layout(0, 0, r, b);
    }

    @Override
    public void popToFirstScreen() {
        mAppSpace.popToFirstScreen();
    }

    private GestureListener mLeftRightGestureListener = new GestureListener() {
        private boolean mIsForward;
        private boolean mFarEnough;

        @Override

        public void onStart() {
            mFarEnough = false;
//            log.e("start");
        }

        @Override
        public void onGestureChange(float delta) {
            mIsForward = delta < 0;
            if (Math.abs(delta) > 0.4) {
                mFarEnough = true;
            }
        }

        @Override
        public void onEnd() {
            if (mFarEnough) {
                mVolumeView.setSkip(mIsForward);
                if (mIsForward) {
                    MediaService.next();
                } else {
                    MediaService.previous();
                }
            } else {
                // not far enough to skip.
            }
        }
    };
    private AudioManager mAudioManager;
    private GestureListener mUpDownGestureListener = new GestureListener() {
        private int mInitialVolume;
        private int mMaxVolume;
        private int mTargetVolume = -1;

        @Override
        public void onStart() {
            mInitialVolume = mAudioManager.getStreamVolume(AudioManager.STREAM_MUSIC);
            mMaxVolume = mAudioManager.getStreamMaxVolume(AudioManager.STREAM_MUSIC);
        }

        @Override
        public void onGestureChange(float delta) {
            int targetVolume = mInitialVolume + (int) (-delta * mMaxVolume);
            if (targetVolume > mMaxVolume) {
                targetVolume = mMaxVolume;
            } else if (targetVolume < 0) {
                targetVolume = 0;
            }
            if (mTargetVolume != targetVolume) {
                mAudioManager.setStreamVolume(AudioManager.STREAM_MUSIC, targetVolume, 0);
                mTargetVolume = targetVolume;
            }
            mVolumeView.setVolume(targetVolume, mMaxVolume);
        }

        @Override
        public void onEnd() {
        }
    };

    /**
     * Monitor touch events - until we intercept them.
     *
     * @param ev
     * @return
     */
    @Override
    public boolean onInterceptTouchEvent(MotionEvent ev) {
        return mGestureHandler.onInterceptTouchEvent(ev);
    }

    /**
     * This one only happens after we've done the capture.
     *
     * @param ev
     * @return
     */
    @Override
    public boolean onTouchEvent(MotionEvent ev) {
        return mGestureHandler.onTouchEvent(ev);
    }
}
