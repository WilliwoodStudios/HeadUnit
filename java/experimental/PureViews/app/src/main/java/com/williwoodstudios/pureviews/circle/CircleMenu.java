package com.williwoodstudios.pureviews.circle;

import android.content.Context;
import android.util.Log;

import com.williwoodstudios.pureviews.AppScreen;
import com.williwoodstudios.pureviews.R;

import java.util.List;

/**
 * Created by robwilliams on 2015-10-18.
 */
public class CircleMenu extends AppScreen {
    private final Configuration mConfiguration;

    public static class CircleMenuItem {
        public CircleMenuItem(String name, int imageResourceId, OnClickListener listener) {
            mName = name;
            mImageResourceId = imageResourceId;
            mOnClickListener = listener;
        }
        public String mName;
        public int mImageResourceId;
        public OnClickListener mOnClickListener;

    }
    public interface Configuration {
        List<CircleMenuItem> getItems();
    }

    public CircleMenu(Context owner, Configuration configuration) {
        super(owner);
        mConfiguration = configuration;

        for (CircleMenuItem item : mConfiguration.getItems()) {
            CircleButton toAdd = new CircleButton(owner, item.mName);
            toAdd.setTitlePosition(CircleButton.TitlePosition.BELOW);
            toAdd.setImageResource(item.mImageResourceId);
            toAdd.onAnimationEnd();
            toAdd.setBitmapPad(0.25f);
            OnClickListener listener = item.mOnClickListener;
            if (listener != null) {
                toAdd.setOnClickListener(listener);
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
