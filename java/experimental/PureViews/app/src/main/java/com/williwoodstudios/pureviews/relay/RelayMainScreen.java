package com.williwoodstudios.pureviews.relay;

import android.content.Context;
import android.graphics.Color;
import android.util.Log;

import com.williwoodstudios.pureviews.R;
import com.williwoodstudios.pureviews.circle.CircleMenu;

/**
 * Created by brcewane on 2018-05-27.
 */

public class RelayMainScreen extends CircleMenu {

    public RelayMainScreen(Context owner, Configuration configuration) {
        super(owner, configuration);
        init();
    }

    private void init() {
        setBackgroundColor(Color.BLACK);
    }

    @Override
    public int getNavigationLevel() {
        return 1;
    }

    @Override
    public int getNavigationIconResourceID() {
        return R.drawable.core_relays_img_icon_128x128;
    }

    @Override
    public float getNavigationIconResourcePadding() {
        return 0.1f;
    }

    @Override
    public boolean showCircleMenuIcon() {
        return true;
    }

}
