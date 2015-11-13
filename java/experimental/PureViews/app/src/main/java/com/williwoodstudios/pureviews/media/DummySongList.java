package com.williwoodstudios.pureviews.media;

import com.williwoodstudios.pureviews.R;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

/**
 * Created by robwilliams on 2015-11-13.
 */
public class DummySongList {
    private static String ALBUM_LICENSE_TO_ILL = "Licensed To Ill";
    private static String ARTIST_BEASTIE = "Beastie Boys";

    private static String ARTIST_FOO = "Foo Fighters";
    private static String ALBUM_GREATEST_HITS = "Greatest Hits";

    private static String ARTIST_ACDC = "ACDC";
    private static String ALBUM_BACK = "Back In Black";

    private static String ARTIST_USS = "USS";
    private static String ALBUM_ADVANCED = "Advanced Basics";

    private static String ARTIST_BILLY = "Billy Talent";
    private static String ALBUM_BILLY_3 = "Billy Talent III";

    private HashMap<String, Integer> mAlbumArt = new HashMap<>();

    private void addAlbumArt(String name, int imageId) {
        mAlbumArt.put(name, imageId);
    }

    public static class Song implements Comparable<Song> {
        String mArtist;
        String mAlbum;
        String mName;
        int mAlbumArt;

        public Song(String artist, String album, String name, int albumArt) {
            mArtist = artist;
            mAlbum = album;
            mName = name;
            mAlbumArt = albumArt;
        }

        @Override
        public int compareTo(Song another) {
            if (this == another) {
                return 0;
            }
            int toReturn = mArtist.compareTo(another.mArtist);
            if (toReturn == 0) {
                toReturn = mAlbum.compareTo(another.mAlbum);
                if (toReturn == 0) {
                    toReturn = mName.compareTo(another.mName);
                }
            }
            return toReturn;
        }
    }

    private void addSong(String artist, String album, String name) {
        int albumArt = -1;
        if (mAlbumArt.containsKey(album)) {
            albumArt = mAlbumArt.get(album);
        }

        mSongList.add(new Song(artist, album, name, albumArt));
    }

    private ArrayList<Song> mSongList = new ArrayList<>();

    public DummySongList() {
        addAlbumArt(ALBUM_LICENSE_TO_ILL, R.drawable.licensed_to_ill);
        addAlbumArt(ALBUM_ADVANCED, R.drawable.album_uss);
        addAlbumArt(ALBUM_BACK, R.drawable.album_back_in_black);
        addAlbumArt(ALBUM_BILLY_3, R.drawable.album_billytalent);
        addAlbumArt(ALBUM_GREATEST_HITS, R.drawable.foofighters_gh_cover);
        addAlbumArt("Workshop 12",R.drawable.ws12_500px);
        addAlbumArt("SpeedSound",R.drawable.ws12_500px);
        addAlbumArt("VSignBeatz",R.drawable.ws12_500px);

        addSong(ARTIST_BEASTIE, ALBUM_LICENSE_TO_ILL, "So What Cha Want");
        addSong(ARTIST_BEASTIE, ALBUM_LICENSE_TO_ILL, "Brass Monkey");
        addSong(ARTIST_BEASTIE, ALBUM_LICENSE_TO_ILL, "No Sleep Till Brooklyn");

        addSong(ARTIST_FOO, ALBUM_GREATEST_HITS, "All My Life");
        addSong(ARTIST_FOO, ALBUM_GREATEST_HITS, "Everlong");
        addSong(ARTIST_FOO, ALBUM_GREATEST_HITS, "Best Of You");

        addSong(ARTIST_ACDC, ALBUM_BACK, "You Shook Me All Night Long");
        addSong(ARTIST_ACDC, ALBUM_BACK, "Hells Bells");
        addSong(ARTIST_ACDC, ALBUM_BACK, "Back In Black");

        addSong(ARTIST_USS, ALBUM_ADVANCED, "This Is The Best");
        addSong(ARTIST_USS, ALBUM_ADVANCED, "Yin Yang");

        addSong(ARTIST_BILLY, ALBUM_BILLY_3, "Devil On My Shoulder");
        addSong(ARTIST_BILLY, ALBUM_BILLY_3, "Saint Veronika");
        addSong(ARTIST_BILLY, ALBUM_BILLY_3, "Rusted From The Rain");

        addSong("Workshop 12","SpeedSound", "NNAF - Trip & Crap - AM");
        addSong("Workshop 12","VSignBeatz","Electric Hip-Hop Beat - AM");
    }

    public List<Song> getSongList() {
        return mSongList;
    }
}
