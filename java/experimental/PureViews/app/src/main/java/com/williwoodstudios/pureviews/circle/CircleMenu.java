package com.williwoodstudios.pureviews.circle;

import android.content.Context;
import android.util.Log;
import android.view.View;

import com.williwoodstudios.pureviews.AppScreen;
import com.williwoodstudios.pureviews.R;
import com.williwoodstudios.pureviews.air.AirMainScreen;
import com.williwoodstudios.pureviews.media.MediaMainScreen;

/**
 * Created by robwilliams on 2015-10-18.
 */
public class CircleMenu extends AppScreen {

    private String[] names = new String[]{"music", "maps", "data logger", "phone", "suspension", "dashboard"};
    private int[] mImageResources = new int[]{R.drawable.core_media_player_img_icon_256x256,
            R.drawable.core_maps_img_icon_256x256,
            R.drawable.core_datalogger_img_icon_256x256,
            R.drawable.core_phone_img_icon_256x256,
            R.drawable.core_suspension_img_icon_256x256,
            R.drawable.core_dashboard_img_icon_256x256
    };
    private OnClickListener[] mOnClickListeners = new OnClickListener[]{
            new OnClickListener() {
                @Override
                public void onClick(View v) {
                    pushScreen(new MediaMainScreen(getContext()));
                }
            },
            null,
            null,
            null,
            new OnClickListener() {
                @Override
                public void onClick(View v) {
                    pushScreen(new AirMainScreen(getContext()));
                }
            },
            null
    };

    public CircleMenu(Context owner) {
        super(owner);
        for (int i = 0; i < names.length; ++i) {
            CircleButton toAdd = new CircleButton(owner, names[i]);
            toAdd.setTitlePosition(CircleButton.TitlePosition.BELOW);
            toAdd.setImageResource(mImageResources[i]);
            toAdd.onAnimationEnd();
            toAdd.setBitmapPad(0.25f);
            if (mOnClickListeners[i] != null) {
                toAdd.setOnClickListener(mOnClickListeners[i]);
            }
            addView(toAdd);
        }
        setBackgroundResource(R.drawable.background_pomegranate);
    }

    @Override
    protected void onLayout(boolean changed, int l, int t, int r, int b) {
        int width = r - l;
        int height = b - t;

        int radiusFromHorizontal = width / 18 * 4;
        int radiusFromVertical = height / 3;

        int radius = radiusFromHorizontal < radiusFromVertical ? radiusFromHorizontal : radiusFromVertical;

        int itemHeight = (int) (radius * 1.3);

        int marginX = (width - radius * 3) / 6;
        int marginY = (height - itemHeight * 2) / 4;

        Log.i("RPW", changed + " " + l + " " + t + " " + r + " " + b);
        for (int i = 0; i < getChildCount(); ++i) {
            int x = i % 3;
            int y = i / 3;
            int left = x * (radius + (marginX << 1)) + marginX;
            int top = y * (itemHeight + (marginY << 1)) + marginY;
            getChildAt(i).layout(left, top, left + radius, top + itemHeight);
        }
    }
}
