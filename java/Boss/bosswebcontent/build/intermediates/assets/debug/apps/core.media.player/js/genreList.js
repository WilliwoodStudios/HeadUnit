/* Copyright (c) 2015 Workshop 12 Inc. */
function genreList() {
    this.component = $ui.WindowPane;
    this.animated = true;
    this.backCaption = 'My Library',

    this.content = [{
            component: $ui.Header,
            caption: 'Genres'
        }, {
            component: $ui.List,
            style: $ui.GenericListItem,
            provider: {
                id: 'entryProvider',
                property: 'items'
            },
            onaction: function(event) {
                event.target.sharedDetailMode = "genre";
                $ui.push(sharedDetail, event.target);
            }
        }
    ];

    this.attachedObjects = [{
        component: $ui.DataProvider,
        id: 'entryProvider',
        onbeforeupdate: function() {
            var i,
                item,
                firstLetter,
                letters = [],
                header;
            // Rename any necessary fields for display in the list
            // and insert letter headers
            for (i = 0; i < this.data.items.length; i++) {
                item = this.data.items[i];
                if (item.component == $ui.Header) {
                    continue;
                }
                item.title = item.name;
                item.img = "/apps/core.media.player/img/ic_genre.png";
                item.accent = item.artistCount + " " + (item.artistCount == 1 ? "Artist" : "Artists");
                item.accent += " - ";
                item.accent += item.songCount + " " + (item.songCount == 1 ? "Song" : "Songs");
                item.accent += " - ";
                item.accent += item.playCount + " " + (item.playCount == 1 ? "Play" : "Plays");
            }
        }
    }, {
        component: $ui.DataProvider,
        id: 'topPlayedProvider',
        onbeforeupdate: function() {
            var i,
                item;
            // Rename any necessary fields for display in the image list
            for (i = 0; i < this.data.items.length; i++) {
                item = this.data.items[i];
                item.caption = item.name;
                item.img = item.artwork;
            }
        }
    }];

    this.onshow = function() {
        var mediaSource = $system.audio.getActiveMediaSource();
        if (mediaSource) {
            mediaSource.getGenres(function(genres) {
                this.entryProvider.data = {
                    items: genres
                };
            }.$bind(this));
        }
    }
}