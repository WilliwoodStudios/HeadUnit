package com.williwoodstudios.pureviews.circle;

import android.content.Context;
import android.graphics.Canvas;
import android.graphics.drawable.Drawable;
import android.util.Log;
import android.view.ViewGroup;
import android.widget.ScrollView;

import com.williwoodstudios.pureviews.AppScreen;
import com.williwoodstudios.pureviews.control.ScrollViewThatIgnoresDoubleTouch;
import com.williwoodstudios.pureviews.Theme;

import java.util.List;

/**
 * Created by robwilliams on 2015-10-18.
 */
public class CircleMenu extends AppScreen {
    // TODO: Scrolling should be sticky - right now it isn't.

    private final Configuration mConfiguration;
    private final ScrollView mScrollView;
    private final ViewGroup mButtonGroup;
    private final Context mContext;

    public static class CircleMenuItem {
        public CircleMenuItem(String name, int imageResourceId, OnClickListener listener, OnLongClickListener longClickListener) {
            mName = name;
            mImageResourceId = imageResourceId;
            mOnClickListener = listener;
            mPackageName = null;
            mAppIcon = null;
            mOnLongClickListener = longClickListener;
        }
        public CircleMenuItem(String name, Drawable appIcon, String packageName, OnClickListener listener, OnLongClickListener longClickListener) {
            mName = name;
            mImageResourceId = -1;
            mOnClickListener = listener;
            mPackageName = packageName;
            mAppIcon = appIcon;
            mOnLongClickListener = longClickListener;
        }

        public String mName;
        public int mImageResourceId;
        public OnClickListener mOnClickListener;
        public Drawable mAppIcon;
        public String mPackageName;
        public OnLongClickListener mOnLongClickListener;
        public int mIndex = -1;
        public boolean mMaintainState = false;
    }
    public interface Configuration {
        List<CircleMenuItem> getItems();
    }

    public CircleMenu(Context owner, Configuration configuration) {
        super(owner);
        mContext = owner;
        mConfiguration = configuration;
        mScrollView = new ScrollViewThatIgnoresDoubleTouch(owner);
        mButtonGroup = new ViewGroup(owner) {
            @Override
            protected void onLayout(boolean changed, int l, int t, int r, int b) {

            }
        };

        addView(mScrollView);
        mScrollView.addView(mButtonGroup);

        refreshMenu();

        setBackgroundResource(Theme.getBackgroundResource(getContext()));
    }

    public void refreshMenu() {
        // First clear any existing items
        android.view.View view;
        for (int i = mButtonGroup.getChildCount() - 1; i >= 0 ; i--) {
            view = mButtonGroup.getChildAt(i);
            if (view instanceof CircleButton) {
                mButtonGroup.removeView(view);
            }
        }
        // Then load with the latest
        for (CircleMenuItem item : mConfiguration.getItems()) {
            CircleButton toAdd = new CircleButton(mContext, item.mName);
            toAdd.setIndex(item.mIndex);
            toAdd.setMaintainsState(item.mMaintainState);
            toAdd.setTitlePosition(CircleButton.TitlePosition.BELOW);
            if (item.mImageResourceId != -1 && item.mAppIcon == null) { // Resource id is one of our internal apps
                toAdd.setImageResource(item.mImageResourceId);
            } else if (item.mAppIcon != null) { // AppIcon is an actual Android installed app
                toAdd.setAppIcon(item.mAppIcon);
            }
            if (item.mPackageName != null) {
                toAdd.setPackageName(item.mPackageName);
            }
            toAdd.onAnimationEnd();
            toAdd.setBitmapPad(0.25f);
            OnClickListener clickListener = item.mOnClickListener;
            if (clickListener != null) {
                toAdd.setOnClickListener(clickListener);
            }
            OnLongClickListener longClickListener = item.mOnLongClickListener;
            if (longClickListener != null) {
                toAdd.setOnLongClickListener(longClickListener);
            }
           // toAdd.setLon
            mButtonGroup.addView(toAdd);
        }

        redoLayout(getLeft(),getTop(),getRight(),getBottom());
    }

    public void themeUpdated() {
        // Update background
        setBackgroundResource(Theme.getBackgroundResource(getContext()));
        // Update selection color of circle buttons
        android.view.View view;
        for (int i = 0; i < mButtonGroup.getChildCount(); i++) {
            view = mButtonGroup.getChildAt(i);
            if (view instanceof CircleButton) {
                ((CircleButton) view).themeUpdated();
            }
        }
    }

    @Override
    protected void onLayout(boolean changed, int l, int t, int r, int b) {
        redoLayout(l, t, r, b);
    }

    private void redoLayout(int l, int t, int r, int b) {
        int width = r - l;
        int height = b - t;

        int radiusFromHorizontal = width / 18 * 4;
        int radiusFromVertical = height / 3;

        int radius = radiusFromHorizontal < radiusFromVertical ? radiusFromHorizontal : radiusFromVertical;

        int itemHeight = (int) (radius * 1.3);

        int marginX = (width - radius * 3) / 6;
        int marginY = (height - itemHeight * 2) / 20;

        int scrollHeight = 0;

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

    @Override
    public boolean showCircleMenuIcon() {
        return false;
    }
}
