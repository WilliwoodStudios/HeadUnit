package com.workshoptwelve.brainiac.boss;

import android.content.ContentValues;
import android.content.Context;
import android.database.Cursor;
import android.database.SQLException;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;
import android.database.sqlite.SQLiteStatement;

import com.workshoptwelve.brainiac.boss.common.content.APropertyServiceImpl;

import org.json.JSONException;
import org.json.JSONObject;

/**
 * Created by robwilliams on 15-08-27.
 */
public class AndroidPropertyServiceImpl extends APropertyServiceImpl {
    private final Context mContext;

    public AndroidPropertyServiceImpl(Context context) {
        mContext = context;
        mPropertyOpenHelper = new PropertyOpenHelper();
    }

    private static final String TABLE = "property";
    private static final String COLUMN_NAME = "name";
    private static final String COLUMN_VALUE = "value";

    private static final String JSON_RESULT = "result";
    private static final String JSON_NAME = "name";
    private static final String JSON_VALUE = "value";
    private static final String JSON_USING_DEFAULT = "usingDefault";
    private static final String JSON_PROPERTY = "property";
    private static final String JSON_ERROR = "error";

    @Override
    public JSONObject set(String name, String value) throws JSONException {
        ContentValues values = new ContentValues();

        values.put(COLUMN_VALUE, value);

        SQLiteDatabase database = mPropertyOpenHelper.getWritableDatabase();

        try {
            int rows = database.update(TABLE, values, COLUMN_NAME + " = ?", new String[]{name});
            if (rows == 1) {
                // excellent.
            } else {
                // ignoring any error from the insert.
                values.put(COLUMN_NAME, name);
                database.insert(TABLE, null, values);
            }

            JSONObject toReturn = new JSONObject();

            toReturn.put(JSON_RESULT, 1);

            JSONObject property = new JSONObject();
            toReturn.put(JSON_PROPERTY, property);

            property.put(JSON_NAME, name);
            property.put(JSON_VALUE, value);

            return toReturn;
        } finally {
            database.close();
        }
    }

    @Override
    public JSONObject get(String name, String defaultValue) throws JSONException {
        SQLiteDatabase database = mPropertyOpenHelper.getReadableDatabase();
        try {
            Cursor cursor = database.query(TABLE, new String[]{COLUMN_VALUE}, COLUMN_NAME + " = ?", new String[]{name}, null, null, null);
            try {
                JSONObject toReturn = new JSONObject();
                JSONObject property = new JSONObject();
                toReturn.put(JSON_RESULT, 1);
                toReturn.put(JSON_PROPERTY, property);

                property.put(JSON_NAME, name);
                property.put(JSON_USING_DEFAULT, true);
                if (null == defaultValue) {
                    property.put(JSON_VALUE, JSONObject.NULL);
                } else {
                    property.put(JSON_VALUE, defaultValue);
                }
                if (cursor.moveToFirst()) {
                    try {
                        String toUse = cursor.getString(0);
                        if (toUse == null) {
                            property.put(JSON_VALUE, JSONObject.NULL);
                        } else {
                            property.put(JSON_VALUE, toUse);
                        }
                        property.put(JSON_USING_DEFAULT, false);
                    } catch (RuntimeException re) {
                        property.put(JSON_ERROR, re.getMessage());
                    }
                }
                return toReturn;
            } finally {
                cursor.close();
            }
        } finally {
            database.close();
        }
    }

    private PropertyOpenHelper mPropertyOpenHelper;

    private class PropertyOpenHelper extends SQLiteOpenHelper {
        private static final String DATABASE_NAME = "boss.property.db";
        private static final int DATABASE_VERSION = 100;

        private String SQL_CREATE_TABLES = "create table property (name varchar(200) not null primary key, value varchar(4000))";

        public PropertyOpenHelper() {
            super(mContext, DATABASE_NAME, null, DATABASE_VERSION);
        }

        @Override
        public void onCreate(SQLiteDatabase db) throws SQLException {
            db.execSQL(SQL_CREATE_TABLES);
        }

        @Override
        public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion) {

        }
    }
}
