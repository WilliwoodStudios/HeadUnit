package com.workshoptwelve.server.desktop;

import com.workshoptwelve.brainiac.server.common.AEndPoint;
import com.workshoptwelve.brainiac.server.common.content.AContentServiceImpl;
import com.workshoptwelve.brainiac.server.common.log.Log;
import com.workshoptwelve.brainiac.server.common.stream.HttpOutputStream;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.OutputStream;

/**
 * Created by robwilliams on 15-04-12.
 */
public class DesktopContentServiceImpl extends AContentServiceImpl {
    private final String mRootPath;

    public DesktopContentServiceImpl(String rootPath) {
        if (!rootPath.endsWith("/")) {
            rootPath += "/";
        }
        mRootPath = rootPath;
    }

    @Override
    public void sendPathToStream(String path, HttpOutputStream outputStream) throws IOException {
        Log.d(path);
        File file = new File(mRootPath + path);
        if (file.exists()) {
            FileInputStream fis = new FileInputStream(file);
            try {
                streamToStream(fis,outputStream);
            } finally {
                close(fis);
            }
        } else {
            AEndPoint.sendHeaders(404,"File not found",outputStream);
            return;
        }

    }

    protected void close(FileInputStream fis) {
        try {
            fis.close();
        } catch (Throwable t) {
            // consume
        }
    }
}
