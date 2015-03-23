function main() {
	this.component = $ui.WindowPane;

	this.disableAnimation = true;
	
	this.content = [
		{
			component: $ui.MediaPlayer,
			id: 'mediaPlayer',
			provider: {
				id: 'mediaPlayerProvider',
				property: 'currentSong'
			},
			onmenuclick: function() {
				console.log('menuclick');
			},
			onplay: function() {
				var mediaSource = $system.audio.getActiveMediaSource();
				if (mediaSource && (mediaSource.type == $system.MediaSourceType.PLAYER)) {
					mediaSource.play();
				}
			},
			onpause: function() {
				var mediaSource = $system.audio.getActiveMediaSource();
				if (mediaSource && (mediaSource.type == $system.MediaSourceType.PLAYER)) {
					mediaSource.pause();
				}
			}
		}	
	];
	
	this.attachedObjects = [
		{
			component: $ui.DataProvider,
			id: 'mediaPlayerProvider'
		}
	];
	
	this.onshow = function() {
		// Set our current media
		var mediaSource = $system.audio.getActiveMediaSource();
		if (mediaSource && (mediaSource.type == $system.MediaSourceType.PLAYER)) {
			var song = mediaSource.getCurrentSong(),
				data = {
					currentSong: {
						album: song.albumName,
						coverArt: song.albumArt,
						song: song.name,
						artist: song.artistName,
						duration: song.duration,
						paused: mediaSource.isPaused()
					}
				};
			console.log(data);
			this.mediaPlayerProvider.setData(data);
		}
	}
}