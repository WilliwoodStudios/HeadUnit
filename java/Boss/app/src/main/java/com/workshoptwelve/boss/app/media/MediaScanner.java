package com.workshoptwelve.boss.app.media;

import android.content.Context;
import android.content.res.Resources;
import android.database.sqlite.SQLiteDatabase;
import android.media.MediaMetadataRetriever;
import android.os.Environment;
import android.text.TextUtils;

import com.workshoptwelve.boss.app.R;
import com.workshoptwelve.boss.app.media.jdo.Album;
import com.workshoptwelve.boss.app.media.jdo.Artist;
import com.workshoptwelve.boss.app.media.jdo.Genre;
import com.workshoptwelve.boss.app.media.jdo.MediaSQLiteHelper;
import com.workshoptwelve.boss.app.media.jdo.Song;
import com.workshoptwelve.brainiac.boss.common.log.Log;
import com.workshoptwelve.brainiac.boss.common.threading.ThreadPool;

import java.io.File;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Created by robwilliams on 15-05-22.
 */
public class MediaScanner {
    private static final Log log = Log.getLogger(MediaScanner.class);
    private final Context mContext;
    private int mMediaCount;

    private Pattern mStripNumberPattern = Pattern.compile("(^[0-9]+)([\\- .]+)(.*)");
    private MediaSQLiteHelper mMySqliteHelper;
    private boolean mScanInProgress;
    public Runnable mScanner = new Runnable() {
        public void run() {
            doScan();
        }
    };

    public MediaScanner(Context context) {
        log.setLogLevel(Log.Level.v);
        mContext = context;
        mMySqliteHelper = new MediaSQLiteHelper(mContext);
    }

    private void doScan() {
        try {
            mMediaCount = 0;
            SQLiteDatabase database = mMySqliteHelper.getWritableDatabase();

            Genre.loadGenres(database);
            Artist.loadArtists(database);
            Album.loadAlbums(database);
            Song.loadSongs(database);

            syncMediaLibrary(database, Environment.getExternalStorageDirectory());
        } finally {
            synchronized (this) {
                mScanInProgress = false;
            }
        }
    }


    private Resources getResources() {
        return mContext.getResources();
    }


    public synchronized void startScan() {
        if (mScanInProgress) {
            log.w("Not scanning - a doScan is already in progress.");
            return;
        }
        mScanInProgress = true;
        ThreadPool.getInstance().run(mScanner);
    }

    private void syncMediaFile(SQLiteDatabase database, File file) {
        MediaMetadataRetriever retriever = new MediaMetadataRetriever();
        try {
            retriever.setDataSource(file.getAbsolutePath());

            String artist = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_ARTIST);
            String title = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_TITLE);
            String genre = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_GENRE);
            String album = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_ALBUM);
            String number = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_CD_TRACK_NUMBER);
            String duration = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_DURATION);
            String year = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_YEAR);

            String[] pathParts = file.getAbsolutePath().split("/");

            if (genre == null) {
                genre = getResources().getString(R.string.media_unknown_genre);
            }

            Genre theGenre = Genre.findOrCreate(database, genre);

            if (artist == null) {
                if (pathParts.length > 3) {
                    artist = pathParts[pathParts.length - 3];
                } else {
                    artist = getResources().getString(R.string.media_unknown_artist);
                }
            }

            Artist theArtist = Artist.getArtistByName(artist);
            if (theArtist == null) {
                theArtist = new Artist(artist);
                theArtist.setGenreUid(theGenre.getUid());
                theArtist.insert(database);
            }

            if (album == null) {
                if (pathParts.length > 3) {
                    album = pathParts[pathParts.length - 2];
                } else {
                    album = getResources().getString(R.string.media_unknown_album);
                }
            }

            Album theAlbum = Album.findAlbumByArtistAndName(theArtist, album);
            if (theAlbum == null) {
                theAlbum = new Album(theArtist, album);
                theAlbum.insert(database);
            }

            if (theAlbum.getYear() == null && !TextUtils.isEmpty(year)) {
                try {
                    long value = Long.parseLong(year);
                    if (value != 0) {
                        theAlbum.setYear(value);
                        theAlbum.update(database);
                    }
                } catch (NumberFormatException nfe) {
                    // todo log.
                }
            }

            Long trackNumber = null;
            if (number == null || number.equals("0")) {
                String fileName = pathParts[pathParts.length - 1];
                Matcher matcher = mStripNumberPattern.matcher(fileName);
                if (matcher.matches()) {
                    number = matcher.group(1);
                    trackNumber = Long.parseLong(number);
                } else {
                    number = "";
                }
            } else {
                try {
                    trackNumber = Long.valueOf(number);
                } catch (NumberFormatException nfe) {
                    // todo log.
                }
            }

            if (title == null) {
                String fileName = pathParts[pathParts.length - 1];
                int dot = fileName.lastIndexOf('.');
                if (dot != -1) {
                    fileName = fileName.substring(0, dot);
                }
                title = fileName;
            }

            Matcher matcher = mStripNumberPattern.matcher(title);
            if (matcher.matches()) {
                String numberPart = matcher.group(1);
                if (trackNumber != null && Long.parseLong(numberPart) == trackNumber) {
                    String oldTitle = title;
                    title = matcher.group(3);
                    if (TextUtils.isEmpty(title.trim())) {
                        title = oldTitle;
                    }
                }
            }

            Long durationAsLong = null;
            if (duration != null) {
                durationAsLong = Long.parseLong(duration);
                if (durationAsLong == 0) {
                    durationAsLong = null;
                }
            }

            Song theSong = Song.findSongByAlbumAndName(theAlbum, title);
            if (theSong == null) {
                theSong = new Song(theAlbum, title);
                theSong.setDuration(durationAsLong);
                theSong.setTrackNumber(trackNumber);
                theSong.setPath(file.getAbsolutePath());
                theSong.insert(database);
            }

            byte[] picture = retriever.getEmbeddedPicture();

            String pic = picture == null ? "no pic" : "yes pic!";

            ++mMediaCount;

            log.v("MEDIA", String.format("%s %s %s %s %s %s %s %s", number, artist, album, title, pic, genre, duration, file.getAbsolutePath()));
        } finally {
            retriever.release();
        }

    }

    private void syncMediaLibrary(SQLiteDatabase database, File file) {
        if (file.isDirectory()) {
            for (File child : file.listFiles()) {
                if (child.isDirectory()) {
                    syncMediaLibrary(database, child);
                } else if (child.getName().toLowerCase().endsWith("mp3") || child.getName().toLowerCase().endsWith("m4a")) {
                    syncMediaFile(database, child);
                }
            }
        }
    }
}
