function mainMenu() {
	this.component = ws12.WindowPane;
	
	this.disableAnimation = true;
	
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
					caption: 'music',
					visible: window.innerHeight < window.innerWidth,
					imgClass: 'ws12-icon-head-unit-music',
					onclick: function() {
						this.screen.container.push(paneMediaPlayer);
					}
				},
				{
					caption: 'maps',
					imgClass: 'ws12-icon-head-unit-map',
					onclick: function() {
						this.screen.container.push(paneMap);
					}
				},
				{
					caption: 'data logger',
					imgClass: 'ws12-icon-head-unit-logging',
					onclick: function() {
						ws12.openApp('apps/core.datalogger/index.html');
					}
				},
				{
					caption: 'phone',
					imgClass: 'ws12-icon-head-unit-phone',
					onclick: function() {
						this.screen.container.push(panePhone);
					}
				},
				{
					caption: 'dashboard',
					imgClass: 'ws12-icon-head-unit-dashboard',
					onclick: function() {
						this.screen.container.push(paneDashboard);
					}
				},				
				{
					caption: 'browser',
					imgClass: 'ws12-icon-head-unit-browser',
					onclick: function() {
						this.screen.container.push(paneBrowser);
					}
				}
				
			]
		}
	
	];
	
	this.onshow = function() {
	}
}