function libraryMenu() {
	this.component = $ui.WindowPane;
	
	this.backCaption = 'Back',
	
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
					identifier: 'menuitem.playlist'
				},
				{
					caption: 'genre',
					img: 'img/ic_genre.png',
					identifier: 'menuitem.genre'
				},
				{
					caption: 'artist',
					img: 'img/ic_artist.png',
					identifier: 'menuitem.artist'
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
				}
			}
		}
	
	];
	
	this.onshow = function() {
		// Get our background image
		var backgroundImg = $core.getBackgroundImage($ui.getThemeColor());
		if (backgroundImg) {
			this.setBackground(new ScreenBackground('../../'+backgroundImg));
		}
	}
}