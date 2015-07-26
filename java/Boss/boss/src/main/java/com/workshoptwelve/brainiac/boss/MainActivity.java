package com.workshoptwelve.brainiac.boss;

import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.ServiceConnection;
import android.os.IBinder;
import android.os.RemoteException;
import android.support.v7.app.ActionBarActivity;
import android.os.Bundle;
import android.text.method.ScrollingMovementMethod;
import android.view.Menu;
import android.view.MenuItem;
import android.widget.TextView;

import com.workshoptwelve.brainiac.boss.hardware.accessory.AndroidAccessoryManager;
import com.workshoptwelve.brainiac.boss.hardware.obdii.AndroidOBDConnection;
import com.workshoptwelve.brainiac.boss.hardware.usb.BossUSBManager;
import com.workshoptwelve.brainiac.boss.log.AndroidLogger;
import com.workshoptwelve.brainiac.boss.common.hardware.accessory.AccessoryService;
import com.workshoptwelve.brainiac.boss.common.hardware.obdii.OBDService;
import com.workshoptwelve.brainiac.boss.common.server.Server;
import com.workshoptwelve.brainiac.boss.common.content.ContentService;
import com.workshoptwelve.brainiac.boss.common.log.Log;
import com.workshoptwelve.brainiac.boss.common.multimedia.MultiMediaService;


public class MainActivity extends ActionBarActivity implements AndroidLogger.AndroidLoggerListener {
    private TextView mTextViewLog;

    @Override
    public void onLogAvailable(final Log.Level level, final StringBuilder toLog) {
        runOnUiThread(new Runnable() {
            public void run() {
                if (mTextViewLog.getLineCount() > 2000) {
                    mTextViewLog.setText("");
                }
                mTextViewLog.append(toLog.toString());
                mTextViewLog.append("\n");
            }
        });
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

//        mTextViewLog = (TextView)findViewById(R.id.textViewLog);
//        mTextViewLog.setMovementMethod(new ScrollingMovementMethod());
//
//        sAndroidLogger.setAndroidLoggerListener(this);

        startBossService();
    }

    private void startBossService() {
        Intent intent = new Intent("com.workshoptwelve.brainiac.boss.SERVICE");
        startService(intent);
        bindService(intent, mServiceConnection, BIND_AUTO_CREATE);
    }

    private ServiceConnection mServiceConnection = new ServiceConnection() {
        @Override
        public void onServiceConnected(ComponentName name, IBinder service) {
            android.util.Log.e("BOSS", "Connected to self");
            IBoss mBoss = IBoss.Stub.asInterface(service);
            // TODO - make this async.
            for (int i = 0; i < 20; ++i) {
                try {
                    int port = mBoss.getServerPort();
                    if (port < 0) {
                        try {
                            Thread.sleep(250);
                        } catch (InterruptedException ie) {
                            // consume
                        }
                    } else {
                        break;
                    }
                } catch (Throwable t) {
                    //
                }
            }
            try {
                android.util.Log.e("BOSS", "We are running on " + mBoss.getVersion() + " " + mBoss.getServerPort());
            } catch (RemoteException re) {
                android.util.Log.e("BOSS", "Damn!", re);
            }
        }

        @Override
        public void onServiceDisconnected(ComponentName name) {
            android.util.Log.e("BOSS", "Disconnected from self?");
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
        if (id == R.id.action_clear) {
            mTextViewLog.setText("");
            return true;
        }

        return super.onOptionsItemSelected(item);
    }
}
