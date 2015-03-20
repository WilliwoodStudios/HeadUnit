function main() {
	this.component = $ui.WindowPane;

	this.disableAnimation = true;
	
	this.content = [
		{
			component: $ui.MediaPlayer,
			coverArt: 'spec/img/coverart/licensed_to_ill.jpg',
			artist: 'Beastie Boys',
			song: 'So What Cha Want',
			album: 'License To Ill',
			onmenuclick: function() {
				//this.screen.container.push(paneMediaMenu);
			}
		}	
	];
	
	this.onshow = function() {
		
	}
}