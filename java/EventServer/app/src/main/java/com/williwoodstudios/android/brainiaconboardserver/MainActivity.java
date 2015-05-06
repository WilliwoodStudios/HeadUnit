package com.williwoodstudios.android.brainiaconboardserver;

import android.support.v7.app.ActionBarActivity;
import android.os.Bundle;
import android.view.Menu;
import android.view.MenuItem;

import com.williwoodstudios.android.brainiaconboardserver.log.AndroidLogger;
import com.workshoptwelve.brainiac.server.common.Server;
import com.workshoptwelve.brainiac.server.common.content.ContentService;
import com.workshoptwelve.brainiac.server.common.log.Log;
import com.workshoptwelve.brainiac.server.common.multimedia.MultiMediaService;


public class MainActivity extends ActionBarActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        Log.setLogger(new AndroidLogger());

        ContentService.getInstance().setContentServiceImpl(new AndroidContentServiceImpl(this,"html/src"));
        MultiMediaService.getInstance().setMultiMediaServiceImpl(new AndroidMultiMediaService(this));

        Server server = Server.getInstance();
        server.addService(MultiMediaService.getInstance());
        server.start();

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
}
