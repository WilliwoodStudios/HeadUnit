package com.workshoptwelve.brainiac.boss.common.server.stream;

import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.List;

/**
 * Created by robwilliams on 15-05-05.
 */
public class HttpOutputStream extends OutputStream {
    private OutputStream mBase;

    private boolean mHeadersSent = false;
    private Mode mMode;

    private int mResponseCode = 500;
    private String mResponseText = "Not set in code";
    private ByteArrayOutputStream mBuffer;

    private List<String> mHeaders = new ArrayList<String>();

    public void write(JSONObject toWrite) throws IOException {
        if (mBase != null) {
            write(toWrite.toString().getBytes());
        }
    }

    public enum Mode {
        CHUNKED,
        BUFFERED,
        RAW
    }

    public HttpOutputStream() {
        setMode(Mode.BUFFERED);
    }

    public void setBase(OutputStream base) {
        mBase = base;
        if (mBuffer != null) {
            mBuffer.reset();
        }
        mHeadersSent = false;
        mHeaders.clear();
    }

    public void setResponse(int responseCode, String responseText) throws IOException {
        if (mHeadersSent) {
            throw new IOException("Headers already sent");
        }

        mResponseCode = responseCode;
        mResponseText = responseText;
    }

    public void addHeader(String name, String value) {
        mHeaders.add(name + ": " + value);
    }

    public void setMode(Mode mode) {
        if (mode == mMode) {
            return;
        }
        mMode = mode;
        if (mMode == Mode.BUFFERED) {
            mBuffer = new ByteArrayOutputStream();
        } else {
            mBuffer = null;
        }
    }

    @Override
    public void write(byte[] b) throws IOException {
        write(b, 0, b.length);
    }

    @Override
    public void write(byte[] b, int off, int len) throws IOException {
        if (mBase != null) {
            if (Mode.CHUNKED == mMode) {
                if (!mHeadersSent) {
                    sendHeaders();
                }
                // TODO send.

            } else if (Mode.BUFFERED == mMode) {
                mBuffer.write(b, off, len);
            } else {
                mBase.write(b, off, len);
            }
        } else {
            // TODO log.
        }
    }

    @Override
    public void flush() throws IOException {
        if (mBase != null) {
            if (mMode == Mode.RAW) {
                mBase.flush();
            } else {
                // Chunked and buffered not flushed like this.
            }
        } else {
            // TODO log.
        }
    }

    @Override
    public void close() throws IOException {
        if (mBase != null) {
            if (mMode == Mode.RAW) {
                mBase.close();
            } else if (mMode == Mode.BUFFERED) {
                if (!mHeadersSent) {
                    sendHeaders();
                }
                mBase.write(mBuffer.toByteArray());
                mBuffer.reset();
            } else if (mMode == Mode.CHUNKED) {
                // TODO.
            }

            mBase.flush();

            mBase = null;
        }
    }

    private byte[] mWriteArray = new byte[1];

    @Override
    public void write(int b) throws IOException {
        mWriteArray[0] = (byte) b;
        write(mWriteArray, 0, 1);
    }

    private void sendHeaders() throws IOException {
        if (mHeadersSent) {
            throw new IOException("Headers already sent");
        }

        if (mMode == Mode.BUFFERED) {
            addHeader("Content-Length", String.valueOf(mBuffer.size()));
        }

        if (mMode == Mode.BUFFERED || mMode == Mode.CHUNKED) {
            addHeader("Connection", "keep-alive");
        }

        addHeader("Access-Control-Allow-Origin","*");

        ByteArrayOutputStream headerBuffer = new ByteArrayOutputStream();

        headerBuffer.write(sHttp);
        headerBuffer.write(' ');
        headerBuffer.write(String.valueOf(mResponseCode).getBytes());
        headerBuffer.write(' ');
        headerBuffer.write(mResponseText.getBytes());
        headerBuffer.write(sCrLf);

        for (String item : mHeaders) {
            headerBuffer.write(item.getBytes());
            headerBuffer.write(sCrLf);
        }

        headerBuffer.write(sCrLf);

        mBase.write(headerBuffer.toByteArray());

        mHeadersSent = true;
        mHeaders.clear();
    }

    private static final byte[] sHttp = "HTTP/1.1".getBytes();
    private static final byte[] sCrLf = "\r\n".getBytes();

}
