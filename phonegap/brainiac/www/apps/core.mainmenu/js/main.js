function main() {
	this.component = $ui.WindowPane;
	
	this.disableAnimation = true;
	
	this.background = {
		img: 'img/background.jpg',
		colorized: true,
		position: 'center bottom',
	};
	
	this.content = [
		{
			component: $ui.CircleMenu,
			items: [
				{
					caption: 'music',
					visible: window.innerHeight < window.innerWidth,
					icon: '../../apps/core.media.player/img/icon-128x128.png',
					onclick: function() {
						$ui.openApp('core.media.player');
					}
				},
				{
					caption: 'maps',
					icon: '../../apps/core.maps/img/icon-128x128.png',
					onclick: function() {
						$ui.openApp('core.maps');
					}
				},
				{
					caption: 'data logger',
					icon: '../../apps/core.datalogger/img/icon-128x128.png',
					onclick: function() {
						$ui.openApp('core.datalogger');
					}
				},
				{
					caption: 'phone',
					icon: '../../apps/core.phone/img/icon-128x128.png',
					onclick: function() {
						$ui.openApp('core.phone');
					}
				},
				{
					caption: 'dashboard',
					icon: '../../apps/core.dashboard/img/icon-128x128.png',
					onclick: function() {
						$ui.openApp('core.dashboard');
					}
				},				
				{
					caption: 'browser',
					icon: '../../apps/core.browser/img/icon-128x128.png',
					onclick: function() {
						$ui.openApp('core.browser');
					}
				}
				
			]
		}
	
	];
	
	this.onshow = function() {
	}
}