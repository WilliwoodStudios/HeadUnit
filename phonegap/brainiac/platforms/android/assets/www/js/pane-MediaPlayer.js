function paneMediaPlayer() {
	this.component = ws12.WindowPane;
	
	// Values are based on if this is in a dual view
	this.disableAnimation = (window.innerHeight > window.innerWidth);
	this.menuImgClass = (window.innerHeight < window.innerWidth) ? 'ws12-icon-head-unit-music' : undefined;
	
	this.content = [
		{
			component: ws12.MediaPlayer,
			coverArt: 'spec/img/coverart/licensed_to_ill.jpg',
			artist: 'Beastie Boys',
			song: 'So What Cha Want',
			album: 'License To Ill',
			onmenuclick: function() {
				this.screen.container.push(paneMediaMenu);
			}
		}	
	];
	
	this.onshow = function() {
		
	}
}