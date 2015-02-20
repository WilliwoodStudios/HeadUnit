function paneMenu() {
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
					imgClass: 'ws12-icon-head-unit-music',
					onclick: function() {
						console.log(this.caption + ' clicked');
					}
				},
				{
					caption: 'maps',
					imgClass: 'ws12-icon-head-unit-map',
					onclick: function() {
						console.log(this.caption + ' clicked');
					}
				},
				{
					caption: 'browser',
					imgClass: 'ws12-icon-head-unit-browser',
					onclick: function() {
						this.screen.container.push(paneBrowser);
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
					caption: 'logging',
					imgClass: 'ws12-icon-head-unit-logging',
					onclick: function() {
						console.log(this.caption + ' clicked');
					}
				}
				
			]
		}
	
	];
	
	this.onshow = function() {
		
	}
}