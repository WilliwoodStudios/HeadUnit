package com.workshoptwelve.brainiac.boss;

import android.content.ComponentName;
import android.content.Intent;
import android.content.ServiceConnection;
import android.os.Bundle;
import android.os.IBinder;
import android.os.RemoteException;
import android.support.v7.app.ActionBarActivity;
import android.view.Menu;
import android.view.MenuItem;
import android.widget.TextView;

import com.workshoptwelve.brainiac.boss.common.hardware.obdii.IOBDListener;
import com.workshoptwelve.brainiac.boss.common.hardware.obdii.OBDService;
import com.workshoptwelve.brainiac.boss.common.log.Log;


public class MainActivity extends ActionBarActivity {
    private TextView mTextViewLog;
    private TextView mCTextView;
    private TextView mDTextView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        mCTextView = (TextView)findViewById(R.id.cTextView);
        mDTextView = (TextView)findViewById(R.id.dTextView);

        startBossService();
    }

    private void startBossService() {
        Intent intent = new Intent("com.workshoptwelve.brainiac.boss.SERVICE");
        intent.setPackage("com.workshoptwelve.brainiac.boss");
        startService(intent);
        bindService(intent, mServiceConnection, BIND_AUTO_CREATE);
    }


    private IOBDListener mOBDListener = new IOBDListener() {
        @Override
        public void onPIDUpdated(final int mode, final int pid, final String value) {
            runOnUiThread(new Runnable() {
                public void run() {
                    if (pid==0xc) {
                        mCTextView.setText(value);
                    } else {
                        mDTextView.setText(value);
                    }
                }
            });
        }
    };

    private void registerTestOBD() {
//        OBDService.getInstance().registerForPIDUpdate(mOBDListener, (1 << 16) + 0xc);
//        OBDService.getInstance().registerForPIDUpdate(mOBDListener, (1 << 16) + 0xd);
    }

    private ServiceConnection mServiceConnection = new ServiceConnection() {
        @Override
        public void onServiceConnected(ComponentName name, IBinder service) {
            registerTestOBD();
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
