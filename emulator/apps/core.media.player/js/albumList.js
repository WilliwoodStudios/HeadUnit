function albumList() {
	this.component = $ui.WindowPane;
	this.animated = true;
	this.backCaption = 'Back',
	
	this.content = [
		{
			component: $ui.ControlGroup,
			visible: false,
			id: 'topPlayed',
			content: [
				{
					component: $ui.Header,
					caption: 'Top Played Albums'
				},
				{
					component: $ui.List,
					style: $ui.ImageListItem,
					provider: {
						id: 'topPlayedProvider',
						property: 'items'
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
					item.img = item.albumArt;
					item.accent = item.genre;
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
					item.img = item.albumArt;
				}
			}
		}
	];
	
	this.onshow = function() {
		var mediaSource = $system.audio.getActiveMediaSource();
		if (mediaSource) {
			// Get our top played albums
			var topPlayed = mediaSource.getMostPlayedAlbums();
			if (topPlayed && (topPlayed.length > 0)) {
				this.topPlayedProvider.setData({items: topPlayed});
				this.topPlayed.visible = true;
			}
			// Retrieve our list of all albums
			var albums = mediaSource.getAlbums();
			this.entryProvider.setData({items: albums});
		}
	}
}