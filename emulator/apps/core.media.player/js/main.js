function main() {
	this.component = $ui.WindowPane;
	this.content = [
		{
			component: $ui.MediaPlayer,
			id: 'mediaPlayer',
			provider: {
				id: 'mediaPlayerProvider',
				property: 'currentSong'
			},
			onmenuclick: function () {
				$ui.push(libraryMenu);
			},
			onplay: function () {
				var mediaSource = $system.audio.getActiveMediaSource();
				if (mediaSource && (mediaSource.type == $system.MediaSourceType.PLAYER)) {
					mediaSource.play();
				}
			},
			onpause: function () {
				var mediaSource = $system.audio.getActiveMediaSource();
				if (mediaSource && (mediaSource.type == $system.MediaSourceType.PLAYER)) {
					mediaSource.pause();
				}
			},
			onskipback: function () {
				var mediaSource = $system.audio.getActiveMediaSource();
				if (mediaSource && (mediaSource.type == $system.MediaSourceType.PLAYER)) {
					mediaSource.skipBack();
				}
			},
			onskipforward: function () {
				var mediaSource = $system.audio.getActiveMediaSource();
				if (mediaSource && (mediaSource.type == $system.MediaSourceType.PLAYER)) {
					mediaSource.skipForward();
				}
			},
			ontoggleshuffle: function() {
				$system.songHistory.setShuffle(!$system.songHistory.getShuffle());
			},
			ontogglerepeat: function() {
				var repeat = $system.songHistory.getRepeat();
				repeat += 1;
				repeat %= 3;
				$system.songHistory.setRepeat(repeat);
			}

		}
	];

	this.attachedObjects = [
		{
			component: $ui.DataProvider,
			id: 'mediaPlayerProvider'
		}
	];

	this.onCurrentSongChanged = function (event) {
		// pretty much ignoring the event...
		var mediaSource = $system.audio.getActiveMediaSource();
		var data = {
			currentSong: {
				album: "-",
				covertArt: "",
				song: "",
				artist: "",
				duration: "0:00",
				paused: true
			}
		};
		if (mediaSource && (mediaSource.type == $system.MediaSourceType.PLAYER)) {
			var song = mediaSource.getCurrentSong();
			if (song) {
				data = {
					currentSong: {
						album: song.albumName,
						coverArt: song.artwork,
						song: song.name,
						artist: song.artistName,
						duration: song.duration,
						paused: mediaSource.isPaused()
					}
				};
			}
		}
		this.mediaPlayerProvider.data = data;
	}.$bind(this);
	
	var self = this;
	
	this.onShuffleChanged = function(event) {
		self.mediaPlayer.setShuffle(event.data);
	};
	
	this.onRepeatChanged = function(event) {
		self.mediaPlayer.setRepeat(event.data);
	};
	
	this.onPlaybackEnded = function(event) {
		this.mediaPlayer.setPaused(true);
	}.$bind(this);
	
	this.onPlaybackStarted = function(event) {
		this.mediaPlayer.setPaused(false);
	}.$bind(this);


	this.onshow = function () {
		// Set our current media
		this.onCurrentSongChanged();
		console.log("Going to add event listener");
		console.log("$data: " + $data);
		
		$data.addEventListener($system.songHistory.MEDIA_SONG_CHANGED, this.onCurrentSongChanged);
		$data.addEventListener($system.songHistory.MEDIA_SHUFFLE_CHANGED,this.onShuffleChanged);
		$data.addEventListener($system.songHistory.MEDIA_REPEAT_CHANGED,this.onRepeatChanged);
		$data.addEventListener("mediaPlaybackStarted",this.onPlaybackStarted);
		$data.addEventListener("mediaPlaybackEnded",this.onPlaybackEnded);
	};

}