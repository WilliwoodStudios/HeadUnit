package com.williwoodstudios.pureviews;

/**
 * Created by robwilliams on 2015-11-10.
 */
public interface ScreenManager {
    void pushScreen(AppScreen which);
    void popScreen(AppScreen which);
    boolean isTopScreen(AppScreen which);
    void popToFirstScreen();
}
