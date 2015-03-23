// The Audio Manager provides the interface to the audio services of Brainiac 
function PlayerMediaSource() {
	// Initialize the return object
	var object = {
		_player: new Audio(),
		uid: 'media.source.player',
		name: 'iPhone',
		type: $system.MediaSourceType.PLAYER
	}
	
	// Private function to populate the hard coded media library
	object._populateLibrary = function(data) {
		this._library = data;
		// Now create our index
		this._library.index = {
			albums: {},
			songs: {},
			artists: {},
			genres: {}
		}
		var i,
			item;
		// Index Albums
		for (i = 0; i < data.albums.length; i++) {
			item = data.albums[i];
			this._library.index.albums[item.uid] = item;
		}
		// Index Songs
		for (i = 0; i < data.songs.length; i++) {
			item = data.songs[i];
			this._library.index.songs[item.uid] = item;
		}
		// Index Artists
		for (i = 0; i < data.artists.length; i++) {
			item = data.artists[i];
			this._library.index.artists[item.uid] = item;
		}
		// Index Genres
		for (i = 0; i < data.genres.length; i++) {
			item = data.genres[i];
			this._library.index.genres[item.uid] = item;
		}
		// See if we have a currently loaded song
		if (data.currentSong && (data.currentSong.uid != undefined)) {
			this._player.src = this._library.index.songs[data.currentSong.uid].path;
		}
	}
	object._populateLibrary = object._populateLibrary.bind(object);
	
	// Load all of our media library
	$core._loadJSONFromUrl('data/data-mediaLibrary.json', object._populateLibrary);
	
	// Retrieves the current playing song
	object.getCurrentSong = function(soundEffect) {
		var index = this._library.index,
			song = index.songs[this._library.currentSong.uid],
			album = index.albums[song.albumUid],
			artist = index.artists[album.artistUid],
			genre = index.genres[artist.genreUid],
			result = {
				uid: song.uid,
				name: song.name,
				duration: song.duration,
				albumName: album.name,
				artistName: artist.name,
				albumArt: album.artwork,
				year: album.year,
				genre: genre.name
			};
		return result
	}
	object.getCurrentSong = object.getCurrentSong.bind(object);
	
	// Play's the new requested song
	object.load = function(song) {
		if (song == undefined || song == null) return;
		// Find the path to the song
		var index = this._library.index,
			db_song = index.songs[song.uid];
		if (db_song && (db_song.path != undefined)) {
			this._player.src = db_song.path;
			this._player.play();
		}
	}
	object.load = object.load.bind(object);
	
	// Pause the currently playing song
	object.pause = function() {
		if (this._player.paused == true) return;
		this._player.pause();
	}
	object.pause = object.pause.bind(object);
	
	// Un-pause the current song
	object.play = function() {
		if (this._player.src == undefined) return;
		this._player.play();
	}
	object.play = object.play.bind(object);
	
	// Returns the paused state of the audio
	object.isPaused = function() {
		return this._player.paused;
	}
	object.isPaused = object.isPaused.bind(object);
	
	return object;
}