package com.workshoptwelve.brainiac.localui;

import android.app.Activity;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.ServiceConnection;
import android.graphics.PixelFormat;
import android.os.Bundle;
import android.os.Handler;
import android.os.IBinder;
import android.os.RemoteException;
import android.util.Log;
import android.view.Gravity;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.view.WindowManager;

import com.workshoptwelve.brainiac.boss.IBoss;

import org.xwalk.core.XWalkView;

public class MainActivity extends Activity {
    private XWalkView mXWalkView;
    private Handler mHandler;
    private IBoss mBoss;
    private ServiceConnection mServiceConnection = new ServiceConnection() {
        @Override
        public void onServiceConnected(ComponentName name, IBinder service) {
            Log.v("LOCALUI", "Service connected");
            mBoss = IBoss.Stub.asInterface(service);
            mHandler.postDelayed(mFindServerPort, 0);
        }

        @Override
        public void onServiceDisconnected(ComponentName name) {
            Log.e("LOCALUI", "Uh oh");
        }
    };
    private int mServerPort;
    private Runnable mFindServerPort = new Runnable() {
        public void run() {
            Log.v("LOCALUI", "find server port");
            if (mBoss != null) {
                int serverPort = -1;
                try {
                    serverPort = mBoss.getServerPort();
                    Log.v("LOCALUI", "Port: " + serverPort);
                } catch (RemoteException re) {
                    // consume.
                }
                if (serverPort < 1) {
                    mHandler.postDelayed(this, 100);
                } else {
                    mServerPort = serverPort;
                    mHandler.postDelayed(mOpenContent, 0);
                }
            }
        }
    };


    private Runnable mOpenContent = new Runnable() {
        public void run() {
            mXWalkView.load("http://127.0.0.1:" + mServerPort + "/index.html", null);
        }
    };

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        mXWalkView = (XWalkView) findViewById(R.id.activity_main);
        mXWalkView.setSystemUiVisibility(View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY | View.SYSTEM_UI_FLAG_FULLSCREEN | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION);
        mXWalkView.setOnSystemUiVisibilityChangeListener(mSystemUiVisibilityChangeListener);
        mHandler = new Handler();
        connectService();

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
    }

    private View.OnSystemUiVisibilityChangeListener mSystemUiVisibilityChangeListener = new View.OnSystemUiVisibilityChangeListener() {
        @Override
        public void onSystemUiVisibilityChange(int visibility) {
            mXWalkView.setSystemUiVisibility(View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY | View.SYSTEM_UI_FLAG_FULLSCREEN | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION);
        }
    };

    private void connectService() {
        if (mBoss == null) {
            Intent intent = new Intent("com.workshoptwelve.brainiac.boss.SERVICE");
            startService(intent);
            bindService(intent, mServiceConnection, Context.BIND_AUTO_CREATE);
        }
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
}
