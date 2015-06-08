package com.workshoptwelve.brainiac.mediascanner;

import android.database.sqlite.SQLiteDatabase;
import android.media.MediaMetadataRetriever;
import android.os.Bundle;
import android.os.Environment;
import android.support.v7.app.ActionBarActivity;
import android.text.TextUtils;
import android.util.Log;
import android.view.Menu;
import android.view.MenuItem;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.File;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class MainActivity extends ActionBarActivity {

    private int mMediaCount;
    private MediaMetadataRetriever mRetriever = new MediaMetadataRetriever();
    private Pattern mStripNumberPattern = Pattern.compile("(^[0-9]+)([\\- .]+)(.*)");
    private MediaSQLiteHelper mMySqliteHelper = new MediaSQLiteHelper(this);
    private Map<String, Genre> mGenreByName = new HashMap<>();

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

    }

    private void syncMediaFile(SQLiteDatabase database, File file) {
        mRetriever.setDataSource(file.getAbsolutePath());

        String artist = mRetriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_ARTIST);
        String title = mRetriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_TITLE);
        String genre = mRetriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_GENRE);
        String album = mRetriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_ALBUM);
        String number = mRetriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_CD_TRACK_NUMBER);
        String duration = mRetriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_DURATION);
        String year = mRetriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_YEAR);

        String[] pathParts = file.getAbsolutePath().split("/");

        if (genre == null) {
            genre = getResources().getString(R.string.media_genre_unknown);
        }

        Genre theGenre = Genre.findOrCreate(database, genre);

        if (artist == null) {
            if (pathParts.length > 3) {
                artist = pathParts[pathParts.length - 3];
            } else {
                artist = getResources().getString(R.string.media_artist_unknown);
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
                album = getResources().getString(R.string.media_album_unknown);
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

        if (file.getAbsolutePath().indexOf("Kra")!=-1) {
            Log.v("Diana","Sauce");
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

        byte[] picture = mRetriever.getEmbeddedPicture();

        String pic = picture == null ? "no pic" : "yes pic!";

        ++mMediaCount;

        Log.d("MEDIA", String.format("%s %s %s %s %s %s %s %s", number, artist, album, title, pic, genre, duration, file.getAbsolutePath()));
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

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        // Inflate the menu; this adds items to the action bar if it is present.
        getMenuInflater().inflate(R.menu.menu_main, menu);
        return true;
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        // Handle action bar item clicks here. The action bar will
        // automatically handle clicks on the Home/Up button, so long
        // as you specify a parent activity in AndroidManifest.xml.
        int id = item.getItemId();

        //noinspection SimplifiableIfStatement
        if (id == R.id.action_settings) {
            new Thread() {
                public void run() {
                    mMediaCount = 0;
                    SQLiteDatabase database = mMySqliteHelper.getWritableDatabase();

                    Genre.loadGenres(database);
                    Artist.loadArtists(database);
                    Album.loadAlbums(database);
                    Song.loadSongs(database);

                    syncMediaLibrary(database, Environment.getExternalStorageDirectory());
                    Log.d("MEDIA", "Media Count: " + mMediaCount);

                    try {
                        JSONObject values = new JSONObject();
                        values.put("songs", Song.getAllSongAsJSON());
                        values.put("genres", Genre.getAllGenreAsJSON());
                        values.put("artists", Artist.getAllArtistAsJSON());
                        values.put("albums", Album.getAllAlbumAsJSON());
                        values.put("currentSong", null);

                        Log.e("JSON",values.toString(2));
                    } catch (JSONException je) {
                        // togo log.
                    }

                }
            }.start();
            return true;
        }

        return super.onOptionsItemSelected(item);
    }

}
