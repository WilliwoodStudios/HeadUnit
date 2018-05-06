package com.williwoodstudios.pureviews.square;

import android.content.Context;
import android.content.SharedPreferences;
import android.graphics.Canvas;
import android.graphics.Color;
import android.util.Log;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ScrollView;
import android.app.Activity;

import com.williwoodstudios.pureviews.AppScreen;
import com.williwoodstudios.pureviews.control.ScrollViewThatIgnoresDoubleTouch;
import com.williwoodstudios.pureviews.Theme;
import com.williwoodstudios.pureviews.ThemeListener;

/**
 * Created by brcewane on 2018-04-29.
 */

public class SquareMenu extends AppScreen implements ThemeListener {

    private final ScrollView mScrollView;
    private final ViewGroup mButtonGroup;

    private OnClickListener mOnClickListener;


    public SquareMenu(Context owner) {
        super(owner);

        mScrollView = new ScrollViewThatIgnoresDoubleTouch(owner);
        mButtonGroup = new ViewGroup(owner) {
            @Override
            protected void onLayout(boolean changed, int l, int t, int r, int b) {

            }
        };

        mButtonGroup.setBackgroundColor(Color.BLACK);

        addView(mScrollView);
        mScrollView.addView(mButtonGroup);

        mOnClickListener = new OnClickListener() {
            @Override
            public void onClick(View v) {
                SquareButton button = (SquareButton)v;
                ViewGroup group = button.getButtonGroup();
                Theme.setColor(button.getResourceIndex());
                button.setChecked(true);
                // Update our stored preference
                SharedPreferences prefs = ((Activity)getContext()).getPreferences(Context.MODE_PRIVATE);
                SharedPreferences.Editor editor = prefs.edit();
                editor.putInt(Theme.PREFERNCE_INDEX, button.getResourceIndex());
                editor.commit();
                // Uncheck the rest
                for (int i = 0; i < group.getChildCount(); i++) {
                    View view = group.getChildAt(i);
                    if (view instanceof SquareButton) {
                        if (view != button) {
                            ((SquareButton)view).setChecked(false);
                        }
                    }
                }
            }
        };
        // Loop through all our colors
        for (int i = 0; i < Theme.colors.length; i++) {
            SquareButton toAdd = new SquareButton(owner, i, mButtonGroup);
            if (i == Theme.getIndex()) {
                toAdd.setChecked(true);
            }
            toAdd.onAnimationEnd();
            toAdd.setBitmapPad(0.25f);
            toAdd.setOnClickListener(mOnClickListener);
            mButtonGroup.addView(toAdd);
        }
    }

    public void themeUpdated() {
        // Nothing to do
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
        int marginY = (height - itemHeight * 2) / 20;

        int scrollHeight = 0;

        Log.i("RPW", changed + " " + l + " " + t + " " + r + " " + b);
        for (int i = 0; i < mButtonGroup.getChildCount(); ++i) {
            int x = i % 3;
            int y = i / 3;
            int left = x * (radius + (marginX << 1)) + marginX;
            int top = y * (itemHeight + (marginY << 1)) + marginY;
            mButtonGroup.getChildAt(i).layout(left, top, left + radius, top + itemHeight);
            scrollHeight = top+itemHeight;
        }

        scrollHeight += itemHeight/3;

        mScrollView.layout(0,0,width,height);

        mButtonGroup.layout(0,0,width,scrollHeight);
    }

    @Override
    protected void onDraw(Canvas canvas) {
        super.onDraw(canvas);
    }
}
