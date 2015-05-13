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

        for (int i = 0; i < length; i+=16) {
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

    public static boolean isHex(char c) {
        return (c >= '0' && c <= '9') || (c >= 'A' && c <= 'F') || (c >= 'a' && c <= 'f');
    }

    public static byte[] responseToBytes(String response) {
        int nibbleCount = 0;
        for (int i = 0; i < response.length(); ++i) {
            if (isHex(response.charAt(i))) {
                ++nibbleCount;
            }
        }
        byte[] toReturn = new byte[nibbleCount / 2];
        if (toReturn.length == 0) {
            return toReturn;
        }
        int offset = 0;
        int pos = 0;

        for (int i = 0; i < response.length(); ++i) {
            char c = response.charAt(i);
            if (isHex(c)) {
                if (c > 'Z') {
                    c -= 32;
                }
                byte v = (byte) (c < 'A' ? c - '0' : c - 'A' + 10);
                if (pos == 0) {
                    toReturn[offset] = (byte) (v << 4);
                    pos++;
                } else if (pos == 1) {
                    pos = 0;
                    toReturn[offset++] |= v;
                    if (offset == toReturn.length) {
                        break;
                    }
                }
            }
        }
        return toReturn;
    }


}

