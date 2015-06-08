package com.workshoptwelve.brainiac.mediascanner;

import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.HashMap;
import java.util.Map;

/**
 * Created by robwilliams on 15-05-22.
 */
public class Genre {
    private static Map<String, Genre> sGenreByName = new HashMap<>();
    private static Map<String, Genre> sGenreByUid = new HashMap<>();
    private final String mUid;
    private final String mName;

    public Genre(Cursor cursor) {
        mUid = cursor.getString(cursor.getColumnIndex("uid"));
        mName = cursor.getString(cursor.getColumnIndex("name"));
    }

    public Genre(String name) {
        mName = name;
        mUid = MediaHelper.createUID("genre|" + name);
    }

    public static Genre getGenreByUid(String uid) {
        return sGenreByUid.get(uid);
    }

    public static void loadGenres(SQLiteDatabase database) {
        Cursor c = database.rawQuery("select * from genre", null);
        try {
            while (c.moveToNext()) {
                Genre toAdd = new Genre(c);
                sGenreByName.put(toAdd.mName, toAdd);
                sGenreByUid.put(toAdd.mUid, toAdd);
            }
        } finally {
            c.close();
        }
    }

    public static Genre findOrCreate(SQLiteDatabase database, String name) {
        Genre toReturn = sGenreByName.get(name);
        if (toReturn != null) {
            return toReturn;
        }

        toReturn = new Genre(name);
        toReturn.insert(database);
        sGenreByName.put(name, toReturn);
        sGenreByUid.put(toReturn.mUid, toReturn);
        return toReturn;
    }

    public JSONObject toJSON() throws JSONException {
        if (mAsJSON==null) {
            JSONObject toReturn = new JSONObject();
            toReturn.put("uid",mUid);
            toReturn.put("name",mName);
            mAsJSON = toReturn;
        }
        return mAsJSON;
    }

    private JSONObject mAsJSON;

    public void insert(SQLiteDatabase database) {
        database.execSQL("insert into genre (uid,name) values (?,?)", new String[]{mUid, mName});
    }

    public String getUid() {
        return mUid;
    }

    public static JSONArray getAllGenreAsJSON() throws JSONException {
        JSONArray toReturn = new JSONArray();
        for (Genre g : sGenreByUid.values()) {
            toReturn.put(g.toJSON());
        }
        return toReturn;
    }
}
