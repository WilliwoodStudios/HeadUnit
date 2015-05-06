package com.workshoptwelve.brainiac.server.common.content;

import com.workshoptwelve.brainiac.server.common.stream.HttpOutputStream;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;

/**
 * Created by robwilliams on 15-04-12.
 */
public abstract class AContentServiceImpl {
    public abstract void sendPathToStream(String path, HttpOutputStream outputStream) throws IOException;

    public void streamToStream(InputStream inputStream, OutputStream outputStream) throws IOException {
        byte[] buffer = new byte[20000];
        int readLength;
        do {
            readLength = inputStream.read(buffer);
            if (readLength > 0) {
                outputStream.write(buffer, 0, readLength);
            }
        } while (readLength > 0);
    }
}
