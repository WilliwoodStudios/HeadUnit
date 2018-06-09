package com.williwoodstudios.pureviews.relay;



import android.content.Context;
import android.graphics.Color;
import com.williwoodstudios.pureviews.MainActivity;
import com.williwoodstudios.pureviews.R;
import com.williwoodstudios.pureviews.Theme;
import com.williwoodstudios.pureviews.circle.CircleMenu;
import android.graphics.drawable.ColorDrawable;
import android.graphics.drawable.Drawable;
import android.view.ViewGroup;


/**
 * Created by brcewane on 2018-05-27.
 */

public class RelayMainScreen extends CircleMenu {

    private MainActivity mainActivity;
    private ViewGroup mViewGroup;

    public RelayMainScreen(Context owner, Configuration configuration) {
        super(owner, configuration);
        mainActivity = (MainActivity)owner;
        init();
    }

    private void init() {
        mViewGroup = this;
        setBackgroundColor(Color.BLACK);
    }

    // This function will flash the screen on a press and hold
    public void flashScreen() {
        new Thread() {
            public void run() {
                int i = 0;
                while (i++ < 4) {
                    try {
                        mainActivity.runOnUiThread(new Runnable() {

                            @Override
                            public void run() {
                                Drawable background = mViewGroup.getBackground();
                                if (background instanceof ColorDrawable) {
                                    int color = ((ColorDrawable) background).getColor();
                                    if (color == Color.BLACK) {
                                        mViewGroup.setBackgroundColor(Theme.getColor());
                                    } else {
                                        mViewGroup.setBackgroundColor(Color.BLACK);
                                    }
                                }
                            }
                        });
                        Thread.sleep(125);
                    } catch (InterruptedException e) {
                        e.printStackTrace();
                    }
                }
            }
        }.start();
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
