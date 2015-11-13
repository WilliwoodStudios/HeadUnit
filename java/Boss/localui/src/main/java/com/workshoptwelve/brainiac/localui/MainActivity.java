package com.workshoptwelve.brainiac.localui;

import android.app.Activity;
import android.content.Context;
import android.graphics.PixelFormat;
import android.media.AudioManager;
import android.os.Bundle;
import android.view.Gravity;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.view.WindowManager;

import com.workshoptwelve.brainiac.boss.common.log.Log;
import com.workshoptwelve.brainiac.localui.extension.SystemThemeExtension;
import com.workshoptwelve.brainiac.localui.extension.SystemSoundExtension;
import com.workshoptwelve.brainiac.localui.util.log.RedundantAndroidLogger;
import com.workshoptwelve.brainiac.localui.view.DoubleSwipeGestureHandler;
import com.workshoptwelve.brainiac.localui.view.GestureListener;
import com.workshoptwelve.brainiac.localui.view.GesturedXWalkView;
import com.workshoptwelve.brainiac.localui.view.VolumeView;

import org.xwalk.core.XWalkPreferences;

import java.net.URL;

public class MainActivity extends Activity implements BossConnectionHelper.BossConnectionListener {
    private static final Log log;

    static {
        Log.setLogger(new RedundantAndroidLogger("brainiac"));
        XWalkPreferences.setValue(XWalkPreferences.REMOTE_DEBUGGING, true);
        log = Log.getLogger(MainActivity.class);
    }

    private GesturedXWalkView mXWalkView;
    private VolumeView mVolumeView;
    private SystemSoundExtension mSystemSoundExtension;

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
            mIsForward = delta > 0;
            if (Math.abs(delta) > 0.25) {
                mFarEnough = true;
            }
//            log.e(delta);
        }

        @Override
        public void onEnd() {
//            log.e("On end");
            if (mFarEnough) {
                int port = BossConnectionHelper.getInstance().getServerPort();
                mVolumeView.setSkip(mIsForward);
                final String urlString = "http://127.0.0.1:" + port + "/brainiac/service/mm/skip?direction=" + (mIsForward ? "forward" : "back");
                new Thread() {
                    public void run() {
                        try {
                            URL url = new URL(urlString);
                            url.getContent();
                        } catch (Exception e) {
                            log.e("Could not skip:", e);
                        }
                    }
                }.start();
            } else {
                log.e("Not far enough to skip");
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
//            log.e("start");
        }

        @Override
        public void onGestureChange(float delta) {
            int targetVolume = mInitialVolume + (int) (delta * mMaxVolume);
            if (targetVolume > mMaxVolume) {
                targetVolume = mMaxVolume;
            } else if (targetVolume < 0) {
                targetVolume = 0;
            }
            if (mTargetVolume != targetVolume) {
                mAudioManager.setStreamVolume(AudioManager.STREAM_MUSIC, targetVolume, 0);
                mTargetVolume = targetVolume;
                log.v("Setting volume to " + targetVolume + " " + delta);
            }
            mVolumeView.setVolume(targetVolume,mMaxVolume);
//            log.e(delta);
        }

        @Override
        public void onEnd() {
//            log.e("end");
        }
    };
    private SystemThemeExtension mSystemThemeExtension;
    private View.OnSystemUiVisibilityChangeListener mSystemUiVisibilityChangeListener = new View.OnSystemUiVisibilityChangeListener() {
        @Override
        public void onSystemUiVisibilityChange(int visibility) {
            mXWalkView.setSystemUiVisibility(View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY | View.SYSTEM_UI_FLAG_FULLSCREEN | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION);
        }
    };

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        log.setLogLevel(Log.Level.v);
        mAudioManager = (AudioManager) getSystemService(Context.AUDIO_SERVICE);
        setContentView(R.layout.activity_main);

        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);

        mSystemSoundExtension = new SystemSoundExtension(this);
        mSystemThemeExtension = new SystemThemeExtension(this);

        mVolumeView = (VolumeView) findViewById(R.id.volumeView);

        mXWalkView = (GesturedXWalkView) findViewById(R.id.activity_main);
        mXWalkView.setSystemUiVisibility(View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY | View.SYSTEM_UI_FLAG_FULLSCREEN | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION);
        mXWalkView.setOnSystemUiVisibilityChangeListener(mSystemUiVisibilityChangeListener);

        DoubleSwipeGestureHandler upDown = new DoubleSwipeGestureHandler.UpDownDoubleSwipeGestureHandler(mXWalkView);
        upDown.setGestureListener(mUpDownGestureListener);
        mXWalkView.addGestureHandler(upDown);

        DoubleSwipeGestureHandler leftRight = new DoubleSwipeGestureHandler.LeftRightDoubleSwipeGestureHandler(mXWalkView);
        leftRight.setGestureListener(mLeftRightGestureListener);
        mXWalkView.addGestureHandler(leftRight);

        View disableStatusBarView = new View(this);

        WindowManager.LayoutParams handleParams = new WindowManager.LayoutParams(
                WindowManager.LayoutParams.FILL_PARENT,
                100,
                // This allows the view to be displayed over the status bar
                WindowManager.LayoutParams.TYPE_SYSTEM_ALERT,
                // this is to keep button presses going to the background window
                WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE |
                        // this is to enable the notification to recieve touch events
                        WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL |
                        // Draws over status bar
                        WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN,
                PixelFormat.TRANSLUCENT);

        handleParams.gravity = Gravity.TOP;
        getWindow().addContentView(disableStatusBarView, handleParams);

        BossConnectionHelper.getInstance().addBossConnectionListener(this);
        BossConnectionHelper.getInstance().init(this);
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        // Inflate the menu; this adds items to the action bar if it is present.
        getMenuInflater().inflate(R.menu.menu_main, menu);
        return true;
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        // Handle action bar item clicks here. The action bar will
        // automatically handle clicks on the Home/Up button, so long
        // as you specify a parent activity in AndroidManifest.xml.
        int id = item.getItemId();

        //noinspection SimplifiableIfStatement
        if (id == R.id.action_settings) {
            return true;
        }

        return super.onOptionsItemSelected(item);
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (mXWalkView != null) {
            mXWalkView.setSystemUiVisibility(View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY | View.SYSTEM_UI_FLAG_FULLSCREEN | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION);
        }
    }

    @Override
    protected void onStart() {
        super.onStart();
        if (mXWalkView != null) {
            mXWalkView.setSystemUiVisibility(View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY | View.SYSTEM_UI_FLAG_FULLSCREEN | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION);
        }
    }

    @Override
    protected void onRestart() {
        super.onRestart();
        if (mXWalkView != null) {
            mXWalkView.setSystemUiVisibility(View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY | View.SYSTEM_UI_FLAG_FULLSCREEN | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION);
        }
    }

    @Override
    public void onBossConnectionAvailable() {
        int serverPort = BossConnectionHelper.getInstance().getServerPort();
        mXWalkView.load("http://127.0.0.1:" + serverPort + "/mobile.html", null);
    }

    @Override
    public void onBossServicesNotAvailable() {
        // TODO something
    }
}
