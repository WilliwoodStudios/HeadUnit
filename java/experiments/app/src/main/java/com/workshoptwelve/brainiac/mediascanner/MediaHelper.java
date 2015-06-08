package com.workshoptwelve.brainiac.mediascanner;

import android.database.Cursor;

import java.security.MessageDigest;

/**
 * Created by robwilliams on 15-05-22.
 */
public class MediaHelper {
    static String createUID(String value) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA1");
            md.update(value.getBytes());
            byte[] digest = md.digest();
            String toReturn = "";
            for (byte x : digest) {
                if ((x & 0xff) < 16) {
                    toReturn += "0";
                }
                toReturn += Integer.toString(x & 0xff,16);
            }
            return toReturn;
        } catch (Exception e) {
            return value;
        }
    }

    public static String getString(Cursor c, String name) {
        return c.getString(c.getColumnIndex(name));
    }

    public static Long getLong(Cursor c, String name, Long defaultValue) {
        int colIndex = c.getColumnIndex(name);
        if (c.isNull(colIndex)) {
            return defaultValue;
        }
        return c.getLong(colIndex);
    }

}
