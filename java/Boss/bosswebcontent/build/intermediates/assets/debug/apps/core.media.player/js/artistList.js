/* Copyright (c) 2015 Workshop 12 Inc. */
function artistList() {
    this.component = $ui.WindowPane;
    this.animated = true;
    this.backCaption = 'My Library',
    
    this.content = [
        {
            component: $ui.ControlGroup,
            visible: false,
            id: 'topPlayed',
            content: [
                {
                    component: $ui.Header,
                    caption: 'Top Played Artists'
                },
                {
                    component: $ui.List,
                    style: $ui.ImageListItem,
                    provider: {
                        id: 'topPlayedProvider',
                        property: 'items'
                    },
                    onaction: function(event) {
                        event.target.sharedDetailMode = "artist";
                        $ui.push(sharedDetail,event.target);
                    }
                }
            ]
        },
        {
            component: $ui.List,
            style: $ui.GenericListItem,
            provider: {
                id: 'entryProvider',
                property: 'items'
            },
            onaction: function(event) {
                event.target.sharedDetailMode = "artist";
                $ui.push(sharedDetail, event.target);
            }
        }
    
    ];
    
    this.attachedObjects = [
        {
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
                    item.title = item.name;
                    item.img = item.artwork;
                    item.accent = item.albumCount + " " + (item.albumCount==1 ? "Album" : "Albums");
                    item.accent += " - ";
                    item.accent += item.songCount + " " + (item.songCount==1 ? "Song" : "Songs");
                    item.accent += " - ";
                    item.accent += item.playCount + " " + (item.playCount==1 ? "Play" : "Plays");
                    item.img = item.artwork;
                    if (item.title && item.title.length > 0) {
                        firstLetter = item.title[0].toUpperCase();
                        if (letters.indexOf(firstLetter) < 0) {
                            letters.push(firstLetter);
                            header = {
                                component: $ui.Header,
                                caption: firstLetter
                            };
                            this.data.items.splice(i,0,header);
                        }
                    }
                }
            }
        },
        {
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
        }
    ];
    
    this.onshow = function() {
        var mediaSource = $system.audio.getActiveMediaSource();
        if (mediaSource) {
            // Get our top played albums
            mediaSource.getMostPlayedArtists(function(topPlayed) {
                if (topPlayed && (topPlayed.length > 0)) {
                    this.topPlayedProvider.data = {items: topPlayed};
                    this.topPlayed.visible = true;
                }
            }.$bind(this));
            // Retrieve our list of all atrists
            mediaSource.getArtists(function(artists) {
                this.entryProvider.data = {items: artists};
            }.$bind(this));
        }
    }
}