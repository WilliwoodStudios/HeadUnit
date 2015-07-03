package com.workshoptwelve.brainiac.boss.common.util;

import java.io.IOException;
import java.io.OutputStream;

/**
 * Created by robwilliams on 15-06-30.
 */
public class CircularPipeTest {
    public static void main(String[] args) throws Exception {
        CircularPipe pipe = new CircularPipe(5);
        OutputStream outputStream = pipe.getOutputStream();
        CircularPipe.InputStream inputStream = pipe.getInputStream();

        outputStream.write(1);
        outputStream.write(2);
        outputStream.write(3);

        if (inputStream.available() != 3) {
            throw new IllegalStateException();
        }

        outputStream.write(4);
        outputStream.write(5);

        if (inputStream.available() != 5) {
            throw new IllegalStateException();
        }

        byte[] twoBytes = new byte[2];
        int readLength = inputStream.read(twoBytes);

        if (readLength != 2 || twoBytes[0] != 1 || twoBytes[1] != 2 || inputStream.available() != 3) {
            throw new IllegalStateException();
        }

        byte[] nextWrite = {6, 7, 8, 9, 10, 11, 12};
        outputStream.write(nextWrite);

        if (inputStream.available() != 5) {
            throw new IllegalStateException();
        }
        for (int i = 8; i < 13; ++i) {
            if (inputStream.read() != i) {
                throw new IllegalStateException();
            }
        }
        if (inputStream.available() != 0) {
            throw new IllegalStateException();
        }

        inputStream.close();
        if (inputStream.read() != -1) {
            throw new IllegalStateException();
        }

        secondTests();
        thirdTests();
    }

    private static void thirdTests() throws IOException {
        CircularPipe pipe = new CircularPipe(1);
        pipe.getOutputStream().close();
        try {
            pipe.getOutputStream().write(1);
            throw new IllegalStateException("Bad");
        } catch (IOException ioe) {
            // good
        }
    }

    private static void secondTests() throws Exception {
        byte[] buffer = new byte[1];
        final CircularPipe pipe = new CircularPipe(5);
        pipe.getOutputStream().write(1);
        int length = pipe.getInputStream().read(buffer, 0, 1, 100);
        if (length != 1) {
            throw new IllegalStateException();
        }
        if (buffer[0] != 1) {
            throw new IllegalStateException();
        }
        length = pipe.getInputStream().read(buffer, 0, 1, 100);
        if (length != 0) {
            throw new IllegalStateException("Not good!");
        }
        new Thread() {
            public void run() {
                try {
                    Thread.sleep(1000);
                } catch (InterruptedException ie) {
                }

                try {
                    pipe.getOutputStream().write(8);
                } catch (Throwable t) {

                }
            }
        }.start();
        System.out.println("About to read");
        int value = pipe.getInputStream().read();
        System.out.println("Read finished");
        if (value != 8) {
            throw new IllegalStateException();
        }
    }

}
