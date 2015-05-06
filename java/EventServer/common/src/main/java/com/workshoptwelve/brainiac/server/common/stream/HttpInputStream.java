package com.workshoptwelve.brainiac.server.common.stream;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Created by robwilliams on 15-05-05.
 */
public class HttpInputStream extends InputStream {
    private InputStream mBase;

    private boolean mHeadersRead = false;
    private List<String> mHeaders = new ArrayList<String>();

    public HttpInputStream() {
    }

    public void setBase(InputStream base) {
        mBase = base;
        mHeadersRead = false;
        mHeaders = Collections.emptyList();
    }

    private byte [] mReadHeaderBuffer = new byte[2000];

    public List<String> readHeaders() throws IOException {
        if (mHeadersRead) {
            return mHeaders;
        }
        // Log.d();
        byte[] buffer = mReadHeaderBuffer;
        int lineStart;
        int readLength;
        String lineInProgress = "";
        ArrayList<String> toReturn = new ArrayList<String>();
        do {
            readLength = mBase.read(buffer);
            lineStart = 0;
            for (int i = 0; i < readLength; ++i) {
                if (i > 0 && buffer[i - 1] == '\r' && buffer[i] == '\n') {
                    int length = i - lineStart - 1;
                    if (length == 0) {
                        mHeadersRead = true;
                        mHeaders = Collections.unmodifiableList(toReturn);
                        return mHeaders;
                    } else {
                        if (lineInProgress.length() != 0) {
                            String newLine = lineInProgress + new String(buffer, lineStart, length);
                            toReturn.add(newLine);
                        } else {
                            toReturn.add(new String(buffer, lineStart, length));
                        }
                        lineStart = i + 1;
                    }
                }
            }
            if (lineStart < readLength) {
                lineInProgress += new String(buffer, lineStart, readLength - lineStart);
            } else {
                lineInProgress = "";
            }

        } while (lineInProgress.length() > 10000 || toReturn.size() > 100);

        throw new IOException("Corrupt headers.");
    }

    @Override
    public int read(byte[] b) throws IOException {
        return mBase.read(b);
    }

    @Override
    public int read(byte[] b, int off, int len) throws IOException {
        return mBase.read(b, off, len);
    }

    @Override
    public long skip(long n) throws IOException {
        throw new IOException("Not supported");
    }

    @Override
    public int available() throws IOException {
        return mBase.available();
    }

    @Override
    public void close() throws IOException {
        mBase = null;
    }

    @Override
    public synchronized void mark(int readlimit) {
    }

    @Override
    public synchronized void reset() throws IOException {
        throw new IOException("Not supported");
    }

    @Override
    public boolean markSupported() {
        return false;
    }

    @Override
    public int read() throws IOException {
        return mBase.read();
    }
}
