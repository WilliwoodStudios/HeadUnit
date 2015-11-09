package com.williwoodstudios.pureviews;

import android.content.Context;
import android.graphics.Bitmap;
import android.util.Log;
import android.view.ViewGroup;

/**
 * Created by robwilliams on 2015-10-18.
 */
public class CircleMenu extends ViewGroup {

    private String [] names = new String[] { "music","maps","data logger","phone","dashboard"};

    public CircleMenu(Context owner) {
        super(owner);
        for (int i=0; i<5; ++i) {
            addView(new CircleButton(owner,names[i]));
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

        int itemHeight = (int)(radius * 1.3);

        int marginX = (width - radius*3) / 6;
        int marginY = (height - itemHeight*2) / 4;

        Log.i("RPW", changed + " " + l + " " + t + " " + r + " " + b);
        for (int i=0; i<getChildCount(); ++i) {
            int x = i % 3;
            int y = i / 3;
            int left = x * (radius + (marginX<<1)) + marginX;
            int top = y * (itemHeight + (marginY<<1)) + marginY;
            getChildAt(i).layout(left,top,left + radius, top+itemHeight);
        }
    }
}
