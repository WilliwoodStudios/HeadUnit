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

/**
 * Created by robwilliams on 15-05-22.
 */
public class Song {
    private static final Long ZERO = Long.valueOf(0);
    private static Map<String, Song> sSongsByAlbumAndName = new HashMap<>();
    /*
    "    uid text(20) not null primary key, \n" +
            "    name text(20) not null, \n" +
            "    duration number, \n" +
            "    albumUid text(20) not null, \n" +
            "    path text(20) not null, \n" +
            "    playCount number not null default 0, \n" +
            "    skipCount number not null default 0, \n" +
            */
    private final String mUid;
    private final String mName;
    private final String mAlbumUid;
    private Long mDuration;
    private Long mTrackNumber;
    private String mPath;
    private long mPlayCount;
    private long mSkipCount;
    private long mRating;
    private JSONObject mAsJSON;

    private Song(Cursor c) {
        mUid = SQLHelper.getString(c, "uid");
        mName = SQLHelper.getString(c, "name");
        mDuration = SQLHelper.getLong(c, "duration", null);
        mTrackNumber = SQLHelper.getLong(c, "trackNumber", null);
        mAlbumUid = SQLHelper.getString(c, "albumUid");
        mPath = SQLHelper.getString(c, "path");
        mPlayCount = SQLHelper.getLong(c, "playCount", ZERO);
        mSkipCount = SQLHelper.getLong(c, "skipCount", ZERO);
        mRating = SQLHelper.getLong(c, "rating", ZERO);

        addToLists();
    }

    public Song(Album album, String name) {
        mName = name;
        mAlbumUid = album.getUid();
        mUid = Hash.sha1("song|" + mAlbumUid + "|" + mName);
    }

    public static void loadSongs(SQLiteDatabase database) {
        Cursor c = database.rawQuery("select * from song", null);
        try {
            while (c.moveToNext()) {
                Song toAdd = new Song(c);
                toAdd.addToLists();
            }
        } finally {
            c.close();
        }
    }

    public static Song findSongByAlbumAndName(Album theAlbum, String name) {
        return sSongsByAlbumAndName.get(theAlbum.getUid() + "|" + name);
    }

    public static JSONArray getAllSongAsJSON() throws JSONException {
        JSONArray toReturn = new JSONArray();
        for (Song s : sSongsByAlbumAndName.values()) {
            toReturn.put(s.toJSON());
        }
        return toReturn;

    }

    public void update(SQLiteDatabase database) {
        database.execSQL("update song set name = ?, duration = ?, trackNumber = ?, albumUid = ?, path = ?, playCount = ?, skipCount = ?, rating = ? where uid = ?",
                new Object[]{mName, mDuration, mTrackNumber, mAlbumUid, mPath, mPlayCount, mSkipCount, mRating, mUid});
    }

    public void insert(SQLiteDatabase database) {
        database.execSQL("insert into song (name, duration, trackNumber, albumUid, path, playCount, skipCount, rating, uid) values (?,?,?,?,?,?,?,?,?)",
                new Object[]{mName, mDuration, mTrackNumber, mAlbumUid, mPath, mPlayCount, mSkipCount, mRating, mUid});
        addToLists();
    }

    public JSONObject toJSON() throws JSONException {
        if (mAsJSON == null) {
            JSONObject toReturn = new JSONObject();
            toReturn.put("name", mName);
            toReturn.put("duration", mDuration);
            toReturn.put("trackNumber", mTrackNumber);
            toReturn.put("albumUid", mAlbumUid);
            toReturn.put("playCount", mPlayCount);
            toReturn.put("skipCount", mSkipCount);
            toReturn.put("rating", mRating);
            toReturn.put("uid", mUid);
            mAsJSON = toReturn;
        }
        return mAsJSON;
    }

    private void addToLists() {
        sSongsByAlbumAndName.put(mAlbumUid + "|" + mName, this);
    }

    public String getUid() {
        return mUid;
    }

    public String getName() {
        return mName;
    }

    public Long getDuration() {
        return mDuration;
    }

    public void setDuration(Long duration) {
        this.mDuration = duration;
        clearJSON();
    }

    public void setTrackNumber(Long trackNumber) {
        mTrackNumber = trackNumber;
        clearJSON();

    }

    public String getAlbumUid() {
        return mAlbumUid;
    }

    public String getPath() {
        return mPath;
    }

    public void setPath(String path) {
        mPath = path;
        clearJSON();

    }

    private void clearJSON() {
        mAsJSON = null;
    }

    public long getPlayCount() {
        return mPlayCount;
    }

    public void incPlaycount() {
        ++mPlayCount;
    }

    public long getSkipCount() {
        return mSkipCount;
    }

    public void incSkipCount() {
        ++mSkipCount;
    }

    public long getRating() {
        return mRating;
    }
}
