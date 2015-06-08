package com.workshoptwelve.boss.app.media.jdo;


import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;

import com.workshoptwelve.boss.app.sql.SQLHelper;
import com.workshoptwelve.brainiac.boss.common.util.Hash;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.HashMap;
import java.util.Map;

public class Artist {
    private static final Map<String, Artist> sArtistByName = new HashMap<>();
    private static final Map<String, Artist> sArtistByUid = new HashMap<>();

    private final String mUid;
    private final String mName;
    private String mGenreUid;

    private JSONObject mAsJSON = null;

    public Artist(Cursor c) {
        mUid = SQLHelper.getString(c,"uid");
        mName = SQLHelper.getString(c,"name");
        mGenreUid = SQLHelper.getString(c,"genreUid");
    }

    /*
    "    uid text(20) not null primary key, \n" +
            "    name text(20) not null, \n" +
            "    genreUid text(20), \n" +
            "    unique(name) \n" +
            */

    public Artist(String name) {
        mName = name;
        mUid = Hash.sha1("artist|" + mName);
    }

    public static Artist getArtistByName(String name) {
        return sArtistByName.get(name);
    }

    public static void loadArtists(SQLiteDatabase database) {
        Cursor c = database.rawQuery("select * from artist", null);
        try {
            while (c.moveToNext()) {
                Artist artist = new Artist(c);
                artist.addToLists();
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
        addToLists();
    }

    private void addToLists() {
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
