package com.workshoptwelve.boss.app;

import android.content.Context;

import com.workshoptwelve.brainiac.boss.common.content.AContentServiceImpl;
import com.workshoptwelve.brainiac.boss.common.server.stream.HttpOutputStream;

import java.io.IOException;
import java.io.InputStream;

/**
 * Created by robwilliams on 15-05-05.
 */
public class AndroidContentServiceImpl extends AContentServiceImpl {

    private final Context mContext;

    public AndroidContentServiceImpl(Context context, String s) {
        super();
        mContext = context;
    }

    @Override
    public void sendPathToStream(String path, HttpOutputStream outputStream) throws IOException {
        InputStream inputStream = mContext.getAssets().open(path);
        try {
            outputStream.setResponse(200,"OK");
            streamToStream(inputStream, outputStream);
        } finally {
            inputStream.close();
        }
    }
}
