package com.williwoodstudios.pureviews.air;

import android.database.DataSetObserver;
import android.util.Log;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ListAdapter;

/**
 * Created by robwilliams on 2015-11-10.
 */
public class PresetListAdapter implements ListAdapter {

    private final PresetItemView[] mPresetViews;
    private AirMainScreen mOwner;
    private DataSetObserver mDataSetObserver;
    private String[] mPresets;

    public PresetListAdapter(AirMainScreen owner) {
        mOwner = owner;
        mPresets = owner.getPresets();
        mPresetViews = new PresetItemView[mPresets.length];
    }

    private String mFiller = "--";

    @Override
    public boolean areAllItemsEnabled() {
        return false;
    }

    @Override
    public boolean isEnabled(int position) {
        return position%2==0;
    }

    @Override
    public void registerDataSetObserver(DataSetObserver observer) {
        mDataSetObserver = observer;

    }

    @Override
    public void unregisterDataSetObserver(DataSetObserver observer) {
        if (mDataSetObserver == observer) {
            mDataSetObserver = null;
        }

    }

    @Override
    public int getCount() {
        return 2 * mPresets.length - 1;
    }

    @Override
    public Object getItem(int position) {
        if (position % 2 == 1) {
            return mFiller;
        } else {
            return mPresets[position / 2];
        }
    }

    @Override
    public long getItemId(int position) {
        return position;
    }

    @Override
    public boolean hasStableIds() {
        return true;
    }

    @Override
    public View getView(final int position, View convertView, ViewGroup parent) {
        if (position % 2 == 1) {
            View toReturn = new View(mOwner.getContext()) {
                @Override
                protected void onMeasure(int widthMeasureSpec, int heightMeasureSpec) {
                    setMeasuredDimension(ViewGroup.LayoutParams.MATCH_PARENT, 1);
                }
            };
            toReturn.setBackgroundColor(0xff7f7f7f);
            return toReturn;
        } else {
            final int preset = position / 2;
            if (preset < 0 || preset >= mPresetViews.length) {
                return null;
            }

            if (mPresetViews[preset] == null) {
                PresetItemView toReturn = new PresetItemView(mOwner.getContext());
                mPresetViews[preset] = toReturn;
                if (mOwner.getSelectedPreset() == position / 2) {
                    toReturn.setSelected(true);
                }
//                toReturn.setOnClickListener(new View.OnClickListener() {
//                    @Override
//                    public void onClick(View v) {
//                        if (v.isSelected()) {
//
//                        } else {
//                            v.setSelected(true);
//                            if (mDataSetObserver != null) {
//                                mDataSetObserver.onChanged();
//                            }
//                            for (int i=0; i<mPresetViews.length; ++i) {
//                                if (i!=preset && mPresetViews[i]!=null && mPresetViews[i].isSelected()) {
//                                    mPresetViews[i].setSelected(false);
//                                }
//                            }
//                        }
//                        Log.e("PresetListAdapter", "Position: " + position);
//                        v.setSelected(true);
//                        mOwner.setSelectedPreset(preset);
//                    }
//                });
                toReturn.setText(mPresets[position / 2]);
            }
            return mPresetViews[preset];
        }
    }

    @Override
    public int getItemViewType(int position) {
        return position % 2;
    }

    @Override
    public int getViewTypeCount() {
        return 2;
    }

    @Override
    public boolean isEmpty() {
        return false;
    }
}
