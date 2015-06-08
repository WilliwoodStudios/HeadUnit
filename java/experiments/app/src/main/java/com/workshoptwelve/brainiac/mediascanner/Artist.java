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
public class Artist {
    private static final Map<String, Artist> sArtistByName = new HashMap<>();
    private static final Map<String, Artist> sArtistByUid = new HashMap<>();

    private final String mUid;
    private final String mName;
    private String mGenreUid;

    private JSONObject mAsJSON = null;

    public Artist(Cursor c) {
        mUid = c.getString(c.getColumnIndex("uid"));
        mName = c.getString(c.getColumnIndex("name"));
        mGenreUid = c.getString(c.getColumnIndex("genreUid"));
    }

    /*
    "    uid text(20) not null primary key, \n" +
            "    name text(20) not null, \n" +
            "    genreUid text(20), \n" +
            "    unique(name) \n" +
            */

    public Artist(String name) {
        mName = name;
        mUid = MediaHelper.createUID("artist|" + mName);
    }

    public static Artist getArtistByName(String name) {
        return sArtistByName.get(name);
    }

    public static void loadArtists(SQLiteDatabase database) {
        Cursor c = database.rawQuery("select * from artist", null);
        try {
            while (c.moveToNext()) {
                Artist artist = new Artist(c);
                sArtistByName.put(artist.mName, artist);
                sArtistByUid.put(artist.mUid, artist);
            }
        } finally {
            c.close();
        }
    }

    public JSONObject toJSON() throws JSONException {
        if (mAsJSON == null) {
            JSONObject toReturn = new JSONObject();
            toReturn.put("uid", mUid);
            toReturn.put("name", mName);
            toReturn.put("genreUid", mGenreUid);
            mAsJSON = toReturn;
        }
        return mAsJSON;
    }

    private void clearJSON() {
        mAsJSON = null;
    }

    public String getGenreUid() {
        return mGenreUid;
    }

    public void setGenreUid(String genreUid) {
        mGenreUid = genreUid;
        clearJSON();
    }

    public String getName() {
        return mName;
    }

    public String getUid() {
        return mUid;
    }

    public void insert(SQLiteDatabase database) {
        database.execSQL("insert into artist (uid,name,genreUid) values (?,?,?)", new String[]{mUid, mName, mGenreUid});
        sArtistByName.put(mName, this);
        sArtistByUid.put(mUid, this);
    }

    public void update(SQLiteDatabase database) {
        database.execSQL("update artist set name = ?, genreUid = ? where uid = ?", new String[]{mName, mGenreUid, mUid});
    }

    public static JSONArray getAllArtistAsJSON() throws JSONException {
        JSONArray toReturn = new JSONArray();
        for (Artist a : sArtistByUid.values()) {
            toReturn.put(a.toJSON());

        }
        return toReturn;
    }
}
