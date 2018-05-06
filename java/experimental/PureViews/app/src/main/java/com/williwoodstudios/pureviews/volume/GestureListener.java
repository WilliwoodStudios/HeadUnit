package com.williwoodstudios.pureviews.volume;

/**
 * Listener for hearing the output of the gesture.
 */
public interface GestureListener {
    /**
     * Called when a new gesture has started.
     */
    void onStart();

    /**
     * Measure how much swipe has happened, as a fraction of the screen; number will be between -1 and +1 - and if you move up and down, could be 0...
     *
     * @param delta
     */
    void onGestureChange(float delta);

    /**
     * Called when the gesture has finished.
     */
    void onEnd();
}
