package com.williwoodstudios.pureviews;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.view.Window;
import android.view.WindowManager;
import android.content.Context;
import android.content.SharedPreferences;
import android.app.WallpaperManager;
import java.io.IOException;
import java.io.InputStream;

import com.williwoodstudios.pureviews.media.MediaService;
import com.williwoodstudios.pureviews.overlay.OverlayService;
import com.williwoodstudios.pureviews.relay.RelayController;


public class MainActivity extends Activity {
    private BrainiacLayout mBrainiacLayout;
    private RelayController mRelayController;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        MediaService.init(this);

        super.onCreate(savedInstanceState);

        requestWindowFeature(Window.FEATURE_NO_TITLE);
        getWindow().setFlags(
                WindowManager.LayoutParams.FLAG_FULLSCREEN,
                WindowManager.LayoutParams.FLAG_FULLSCREEN);
        // Retrieve our color preference
        SharedPreferences prefs = this.getPreferences(Context.MODE_PRIVATE);
        int themeColor = prefs.getInt(Theme.PREFERNCE_INDEX, Theme.getIndex());
        Theme.setColor(themeColor);

        setContentView(mBrainiacLayout = new BrainiacLayout(this));

        startService(new Intent(this, OverlayService.class));

        WallpaperManager wpM = WallpaperManager.getInstance(getApplicationContext());
        try {
            //InputStream is = getResources().openRawResource(R.drawable.wallpaper);
            wpM.setResource(R.raw.wallpaper);
        } catch (IOException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }

        // Initialize our Relay Controller
        mRelayController = new RelayController(this);
    }

    @Override
    public void onBackPressed() {
        mBrainiacLayout.onBackPressed();
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
    }

    public RelayController getRelayController() {return mRelayController;}
}
