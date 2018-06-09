package com.williwoodstudios.pureviews.settings;

import android.content.Context;
import android.graphics.Canvas;
import android.graphics.Color;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ScrollView;

import com.williwoodstudios.pureviews.AppScreen;
import com.williwoodstudios.pureviews.R;
import com.williwoodstudios.pureviews.ScreenManager;
import com.williwoodstudios.pureviews.ThemeListener;
import com.williwoodstudios.pureviews.control.ScrollViewThatIgnoresDoubleTouch;

/**
 * Created by brcewane on 2018-06-09.
 */

public class SettingsMenu extends AppScreen implements ThemeListener {
    private final ScrollView mScrollView;
    private final ViewGroup mMenuGroup;
    private final ScreenManager mScreenManager;

    public SettingsMenu(Context owner, ScreenManager screenManager) {
        super(owner);
        mScreenManager = screenManager;
        // Create our groups
        mScrollView = new ScrollViewThatIgnoresDoubleTouch(owner);
        mMenuGroup = new ViewGroup(owner) {
            @Override
            protected void onLayout(boolean changed, int l, int t, int r, int b) {

            }
        };
        // Set default background color
       // mMenuGroup.setBackgroundColor(Color.RED);
        addView(mScrollView);
        mScrollView.setBackgroundColor((Color.BLACK));
        mScrollView.addView(mMenuGroup);
        // Create our Color settings menu item
        OnClickListener listener = new OnClickListener() {
            @Override
            public void onClick(View v) {
                mScreenManager.pushScreen(new ColorSettingsMenu(getContext()));
            }
        };
        SettingsMenuItem colorItem;
        colorItem = new SettingsMenuItem(owner, "Color Selection", R.drawable.core_settings_img_palette);
        colorItem.onAnimationEnd();
        colorItem.setOnClickListener(listener);
        mMenuGroup.addView(colorItem);
        // Create our Relay settings Item
        listener = new OnClickListener() {
            @Override
            public void onClick(View v) {
                //mScreenManager.pushScreen(new RelaySettings(getContext()));
            }
        };
        SettingsMenuItem relayItem;
        relayItem = new SettingsMenuItem(owner, "Relay Configuration", R.drawable.core_relays_img_icon_256x256);
        relayItem.onAnimationEnd();
        relayItem.setOnClickListener(listener);
        mMenuGroup.addView(relayItem);
    }


    public void themeUpdated() {
        // Nothing to do
    }

    @Override
    protected void onLayout(boolean changed, int l, int t, int r, int b) {
        int width = r - l;
        int height = b - t;
        int itemHeight = height/6;
        int scrollHeight = 0;
        // Layout each of our menu items
        for (int i = 0; i < mMenuGroup.getChildCount(); ++i) {
            int left = 0;
            int top = i * itemHeight;
            mMenuGroup.getChildAt(i).layout(left, top, width, top + itemHeight);
            scrollHeight = top+itemHeight;
        }
        // Set our scroll height
        scrollHeight += itemHeight/3;
        mScrollView.layout(0,0,width,height);
        mMenuGroup.layout(0,0,width,scrollHeight);
    }

    @Override
    protected void onDraw(Canvas canvas) {
        super.onDraw(canvas);
    }

    @Override
    public boolean showCircleMenuIcon() {
        return false;
    }
}
