package com.workshoptwelve.brainiac.localui;

import android.app.Activity;
import android.content.Context;
import android.graphics.PixelFormat;
import android.media.AudioManager;
import android.net.http.SslError;
import android.os.Bundle;
import android.os.Handler;
import android.os.SystemClock;
import android.view.Gravity;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.view.WindowManager;
import android.view.animation.AlphaAnimation;
import android.webkit.ValueCallback;
import android.webkit.WebResourceResponse;
import android.widget.RelativeLayout;
import android.widget.Toast;

import com.workshoptwelve.brainiac.boss.common.log.Log;
import com.workshoptwelve.brainiac.localui.extension.SystemLoadedExtension;
import com.workshoptwelve.brainiac.localui.extension.SystemThemeExtension;
import com.workshoptwelve.brainiac.localui.extension.SystemSoundExtension;
import com.workshoptwelve.brainiac.localui.util.log.RedundantAndroidLogger;
import com.workshoptwelve.brainiac.localui.view.DoubleSwipeGestureHandler;
import com.workshoptwelve.brainiac.localui.view.GestureListener;
import com.workshoptwelve.brainiac.localui.view.GesturedXWalkView;
import com.workshoptwelve.brainiac.localui.view.VolumeView;

import org.xwalk.core.XWalkPreferences;
import org.xwalk.core.XWalkResourceClient;
import org.xwalk.core.XWalkView;

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

    private XWalkResourceClient mResourceClient;

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
            mLayoutMain.setSystemUiVisibility(View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY | View.SYSTEM_UI_FLAG_FULLSCREEN | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION);
        }
    };
    private RelativeLayout mLayoutMain;
    private RelativeLayout mSplashLayout;
    private SystemLoadedExtension mSystemLoadedExtension;
    private long mSplashShownTime;
    private Handler mHandler;

    @Override
    protected void onStop() {
        log.e("RPW","stop");
        if (mXWalkView != null) {
            mLayoutMain.removeView(mXWalkView);
            mXWalkView = null;
        }
        super.onStop();

    }

    @Override
    protected void onPause() {
        log.e("RPW","pause");
        super.onPause();
    }

    class MyResourceClient extends XWalkResourceClient {
        public MyResourceClient(XWalkView v) {
            super(v);
        }

        @Override
        public void onLoadFinished(XWalkView view, String url) {
            log.e("RPW","load fin");
                toast("finished");
            super.onLoadFinished(view, url);
        }

        @Override
        public void onLoadStarted(XWalkView view, String url) {
            log.e("RPW","load start",url);
            toast("started");
            super.onLoadStarted(view, url);
        }

        @Override
        public void onProgressChanged(XWalkView view, int progressInPercent) {
            log.e("RPW","Prog",progressInPercent);
            toast("progress " + progressInPercent);
            super.onProgressChanged(view, progressInPercent);
        }

        @Override
        public void onReceivedLoadError(XWalkView view, int errorCode, String description, String failingUrl) {
            toast("load error");
            super.onReceivedLoadError(view, errorCode, description, failingUrl);
        }

        @Override
        public void onReceivedSslError(XWalkView view, ValueCallback<Boolean> callback, SslError error) {
            toast("ssl error");
            super.onReceivedSslError(view, callback, error);
        }

        @Override
        public WebResourceResponse shouldInterceptLoadRequest(XWalkView view, String url) {
            return super.shouldInterceptLoadRequest(view, url);
        }

        @Override
        public boolean shouldOverrideUrlLoading(XWalkView view, String url) {
            return super.shouldOverrideUrlLoading(view, url);
        }
    };

    private SystemLoadedExtension.SystemLoadedListener mSystemLoadedListener = new SystemLoadedExtension.SystemLoadedListener() {
        private Runnable mRunnable = new Runnable() {
            public void run() {
                 showSplash(false);
            }
        };

        @Override
        public void onSystemLoaded() {
            runOnUiThread(mRunnable);
        }
    };


    @Override
    protected void onCreate(Bundle savedInstanceState) {
        log.e("RPW", "oncreate");
        mHandler = new Handler();
        super.onCreate(savedInstanceState);
        log.setLogLevel(Log.Level.v);
        mAudioManager = (AudioManager) getSystemService(Context.AUDIO_SERVICE);
        setContentView(R.layout.activity_main);

        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);

        new GesturedXWalkView(this,this);

        mSystemSoundExtension = new SystemSoundExtension(this);
        mSystemThemeExtension = new SystemThemeExtension(this);
        mSystemLoadedExtension = new SystemLoadedExtension(this);
        mSystemLoadedExtension.setSystemLoadedListener(mSystemLoadedListener);

        mVolumeView = (VolumeView) findViewById(R.id.volumeView);

        mSplashLayout = (RelativeLayout) findViewById(R.id.splashLayout);

        mLayoutMain = (RelativeLayout) findViewById(R.id.layout_main);
        mLayoutMain.setOnSystemUiVisibilityChangeListener(mSystemUiVisibilityChangeListener);

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

    private void toast(String message) {
        // Toast.makeText(this, message, Toast.LENGTH_SHORT).show();
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
        log.e("RPW", "onResume");
        super.onResume();
        if (mXWalkView != null) {
            mXWalkView.setSystemUiVisibility(View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY | View.SYSTEM_UI_FLAG_FULLSCREEN | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION);
        }
        // onBossConnectionAvailable();
    }

    @Override
    protected void onStart() {
        log.e("RPW", "onstart");
        super.onStart();
        showSplash(true);

        mHandler.post(new Runnable() {
            public void run() {
                if (mXWalkView == null) {
                    mXWalkView = new GesturedXWalkView(MainActivity.this, MainActivity.this);
                    mLayoutMain.addView(mXWalkView, 0);
                    mXWalkView.setResourceClient(mResourceClient = new MyResourceClient(mXWalkView));

                    DoubleSwipeGestureHandler upDown = new DoubleSwipeGestureHandler.UpDownDoubleSwipeGestureHandler(mXWalkView);
                    upDown.setGestureListener(mUpDownGestureListener);
                    mXWalkView.addGestureHandler(upDown);

                    DoubleSwipeGestureHandler leftRight = new DoubleSwipeGestureHandler.LeftRightDoubleSwipeGestureHandler(mXWalkView);
                    leftRight.setGestureListener(mLeftRightGestureListener);
                    mXWalkView.addGestureHandler(leftRight);

                    mLayoutMain.setSystemUiVisibility(View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY | View.SYSTEM_UI_FLAG_FULLSCREEN | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION);
                }

                onBossConnectionAvailable();
            }
        });
    }

    private Runnable mAnimateSplashRunnable = new Runnable() {
        public void run() {
            AlphaAnimation fade = new AlphaAnimation(1, 0);
            fade.setDuration(750);
            fade.setFillAfter(true);
            mSplashLayout.startAnimation(fade);
        }
    };

    private void showSplash(boolean b) {
        log.e("RPW","Show Splash",b);
        if (b) {
            mSplashLayout.clearAnimation();
            mSplashLayout.setAlpha(1);
            mSplashShownTime = SystemClock.currentThreadTimeMillis();
//
//            mHandler.postDelayed(new Runnable() { public void run() { showSplash(false);} },10000);
        } else {
            long delta = SystemClock.currentThreadTimeMillis() - mSplashShownTime;
            if (delta < 1000) {
                long delay = 1000 - delta;
                mHandler.postDelayed(mAnimateSplashRunnable, delay);
            } else {
                mAnimateSplashRunnable.run();
            }
        }
    }

    @Override
    protected void onRestart() {
        log.e("RPW","onrestart");
        super.onRestart();
        if (mLayoutMain != null) {
            mLayoutMain.setSystemUiVisibility(View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY | View.SYSTEM_UI_FLAG_FULLSCREEN | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION);
        }
    }

    @Override
    public void onBossConnectionAvailable() {
        int serverPort = BossConnectionHelper.getInstance().getServerPort();
        if (serverPort > 0) {
            // TODO check for serverport missing...
            mXWalkView.load("http://127.0.0.1:" + serverPort + "/mobile.html", null);
        }
    }

    @Override
    public void onBossServicesNotAvailable() {
        // TODO something
        Toast.makeText(this,"Services are not available", Toast.LENGTH_LONG).show();
    }
}
