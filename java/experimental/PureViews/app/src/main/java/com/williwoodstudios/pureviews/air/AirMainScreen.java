package com.williwoodstudios.pureviews.air;

import android.content.Context;
import android.util.AttributeSet;
import android.util.Log;
import android.view.View;
import android.widget.AdapterView;
import android.widget.ListView;

import com.williwoodstudios.pureviews.AppScreen;
import com.williwoodstudios.pureviews.R;

/**
 * Created by robwilliams on 2015-11-09.
 */
public class AirMainScreen extends AppScreen {

    private String[] mPresets = new String[]{"Parked", "Driving", "Full Height"};
    private int[][] mPresetValues = new int[][]{{20, 20, 25, 27, 160}, {40, 40, 42, 45, 160}, {72, 71, 76, 77, 160}};

    private int mSelectedPreset = -1;

    public int getSelectedPreset() {
        return mSelectedPreset;
    }

    public void setSelectedPreset(int which) {
        if (which>=0 && which < mPresets.length) {
            mPressureControl.setPressures(mPresetValues[which]);
        }
    }

    private PressureControl mPressureControl;
    private ListView mPressureList;
    private View mSpacer;


    public AirMainScreen(Context context) {
        super(context);
        init();
    }

    public AirMainScreen(Context context, AttributeSet attrs) {
        super(context, attrs);
        init();
    }

    public AirMainScreen(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        init();
    }

    protected void selectPreset(int which) {
        if (which < 0 || which >= mPresets.length) {
            // do nothing.
        } else {
            mPressureControl.setPressures(mPresetValues[which]);
        }
    }

    public void themeUpdated() {
        // Do Nothing yet
    }

    private void init() {
        setBackgroundColor(0xff007f00);
        mPressureControl = new PressureControl(getContext(), this);
        mPressureControl.setPressures(new int[]{40, 40, 42, 45, 162});

        addView(mPressureControl);

        mPressureList = new ListView(getContext());
        mPressureList.setAdapter(new PresetListAdapter(this));
        mPressureList.setBackgroundColor(0xff000000);
        mPressureList.setSelection(0);
        mPressureList.setChoiceMode(ListView.CHOICE_MODE_SINGLE);
        mPressureList.setOnItemClickListener(new AdapterView.OnItemClickListener() {
            @Override
            public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
                Log.e("AirMainScreen","Item click "+position+ " " + id);
                view.setSelected(true);
                selectPreset(position/2);
            }
        });
//        mPressureList.setOnItemSelectedListener(new AdapterView.OnItemSelectedListener() {
//            @Override
//            public void onItemSelected(AdapterView<?> parent, View view, int position, long id) {
//                Log.e("AirMainScreen", "Item selected " + position);
//            }
//
//            @Override
//            public void onNothingSelected(AdapterView<?> parent) {
//                Log.e("AirMainScreen","Nothing selected");
//            }
//        });
        addView(mPressureList);

        mSpacer = new View(getContext());
        mSpacer.setBackgroundColor(0xffffffff);
        addView(mSpacer);
    }

    @Override
    protected void onLayout(boolean changed, int l, int t, int r, int b) {
        int width = r - l;
        int height = b - t;

        if (width != mWidth || height != mHeight) {
            mWidth = width;
            mHeight = height;

            mPressureControl.layout(width - height, 0, width, height);

            mPressureList.layout(0, 0, width - height, height);

            mSpacer.layout(width - height - 1, 0, width - height, height);
        }
    }

    private int mWidth, mHeight;

    public String[] getPresets() {
        return mPresets;
    }

    @Override
    public int getNavigationLevel() {
        return 1;
    }

    @Override
    public int getNavigationIconResourceID() {
        return R.drawable.core_suspension_img_icon_128x128;
    }

    @Override
    public float getNavigationIconResourcePadding() {
        return 0.1f;
    }
}
