package com.williwoodstudios.pureviews;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.view.Window;
import android.view.WindowManager;
import android.content.Context;
import android.content.SharedPreferences;


public class MainActivity extends Activity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        requestWindowFeature(Window.FEATURE_NO_TITLE);
        getWindow().setFlags(
                WindowManager.LayoutParams.FLAG_FULLSCREEN,
                WindowManager.LayoutParams.FLAG_FULLSCREEN);
        // Retrieve our color preference
        SharedPreferences prefs = this.getPreferences(Context.MODE_PRIVATE);
        int themeColor = prefs.getInt(Theme.PREFERNCE_INDEX, Theme.getIndex());
        Theme.setColor(themeColor);

        setContentView(new BrainiacLayout(this));

    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
    }
}
