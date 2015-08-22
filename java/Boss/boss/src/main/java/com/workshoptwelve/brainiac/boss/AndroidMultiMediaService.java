package com.workshoptwelve.brainiac.boss;

import android.content.Context;
import android.media.MediaPlayer;
import android.net.Uri;
import android.os.Environment;

import com.workshoptwelve.brainiac.boss.common.error.BossError;
import com.workshoptwelve.brainiac.boss.common.error.BossException;
import com.workshoptwelve.brainiac.boss.common.event.Event;
import com.workshoptwelve.brainiac.boss.common.event.EventService;
import com.workshoptwelve.brainiac.boss.common.event.EventType;
import com.workshoptwelve.brainiac.boss.common.multimedia.AMultiMediaServiceImpl;
import com.workshoptwelve.brainiac.boss.common.util.FileUtil;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.File;
import java.io.IOException;
import java.net.URLDecoder;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;

/**
 * Created by robwilliams on 15-05-05.
 */
public class AndroidMultiMediaService extends AMultiMediaServiceImpl implements MediaPlayer.OnCompletionListener {
    /**
     * Songs that are being played - in order.
     */
    private List<Song> mBaseSongList;

    /**
     * Songs that are being played - in play order - (it might be shuffled)
     */
    private List<Song> mEffectiveSongList;

    private Song mPlayingSong;

    private boolean mPlayingSongIsPaused;

    private int mPlayingSongPosition = 0;

    private MediaPlayer mMediaPlayer;

    enum RepeatMode {
        NONE,
        ONE,
        ALL
    };

    private RepeatMode mRepeatMode = RepeatMode.ALL;

    private boolean mShuffle = false;

    private interface Songable {
        List<Song> getSongs();
    }
    private class Genre implements Songable {
        private String uid;
        private String name;

        private ArrayList<Artist> mGenreArtists = new ArrayList<>();
        private ArrayList<Album> mGenreAlbums = new ArrayList<>();
        private ArrayList<Song> mGenreSongs = new ArrayList<>();

        public Genre(JSONObject source) throws JSONException {
            this.uid = source.getString("uid");
            this.name = source.getString("name");

            mGenres.add(this);
            mGenresByUid.put(uid, this);
        }

        public void addSong(Artist artist, Album album, Song song) {
            if (!mGenreArtists.contains(artist)) {
                mGenreArtists.add(artist);
            }
            if (!mGenreAlbums.contains(album)) {
                mGenreAlbums.add(album);
            }
            if (!mGenreSongs.contains(song)) {
                mGenreSongs.add(song);
            }
        }

        public List<Song> getSongs() {
            Collections.sort(mGenreArtists, new Comparator<Artist>() {
                @Override
                public int compare(Artist lhs, Artist rhs) {
                    return lhs.name.compareToIgnoreCase(rhs.name);
                }
            });
            ArrayList<Song> toReturn = new ArrayList<>();
            for (Artist artist : mGenreArtists) {
                toReturn.addAll(artist.getSongs());
            }
            return toReturn;
        }
    }

    private class Artist implements Songable {
        private String uid;
        private String name;
        private String genreUid;
        private int playCount;

        private ArrayList<Album> mArtistAlbums = new ArrayList<>();
        private ArrayList<Song> mArtistSongs = new ArrayList<>();

        public Artist(JSONObject source) throws JSONException {
            uid = source.getString("uid");
            name = source.getString("name");
            genreUid = source.getString("genreUid");
            playCount = source.getInt("playCount");

            mArtists.add(this);
            mArtistsByUid.put(uid, this);
        }

        public void addSong(Album album, Song song) {
            if (!mArtistAlbums.contains(album)) {
                mArtistAlbums.add(album);
            }
            if (!mArtistSongs.contains(song)) {
                mArtistSongs.add(song);
            }
            mGenresByUid.get(genreUid).addSong(this, album, song);
        }

        public List<Song> getSongs() {
            Collections.sort(mArtistAlbums, new Comparator<Album>() {
                @Override
                public int compare(Album lhs, Album rhs) {
                    return lhs.name.compareTo(rhs.name);
                }
            });
            ArrayList<Song> toReturn = new ArrayList<>();
            for (Album album : mArtistAlbums) {
                toReturn.addAll(album.getSongs());
            }
            return toReturn;
        }
    }

    private class Album implements Songable {
        private final String uid;
        private final String name;
        private final String artistUid;
        private final int year;
        private final String artwork;

        private final ArrayList<Song> mAlbumSongs = new ArrayList<>();

        public Album(JSONObject source) throws JSONException {
            uid = source.getString("uid");
            name = source.getString("name");
            artistUid = source.getString("artistUid");
            year = source.getInt("year");
            artwork = source.getString("artwork");

            mAlbums.add(this);
            mAlbumsByUid.put(uid, this);
        }

        public void addSong(Song song) {
            if (!mAlbumSongs.contains(song)) {
                mAlbumSongs.add(song);
                mArtistsByUid.get(artistUid).addSong(this, song);
            }
        }

        public List<Song> getSongs() {
            Collections.sort(mAlbumSongs, new Comparator<Song>() {
                @Override
                public int compare(Song lhs, Song rhs) {
                    return lhs.name.compareToIgnoreCase(rhs.name);
                }
            });
            return mAlbumSongs;
        }
    }

    private class Playlist implements Songable {
        private String uid;
        private String name;
        private int playCount;
        private ArrayList<String> songs = new ArrayList<>();

        public Playlist(JSONObject source) throws JSONException {
            uid = source.getString("uid");
            name = source.getString("name");
            playCount = source.getInt("playCount");
            JSONArray array = source.getJSONArray("songs");
            for (int i = 0; i < array.length(); ++i) {
                songs.add(array.getString(i));
            }

            mPlaylists.add(this);
            mPlaylistsByUid.put(uid, this);
        }

        public List<Song> getSongs() {
            List<Song> toReturn = new ArrayList<>();
            for (String s : songs) {
                toReturn.add(mSongsByUid.get(s));
            }
            Collections.sort(toReturn, new Comparator<Song>() {
                @Override
                public int compare(Song lhs, Song rhs) {
                    int toReturn = mAlbumsByUid.get(lhs.albumUid).name.compareToIgnoreCase(mAlbumsByUid.get(rhs.albumUid).name);
                    if (toReturn == 0) {
                        toReturn = lhs.name.compareToIgnoreCase(rhs.name);
                    }
                    return toReturn;
                }
            });
            return toReturn;
        }
    }

    private class Song {
        private String uid;
        private String name;
        private int duration;
        private String albumUid;
        private String path;
        private int playCount;
        private JSONObject mSource;

        public Song(JSONObject source) throws JSONException {
            mSource = source;

            uid = source.getString("uid");
            name = source.getString("name");
            duration = source.getInt("duration");
            albumUid = source.getString("albumUid");
            path = source.getString("path");
            try {
                path = URLDecoder.decode(path, "UTF-8");
            } catch (Exception toIgnore) {
                //
            }
            path = path.replaceAll("^/*data/","");
            playCount = source.getInt("playCount");

            mSongs.add(this);
            mSongsByUid.put(uid, this);
        }

        public void apply() throws JSONException {
            Album album = mAlbumsByUid.get(albumUid);

            if (album != null) {
                album.addSong(this);
                mSource.put("albumName", album.name);
                mSource.put("artwork", album.artwork);
                Artist artist = mArtistsByUid.get(album.artistUid);
                if (artist != null) {
                    mSource.put("artistName", artist.name);
                }
            }
        }


        public Uri getURI() {
            File myFile = new File(mRoot, path);
            log.e("Exist:", myFile, myFile.exists());
            return Uri.fromFile(myFile);
        }
        public JSONObject getSource() {
            return mSource;
        }
    }

    private final Context mContext;

    private JSONObject mLibrary;
    private Object mLibraryLock = new Object();
    /**
     * Root director for media files. (Currently a subdir of Music)
     */
    private File mRoot;

    public AndroidMultiMediaService(Context context) {
        mContext = context;
    }

    private ArrayList<Album> mAlbums = new ArrayList<>();
    private ArrayList<Playlist> mPlaylists = new ArrayList<>();
    private ArrayList<Song> mSongs = new ArrayList<>();
    private ArrayList<Artist> mArtists = new ArrayList<>();
    private ArrayList<Genre> mGenres = new ArrayList<>();

    private HashMap<String, Album> mAlbumsByUid = new HashMap<>();
    private HashMap<String, Playlist> mPlaylistsByUid = new HashMap<>();
    private HashMap<String, Song> mSongsByUid = new HashMap<>();
    private HashMap<String, Artist> mArtistsByUid = new HashMap<>();
    private HashMap<String, Genre> mGenresByUid = new HashMap<>();

    @Override
    public JSONObject getLibrary() throws JSONException, IOException, BossException {
        synchronized (mLibraryLock) {
            forceInit();
            JSONObject status = super.getStatus();
            JSONObject media = new JSONObject();
            status.put("media", media);
            media.put("library", mLibrary);
            return status;
        }
    }

    @Override
    public JSONObject skip(boolean isBack) throws JSONException, BossException {
        forceInit();
        if (isBack) {
            // If we are playing - and within 3 seconds of the start - go to the previous... otherwise start again.
            if (mPlayingSong != null && mMediaPlayer != null && mMediaPlayer.getCurrentPosition() > 3000) {
                // jump to the start of the song.
            } else {
                // jump to the previous song.
                mPlayingSongPosition--;
            }
        } else {
            mPlayingSongPosition++;
        }
        playCurrentSong();

        return getStatus();
    }

    private void forceInit() throws BossException, JSONException {
        synchronized (mLibraryLock) {
            if (mLibrary == null) {
                try {
                    File directory = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_MUSIC);
                    mRoot = new File(directory, "Brainiac");
                    File library = new File(mRoot, "data-mediaLibrary.json");
                    mLibrary = FileUtil.readFileAsJSONObject(library);

                    JSONArray albums = mLibrary.getJSONArray("albums");
                    for (int i = 0; i < albums.length(); ++i) {
                        new Album(albums.getJSONObject(i));
                    }

                    JSONArray playlists = mLibrary.getJSONArray("playlists");
                    for (int i = 0; i < playlists.length(); ++i) {
                        new Playlist(playlists.getJSONObject(i));
                    }

                    JSONArray songs = mLibrary.getJSONArray("songs");
                    for (int i = 0; i < songs.length(); ++i) {
                        new Song(songs.getJSONObject(i));
                    }

                    JSONArray artists = mLibrary.getJSONArray("artists");
                    for (int i = 0; i < artists.length(); ++i) {
                        new Artist(artists.getJSONObject(i));
                    }

                    JSONArray genres = mLibrary.getJSONArray("genres");
                    for (int i = 0; i < genres.length(); ++i) {
                        new Genre(genres.getJSONObject(i));
                    }

                    for (Song song : mSongs) {
                        song.apply();
                    }

                    Collections.sort(mSongs, new Comparator<Song>() {
                        @Override
                        public int compare(Song lhs, Song rhs) {
                            return lhs.name.compareTo(rhs.name);
                        }
                    });

                    mBaseSongList = new ArrayList<>(mSongs);
                    sortEffectiveSongList(null);

                } catch (IOException ioe) {
                    throw new BossException(BossError.UNHANDLED_EXCEPTION, ioe);
                }
            }
        }
    }

    @Override
    public JSONObject playWithContext(String uid, String context, String contextId) throws JSONException, BossException {
        forceInit();
        Songable songable = null;
        if ("".equals(context)) {
            songable = new Songable() {
                @Override
                public List<Song> getSongs() {
                    return mSongs;
                }
            };
        } else if ("genre".equals(context)) {
            songable = mGenresByUid.get(contextId);
        } else if ("artist".equals(context)) {
            songable = mArtistsByUid.get(contextId);
        } else if ("album".equals(context)) {
            songable = mAlbumsByUid.get(contextId);
        } else if ("playlist".equals(context)) {
            songable = mPlaylistsByUid.get(contextId);
        } else {
            throw new BossException(BossError.PARAMETER_BAD, "Context");
        }
        if (songable == null) {
            throw new BossException(BossError.PARAMETER_BAD,"contextId");
        }
        setPlaylist(uid, songable.getSongs());

        if ("genre".equals(context)) {
            Genre genre = mGenresByUid.get(contextId);
            if (genre == null) {
                throw new BossException(BossError.PARAMETER_BAD, "contextId");
            }
            setPlaylist(uid,genre.getSongs());
        }
        log.e("Asked to play:", uid, context, contextId);
        return super.playWithContext(uid, context, contextId);
    }

    private List<Song> randomize(List<Song> songs) {
        List<Song> toReturn = new ArrayList<>();
        List<Song> source = new ArrayList<>(songs);
        while(source.size() != 0) {
            int next = (int)(Math.random() * source.size());
            toReturn.add(source.remove(next));
        }
        return toReturn;
    }

    private EventType mRepeatChanged = new EventType("shuffle changed","mediaRepeatChanged");

    @Override
    public JSONObject toggleShuffle() throws JSONException, BossException {
        forceInit();
        mShuffle = !mShuffle;

        sortEffectiveSongList(mPlayingSong != null ? mPlayingSong.uid : null);

        if (mShuffle) {
            if (mPlayingSong != null) {
                ++mPlayingSongPosition;
            }
            playCurrentSong();
        }
        return getStatus();
    }

    @Override
    public JSONObject toggleRepeat() throws JSONException, BossException {
        forceInit();
        mRepeatMode = RepeatMode.values()[(mRepeatMode.ordinal()+1)%RepeatMode.values().length];
        EventService.getInstance().sendEvent(new Event(mRepeatChanged, new JSONObject().toString()));

        return getStatus();
    }

    private void setPlaylist(String uidOfInitialSong, List<Song> songs) {
        log.e("Song URI:", songs.get(0).getURI());

        mBaseSongList = songs;
        sortEffectiveSongList(uidOfInitialSong);
        mPlayingSongPosition = 0;

        playCurrentSong();
    }

    private void sortEffectiveSongList(String uidOfInitialSong) {
        mEffectiveSongList = null;

        if (mBaseSongList == null) {
            return;
        }

        if (mShuffle) {
            mEffectiveSongList = randomize(mBaseSongList);
            // make sure the seleted song is first.
            for (Song s : mEffectiveSongList) {
                if (s.uid.equals(uidOfInitialSong)) {
                    mEffectiveSongList.remove(s);
                    mEffectiveSongList.add(0, s);
                    break;
                }
            }
        } else {
            // organise the list so that the 'first' song is the selected song.
            mEffectiveSongList = new ArrayList<>(mBaseSongList);
            for (int i=0; i<mEffectiveSongList.size(); ++i) {
                Song current = mEffectiveSongList.get(0);
                if (current.uid.equals(uidOfInitialSong)) {
                    break;
                }
                mEffectiveSongList.add(mEffectiveSongList.remove(0));
            }
        }
    }

    @Override
    public synchronized JSONObject play() throws JSONException, BossException {
        forceInit();
        if (mPlayingSongIsPaused && mMediaPlayer != null) {
            mMediaPlayer.start();
            mPlayingSongIsPaused = false;
        } else {
            playCurrentSong();
        }
        return getStatus();
    }

    @Override
    public synchronized JSONObject pause() throws JSONException, BossException {
        forceInit();
        if (!mPlayingSongIsPaused && mMediaPlayer != null) {
            mPlayingSongIsPaused = true;
            mMediaPlayer.pause();
        }
        return getStatus();
    }

    @Override
    public synchronized JSONObject getStatus() throws JSONException, BossException {
        forceInit();
        JSONObject toReturn = new JSONObject();
        toReturn.put("result", 1);

        if (mPlayingSong == null) {
            toReturn.put("playing",false);
            if (mEffectiveSongList==null || mEffectiveSongList.size() == 0) {
                toReturn.put("song", JSONObject.NULL);
            } else {
                toReturn.put("song", mEffectiveSongList.get(mPlayingSongPosition).getSource());
            }
        } else {
            toReturn.put("playing",!mPlayingSongIsPaused);
            try {
                toReturn.put("song", mPlayingSong.getSource());
            } catch (RuntimeException re) {
                // consume.
            }
        }

        toReturn.put("shuffle",mShuffle);
        toReturn.put("repeat",mRepeatMode.ordinal());

        return toReturn;
    }



    private synchronized void playCurrentSong() {
        mPlayingSong = null;
        mPlayingSongIsPaused = false;

        if (mEffectiveSongList== null) {
            log.e("No effective song list at this time");
            return;
        }

        try {
            if (mMediaPlayer != null) {
                mMediaPlayer.stop();
                mMediaPlayer.release();
            }
            mMediaPlayer = null;
        } catch (IllegalStateException ie) {
            // ignore
        }

        if (mPlayingSongPosition < 0) {
            if (mRepeatMode==RepeatMode.ALL) {
                mPlayingSongPosition = mEffectiveSongList.size()-1;
            } else {
                mPlayingSongPosition = 0;
                return;
            }
        }
        if (mPlayingSongPosition >= mEffectiveSongList.size()) {
            if (mRepeatMode==RepeatMode.ALL) {
                mPlayingSongPosition = 0;
            } else {
                mPlayingSongPosition = 0;
                return;
            }
        }

        mMediaPlayer = new MediaPlayer();
        mMediaPlayer.setOnCompletionListener(this);

        try {
            mPlayingSong = mEffectiveSongList.get(mPlayingSongPosition);
        } catch (RuntimeException re) {
            log.e("Could not play next song",re);
            return;
        }

        try {
            mMediaPlayer.setDataSource(mContext, mPlayingSong.getURI());
            mMediaPlayer.prepare();
        } catch (IOException ioe) {
            log.e("Could not play next song", ioe);
            return;
        }

        mMediaPlayer.start();
    }

    @Override
    public void onCompletion(MediaPlayer mp) {
        if (mp == mMediaPlayer && mp != null) {
            if (mRepeatMode == RepeatMode.ONE) {
                playCurrentSong();
            } else {
                ++mPlayingSongPosition;
                playCurrentSong();
            }
        }
    }
}
