package com.workshoptwelve.boss.app.sql;

import android.database.Cursor;

public class SQLHelper {
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
