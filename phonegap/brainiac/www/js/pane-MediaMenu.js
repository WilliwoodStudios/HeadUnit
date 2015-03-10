function paneMediaMenu() {
	this.component = ws12.WindowPane;
	
	this.background = {
		img: 'img/background.jpg',
		colorized: true,
		position: 'center bottom',
	};
	
	this.content = [
		{
			component: ws12.CircleMenu,
			items: [
				{
					caption: 'albums',
					imgClass: 'ws12-icon-head-unit-music',
					onclick: function() {
						
					}
				},
				{
					caption: 'artists',
					imgClass: 'ws12-icon-head-unit-map',
					onclick: function() {
						
					}
				},
				{
					caption: 'songs',
					imgClass: 'ws12-icon-head-unit-logging',
					onclick: function() {
						
					}
				},
				{
					caption: 'playlists',
					imgClass: 'ws12-icon-head-unit-phone',
					onclick: function() {
						
					}
				},
				{
					caption: 'genres',
					imgClass: 'ws12-icon-head-unit-dashboard',
					onclick: function() {
						
					}
				}
				
			]
		}
	
	];
}