/* Copyright (c) 2015 Workshop 12 Inc. */
function libraryMenu() {
	this.component = $ui.WindowPane;
	this.animated = true;
	this.backCaption = 'Back';
	
	this.content = [
		{
			component: $ui.CircleMenu,
			items: [
				{
					caption: 'albums',
					img: 'img/ic_albums.png',
					identifier: 'menuitem.albums'
				},
				{
					caption: 'playlist',
					img: 'img/ic_playlist.png',
					identifier: 'menuitem.playlists'
				},
				{
					caption: 'genre',
					img: 'img/ic_genre.png',
					identifier: 'menuitem.genres'
				},
				{
					caption: 'artist',
					img: 'img/ic_artist.png',
					identifier: 'menuitem.artists'
				},
				{
					caption: 'songs',
					img: 'img/icon-128x128.png',
					identifier: 'menuitem.songs'
				}
				
			],
			onclick: function(item) {
				if (item.identifier == 'menuitem.albums') {
					$ui.push(albumList);
				} else if (item.identifier == 'menuitem.artists') {
					$ui.push(artistList);
				} else if (item.identifier == 'menuitem.genres') {
					$ui.push(genreList);
				} else if (item.identifier === 'menuitem.songs') {
					$ui.push(sharedDetail,{ sharedDetailMode: "song" });
				} else if (item.identifier === 'menuitem.playlists') {
					$ui.push(playlistList);
				} else {
					console.log("Not yet handling " + item.identifier);
				}
			}
		}
	];
	
	this.onshow = function() {
		this.onthemechange();
	};
	
	this.onthemechange = function() {
		// Get our background image
		var backgroundImg = $core.getBackgroundImage($ui.theme.backgroundImageColor);
		if (backgroundImg) {
			this.setBackground(new ScreenBackground('../../'+backgroundImg));
		}
	}
}