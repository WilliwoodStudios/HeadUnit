/* $system VERSION: 1.0.0.87*/

/**
 * Main system object for Brainiac
 * @namespace $system
 * @property {$system.AudioManager} audio - This <b>read-only</b> property provides you access to Brainiac's audio services
 * @property {$system.PhoneManager} phone - This <b>read-only</b> property provides you access to Brainiac's phone services
 * @property {$system.ContactsManager} contacts - This <b>read-only</b> property provides you access to Brainiac's contact services
 */
var $system = {
	version: {
		major: 1,
		minor: 0,
		revision: 0,
		build: 1
	},
	_events: [],
	config: {
		theme: {
			rootClass: 'ui-theme-dark bold-weight',
			color: '#D94646'
		},
		celsius: false
	},
	
	// Initialize the system object
	init: function(config) {
		this.isClientDevice = (window.innerWidth < 400);
		// Grab the configuration
		this.config.theme.rootClass = (config.theme.rootClass) ? config.theme.rootClass : this.config.theme.rootClass;
		this.config.theme.color = (config.theme.color) ? config.theme.color : this.config.theme.color;
		this.config.celsius = (config.celsius) ? config.celsius : this.config.celsius;
		// Create our services
		this.audio = new AudioManager(this.isClientDevice);
		this.contacts = new ContactsManager();
		this.phone = new PhoneManager();
	},
	
	/** 
	 * Detect if the system is using Celsius for the temperature measurements
	 * @returns {Boolean} Returns true if Celsius is used for temperature measurements
	 */
	isCelsius: function() {
		return this.config.celsius;
	},
	
	/** 
	 * Assign an event listener to receive notifications
	 * @param {$system.EventType} eventType - Type of event to subscribe to
	 * @param {SystemEventCallback} callback - Callback function to trigger when the subscribed to event fires
	 * @param {$ui.CoreScreen} [screen] - Screen instance the the callback is for. This is important so that when the screen is popped off the stack the callback is unassigned. If the callback is not assigned in screen code, then this can be left undefined
	 */
	addEventListener: function(eventType, callback, screen) {
		var item = {
			eventType: eventType,
			callback: callback,
			screen: screen
		}
		this._events.push(item);
	},
	
	/** 
	 * Remove an event listener from the system
	 * @param {$system.EventType} eventType - Type of event to subscribe to
	 * @param {SystemEventCallback} callback - Callback function to trigger when the subscribed to event fires
	 */
	removeEventListener: function(eventType, callback) {
		var i,
			item,
			systemEvent;
		for (i = 0; i < this._events.length; i++) {
			item = this._events[i];
			if (item.eventType == eventType && item.callback == callback) {
				this._events.splice(i, 1);
				return;
			}
		}
	},
	
	// Remove all event listeners for a screen
	removeEventListenersForScreen: function(screen) {
		var i,
			item,
			systemEvent;
		for (i = this._events.length - 1; i >= 0; i--) {
			if (this._events.length === 0) return;
			item = this._events[i];
			if (item && (item.screen == screen)) {
				this._events.splice(i, 1);
			}
		}
	}
}

/**
 * The {@link $system} <b>callback</b> event definition for $system.addEventListener
 * @callback SystemEventCallback
 * @param {$system.SystemEvent} event - Event which was just raised by the system
 */
 
/**
 * Definitions of available system colors
 * @namespace Color
 * @readonly
 * @memberof $system
 */ 
$system.Color = {
	/** */
	TURQUOISE: '#1ABC9C',
	/**  */
	EMERALD:  '#2ECC71',
	/** */
	PETER_RIVER: '#3498DB',
	/**  */
	AMETHYST: '#AF7AC4',
	/**  */
	WET_ASPHAULT: '#34495E',
	/**  */
	GREEN_SEA: '#16A085',
	/**  */
	NEPHRITIS: '#27AE60',
	/**  */
	BELIZE_HOLE: '#2980B9',
	/**  */
	WISTERIA: '#8E44AD',
	/**  */
	MIDNIGHT_BLUE: '#2C3E50',
	/**  */
	SUN_FLOWER: '#F1C40F',
	/**  */
	CARROT: '#E67E22',
	/**  */
	ALIZARIN: '#D94646', // Our brand color
	/**  */
	CONCRETE: '#AAB7B7',
	/**  */
	ORANGE: '#F39C12',
	/**  */
	PUMPKIN: '#D35400',
	/**  */
	POMEGRANATE: '#C0392B',
	/**  */
	SILVER: '#BDC3C7',
	/**  */
	ASBESTOS: '#98A3A3'
}
 

/**
 * This object represents all of the information for an album.
 * @namespace Album
 * @memberof $system
 * @property {uid} string - The unique identifier for the album
 * @property {string} [name] - The name of the album
 * @property {string} [artistName] - The name of the artist who performs this song
 * @property {string} [albumArt] - Image path for album art
 * @property {number} [year] - The year the album was released
 * @property {string} [genre] - The genre of the album
 */
$system.Album = {};

/**
 * The Audio Manager provides an interface between application JavaScript code and the audio services of Brainiac. By providing an object that creates a bridge to native audio services it allows the system to manage all the audio of the system. 
 * @namespace AudioManager
 * @memberof $system
 */
function AudioManager() {
	// Initialize the return object
	var object = {
		_mediaSources: [new PlayerMediaSource()], 
	}
	
	// Set our current media source
	object._currentMediaSource = object._mediaSources[0];
	
	// Load our sounds
	object._sounds = {};
	if ($system.isClientDevice == false) {
		object._sounds.BLIP = new Audio('sounds/blip.mp3');
		object._sounds.HORN = new Audio('sounds/horn.mp3');
		object._sounds.TOUCH = new Audio('sounds/Touch.ogg');
		object._sounds.TONE0 = new Audio('sounds/tones/0.wav');
		object._sounds.TONE1 = new Audio('sounds/tones/1.wav');
		object._sounds.TONE2 = new Audio('sounds/tones/2.wav');
		object._sounds.TONE3 = new Audio('sounds/tones/3.wav');
		object._sounds.TONE4 = new Audio('sounds/tones/4.wav');
		object._sounds.TONE5 = new Audio('sounds/tones/5.wav');
		object._sounds.TONE6 = new Audio('sounds/tones/6.wav');
		object._sounds.TONE7 = new Audio('sounds/tones/7.wav');
		object._sounds.TONE8 = new Audio('sounds/tones/8.wav');
		object._sounds.TONE9 = new Audio('sounds/tones/9.wav');
		object._sounds.TONE_POUND = new Audio('sounds/tones/p.wav');
		object._sounds.TONE_ASTERIK = new Audio('sounds/tones/s.wav');
	}
	
	/** 
	 * This function will play the sound effect specified by the soundEffect parameter
	 * @function playSoundEffect
	 * @memberof $system.AudioManager
	 * @param {$system.SoundEffect} soundEffect - Type sound effect to play
	 */
	object.playSoundEffect = function(soundEffect) {
		if ($system.isClientDevice == true) return;
		switch(soundEffect) {
			case $system.SoundEffect.BLIP:
				this._sounds.BLIP.play();
				break;
			case $system.SoundEffect.HORN:
				this._sounds.HORN.play();
				break;
			case $system.SoundEffect.TOUCH:
				this._sounds.TOUCH.play();
				break;
			case $system.SoundEffect.TONE0:
				this._sounds.TONE0.play();
				break;
			case $system.SoundEffect.TONE1:
				this._sounds.TONE1.play();
				break;
			case $system.SoundEffect.TONE2:
				this._sounds.TONE2.play();
				break;
			case $system.SoundEffect.TONE3:
				this._sounds.TONE3.play();
				break;
			case $system.SoundEffect.TONE4:
				this._sounds.TONE4.play();
				break;
			case $system.SoundEffect.TONE5:
				this._sounds.TONE5.play();
				break;
			case $system.SoundEffect.TONE6:
				this._sounds.TONE6.play();
				break;
			case $system.SoundEffect.TONE7:
				this._sounds.TONE7.play();
				break;
			case $system.SoundEffect.TONE8:
				this._sounds.TONE8.play();
				break;
			case $system.SoundEffect.TONE9:
				this._sounds.TONE9.play();
				break;
			case $system.SoundEffect.TONE_POUND:
				this._sounds.TONE_POUND.play();
				break;
			case $system.SoundEffect.TONE_ASTERIK:
				this._sounds.TONE_ASTERIK.play();
				break;
		}
	}
	object.playSoundEffect = object.playSoundEffect.bind(object);
	
	/** 
	 * Retrieves all of the available media sources
	 * @function getMediaSources
	 * @memberof $system.AudioManager
	 * @returns {$system.MediaSource[]}
	 */
	object.getMediaSources = function() {
		return this._mediaSources;
	}
	object.getMediaSources = object.getMediaSources.bind(object);
	
	/** 
	 * Returns the current active media source
	 * @function getActiveMediaSource
	 * @memberof $system.AudioManager
	 * @returns {$system.MediaSource}
	 */
	object.getActiveMediaSource = function() {
		return this._currentMediaSource;
	}
	object.getActiveMediaSource = object.getActiveMediaSource.bind(object);
	
	return object;
}
 /**
 * The Contact interface provides information about a Contact from the users database 
 * @namespace CallLogEntry
 * @memberof $system
 * @property {string} uid - Unique identifier for the contact
 * @property {string} [img] - Image for the contact
 * @property {string} name="Unknown" - Name of the caller or recipient
 * @property {string} [contactUid] - Known contact's unique identifier
 * @property {string} [number] - Number dialed, recieved or missed
 * @property {$system.CallLogEntryType} [type] - Type of call log entry
 */
$system.CallLogEntry = {}
/**
 * Type of entry in a {@link $system.CallLogEntry} 
 * @namespace CallLogEntryType
 * @readonly
 * @memberof $system
 */
$system.CallLogEntryType = {
	/** Incoming call */
	INCOMING: 0,
	/** Outgoing Call */
	OUTGOING: 1,
	/** Missed Call */
	MISSED: 2
}
/**
 * The Contact interface provides information about a Contact from the users database 
 * @namespace Contact
 * @memberof $system
 * @property {string} uid - Unique identifier for the contact
 * @property {string} [img] - Image for the contact
 * @property {string} [firstName] - Contact's first name
 * @property {string} [middleName] - Contact's middle name
 * @property {string} [lastName] - Contact's last name
 * @property {string} [lastName] - Contact's last name
 * @property {$system.PhoneNumber[]} [phoneNumbers] - List of contact phone numbers
 */
$system.Contact = {}
/**
 * The Contacts Manager provides an interface between application JavaScript code and the contact services of Brainiac. 
 * @namespace ContactsManager
 * @memberof $system
 */
function ContactsManager(options) {
	// Initialize the return object
	var object = {};	
	
	/** 
	 * This function will return the list of contacts from the connected device
	 * @function getContactList
	 * @memberof $system.ContactsManager
	 * @param {ContactListCallback} callback - Function to be run when the list has been retrieved
	 */
	object.getContactList = function(callback) {
		$core._loadJSONFromUrl('data/data-contactList.json', callback);
	}
	object.getContactList = object.getContactList.bind(object);
	
	return object;
}

/**
 * The {@link $system.ContactsManager} <b>callback</b> event definition for <b>getContactList</b>
 * @callback ContactListCallback
 * @param {$system.Contact[]} contacts - List of contacts that have been returned
 */
/**
 * Type event used with the {@link $system} event listeners
 * @namespace
 * @readonly
 * @memberof $system
 */
$system.EventType = {
	/** Triggers when the speed of the vehicle changes.  When this event fires the data property of the {@link $system.SystemEvent} has the following definition:
	 * <pre>
	 * {
	 *    speed: 60 // Current speed in MPH
	 * }
	 */
	ONSPEEDCHANGE: 'onspeedchange',
	/** Triggers when the fuel level of the vehicle changes.  When this event fires the data property of the {@link $system.SystemEvent} has the following definition:
	 * <pre>
	 * {
	 *    level: 0.25 // Fraction of fill level of tank
	 * }
	 */
	ONFUELCHANGE: 'onfuelchange',
	/** Triggers when the RPM of the vehicle changes.  When this event fires the data property of the {@link $system.SystemEvent} has the following definition:
	 * <pre>
	 * {
	 *    speed: 3025 // Current RPM speed
	 * }
	 */
	ONRPMCHANGE: 'onrpmchange',
	/** Triggers when the user adjusts the driver temperature.  When this event fires the data property of the {@link $system.SystemEvent} has the following definition:
	 * <pre>
	 * {
	 *    temperature: 75 // Current driver temperature setting
	 * }
	 */
	ONDRIVERTEMPCHANGE: 'ondrivertempchange',
	/** Triggers when the user adjusts the passenger temperature.  When this event fires the data property of the {@link $system.SystemEvent} has the following definition:
	 * <pre>
	 * {
	 *    temperature: 73 // Current driver temperature setting
	 * }
	 */
	ONPASSENGERTEMPCHANGE: 'onpassengertempchange'
}

/**
 * The Media source represents an an <b>abstract interface</b> to an available media source of the system.  There are various types of media sources that are available which are defined by
 * the type property
 * @namespace MediaSource
 * @memberof $system
 * @property {uid} string - The unique identifier for the media source
 * @property {string} name - The name of the media source
 * @property {$system.MediaSourceType} type - The type of the media source
 */
$system.MediaSource = {
	/** 
	 * This function will return the current song which is playing (or paused)
	 * @returns {$system.Song}
	 */
	getCurrentSong: function() {}	
}

/**
 * Type of media source used with {@link $system.MediaSource}
 * @namespace MediaSourceType
 * @readonly
 * @memberof $system
 */
$system.MediaSourceType = {
	/** [Standard player]{@link $system.PlayerMediaSource} with play lists, albums, artists and songs */
	PLAYER: 0,
	/** AM/FM Radio */
	AMFM: 1,
	/** XM Radio */
	XM: 2
}

/**
 * The Phone Manager provides an interface between application JavaScript code and the phone services of Brainiac. 
 * @namespace PhoneManager
 * @memberof $system
 */
function PhoneManager(options) {
	// Initialize the return object
	var object = {};	
	
	/** 
	 * This function will return the list of calls made/received/missed by the connected phone
	 * @function getCallLog
	 * @memberof $system.PhoneManager
	 * @param {CallLogCallback} callback - Function to be run when the list has been retrieved
	 */
	object.getCallLog = function(callback) {
		$core._loadJSONFromUrl('data/data-call-list.json', callback);
	}
	object.getCallLog = object.getCallLog.bind(object);
	
	return object;
}

/**
 * The {@link $system.PhoneManager} <b>callback</b> event definition for <b>getCallLog</b>
 * @callback CallLogCallback
 * @param {$system.CallLogEntry[]} entries - List of call log entries that have been returned
 */
 
/**
 * Represents a Phone number entry 
 * @namespace PhoneNumber
 * @memberof $system
 * @property {string} number - The phone Number
 * @property {$system.PhoneNumberType} type - The type of phone number
 */
$system.PhoneNumber = {}

/**
 * Type of phone number used with {@link $system.PhoneNumber} 
 * @namespace PhoneNumberType
 * @readonly
 * @memberof $system
 */
$system.PhoneNumberType = {
	/** Home phone number */
	HOME: 0,
	/** Work phone number */
	WORK: 1,
	/** Mobile phone number */
	MOBILE: 2,
	/** Other phone number */
	OTHER: 3
}


/**
 * Type of media source used with {@link $system.MediaSource}
 * @namespace PlayerMediaSource
 * @memberof $system
 * @extends $system.MediaSource
 */
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
	
	/** 
	 * This function will return an array of albums, in alphabetical order, available to this media source
	 * @function getAlbums
	 * @memberof $system.PlayerMediaSource
	 * @returns {$system.Album[]} 
	 */
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
	
	/** 
	 * This function will return an array of albums that have been played the most.  Maximum return of 4 items.
	 * @function getMostPlayedAlbums
	 * @memberof $system.PlayerMediaSource
	 * @returns {$system.Album[]} 
	 */
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
	
	/** 
	 * This function will load and play the song which is passed as a parameter
	 * @function load
	 * @memberof $system.PlayerMediaSource
	 * @param {$system.Song} song - Song for the system to play
	 */
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
	
	/** 
	 * This function will pause the current playing song if it is playing. 
	 * @function pause
	 * @memberof $system.PlayerMediaSource
	 */
	object.pause = function() {
		if (this._player.paused == true) return;
		this._player.pause();
	}
	object.pause = object.pause.bind(object);
	
	/** 
	 * This function will play the currently loaded song if it is paused. 
	 * @function play
	 * @memberof $system.PlayerMediaSource
	 */
	object.play = function() {
		if (this._player.src == undefined) return;
		this._player.play();
	}
	object.play = object.play.bind(object);
	
	/** 
	 * This function will return <b>true</b> if the current media player is paused
	 * @function isPaused
	 * @memberof $system.PlayerMediaSource
	 * @returns {boolean} 
	 */
	object.isPaused = function() {
		return this._player.paused;
	}
	object.isPaused = object.isPaused.bind(object);
	
	return object;
}
/**
 * This object represents all of the information for a song which could be currently playing, in a play list or an album.
 * @namespace Song
 * @memberof $system
 * @property {uid} string - The unique identifier for the song
 * @property {string} [name] - The name of the song
 * @property {string} [albumName] - The name of the album this song belongs to
 * @property {string} [artistName] - The name of the artist who performs this song
 * @property {number} [duration] - The duration of this song in seconds
 * @property {string} [albumArt] - Image path for album art
 * @property {number} [year] - The year the song was released
 * @property {string} [genre] - The genre of the song
 */
$system.Song = {}

/**
 * Pre-determined audio sound effect values to be used with the system's [Audio Manager]{@link $system.AudioManager}
 * @namespace
 * @readonly
 * @memberof $system
 */
$system.SoundEffect = {
	/** Blip sound */
	BLIP: 0,
	/** Horn sound */
	HORN: 1,
	/** Touch interaction sound */
	TOUCH: 2,
	/** Touch tone sound for key 0 */
	TONE0: 3,
	/** Touch tone sound for key 1 */
	TONE1: 4,
	/** Touch tone sound for key 2 */
	TONE2: 5,
	/** Touch tone sound for key 3 */
	TONE3: 6,
	/** Touch tone sound for key 4 */
	TONE4: 7,
	/** Touch tone sound for key 5 */
	TONE5: 8,
	/** Touch tone sound for key 6 */
	TONE6: 9,
	/** Touch tone sound for key 7 */
	TONE7: 10,
	/** Touch tone sound for key 8 */
	TONE8: 11,
	/** Touch tone sound for key 9 */
	TONE9: 12,
	/** Touch tone sound for key # */
	TONE_POUND: 13,
	/** Touch tone sound for key * */
	TONE_ASTERIK: 14	
}
