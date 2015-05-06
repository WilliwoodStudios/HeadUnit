package com.workshoptwelve.boss.app;

import android.content.Context;
import android.support.v7.app.ActionBarActivity;
import android.os.Bundle;
import android.view.Menu;
import android.view.MenuItem;

import com.workshoptwelve.boss.app.log.AndroidLogger;
import com.workshoptwelve.brainiac.boss.common.server.Server;
import com.workshoptwelve.brainiac.boss.common.content.ContentService;
import com.workshoptwelve.brainiac.boss.common.log.Log;
import com.workshoptwelve.brainiac.boss.common.multimedia.MultiMediaService;


public class MainActivity extends ActionBarActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        initServices(this);
    }

    private static synchronized void initServices(Context context) {
        if (!sStarted) {
            Log.setLogger(new AndroidLogger("boss"));

            ContentService.getInstance().setContentServiceImpl(new AndroidContentServiceImpl(context,"html/src"));
            MultiMediaService.getInstance().setMultiMediaServiceImpl(new AndroidMultiMediaService(context));

            Server server = Server.getInstance();
            server.addService(MultiMediaService.getInstance());
            server.start();

            sStarted = true;
        }
    }
    private static boolean sStarted;

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
