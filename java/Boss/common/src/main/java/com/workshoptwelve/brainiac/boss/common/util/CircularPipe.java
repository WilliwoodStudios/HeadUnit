package com.workshoptwelve.brainiac.boss.common.util;

import java.io.IOException;

/**
 * Created by robwilliams on 15-06-30.
 */
public class CircularPipe {
    int mWriteHead;
    int mLength;
    private byte[] mBuffer;
    private Object mLock = new Object();
    private boolean mClosed = false;
    private OutputStream mOutputStream = new OutputStream();
    private InputStream mInputStream = new InputStream();

    public CircularPipe(int size) {
        mBuffer = new byte[size];

        mWriteHead = 0;
        mLength = 0;
    }

    public OutputStream getOutputStream() {
        return mOutputStream;
    }

    public InputStream getInputStream() {
        return mInputStream;
    }

    private int getReadHead() {
        return (mBuffer.length + mWriteHead - mLength) % mBuffer.length;
    }

    class OutputStream extends java.io.OutputStream {
        private byte[] mWriteSingle = new byte[1];

        @Override
        public void write(int b) throws IOException {
            synchronized (mLock) {
                mWriteSingle[0] = (byte) b;
                write(mWriteSingle, 0, 1);
            }
        }

        @Override
        public void write(byte[] b, int off, int len) throws IOException {
            synchronized (mLock) {
                if (mClosed) {
                    throw new IOException("Closed");
                }

                while (len > 0) {
                    int spaceAfterWriteHead = mBuffer.length - mWriteHead;
                    int lenToWrite = len < spaceAfterWriteHead ? len : spaceAfterWriteHead;
                    System.arraycopy(b, off, mBuffer, mWriteHead, lenToWrite);

                    len -= lenToWrite;
                    off += lenToWrite;
                    mWriteHead += lenToWrite;
                    mWriteHead %= mBuffer.length;
                    mLength += lenToWrite;
                    if (mLength > mBuffer.length) {
                        mLength = mBuffer.length;
                    }
                }

                mLock.notifyAll();
            }
        }

        @Override
        public void close() throws IOException {
            synchronized (mLock) {
                mClosed = true;
                mLock.notifyAll();
            }
        }
    }

    private void lockWait() {
        try {
            mLock.wait();
        } catch (InterruptedException ie) {
        }
    }

    private void lockWait(long timeoutMs) {
        try {
            mLock.wait(timeoutMs);
        } catch (InterruptedException ie) {
        }
    }

    public class InputStream extends java.io.InputStream {
        private byte[] mReadSingle = new byte[1];

        @Override
        public int read() throws IOException {
            synchronized (mLock) {
                int toReturn = read(mReadSingle, 0, 1);
                if (toReturn < 0) {
                    return -1;
                }
                return mReadSingle[0] & 0xff;
            }
        }

        public void close() {
            synchronized (mLock) {
                mClosed = true;
                mLock.notifyAll();
            }
        }

        @Override
        public int read(byte[] b, int off, int len) throws IOException {
            synchronized (mLock) {
                while (!mClosed && mLength == 0) {
                    lockWait();
                }
                return readCommon(b, off, len);
            }
        }

        @Override
        public int available() throws IOException {
            synchronized (mLock) {
                return mLength;
            }
        }

        public int read(byte[] b, int off, int len, long timeoutMs) throws IOException {
            synchronized (mLock) {
                if (!mClosed && mLength == 0) {
                    lockWait(timeoutMs);
                }
                return readCommon(b, off, len);
            }
        }

        private int readCommon(byte[] b, int off, int len) {
            if (mLength > 0) {
                int toReturn = 0;
                while (len > 0 && mLength > 0) {
                    int readHead = getReadHead();
                    int distanceToEnd = mBuffer.length - readHead;
                    int lengthToRead = len < mLength ? len : mLength;
                    if (lengthToRead > distanceToEnd) {
                        lengthToRead = distanceToEnd;
                    }

                    System.arraycopy(mBuffer, readHead, b, off, lengthToRead);

                    mLength -= lengthToRead;
                    len -= lengthToRead;
                    off += lengthToRead;
                    toReturn += lengthToRead;
                }
                return toReturn;
            }
            if (mClosed) {
                return -1;
            }
            return 0;
        }
    }
}
