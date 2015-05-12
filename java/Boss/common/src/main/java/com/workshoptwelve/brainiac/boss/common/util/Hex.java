package com.workshoptwelve.brainiac.boss.common.util;

import java.io.UnsupportedEncodingException;
import java.util.Arrays;

/**
 * Created by robwilliams on 15-05-11.
 */
public class Hex {
    public static final char [] hexChars = "0123456789abcdef".toCharArray();

    public static String dump(String value) {
        StringBuilder temp = new StringBuilder();
        dump(value,temp);
        return temp.toString();
    }

    public static void dump(byte [] values, StringBuilder result) {
        dump(values,0,values.length,result);
    }

    public static void dump(String values, StringBuilder result) {
        try {
            dump(values.getBytes("UTF-8"),result);
        } catch (UnsupportedEncodingException e) {
            result.append(e.getMessage());
        }
    }

    public static void dump(byte [] values, int offset, int length, StringBuilder result) {
        char[] line = new char[42];
        char[] chars = new char[16];

        for (int i = 0; i < length; ++i) {
            Arrays.fill(line, ' ');
            Arrays.fill(chars, ' ');

            int lineOffset = 0;

            for (int j = 0; j < 16 && i + j < length; ++j) {
                int next = values[i+j+offset] & 0xff;
                line[lineOffset++] = hexChars[(next >> 4) & 0xf];
                line[lineOffset++] = hexChars[next & 0xf];

                if (next >= ' ' && next <= 127) {
                    chars[j] = (char)next;
                } else {
                    chars[j] = '.';
                }

                if (j % 2 == 1) {
                    ++lineOffset;
                }
            }

            if (result.length() != 0) {
                result.append("\n");
            }
            result.append(line);
            result.append(chars);
        }
    }


}

