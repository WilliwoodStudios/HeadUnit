package com.workshoptwelve.boss.app.media.jdo;

import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;

import com.workshoptwelve.boss.app.sql.SQLHelper;
import com.workshoptwelve.brainiac.boss.common.log.Log;
import com.workshoptwelve.brainiac.boss.common.util.Hash;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.HashMap;
import java.util.Map;

public class Genre {
    private static final Log log = Log.getLogger(Genre.class);
    static {
        log.setLogLevel(Log.Level.v);
    }

    private static Map<String, Genre> sGenreByName = new HashMap<>();
    private static Map<String, Genre> sGenreByUid = new HashMap<>();
    private final String mUid;
    private final String mName;
    private JSONObject mAsJSON;

    public Genre(Cursor cursor) {
        mUid = SQLHelper.getString(cursor, "uid");
        mName = SQLHelper.getString(cursor, "name");
    }

    public Genre(String name) {
        mName = name;
        mUid = Hash.sha1("genre|" + name);
    }

    public static Genre getGenreByUid(String uid) {
        return sGenreByUid.get(uid);
    }

    public static void loadGenres(SQLiteDatabase database) {
        log.v();
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
        log.v(name);
        Genre toReturn = sGenreByName.get(name);
        if (toReturn != null) {
            return toReturn;
        }
        log.v("By name did not contain",name);

        toReturn = new Genre(name);
        toReturn.insert(database);
        sGenreByName.put(name, toReturn);
        sGenreByUid.put(toReturn.mUid, toReturn);
        log.v("Current content of the lists",sGenreByName,sGenreByUid);
        return toReturn;
    }

    public static JSONArray getAllGenreAsJSON() throws JSONException {
        JSONArray toReturn = new JSONArray();
        for (Genre g : sGenreByUid.values()) {
            toReturn.put(g.toJSON());
        }
        return toReturn;
    }

    public JSONObject toJSON() throws JSONException {
        if (mAsJSON == null) {
            JSONObject toReturn = new JSONObject();
            toReturn.put("uid", mUid);
            toReturn.put("name", mName);
            mAsJSON = toReturn;
        }
        return mAsJSON;
    }

    public void insert(SQLiteDatabase database) {
        database.execSQL("insert into genre (uid,name) values (?,?)", new String[]{mUid, mName});
    }

    public String getUid() {
        return mUid;
    }
}
