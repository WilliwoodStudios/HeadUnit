package com.williwoodstudios.pureviews;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.support.design.widget.FloatingActionButton;
import android.support.design.widget.Snackbar;
import android.support.v7.app.AppCompatActivity;
import android.support.v7.widget.Toolbar;
import android.view.View;
import android.view.Menu;
import android.view.MenuItem;
import android.view.Window;
import android.view.WindowManager;

import com.williwoodstudios.pureviews.networking.NetworkService;

public class MainActivity extends Activity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        requestWindowFeature(Window.FEATURE_NO_TITLE);
        getWindow().setFlags(
                WindowManager.LayoutParams.FLAG_FULLSCREEN,
                WindowManager.LayoutParams.FLAG_FULLSCREEN);

        setContentView(new BrainiacLandscapeLayout(this));

        Intent intent = new Intent(this, NetworkService.class);
        startService(intent);
    }

    @Override
    protected void onDestroy() {
        Intent intent = new Intent(this, NetworkService.class);
        stopService(intent);

        super.onDestroy();
    }
}
