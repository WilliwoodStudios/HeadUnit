package com.williwoodstudios.pureviews.wedge;

import android.content.Context;
import android.graphics.Canvas;
import android.graphics.Paint;
import android.graphics.Typeface;
import android.util.Log;
import android.view.View;
import android.view.animation.TranslateAnimation;
import android.widget.TextView;

import com.williwoodstudios.pureviews.R;
import com.williwoodstudios.pureviews.Theme;
import com.williwoodstudios.pureviews.circle.CircleButton;
import com.williwoodstudios.pureviews.circle.TimerCircleButton;

/**
 * Created by robwilliams on 2015-11-14.
 */
public class WedgeDialogScreen extends WedgeScreen {

    private final TimerCircleButton mYesButton;
    private final CircleButton mNoButton;
    private final Paint mPromptPaint;

    public WedgeDialogScreen(Context context) {
        super(context);
        setWedgeMode(WedgeMode.DIALOG);

        mYesButton = new TimerCircleButton(context, "Yes");
        mYesButton.setDuration(2500);
        mYesButton.setNormalColor(0x1f000000);
        mYesButton.setPressedColor(0x7f000000);
        mYesButton.setImageResource(R.drawable.checkmark);
        mYesButton.setBitmapPad(0.2f);
        mYesButton.setOnClickListener(mOnClickListener);
        addView(mYesButton);

        TranslateAnimation ta = new TranslateAnimation(-500, 0, 0, 0);
        ta.setDuration(250);
        mYesButton.startAnimation(ta);

        mNoButton = new CircleButton(context, "No");
        mNoButton.setNormalColor(0x1f000000);
        mNoButton.setPressedColor(0x7f000000);
        mNoButton.setTitlePosition(CircleButton.TitlePosition.RIGHT);
        mNoButton.setImageResource(R.drawable.cancel);
        mNoButton.setBitmapPad(0.2f);
        mNoButton.setOnClickListener(mOnClickListener);
        addView(mNoButton);
        TranslateAnimation ta2 = new TranslateAnimation(-500, 0, 0, 0);
        ta2.setDuration(250);
        mNoButton.startAnimation(ta2);

        mPromptPaint = new Paint();
        mPromptPaint.setTypeface(Typeface.create(Typeface.SANS_SERIF, Typeface.BOLD));
        mPromptPaint.setColor(0xffffffff);
        mPromptPaint.setAlpha(255);
    }

    private OnClickListener mOnClickListener = new OnClickListener() {
        @Override
        public void onClick(View v) {
            mYesButton.stop();

            popScreen();
        }
    };

    @Override
    protected void onPushFinished() {
    }

    private String [] mPromptLines = new String[0];

    public void setPrompt(String prompt) {
        mPromptLines = prompt.split("\n");
        invalidate();
    }

    @Override
    protected void onLayout(boolean changed, int l, int t, int r, int b) {
        int width = r - l;
        int height = b - t;
        if (width > 0 && height > 0) {
            super.onLayout(changed, l, t, r, b);

            int buttonHeight = height / 3;
            int gap = buttonHeight / 3;
            mYesButton.layout(50, gap, width / 2, gap + buttonHeight);
            mNoButton.layout(50, gap * 2 + buttonHeight, width / 2, (gap + buttonHeight) * 2);

            mPromptPaint.setTextSize(height / 10f);
        }
    }

    @Override
    public void onDraw(Canvas canvas) {
        super.onDraw(canvas);

        int height = (int)mPromptPaint.getTextSize();

        int offset = getHeight()/2 - mPromptLines.length * height/2 + height;

        Log.e("WedgeDialogScreen", "Prompt count: " + mPromptLines.length);

        for (int i=0; i<mPromptLines.length; ++i) {
            float width = mPromptPaint.measureText(mPromptLines[i]);
            canvas.drawText(mPromptLines[i],3*getWidth()/4-width/2,offset,mPromptPaint);
            offset += height;
        }
    }
}
