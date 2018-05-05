package com.williwoodstudios.pureviews;


import android.content.Context;
import android.util.Log;
import android.graphics.Color;

import java.util.ArrayList;

/**
 * Created by robwilliams on 2015-10-18.
 */
public class Theme {
   // public static int color = 255 << 24 | 192 << 16 | 57 << 8 | 43;
    public static String PREFERNCE_INDEX = "brainiac.theme.index";
    public static int TURQUOISE = 0;
    public static int GREEN_SEA = 1;
    public static int EMERALD = 2;
    public static int NEPHRITIS = 3;
    public static int PETER_RIVER = 4;
    public static int BELIZE_HOLE = 5;
    public static int WET_ASHAULT = 6;
    public static int MIDNIGHT_BLUE = 7;
    public static int PINK = 8;
    public static int AMETHYST = 9;
    public static int WISTERIA = 10;
    public static int SUN_FLOWER = 11;
    public static int ORANGE = 12;
    public static int CARROT = 13;
    public static int PUMPKIN = 14;
    public static int ALIZARIN = 15;
    public static int POMEGRANATE = 16;
    public static int SILVER = 17;
    public static int CONCRETE = 18;
    public static int ASBESTOS = 19;
    public static int CIRCLE_BUTTON_TEXT_SIZE = 25;

    public static int[] colors = {Color.parseColor("#1ABC9C"),
            Color.parseColor("#16A085"),
            Color.parseColor("#2ECC71"),
            Color.parseColor("#27AE60"),
            Color.parseColor("#3498DB"),
            Color.parseColor("#2980B9"),
            Color.parseColor("#34495E"),
            Color.parseColor("#2C3E50"),
            Color.parseColor("#FAABEC"),
            Color.parseColor("#AF7AC4"),
            Color.parseColor("#8E44AD"),
            Color.parseColor("#F1C40F"),
            Color.parseColor("#F39C12"),
            Color.parseColor("#E67E22"),
            Color.parseColor("#D35400"),
            Color.parseColor("#D94646"),
            Color.parseColor("#C0392B"),
            Color.parseColor("#BDC3C7"),
            Color.parseColor("#AAB7B7"),
            Color.parseColor("#98A3A3"),};

    private static String[] mBackgrounds = {"background_turquoise",
            "background_green_sea",
            "background_emerald",
            "background_nephritis",
            "background_peter_river",
            "background_belize_hole",
            "background_wet_asphault",
            "background_midnight_blue",
            "background_pink",
            "background_amethyst",
            "background_wisteria",
            "background_sun_flower",
            "background_orange",
            "background_carrot",
            "background_pumpkin",
            "background_alizarin",
            "background_pomegranate",
            "background_silver",
            "background_concrete",
            "background_asbestos"};

    private static int mIndex = POMEGRANATE;
    private static ArrayList<ThemeListener> mthemeListener = new ArrayList<ThemeListener>();



    public static int getColor() {
        return colors[mIndex];
    }
    public static int getIndex() {return mIndex;}

    public static int getBackgroundResource(Context context) {
        String name = mBackgrounds[mIndex];
        return context.getResources().getIdentifier(name,"drawable", context.getPackageName());
    }

    public static void setColor(int index) {
        if (index < 0) return;
        if (index > colors.length - 1) return;
        if (index == mIndex) return;
        mIndex = index;
        //Send signal to update UI by starting with the last added
        ThemeListener listener;
        for (int i = mthemeListener.size() - 1; i >= 0 ; i--) {
            listener = mthemeListener.get(i);
            try {
                listener.themeUpdated();
            } catch (Exception e) {
                Log.v("Theme:setColor",e.getMessage());
                // Remove the entry
                mthemeListener.remove(i);
            }
        }
    }

    public static void subscribe(ThemeListener listener) {
        mthemeListener.add(listener);
    }

    public static void unsubscribe(ThemeListener listener) {
        mthemeListener.remove(listener);
    }

}
