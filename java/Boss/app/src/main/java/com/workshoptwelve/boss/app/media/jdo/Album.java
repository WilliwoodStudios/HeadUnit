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

public class Album {
    private static Map<String, Album> sAlbumByArtistAndName = new HashMap<>();
    private static Map<String, Album> sAlbumByUid = new HashMap<>();
    private final String mUid;
    private final String mName;
    private final String mArtistUid;
    private Long mYear;
    private String mArtwork;
    private long mPlaycount;
    private JSONObject mAsJSON;

    private Album(Cursor c) {
        mUid = SQLHelper.getString(c,"uid");
        mName = SQLHelper.getString(c,"name");
        mArtistUid = SQLHelper.getString(c,"artistUid");

        int yearCol = c.getColumnIndex("year");
        if (c.isNull(yearCol)) {
            // cool
        } else {
            mYear = c.getLong(yearCol);
        }

        int artCol = c.getColumnIndex("artwork");
        if (c.isNull(artCol)) {
            // ok.
        } else {
            mArtwork = c.getString(artCol);
        }

        mPlaycount = c.getInt(c.getColumnIndex("playcount"));
    }

    public Album(Artist artist, String name) {
        mArtistUid = artist.getUid();
        mName = name;
        mUid = Hash.sha1("album|" + mArtistUid + "|" + mName);
    }

    public static Album findAlbumByArtistAndName(Artist artist, String name) {
        return sAlbumByArtistAndName.get(artist.getUid() + "|" + name);
    }

    public static Album findAlbumByUid(String uid) {
        return sAlbumByUid.get(uid);
    }

    public static void loadAlbums(SQLiteDatabase database) {
        Cursor c = database.rawQuery("select * from album", null);
        while (c.moveToNext()) {
            Album toAdd = new Album(c);
            toAdd.addToLists();
        }
    }

    public JSONObject toJSON() throws JSONException {
        if (mAsJSON == null) {
            JSONObject toReturn = new JSONObject();
            toReturn.put("uid", mUid);
            toReturn.put("name", mName);
            toReturn.put("artistUid", mArtistUid);
            toReturn.put("year", mYear);
            toReturn.put("artwork", null);
            toReturn.put("playcount", mPlaycount);
            mAsJSON = toReturn;
        }
        return mAsJSON;
    }

    public void insert(SQLiteDatabase database) {
        database.execSQL("insert into album (uid,name,artistUid,year,artwork,playcount) values (?,?,?,?,?,?)", new Object[]{mUid, mName, mArtistUid, mYear, mArtwork, mPlaycount});
        addToLists();
    }

    private void addToLists() {
        sAlbumByUid.put(mUid, this);
        sAlbumByArtistAndName.put(mArtistUid + "|" + mName, this);
    }

    public void update(SQLiteDatabase database) {
        database.execSQL("update album set name = ?, artistUid = ?, year = ?, artwork = ?, playcount = ? where uid = ?", new Object[]{mName, mArtistUid, mYear, mArtwork, mPlaycount, mUid});
    }

    public Long getYear() {
        return mYear;
    }

    public void setYear(long year) {
        this.mYear = year;
        clearJSON();
    }

    private void clearJSON() {
        mAsJSON = null;
    }

    public String getUid() {
        return mUid;
    }

    public static JSONArray getAllAlbumAsJSON() throws JSONException {
        JSONArray toReturn = new JSONArray();
        for (Album a : sAlbumByUid.values()) {
            toReturn.put(a.toJSON());
        }
        return toReturn;
    }
}
