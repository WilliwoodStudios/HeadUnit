package com.williwoodstudios.pureviews.air;

import android.content.Context;
import android.util.AttributeSet;
import android.util.Log;
import android.view.View;

import com.williwoodstudios.pureviews.AppScreen;
import com.williwoodstudios.pureviews.R;
import com.williwoodstudios.pureviews.controls.RoundedRectButton;
import com.williwoodstudios.pureviews.wedge.WedgeDialogScreen;

import java.util.ArrayList;

/**
 * Created by robwilliams on 2015-11-09.
 */
public class AirMainScreen extends AppScreen {

    private String[] mPresets = new String[]{"Parked", "Driving", "Full Height"};
    private int[][] mPresetValues = new int[][]{{20, 20, 25, 27, 160}, {40, 40, 42, 45, 160}, {72, 71, 76, 77, 160}};

    private int mSelectedPreset = -1;
    private RoundedRectButton mAddSetButton;

    public int getSelectedPreset() {
        return mSelectedPreset;
    }

    public void setSelectedPreset(int which) {
        if (which>=0 && which < mPresets.length) {
            for (int i=0; i<mPresetViews.size(); ++i) {
                mPresetViews.get(i).setSelected(which==i);
            }
            mPressureControl.setPressures(mPresetValues[which]);
            setButtonMode(Mode.ADD_CONDITION);
        }
    }

    private PressureControl mPressureControl;

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

    enum Mode {
        ADD_CONDITION,
        SAVE_PRESET
    };

    private Mode mMode = null;

    private ArrayList<PresetItemView> mPresetViews = new ArrayList<>();

    private void setButtonMode(Mode mode) {
        if (mode != mMode) {
            mMode = mode;
            if (mode == Mode.ADD_CONDITION) {
                mAddSetButton.setText("Add Condition");
            } else {
                mAddSetButton.setText("Save Preset");
                for (PresetItemView v : mPresetViews) {
                    v.setSelected(false);
                }
            }
        }
    }

    private void init() {
        setBackgroundColor(0xff000000);
        mPressureControl = new PressureControl(getContext(), this) {
            @Override
            void onPressuresChanged(int fl, int fr, int bl, int br) {
                Log.e("AirMainScreen","Pressure changed");
                setButtonMode(Mode.SAVE_PRESET);
            }
        };
        mPressureControl.setPressures(new int[]{40, 40, 42, 45, 162});

        addView(mPressureControl);

        for (int i=0; i<mPresets.length; ++i) {
            final int which = i;
            PresetItemView toAdd = new PresetItemView(getContext());
            toAdd.setText(mPresets[i]);
            toAdd.setSelected(false);
            toAdd.setOnClickListener(new OnClickListener() {
                @Override
                public void onClick(View v) {
                    setSelectedPreset(which);
                }
            });
            mPresetViews.add(toAdd);
            addView(toAdd);
        }
        mSpacer = new View(getContext());
        mSpacer.setBackgroundColor(0xffffffff);
        addView(mSpacer);

        mAddSetButton = new RoundedRectButton(getContext());
        addView(mAddSetButton);
        mAddSetButton.setText("Add Condition");

        mAddSetButton.setOnClickListener(new OnClickListener() {
            @Override
            public void onClick(View v) {
                WedgeDialogScreen wds = new WedgeDialogScreen(getContext());
                wds.setPrompt("Activate Preset\n'Full Height'?");
                pushScreen(wds);
            }
        });

        setSelectedPreset(0);
    }

    @Override
    protected void onLayout(boolean changed, int l, int t, int r, int b) {
        int width = r - l;
        int height = b - t;

        if (width != mWidth || height != mHeight) {
            mWidth = width;
            mHeight = height;

            int buttonVSpace = 60;

            mPressureControl.layout(width - height, 0, width, height);

            int presetVOffset = 0;
            for (PresetItemView v : mPresetViews) {
                v.measure(0,0);
                v.layout(0,presetVOffset,width-height-1,presetVOffset+v.getMeasuredHeight());
                presetVOffset += v.getMeasuredHeight();
            }

            int buttonPad = 8;

            mAddSetButton.layout(buttonPad,height-buttonVSpace,width-height-buttonPad,height-buttonPad);

            mSpacer.layout(width - height - 1, 0, width - height, height);
        }
    }

    private int mWidth, mHeight;

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
