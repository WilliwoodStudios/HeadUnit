function paneLoggingMenu() {
	this.component = ws12.WindowPane;
	
	this.menuImgClass = 'ws12-icon-head-unit-logging';
	
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
					caption: '0-60',
					imgClass: 'ws12-icon-head-unit-zero-to-sixty',
					onclick: function() {
						this.screen.container.push(paneZeroToSixty);
					}
				},
				{
					caption: 'horsepower',
					imgClass: 'ws12-icon-head-unit-horsepower',
					onclick: function() {
						console.log(this.caption + ' clicked');
					}
				},
				{
					caption: 'drift angle',
					imgClass: 'ws12-icon-head-unit-drift-angle',
					onclick: function() {
						console.log(this.caption + ' clicked');
					}
				},
				{
					caption: 'track day',
					imgClass: 'ws12-icon-head-unit-track-day',
					onclick: function() {
						console.log(this.caption + ' clicked');
					}
				},
				{
					caption: '1/4 mile',
					imgClass: 'ws12-icon-head-unit-quarter-mile',
					onclick: function() {
						console.log(this.caption + ' clicked');
					}
				},
				{
					caption: 'lateral g\'s',
					imgClass: 'ws12-icon-head-unit-g-forces',
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