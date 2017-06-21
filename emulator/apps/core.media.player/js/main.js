/* Copyright (c) 2015 Workshop 12 Inc. */
function main() {
	this.component = $ui.WindowPane;
	this.debug = false;
	this.content = [
		{
			component: $ui.MediaPlayer,
			id: 'mediaPlayer',
			maxMinVisible: $system.isSplitScreen(),
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
			},
			onminimize: function() {
				if (window.$core) {
					var systemEvent = new $ui.DataEvent($system.EventType.ONMEDIAMINIMIZE);
					$core.raiseEvent(systemEvent);
				}
			},
			onrestore: function() {
				if (window.$core) {
					var systemEvent = new $ui.DataEvent($system.EventType.ONMEDIARESTORE);
					$core.raiseEvent(systemEvent);
				}
			},
			onsource: function() {
				if (window.$core) {
					/*window.setTimeout(function() {
						var systemEvent = new $ui.DataEvent($system.EventType.ONCONFIRMGARAGEDOOR);
						$core.raiseEvent(systemEvent);
					},2000);*/
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
		if (this.debug) console.log("on current song changed");
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
		data.currentSong.paused = $system.audio.getActiveMediaSource().isPaused();

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
		if (this.debug) console.log("Playback ended");
		this.mediaPlayer.setPaused(true);
	}.$bind(this);
	
	this.onPlaybackStarted = function(event) {
		if (this.debug) console.log("Playback started");
		this.mediaPlayer.setPaused(false);
	}.$bind(this);

	this.onshow = function () {
		$ui.addEventListener($system.EventType.MEDIA_SONG_CHANGED, this.onCurrentSongChanged, this);
		$ui.addEventListener($system.EventType.MEDIA_SHUFFLE_CHANGED,this.onShuffleChanged, this);
		$ui.addEventListener($system.EventType.MEDIA_REPEAT_CHANGED,this.onRepeatChanged, this);
		$ui.addEventListener($system.EventType.MEDIA_PLAYBACK_STARTED,this.onPlaybackStarted, this);
		$ui.addEventListener($system.EventType.MEDIA_PLAYBACK_ENDED,this.onPlaybackEnded, this);

		var mediaSource = $system.audio.getActiveMediaSource();
		if (this.debug) console.log("Media Source: about to register our interest");
		mediaSource.registerInterest(this);
	}.$bind(this);

	this.ondestroy = function() {
		if (this.debug) console.log("About to unregister...");
		var mediaSource = $system.audio.getActiveMediaSource();
		mediaSource.unregisterInterest(this);
	}.$bind(this);

	if ("chrome" in window && chrome.runtime && chrome.runtime.id) {
		// We are in a chrome app - don't do the ondestroy/onunload.
	} else {
		var oldOnUnload = window.onunload;
		window.onunload = function() {
			this.ondestroy();
			if (oldOnUnload && typeof(oldOnUnload)==="function") {
				oldOnUnload();
			}
		}.$bind(this);
	}
}