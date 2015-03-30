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
	
	// Retrieves the list of available albums in alphabetical order
	object.getAlbums = function() {
		var result = [],
			i,
			j,
			newAlbum,
			entry,
			artist,
			existingAlbum;
		for (i = 0; i < this._library.albums.length; i++) {
			newAlbum = this._library.albums[i];
			artist = this._library.index.artists[newAlbum.artistUid];
			entry = {
				uid: newAlbum.uid,
				name: newAlbum.name,
				year: newAlbum.year,
				albumArt: newAlbum.artwork,
				artistName: artist.name,
				genre: this._library.index.genres[artist.genreUid].name
			}
			if (result.length == 0) {
				result.push(entry);
				continue;
			}
			// Insert sort the results
			for (j = 0; j < result.length; j++) {
				existingAlbum = result[j];
				// Skip a duplicate entry 
				if ((entry.name == existingAlbum.name) && (entry.uid == existingAlbum.uid)){
					continue;
				} else if (entry.name.toLowerCase() <= existingAlbum.name.toLowerCase()) {
					// Insert before existing album entry and continue
					result.splice(j,0,entry);
					break;
				}
				// If it is greater than 
				if ((j + 1) == result.length) {
					result.push(entry);
					break;
				}
			}
		}
		return result
	}
	object.getAlbums = object.getAlbums.bind(object);
	
	// Return the top played albums (maximum 4)
	object.getMostPlayedAlbums = function() {
		var result = [],
			i,
			album,
			entry,
			artist;
		for (i = 0; i < 4; i++) {
			album = this._library.albums[i];
			artist = this._library.index.artists[album.artistUid];
			entry = {
				uid: album.uid,
				name: album.name,
				year: album.year,
				albumArt: album.artwork,
				artistName: artist.name,
				genre: this._library.index.genres[artist.genreUid].name
			}
			result.push(entry);
		}
		return result;
	}
	object.getMostPlayedAlbums = object.getMostPlayedAlbums.bind(object);
	
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