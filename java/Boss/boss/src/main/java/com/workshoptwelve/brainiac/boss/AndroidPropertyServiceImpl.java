package com.workshoptwelve.brainiac.boss;

import android.content.ContentValues;
import android.content.Context;
import android.database.Cursor;
import android.database.SQLException;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;
import android.database.sqlite.SQLiteStatement;

import com.workshoptwelve.brainiac.boss.common.content.APropertyServiceImpl;
import com.workshoptwelve.brainiac.boss.common.log.Log;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.Iterator;
import java.util.List;

/**
 * Created by robwilliams on 15-08-27.
 */
public class AndroidPropertyServiceImpl extends APropertyServiceImpl {
    private final Context mContext;
    private static final Log log = Log.getLogger(AndroidPropertyServiceImpl.class);

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
    public JSONObject set(JSONObject valuesToUse) throws JSONException {
        SQLiteDatabase database = mPropertyOpenHelper.getWritableDatabase();

        JSONObject toReturn = new JSONObject();
        toReturn.put("result",1);

        JSONObject toReturnValues = new JSONObject();
        toReturn.put("values",toReturnValues);

        try {
            for (Iterator<String> nameIterator = valuesToUse.keys(); nameIterator.hasNext(); ) {
                String name = nameIterator.next();

                ContentValues values = new ContentValues();

                Object value = valuesToUse.get(name);
                toReturnValues.put(name,value);

                String valueToUse = String.valueOf(value);

                values.put(COLUMN_VALUE, valueToUse);

                int rows = database.update(TABLE, values, COLUMN_NAME + " = ?", new String[]{name});
                if (rows == 1) {
                    // excellent.
                } else {
                    // ignoring any error from the insert.
                    values.put(COLUMN_NAME, name);
                    database.insert(TABLE, null, values);
                }
            }
        } finally {
            database.close();
        }

        return toReturn;
    }

    @Override
    public JSONObject get(List<String> names, JSONObject defaultValues) throws JSONException {
        SQLiteDatabase database = mPropertyOpenHelper.getReadableDatabase();
        try {
            JSONObject toReturn = new JSONObject();
            toReturn.put(JSON_RESULT, 1);

            JSONObject toReturnValues = new JSONObject();
            toReturn.put("values",toReturnValues);

            for (String name : names) {
                Cursor cursor = database.query(TABLE, new String[]{COLUMN_VALUE}, COLUMN_NAME + " = ?", new String[]{name}, null, null, null);
                try {
                    if (cursor.moveToFirst()) {
                        try {
                            String toUse = cursor.getString(0);
                            if (toUse == null) {
                                toReturnValues.put(name,JSONObject.NULL);
                            } else {
                                if (toUse.startsWith("{")) {
                                    toReturnValues.put(name,new JSONObject(toUse));
                                } else if (toUse.startsWith("[")) {
                                    toReturnValues.put(name,new JSONArray(toUse));
                                } else {
                                    toReturnValues.put(name,toUse);
                                }
                            }
                        } catch (RuntimeException re) {
                            log.e("Could not properly read property",re);
                        }
                    } else {
                        if (defaultValues != null && defaultValues.has(name)) {
                            toReturnValues.put(name,defaultValues.get(name));
                        } else {
                            toReturnValues.put(name,JSONObject.NULL);
                        }
                    }
                } finally {
                    cursor.close();
                }
            }
            return toReturn;
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
