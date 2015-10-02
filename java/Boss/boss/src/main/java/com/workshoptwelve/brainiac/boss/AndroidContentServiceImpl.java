package com.workshoptwelve.brainiac.boss;

import android.content.Context;

import com.workshoptwelve.brainiac.boss.common.content.AContentServiceImpl;
import com.workshoptwelve.brainiac.boss.common.log.Log;
import com.workshoptwelve.brainiac.boss.common.server.stream.HttpOutputStream;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;

/**
 * Created by robwilliams on 15-05-05.
 */
public class AndroidContentServiceImpl extends AContentServiceImpl {
    private final File mRootPath;
    private Log log = Log.getLogger(AndroidContentServiceImpl.class);


    private final Context mContext;

    public AndroidContentServiceImpl(Context context, String s) {
        super();
        mContext = context;
        mRootPath = new File(mContext.getFilesDir(), "content");
    }

    @Override
    public void sendPathToStream(String path, HttpOutputStream outputStream) throws IOException {
        if (path.indexOf("..") != -1) {
            throw new IOException("..");
        }
        File toSend = new File(mRootPath, path);
        if (toSend.isDirectory()) {
            toSend = new File(toSend, "index.html");
        }
        if (toSend.exists()) {
            outputStream.setResponse(200, "OK");
            FileInputStream fis = new FileInputStream(toSend);
            try {
                streamToStream(fis, outputStream);
            } finally {
                fis.close();
            }
        } else {
            outputStream.setResponse(404, "File not found");
        }
    }
}
