package com.workshoptwelve.brainiac.mediascanner;

import android.content.Context;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;

/**
 * Created by robwilliams on 15-05-22.
 */
class MediaSQLiteHelper extends SQLiteOpenHelper {
    private static final String CREATE_TABLES = "create table album ( \n" +
            "    uid text(20) not null primary key,  \n" +
            "    name text(20) not null,  \n" +
            "    artistUid text(20) not null,  \n" +
            "    year number,  \n" +
            "    artwork text(20), \n" +
            "    playcount number not null default 0, \n" +
            "    unique(name,artistUid) \n" +
            "); \n" +
            " \n" +
            "create table song ( \n" +
            "    uid text(20) not null primary key, \n" +
            "    name text(20) not null, \n" +
            "    duration number, \n" +
            "    trackNumber number, \n" +
            "    albumUid text(20) not null, \n" +
            "    path text(20) not null, \n" +
            "    playCount number not null default 0, \n" +
            "    skipCount number not null default 0, \n" +
            "    rating number not null default 0 \n" +
            "); \n" +
            " \n" +
            "create table artist ( \n" +
            "    uid text(20) not null primary key, \n" +
            "    name text(20) not null, \n" +
            "    genreUid text(20), \n" +
            "    unique(name) \n" +
            "); \n" +
            " \n" +
            "create table genre ( \n" +
            "    uid text(20) not null primary key, \n" +
            "    name text(20) not null, \n" +
            "    unique(name) \n" +
            ")";

    public MediaSQLiteHelper(Context context) {
        super(context, "media", null, 1);
    }

    @Override
    public void onCreate(SQLiteDatabase db) {
        for (String line : CREATE_TABLES.split(";")) {
            db.execSQL(line);
        }
    }

    @Override
    public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion) {

    }
}

