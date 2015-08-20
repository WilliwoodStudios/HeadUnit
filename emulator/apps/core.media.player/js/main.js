/* Copyright (c) 2015 Workshop 12 Inc. */
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
				var mediaSource = $system.audio.getActiveMediaSource();
				if (mediaSource && (mediaSource.type == $system.MediaSourceType.PLAYER)) {
					mediaSource.toggleShuffle();
				}
			},
			ontogglerepeat: function() {
				var mediaSource = $system.audio.getActiveMediaSource();
				if (mediaSource && (mediaSource.type == $system.MediaSourceType.PLAYER)) {
					mediaSource.toggleRepeat();
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

	this.onCurrentSongChanged = function (event) {
		// pretty much ignoring the event...
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
		var song = event.data;

		data.currentSong.album = song.albumName;
		data.currentSong.coverArt = song.artwork;
		data.currentSong.song = song.name;
		data.currentSong.artist = song.artistName;
		data.currentSong.duration = song.duration;
		data.currentSong.paused = !($system.audio.getActiveMediaSource().isPaused());

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
		$ui.addEventListener($system.EventType.MEDIA_SONG_CHANGED, this.onCurrentSongChanged, this);
		$ui.addEventListener($system.EventType.MEDIA_SHUFFLE_CHANGED,this.onShuffleChanged, this);
		$ui.addEventListener($system.EventType.MEDIA_REPEAT_CHANGED,this.onRepeatChanged, this);
		$ui.addEventListener($system.EventType.MEDIA_PLAYBACK_STARTED,this.onPlaybackStarted, this);
		$ui.addEventListener($system.EventType.MEDIA_PLAYBACK_ENDED,this.onPlaybackEnded, this);

		var mediaSource = $system.audio.getActiveMediaSource();
		if (mediaSource.broadcastStatus) {
			mediaSource.broadcastStatus();
		}
		mediaSource.getStatus();
	}.$bind(this);

}