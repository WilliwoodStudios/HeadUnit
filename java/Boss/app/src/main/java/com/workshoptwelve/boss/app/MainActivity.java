package com.workshoptwelve.boss.app;

import android.content.Context;
import android.support.v7.app.ActionBarActivity;
import android.os.Bundle;
import android.text.method.ScrollingMovementMethod;
import android.view.Menu;
import android.view.MenuItem;
import android.widget.TextView;

import com.workshoptwelve.boss.app.hardware.obdii.AndroidOBDConnection;
import com.workshoptwelve.boss.app.hardware.usb.BossUSBManager;
import com.workshoptwelve.boss.app.log.AndroidLogger;
import com.workshoptwelve.brainiac.boss.common.hardware.obdii.OBDService;
import com.workshoptwelve.brainiac.boss.common.server.Server;
import com.workshoptwelve.brainiac.boss.common.content.ContentService;
import com.workshoptwelve.brainiac.boss.common.log.Log;
import com.workshoptwelve.brainiac.boss.common.multimedia.MultiMediaService;


public class MainActivity extends ActionBarActivity implements AndroidLogger.AndroidLoggerListener {
    private TextView mTextViewLog;

    @Override
    public void onLogAvailable(final Log.Level level, final StringBuilder toLog) {
        runOnUiThread(new Runnable() {
            public void run() {
                if (mTextViewLog.getLineCount() > 2000) {
                    mTextViewLog.setText("");
                }
                mTextViewLog.append(toLog.toString());
                mTextViewLog.append("\n");
            }
        });
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        mTextViewLog = (TextView)findViewById(R.id.textViewLog);
        mTextViewLog.setMovementMethod(new ScrollingMovementMethod());

        initServices(this,this);
    }

    static AndroidLogger sAndroidLogger;

    private static synchronized void initServices(Context context,AndroidLogger.AndroidLoggerListener addLog) {
        if (!sStarted) {
            Log.setLogger(sAndroidLogger = new AndroidLogger("boss"));

            ContentService.getInstance().setContentServiceImpl(new AndroidContentServiceImpl(context, "html/src"));
            MultiMediaService.getInstance().setMultiMediaServiceImpl(new AndroidMultiMediaService(context));
            OBDService.getInstance().setOBDConnection(new AndroidOBDConnection());

            Server server = Server.getInstance();
            server.addService(MultiMediaService.getInstance());
            server.start();

            BossUSBManager.getInstance().startup(context);

            sStarted = true;
        }
        sAndroidLogger.setAndroidLoggerListener(addLog);
    }
    private static boolean sStarted;

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        // Inflate the menu; this adds items to the action bar if it is present.
        getMenuInflater().inflate(R.menu.menu_main, menu);
        return true;
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        // Handle action bar item clicks here. The action bar will
        // automatically handle clicks on the Home/Up button, so long
        // as you specify a parent activity in AndroidManifest.xml.
        int id = item.getItemId();

        //noinspection SimplifiableIfStatement
        if (id == R.id.action_clear) {
            mTextViewLog.setText("");
            return true;
        }

        return super.onOptionsItemSelected(item);
    }
}
