package com.example.bosswebcontent_test;

import android.content.ComponentName;
import android.content.Intent;
import android.content.ServiceConnection;
import android.os.IBinder;
import android.os.ParcelFileDescriptor;
import android.os.RemoteException;
import android.support.v7.app.ActionBarActivity;
import android.os.Bundle;
import android.util.Log;
import android.view.Menu;
import android.view.MenuItem;

import com.workshoptwelve.brainiac.boss.webcontent.IWebContent;

import java.io.FileInputStream;
import java.io.IOException;

public class MainActivity extends ActionBarActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        Intent intent = new Intent("com.workshoptwelve.brainiac.boss.WEBCONTENT");
        startService(intent);
        bindService(intent,mServiceConnection,0);
    }

    private ServiceConnection mServiceConnection = new ServiceConnection() {
        @Override
        public void onServiceConnected(ComponentName name, IBinder service) {
            Log.d("RPW", "connected: " + name.toString());
            IWebContent serviceAsWebContent = IWebContent.Stub.asInterface(service);
            try {
                ParcelFileDescriptor [] pipe = ParcelFileDescriptor.createPipe();
                Log.d("RPW","Returned value: " + serviceAsWebContent.getWebContent("index.html", pipe[1]));
                byte [] buffer = new byte[20000];
                int readLength = 0;
                FileInputStream fis = new FileInputStream(pipe[0].getFileDescriptor());
                try {
                    do {
                        readLength = fis.read(buffer);
                        if (readLength > 0) {
                            Log.d("RPW", new String(buffer, 0, readLength));
                        }
                    } while(readLength >0);
                } finally {
                    fis.close();
                }
            } catch (RemoteException re) {
                Log.e("RPW","ouch",re);
            } catch (RuntimeException re) {
                Log.e("RPW","ouch",re);
            } catch (IOException e) {
                Log.e("RPW", "ouch", e);
            }
        }

        @Override
        public void onServiceDisconnected(ComponentName name) {
            Log.d("RPW","disconnected");
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
}
