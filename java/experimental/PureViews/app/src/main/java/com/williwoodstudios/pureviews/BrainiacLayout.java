package com.williwoodstudios.pureviews;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.SharedPreferences;
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
import com.williwoodstudios.pureviews.relay.RelayMainScreen;
import com.williwoodstudios.pureviews.circle.CircleButton;
import com.williwoodstudios.pureviews.circle.CircleMenu;
import com.williwoodstudios.pureviews.circle.CircleNavigationBar;
import com.williwoodstudios.pureviews.media.MediaMainScreen;
import com.williwoodstudios.pureviews.media.MediaService;
import com.williwoodstudios.pureviews.volume.DoubleSwipeGestureHandler;
import com.williwoodstudios.pureviews.volume.GestureListener;
import com.williwoodstudios.pureviews.volume.VolumeView;
import com.williwoodstudios.pureviews.relay.RelayController;

import org.json.JSONArray;
import org.json.JSONObject;

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
    private final CircleMenu mAppGrid;
    private final AppManagerReceiver mAppManagerReceiver;

    private Activity mActivity;
    private Point mDisplaySize = new Point();

    private DoubleSwipeGestureHandler mGestureHandler;

    // Handle Relay Long Clicks
    private class RelayLongClickListener implements OnLongClickListener {
        private MainActivity mMainActivity;
        public RelayLongClickListener(MainActivity activity) {
            super();
            mMainActivity = activity;
        }
        public boolean onLongClick(View view){
            CircleButton button = (CircleButton) view;
            Context context = getContext();
            RelayController relayController = ((MainActivity)mMainActivity).getRelayController();
            boolean selectedState = button.getSelectedState();
            RelayMainScreen relayScreen = (RelayMainScreen)button.getmCircleMenu();
            relayScreen.flashScreen();
            if (selectedState) { // Currently selected
                Log.d("BRAINIAC","Turn off relay #:" + button.getIndex() + " from a possible " + relayController.getRelays().size() + " relays");
            } else {
                Log.d("BRAINIAC","Turn on relay #:" + button.getIndex() + " from a possible " + relayController.getRelays().size() + " relays");
            }
            button.setSelectedState(!selectedState);
            return true;
        }
    }

    private CircleMenu.Configuration mRelayConfiguration = new CircleMenu.Configuration() {
        @Override
        public List<CircleMenu.CircleMenuItem> getItems() {
            ArrayList<CircleMenu.CircleMenuItem> items = new ArrayList<>();
            // Generic OnClickListener to handle relay click
            OnClickListener mRelayOnClickListener = new OnClickListener() {
                @Override
                public void onClick(View view) {
                    CircleButton button = (CircleButton) view;
                    Context context = getContext();
                    RelayController controller = ((MainActivity)mActivity).getRelayController();
                    Log.d("BRAINIAC","Relay Tap Relay Index #:" + button.getIndex() + " from a possible " + controller.getRelays().size() + " relays");
                    //Intent intent = context.getPackageManager().getLaunchIntentForPackage(button.getPackageName());
                    //context.startActivity(intent);
                }
            };
            // Generic OnLongClickListener to handle relay long press
            OnLongClickListener mRelayOnLongClickListener = new RelayLongClickListener((MainActivity)mActivity);
            RelayController relayController = ((MainActivity)mActivity).getRelayController();
            ArrayList<RelayController.Relay> relays = relayController.getRelays();
            for (int i = 0; i < relays.size(); i++) {
                RelayController.Relay item = relays.get(i);
                CircleMenu.CircleMenuItem menuItem = new CircleMenu.CircleMenuItem(item.getLabel(), item.getResourceId(), mRelayOnClickListener, mRelayOnLongClickListener);
                menuItem.mIndex = i;
                menuItem.mMaintainState = true;
                items.add(menuItem);
            }
            return items;
        }
    };

    // Retrieves all of the menu items for the App Grid circle menu
    private CircleMenu.Configuration mMenuConfiguration = new CircleMenu.Configuration() {
        @Override
        public List<CircleMenu.CircleMenuItem> getItems() {
            ArrayList<CircleMenu.CircleMenuItem> items;
            String[] names = new String[]{};
            int[] ids = new int[]{};

            // Load in our default Applications
            names = new String[]{"Switches"/*, "Suspension"*/};
            ids = new int[]{
                    R.drawable.core_relays_img_icon_256x256/*,
                    R.drawable.core_suspension_img_icon_256x256*/};
            OnClickListener[] mOnClickListeners = new OnClickListener[]{
                    new OnClickListener() {
                        @Override


                        public void onClick(View v) {
                            // Configuration for the Relays
                           mAppSpace.pushScreen(new RelayMainScreen(getContext(), mRelayConfiguration));
                        }
                    }/*,
                    new OnClickListener() {
                        @Override
                        public void onClick(View v) {
                            mAppSpace.pushScreen(new AirMainScreen(getContext()));
                        }
                    }*/
            };
            items = new ArrayList<>();
            // Load our default apps
            for (int i = 0; i < names.length; ++i) {
                items.add(new CircleMenu.CircleMenuItem(names[i], ids[i], mOnClickListeners[i], null));
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
                    items.add(new CircleMenu.CircleMenuItem(appName, icon, packageName, mAppOnClickListener, null));
                }
            }
            return items;
        }
    };

    public BrainiacLayout(Activity activity) {
        super(activity);
        mActivity = activity;
        mAudioManager = (AudioManager) activity.getSystemService(Context.AUDIO_SERVICE);
        // Gesture handler
        mGestureHandler = new DoubleSwipeGestureHandler(this);
        mGestureHandler.setUpDownGestureListener(mUpDownGestureListener);
        mGestureHandler.setLeftRightGestureListener(mLeftRightGestureListener);
        // Create our views
        mVolumeView = new VolumeView(activity);
        mNavBar = new CircleNavigationBar(activity, this);
        mAppSpace = new AppSpace(activity);
        mAppSpace.setFullScreenManager(this);
        mAppSpace.setOnTopChangedListener(mNavBar);
        mMediaAppSpace = new AppSpace(activity);
        // Create our app grid
        mAppGrid = new CircleMenu(activity, mMenuConfiguration);
        mAppSpace.pushScreen(mAppGrid);
        setBackgroundColor(0xff000000);
        addView(mNavBar);
        addView(mAppSpace);
        // Add media player
        mActivity.getWindowManager().getDefaultDisplay().getSize(mDisplaySize);
        if (mDisplaySize.y > mDisplaySize.x) { // portrait
            mMediaAppSpace.setFullScreenManager(this);
            mMediaAppSpace.pushScreen(new MediaMainScreen(getContext()));
            addView(mMediaAppSpace);
        }
        // Listen for app install/uninstall
        mAppManagerReceiver = new AppManagerReceiver(this);
        IntentFilter iF = new IntentFilter();
        iF.addAction(Intent.ACTION_PACKAGE_ADDED);
        iF.addAction(Intent.ACTION_PACKAGE_REMOVED);
        iF.addDataScheme("package");
        getContext().registerReceiver(mAppManagerReceiver,iF);
        addView(mVolumeView);
    }

    public void refreshAppGrid() {
        mAppGrid.refreshMenu();
    }

    public void pushScreen(AppScreen screen) {
        mAppSpace.pushScreen(screen);
    }

    public void popScreen(AppScreen screen) {
        mAppSpace.popScreen(screen);
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

    public void onBackPressed() {
        mAppSpace.pop();
    }
}
