/* Copyright (c) 2015 Workshop 12 Inc. */
function sharedDetail() {
    function getFirst(value) {
        value = value.toUpperCase();
        value = value.replace(/^\"/g, "");
        value = value.replace(/^\'/g, "");
        return value.charAt(0);
    }

    this.component = $ui.WindowPane;
    this.animated = true;
    this.backCaption = "Set in oncreate...";
    
    /**
     * The mode that this sreen will present data in.
     */
    this.viewMode = "Set in oncreate...";

    this.content = [{
        component: $ui.List,
        style: $ui.GenericListItem,
        provider: {
            id: 'entryProvider',
            property: 'items'
        },
        onaction: function (event) {
            if (event.target && event.target.startPlaying) {
                event.target.startPlaying();
                if (this.viewMode === "song") {
                    $ui.pop(2);
                } else {
                    $ui.pop(3);
                }
            } else {
                $ui.pop();
            }
        }.$bind(this)
    }];

    this.attachedObjects = [{
        component: $ui.DataProvider,
        id: 'entryProvider',
        onbeforeupdate: function () {
            var i,
                item,
                firstLetter,
                lastAlbum;
            lastAlbum = null;

            for (i = 0; i < this.data.items.length; i++) {
                item = this.data.items[i];
                if (item.component === $ui.Header) {
                    continue;
                }

                item.title = "";

                item.title += item.name;

                item.accent = $system.util.converter.secondsToTime(item.duration);

                if (item.accent.length > 0) {
                    item.accent += " - ";
                }
                if (item.playCount) {
                    item.accent += item.playCount + " " + (item.playCount == 1 ? "Play" : "Plays");
                }

                item.img = item.artwork;

                if (this.viewMode === "genre" || this.viewMode === "song" || this.viewMode === "playlist") {
                    item.caption = item.albumName + " - " + item.artistName;
                    if (this.data.items.length > 15) {
                        if (item.name.length > 1) {
                            var first = getFirst(item.name);
                            if (first != firstLetter) {
                                firstLetter = first;
                                this.data.items.splice(i, 0, {
                                    component: $ui.Header,
                                    caption: firstLetter
                                });
                            }
                        }
                    }
                } else {
                    if (item.albumName != lastAlbum) {
                        this.data.items.splice(i, 0, {
                            component: $ui.Header,
                            caption: item.albumName + " - " + item.artistName
                        });
                        lastAlbum = item.albumName;
                    }
                }
            }
        }
    }];
    
    /** 
     * Set the correct backCaption for the viewMode we are in.
     */
    this.setBackCaption = function() {
        if (this.viewMode == "artist") {
            this.backCaption = "Artists";
        } else if (this.viewMode == "album") {
            this.backCaption = "Albums";
        } else if (this.viewMode == "genre") {
            this.backCaption = "Genres";
        } else if (this.viewMode == "playlist") {
            this.backCaption = "Playlists";
        } else {
            this.backCaption = "Back";
        }
    }.$bind(this);
    
    /**
     * item.sharedDetailMode makes this screen behave correctly.
     * @param item.sharedDetailMode
     */
    this.oncreate = function (item) {
        if (item && item.sharedDetailMode) {
            this.viewMode = item.sharedDetailMode;
        } else {
            this.viewMode = "song";
        }
        this.setBackCaption();
    }.$bind(this);

    this.onshow = function (item) {
        var mediaSource = $system.audio.getActiveMediaSource();
        if (mediaSource) {
            var songs = [];
            var emptyMessage = "";

            var handleSongs = function(songs) {
                if (songs.length == 0) {
                    songs.push({
                        name: emptyMessage
                    })
                }
                this.entryProvider.data = {
                    items: songs
                };
            }.$bind(this);
            
            if (this.viewMode == "album") {
                emptyMessage = "No songs in the sample album...";
                mediaSource.getAlbumSongs(item.uid,handleSongs);
            } else if (this.viewMode == "artist") {
                emptyMessage = "No songs for this sample artist...";
                mediaSource.getArtistSongs(item.uid,handleSongs);
            } else if (this.viewMode == "genre") {
                emptyMessage = "No songs for this sample genre...";
                mediaSource.getGenreSongs(item.uid,handleSongs);
            } else if (this.viewMode === "playlist") {
                emptyMessage = "No songs for this sample playlist...";
                mediaSource.getPlaylistSongs(item.uid,handleSongs);
            } else if (this.viewMode === "song") {
                emptyMessage = "No songs in the library...";
                mediaSource.getSongs(handleSongs);
            }
        }
    }.$bind(this);
}