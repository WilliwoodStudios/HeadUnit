package com.workshoptwelve.brainiac.localui;

import android.app.Activity;
import android.graphics.PixelFormat;
import android.os.Bundle;
import android.view.Gravity;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.view.WindowManager;

import com.workshoptwelve.brainiac.boss.IBoss;
import com.workshoptwelve.brainiac.boss.common.log.Log;
import com.workshoptwelve.brainiac.localui.extension.SystemSoundExtension;
import com.workshoptwelve.brainiac.localui.util.log.RedundantAndroidLogger;

import org.xwalk.core.XWalkPreferences;
import org.xwalk.core.XWalkView;

public class MainActivity extends Activity implements BossConnectionHelper.BossConnectionListener  {
    private XWalkView mXWalkView;

    static {
        Log.setLogger(new RedundantAndroidLogger("brainiac"));
        XWalkPreferences.setValue(XWalkPreferences.REMOTE_DEBUGGING, true);
    }

    private SystemSoundExtension mSystemSoundExtension;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);

        mSystemSoundExtension = new SystemSoundExtension(this);

        mXWalkView = (XWalkView) findViewById(R.id.activity_main);
        mXWalkView.setSystemUiVisibility(View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY | View.SYSTEM_UI_FLAG_FULLSCREEN | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION);
        mXWalkView.setOnSystemUiVisibilityChangeListener(mSystemUiVisibilityChangeListener);

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

    private View.OnSystemUiVisibilityChangeListener mSystemUiVisibilityChangeListener = new View.OnSystemUiVisibilityChangeListener() {
        @Override
        public void onSystemUiVisibilityChange(int visibility) {
            mXWalkView.setSystemUiVisibility(View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY | View.SYSTEM_UI_FLAG_FULLSCREEN | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION);
        }
    };


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
        mXWalkView.load("http://127.0.0.1:" + serverPort + "/index.html", null);
    }

    @Override
    public void onBossServicesNotAvailable() {
        // TODO something
    }
}
