/* [Copyright (c) 2015 Workshop 12 Inc.] $system VERSION: 1.0.0.1105*/

/**
 * Main system object for Brainiac
 * @namespace $system
 * @property {$system.AccessoryManager} accessoryManager - This <b>read-only</b> property provides you access to Brainiac's connected accessories.
 * @property {$system.AudioManager} audio - This <b>read-only</b> property provides you access to Brainiac's audio services
 * @property {$system.ContactsManager} contacts - This <b>read-only</b> property provides you access to Brainiac's contact services
 * @property {$system.RelayManager} relays - This <b>read-only</b> property provides you access to Brainiac's relay services
 * @property {$system.SuspensionManager} suspension - This <b>read-only</b> property provides you access to Brainiac's suspension services
 * @property {$system.HVAC} hvac This <b>read-only</b> property gives you acces to Brainiac's heating/ventilation/air-conditioning [HVAC].
 * @property {$system.OBDii} obd - This <b>read-only</b> property provides you access to Brainiac's connected OBD-II device.
 * @property {$system.PhoneManager} phone - This <b>read-only</b> property provides you access to Brainiac's phone services
 * @property {$system.Util} util - This <b>read-only</b> property provides you access some util functions.
 */
var $system = {
	version: {
		major: 1,
		minor: 0,
		revision: 0,
		build: 1
	},
	_apps: [],
	config: {
		theme: {},
		celsius: false,
		isEmulator: false
	},
	
	// Initialize the system object
	init: function(config) {
		this.isClientDevice = (config && config.isClientDevice == true) ? true : false;
		// Grab the configuration	
		this.config.theme = (config.theme == undefined) ? {} : config.theme;
		this.config.celsius = (config.celsius != undefined) ? config.celsius : this.config.celsius;
		this.config.isEmulator = (config.isEmulator != undefined) ? config.isEmulator : this.config.isEmulator;
		this.config.isClientDevice = (config.isClientDevice != undefined) ? config.isClientDevice : this.config.isClientDevice;
		// Create our services
		this.audio = new AudioManager(this.isClientDevice);
		this.contacts = new ContactsManager();
		this.phone = new PhoneManager();
		this.relays = new RelayManager();
		this.suspension = new SuspensionManager();
	},
	
	/** 
	 * Detect if the system is using Celsius for the temperature measurements
	 * @returns {Boolean} Returns true if Celsius is used for temperature measurements
	 */
	isCelsius: function() {
		return this.config.celsius;
	},
	
	/** 
	 * Register an app handle to receive notifications
	 * @param {string} id - Unique identifier for the app
	 * @param {$ui} instance - Instance of a $ui app framework to recieve events
	*/
	registerApp: function(id, instance) {
		this._apps.push({id: id, instance: instance});
	},
	
	/** 
	 * Remove an event listener from the system
	 * @param {string} id - Unique identifier of the app to unregister
	 */
	unregisterApp: function(id) {
		var i,
			item;
		for (i = 0; i < this._apps.length; i++) {
			item = this._apps[i];
			if (item.id == id) {
				this._apps.splice(i, 1);
				item.id = undefined;
				item.instance = undefined;
				return;
			}
		}
	},
	
	// Initiate an outgoing phone call
	initiateCall: function(data) {
		if (this.config.isEmulator == true || true) { // TODO - fix
			$ui.push(activeCall, data);
		}
	}
}


 
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
	GREEN_SEA: '#16A085',
	/**  */
	EMERALD:  '#2ECC71',
	/**  */
	NEPHRITIS: '#27AE60',
	/** */
	PETER_RIVER: '#3498DB',
	/**  */
	BELIZE_HOLE: '#2980B9',
	/**  */
	WET_ASPHAULT: '#34495E',
	/**  */
	MIDNIGHT_BLUE: '#2C3E50',
	/** */
	PINK: '#FAABEC',
	/**  */
	AMETHYST: '#AF7AC4',
	/**  */
	WISTERIA: '#8E44AD',
	/**  */
	SUN_FLOWER: '#F1C40F',
	/**  */
	ORANGE: '#F39C12',
	/**  */
	CARROT: '#E67E22',
	/**  */
	PUMPKIN: '#D35400',
	/**  */
	ALIZARIN: '#D94646', // Our brand color
	/**  */
	POMEGRANATE: '#C0392B',
	/**  */
	SILVER: '#BDC3C7',
	/**  */
	CONCRETE: '#AAB7B7',
	/**  */
	ASBESTOS: '#98A3A3'
}
 

/**
 * @namespace AccessoryManager
 * @memberof $system
 * @readonly
 */
$system.accessoryManager = function() {
    function remoteCall(what, onSuccess, onError) {
        $core._remoteCall("/brainiac/service/hardware/acc/" + what, onSuccess, onError);
    }

    var accessoryManager = {
        _private: {}
    };
    accessoryManager._private.accessories = [];

    /**
     * Get the currently known accessories. This function returns immediatley - it does not query the server.
     * @function getConnectedAccessories
     * @memberof $system.AccessoryManager#
     * @param {String} [family] Family of accessory to filter on.
     * @return {Array.<$system.Accessory>}
     */
    accessoryManager.getConnectedAccessories = function(family) {
        if (typeof(family)=="string") {
            var toReturn = [];
            for (var i=0; i<this._private.accessories.length; ++i) {
                var next = this._private.accessories[i];
                if (next.family === family) {
                    toReturn.push($system.util.clone(next));
                }
            }
            return toReturn;
        }
        return $system.util.clone(this._private.accessories);
    }.$bind(accessoryManager);

    /**
     * Send a command to the given accessory.
     * @function sendCommandToAccessory
     * @memberof $system.AccessoryManager#
     * @param {string|$system.Accessory} accessory The serial number of, or the accessory to send the command to.
     * @param {string} command The command to send to the accessory.
     * @param {$system.AccessoryManager.SendMessageCallback} [onSuccess] The callback which will be triggered on success.
     * @param {$system.BossError.BossErrorCallback} [onError] The callback which will be triggered when any error occurs.
     */
    accessoryManager.sendCommandToAccessory = function(accessory, command, onSuccess, onError) {
        var serialNumber = "";
        if ("string" == typeof(accessory)) {
            serialNumber = accessory;
        } else {
            if ("serialNumber" in accessory) {
                serialNumber = accessory["serialNumber"];
            } else {
                console.log("There was no serial number in the accesory object");
                return;
            }
        }
        if ("string" != typeof(serialNumber) || serialNumber === "") {
            console.log("Serial number is not usable: " + serialNumber);
            return;
        }
        if ("string" != typeof(command)) {
            console.log("Command is not a string");
            return;
        }
        var query = "command?";
        query += "serialNumber=" + encodeURIComponent(serialNumber);
        query += "&";
        query += "command=" + encodeURIComponent(command);
        remoteCall(query, onSuccess, onError);
    }.$bind(accessoryManager);

    /**
     * Query the BOSS for currently connected accessories.
     * @function  updateConnectedAccessories
     * @memberof $system.AccessoryManager#
     * @param {$system.AccessoryManager.UpdateConnectedAccessoriesCallback} onUpdated The callback which will be triggered when
     *        the list is updated.
     */
    accessoryManager.updateConnectedAccessories = function(onUpdated) {
        remoteCall("list", function(result) {
            if ("accessories" in result) {
                accessoryManager._private.accessories = result.accessories;
                if (typeof(onUpdated) === "function") {
                    onUpdated($system.util.clone(result.accessories));
                }
            } else {
                console.log("Problem updating accessories - telling caller about our old (possibly stale) ones: " + JSON.stringify(result));
                if (typeof(onUpdated) === "function") {
                    onUpdated($system.util.clone(accessoryManager._private.accessories));
                }
            }
        }, function(error) {
            console.log("Problem updating accessories: " + error);
            if (typeof(onUpdated) === "function") {
                onUpdated($system.util.clone(accessoryManager._private.accessories));
            }
        });
    }.$bind(accessoryManager);

    return accessoryManager;
}();

/**
 * Objects of this namespace encapsulate the basic information about a (possibly) connected accessory.
 * @namespace Accessory
 * @memberof $system
 * @property {String} model The model name. eg: "4x4".
 * @property {String} family The model family. eg: "relay".
 * @property {String} version The product's version number.
 * @property {String} serialNumber The product's (hopefully) unique serial number.
 */

/**
 * Callback for updating the connected accessories. Given as a parameter to to [updateConnectedAccessories]{@link $system.AccessoryManager.updateConnectedAccessories}.
 * @callback UpdateConnectedAccessoriesCallback
 * @memberof $system.AccessoryManager
 * @param {Array.<$system.Accessory>} accessories The now known connected accessories.
 */


/**
 * This object represents all of the information for an album.
 * @namespace Album
 * @memberof $system
 * @property {uid} string - The unique identifier for the album
 * @property {string} [name] - The name of the album
 * @property {string} [artistName] - The name of the artist who performs this song
 * @property {string} [artwork] - Image path for album art
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
		_private: {
			mediaSources: ["tba"],
			currentMediaSource: null
		}
	};
	
	object._private.createDelayedMediaSource = function() {
		if ($system && $system.config && $system.config.isEmulator) {
			return new EmulatorPlayerMediaSource();
		} else {
			return new RemotePlayerMediaSource();
		}
	}.$bind(object);

	// Load our sounds
	object._sounds = {};
	if ($system.isClientDevice === false) {
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
		if ("brainiacSystemSound" in window) {
			brainiacSystemSound.playSoundEffect(soundEffect);
			return;
		}
		if ($system.isClientDevice === true) return;
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
	}.$bind(object);
	
	/** 
	 * Retrieves all of the available media sources
	 * @function getMediaSources
	 * @memberof $system.AudioManager
	 * @returns {$system.MediaSource[]}
	 */
	object.getMediaSources = function() {
		for (var i=0; i<this._private.mediaSources.length; ++i) {
			if ("tba" === this._private.mediaSources[i]) {
				this._private.mediaSources[i] = this._private.createDelayedMediaSource();
			}
		}
		return this._private.mediaSources;
	}.$bind(object);
	
	/** 
	 * Returns the current active media source
	 * @function getActiveMediaSource
	 * @memberof $system.AudioManager
	 * @returns {$system.MediaSource}
	 */
	object.getActiveMediaSource = function() {
		if (this._private.currentMediaSource === null) {
			this.getMediaSources();
			this._private.currentMediaSource = this._private.mediaSources[0];
		}
		return this._private.currentMediaSource;
	}.$bind(object);
	
	return object;
}
/**
 * This namespace covers errors that will be produced by the Brainiac Onboard Server
 * Suite [BOSS].
 * @namespace BossError
 * @memberof $system
 * @readonly
 */
$system.bossError = function() {
    function BossError() {

    };

    // callbacks

    /**
     * Callback when expecting a BossError.
     * @callback BossErrorCallback
     * @memberof $system.BossError
     * @param {$system.BossError.BossErrorResponse|string} error If the
     *        call fails without getting a response from the server your
     *        callback will receive a normal error. If the server produced
     *        the error - it will be a [BossErrorResponse]{@link $system.BossError.BossErrorResponse}.
     */

    /**
     * See [BossErrorCodes]{@link $system.BossError.BossErrorCodes} for expected values of enum and code.
     * @namespace BossErrorResponse
     * @memberof $system.BossError
     * @property {string} message A human readable string that may help a developer
     *           understand what went wrong. It will not be localised and should not be shown
     *           to end users.
     * @property {string} enum A string matching the Java error code enum name.
     * @property {string} description A brief human readable string. It will not be localised and should not
     *           be shown to end users.
     * @property {number} code An error code matching the Java error code integer value.
     */

    /**
     * These are the values that should be expected in a [BossErrorResponse]{@link $system.BossError.BossErrorResponse}
     * @namespace BossErrorCodes
     * @memberof $system.BossError
     * @property {number} UNSPECIFIED_ERROR Error code: <b><code>0</code></b> Unspecified error
     * @property {number} UNHANDLED_EXCEPTION Error code: <b><code>1</code></b> Unhandled exception
     * @property {number} NOT_IMPLEMENTED Error code: <b><code>2</code></b> The given feature is not currently implemented
     * @property {number} PARAMETER_MISSING Error code: <b><code>3</code></b> Missing parameter
     * @property {number} PARAMETER_BAD Error code: <b><code>4</code></b> Bad parameter given
     * @property {number} TIMEOUT Error code: <b><code>5</code></b> Timeout
     * @property {number} OBD_NO_DEVICE_CONNECTED Error code: <b><code>2000</code></b> No device connected
     * @property {number} OBD_VEHICLE_NOT_DETECTED Error code: <b><code>2001</code></b> No vehicle on / connected
     * @property {number} OBD_UNAVAILABLE Error code: <b><code>2002</code></b> Device unavailable
     * @property {number} OBD_NO_RESPONSE Error code: <b><code>2003</code></b> No response
     * @property {number} OBD_MODE_NOT_SUPPORTED Error code: <b><code>2004</code></b> Mode not supported
     * @property {number} OBD_PID_NOT_SUPPORTED Error code: <b><code>2005</code></b> PID not supported (yet)
     * @property {number} OBD_NOT_ENOUGH_DATA Error code: <b><code>2006</code></b> Not enough data returned
     * @property {number} OBD_UNEXPECTED_RESPONSE Error code: <b><code>2007</code></b> Unexpected response
     * @property {number} USB_DRIVER_ERROR Error code: <b><code>3000</code></b> USB Driver Error
     */

    return new BossError();
}();
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
	}.$bind(object);
	
	return object;
}

/**
 * The {@link $system.ContactsManager} <b>callback</b> event definition for <b>getContactList</b>
 * @callback ContactListCallback
 * @param {$system.Contact[]} contacts - List of contacts that have been returned
 */
/**
 * Type of media source used with {@link $system.MediaSource}
 * @namespace EmulatorPlayerMediaSource
 * @memberof $system
 * @extends $system.MediaSource
 */
function EmulatorPlayerMediaSource() {

	// Initialize the return object
	var object = new PlayerMediaSource();

	object._private.player = new Audio();
	object._private.songHistory = new EmulatorSongHistory();

	// Load all of our media library
	$core._loadJSONFromUrl('data/data-mediaLibrary.json', function(data) {
		this._populateLibrary(data);
        this.getSongs(function(songs) {
            this._private.songHistory.setPlaylist(songs, 0, false);
        }.$bind(this));
	}.$bind(object));

	object.playWithContext = function(uid, context, contextId) {
		// If we are playing based on:
		// - songs         - then all songs are a possibiliy.
		// - genre         - then anything in the genre is possible.
		// - artist        - then anything by the artist is possible
		// - album         - then anything in the album is possible.
		// - playlist	   - then anything in the playlist is possible.

		var playList = function(songs) {
			var startFrom = 0;
			for (var i = 0; i < songs.length; ++i) {
				if (songs[i].uid == uid) {
					startFrom = i;
					break;
				}
			}
			this._private.songHistory.setPlaylist(songs, startFrom);
		}.$bind(this);

		if (context === undefined) {
			object.getSongs(playList);
		} else if (context == "genre") {
			object.getGenreSongs(contextId, playList);
		} else if (context == "artist") {
			object.getArtistSongs(contextId, playList);
		} else if (context == "album") {
			object.getAlbumSongs(contextId, playList);
		} else if (context == "playlist") {
			object.getPlaylistSongs(contextId, playList);
		} else {
			throw "Unhandled playWithContext context: " + context;
		}
	}.$bind(object);

	object.skipForward = function() {
		this._private.songHistory.skipForward();
	}.$bind(object);

	object.skipBack = function() {
		this._private.songHistory.skipBack();
	}.$bind(object);

	/** 
	 * This function will pause the current playing song if it is playing.
	 * @function pause
	 * @memberof $system.PlayerMediaSource
	 */
	object.pause = function() {
		if (this._private.player.paused == true) return;
		this._private.player.pause();
	}.$bind(object);

	/** 
	 * This function will play the currently loaded song if it is paused.
	 * @function play
	 * @memberof $system.PlayerMediaSource
	 */
	object.play = function() {
		var currentSrc = this._private.player.src;
		if (currentSrc == undefined || "" == currentSrc) {
			this._private.songHistory.refreshCurrent();
		} else {
			this._private.player.play();
		}
	}
	//	object.play = object.play.$bind(object);

	/** 
	 * This function will return <b>true</b> if the current media player is paused
	 * @function isPaused
	 * @memberof $system.PlayerMediaSource
	 * @returns {boolean}
	 */
	object.isPaused = function() {
		return this._private.player.paused;
	}.$bind(object);

	Object.defineProperty(object,"shuffle",{
		set: function(shuffle) {
			console.log("Write to shuffle: " + shuffle);
			this._private.songHistory.shuffle = shuffle;
		}.$bind(object),
		get: function() {
			console.log("Read of shuffle");
			return this._private.songHistory.shuffle;

		}.$bind(object)
	});

	Object.defineProperty(object,"repeat",{
		set: function(repeat) {
			this._private.songHistory.repeat = repeat;
		}.$bind(object),
		get: function() {
			return this._private.songHistory.repeat;
		}
	});

	object._private.onSongChanged = function(event) {
		if (event && event.data && event.data.name) {
			// cool...
		} else {
			return;
		}

		if (event && event.data) {
			if (event.data.triggerPlay) {
				this._private.player.pause();
				if (event.data.path) {
					this._private.player.src = event.data.path;
				} else {
					this._private.player.src = "";
				}
				this._private.player.play();
				setTimeout(function() {
					if (this._private.player.error) {
						this.skipForward();
					}
				}.$bind(this), 500);
			}
		}
	}.$bind(object);

	object._private.onEnded = function(event) {
		this._private.songHistory.moveForward();
		setTimeout(function() {
			if (this._private.player.paused) {
				var event = new $ui.DataEvent($system.EventType.MEDIA_PLAYBACK_ENDED, null);
				$ui.raiseEvent(event);
			}
		}.$bind(this), 750);
	}.$bind(object);

	object._private.onPause = function(event) {
		setTimeout(function() {
			if (this._private.player.paused) {
				var event = new $ui.DataEvent($system.EventType.MEDIA_PLAYBACK_ENDED, null);
				$ui.raiseEvent(event);
			}
		}.$bind(this), 750);
	}.$bind(object);

	object._private.onPlay = function(event) {
		setTimeout(function() {
			if (!this._private.player.paused) {
				var event = new $ui.DataEvent($system.EventType.MEDIA_PLAYBACK_STARTED, null);
				$ui.raiseEvent(event);
			}
		}.$bind(this), 750);
	}.$bind(object);

    object.getStatus = function() {
    	this._private.songHistory.getStatus();
    }.$bind(object);

    object.toggleShuffle = function() {
    	var current = this._private.songHistory.shuffle;
    	this._private.songHistory.shuffle = !current;
    }.$bind(object);

    object.toggleRepeat = function() {
    	this._private.songHistory.repeat = (this._private.songHistory.repeat + 1) % 3;
    }.$bind(object);

    object.registerInterest = function(what) {
    	this.getStatus();
    }.$bind(object);

    object.unregisterInterest = function(what) {
    }.$bind(object);

	$ui.addEventListener($system.EventType.MEDIA_SONG_CHANGED, object._private.onSongChanged);

	object._private.player.onended = object._private.onEnded;
	object._private.player.onpause = object._private.onPause;
	object._private.player.onplay = object._private.onPlay;


	return object;
}
/**
 * This class encapsulates song history (and future). It is emulator specific and is subject to removal.
 * @namespace SongHistory
 * @memberOf $system
 */
function EmulatorSongHistory() {
    var object = {
        REPEAT_NONE: 0,
        REPEAT_ONE: 1,
        REPEAT_ALL: 2,
        _private: {
            repeat: 0,
            shuffle: false
        },
        history: [],
        future: [],
        playlist: [],
        playlistAt: 0
    };

    object._private.setCurrent = function(song, triggerPlay) {
        if (triggerPlay == undefined) {
            triggerPlay = true;
        }

        if (song == null) {
            song = {};
        }

        var data = $system.util.clone(song);
        data.triggerPlay = triggerPlay;

        this.current = song;

        if (window.$core) {
            var event = new $ui.DataEvent($system.EventType.MEDIA_SONG_CHANGED, data);
            $core.raiseEvent(event);
        }

        return song;
    }.$bind(object);

    object.getStatus = function() {
        // Send song data.
        var song = this.current;
        if (song == null) {
            song = {};
        }

        var data = $system.util.clone(song);
        data.triggerPlay = false;

        if (window.$core) {
            var event = new $ui.DataEvent($system.EventType.MEDIA_SONG_CHANGED, data);
            $core.raiseEvent(event);

            // Send Repeat
            event = new $ui.DataEvent($system.EventType.MEDIA_REPEAT_CHANGED, this._private.repeat);
            $core.raiseEvent(event);

            // Send Shuffle
            event = new $ui.DataEvent($system.EventType.MEDIA_SHUFFLE_CHANGED, this._private.shuffle);
            $core.raiseEvent(event);
        }
    }.$bind(object);

    object.refreshCurrent = function() {
        this._private.setCurrent(this.getCurrent());
    }.$bind(object);

    Object.defineProperty(object, "shuffle", {
        set: function(shuffle) {
            if (shuffle !== this._private.shuffle) {
                this._private.shuffle = shuffle === true;
                if (this.playlist.length != 0) {
                    if (this._private.shuffle) {
                        for (var i = 0; i < this.playlist.length; ++i) {
                            this.playlist[i].rand = Math.random();
                        }
                        this.playlist.sort(function(a, b) {
                            return a.rand - b.rand;
                        });
                    } else {
                        this.playlist.sort(function(a, b) {
                            return a.ordinal - b.ordinal;
                        });
                    }
                    this.playlistAt = 0;
                    this.future = [];
                    this.skipForward();
                }
                if (window.$core) {
                    var event = new $ui.DataEvent($system.EventType.MEDIA_SHUFFLE_CHANGED, this._private.shuffle);
                    $core.raiseEvent(event);
                }
            }
        }.$bind(object),
        get: function() {
            return this._private.shuffle;
        }.$bind(object)
    });

    Object.defineProperty(object, "repeat", {
        set: function(repeat) {
            if (typeof(repeat) === "number") {
                if (repeat >= 0 && repeat <= 2) {
                    if (repeat != this._private.repeat) {
                        this._private.repeat = repeat;
                        if (window.$core) {
                            var event = new $ui.DataEvent($system.EventType.MEDIA_REPEAT_CHANGED, this._private.repeat);
                            $core.raiseEvent(event);
                        }
                    }
                }
            }
        }.$bind(object),
        get: function() {
            return this._private.repeat;
        }
    });

    /**
     * Get the previous song. May return null.
     */
    object.skipBack = function() {
        var current = this.getCurrent();

        if (this.history.length == 0) {
            return this._private.setCurrent(current);
        }

        if (this.isValid(current)) {
            this.future.push(current);
        }

        return this._private.setCurrent(this.history.pop());
    }.$bind(object);

    /**
     * Get the current song. May return null.
     */
    object.getCurrent = function(allowBadResult) {
        if (allowBadResult || this.current) {
            return this.current;
        } else {
            return this.skipForward();
        }
    }.$bind(object);

    object.nextSong = function() {
        // called when a song finishes...
    }.$bind(object);

    object.isValid = function(song) {
        if (song && song.uid && song.uid.length > 0) {
            return true;
        }
        return false;
    }.$bind(object);

    object.moveForward = function() {
        var current = this.getCurrent();

        if (this.repeat == this.REPEAT_ONE) {
            this._private.setCurrent(current);
            return;
        }

        this.skipForward();

    }.$bind(object);

    /**
     * Move to the next song.
     */
    object.skipForward = function(triggerPlay) {
        var current = this.getCurrent(true);

        if (this.future.length == 0 && !this.playListHasNext()) {
            // todo raise finished event
            return current;
        }

        if (this.isValid(current)) {
            var doPush = true;
            if (this.history.length != 0) {
                var historyTop = this.history[this.history.length - 1];
                if (historyTop.uid === current.uid) {
                    doPush = false;
                }
            }
            if (doPush) {
                this.history.push(current);
            }
        }

        if (this.future.length > 0) {
            return this._private.setCurrent(this.future.pop(), triggerPlay);
        }

        return this._private.setCurrent(this.playListNext(), triggerPlay);
    }.$bind(object);

    /**
     *
     */
    object.setPlaylist = function(songs, startFrom, triggerPlay) {
        this.history = [];
        this.future = [];
        this.playlist = [];
        this.playlistAt = 0;

        for (var i = 0; i < songs.length; ++i) {
            var song = $system.util.clone(songs[(startFrom + i) % songs.length]);
            song.ordinal = i;
            this.playlist.push(song);
        }
        this.skipForward(triggerPlay);
    }.$bind(object);

    object.playListHasNext = function() {
        if (this.playlist.length == 0) {
            return false;
        }
        if (this.repeat == this.REPEAT_ALL) {
            return true;
        }
        return this.playlistAt < this.playlist.length;
    }.$bind(object);

    object.playListNext = function() {
        if (this.playlist.length == 0) {
            return null;
        }

        if (this.repeat == this.REPEAT_ALL) {
            this.playlistAt %= this.playlist.length;
        }

        if (this.playlistAt < this.playlist.length) {
            return this.playlist[this.playlistAt++];
        }

        return null;
    }.$bind(object);

    return object;
};
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
	 * </pre>
	 */
	ONSPEEDCHANGE: 'onspeedchange',
	/** Triggers when the fuel level of the vehicle changes.  When this event fires the data property of the {@link $system.SystemEvent} has the following definition:
	 * <pre>
	 * {
	 *    level: 0.25 // Fraction of fill level of tank
	 * }
	 * </pre>
	 */
	ONFUELCHANGE: 'onfuelchange',
	/** Triggers when the RPM of the vehicle changes.  When this event fires the data property of the {@link $system.SystemEvent} has the following definition:
	 * <pre>
	 * {
	 *    speed: 3025 // Current RPM speed
	 * }
	 * </pre>
	 */
	ONRPMCHANGE: 'onrpmchange',
	/** Triggers when the user adjusts the driver temperature.  When this event fires the data property of the {@link $system.SystemEvent} has the following definition:
	 * <pre>
	 * {
	 *    temperature: 75 // Current driver temperature setting
	 * }
	 * </pre>
	 */
	ONDRIVERTEMPCHANGE: 'ondrivertempchange',
	/** Triggers when the user adjusts the passenger temperature.  When this event fires the data property of the {@link $system.SystemEvent} has the following definition:
	 * <pre>
	 * {
	 *    temperature: 73 // Current driver temperature setting
	 * }
	 * </pre>
	 */
	ONPASSENGERTEMPCHANGE: 'onpassengertempchange',
	/**
	 * Triggered when the current song has changed.
	 */
    MEDIA_SONG_CHANGED: "mediaSongChanged",
    /**
     * Triggered when the state of the media player's 'repeat' has changed.
     */
    MEDIA_REPEAT_CHANGED: "mediaRepeatChanged",
    /**
     * Triggered when the state of shuffle has changed.
     */
    MEDIA_SHUFFLE_CHANGED: "mediaShuffleChanged",
    /**
     * Triggered when media playback starts.
     */
    MEDIA_PLAYBACK_STARTED: "mediaPlaybackStarted",
    /**
     * Triggered when media playback completes.
     */
    MEDIA_PLAYBACK_ENDED: "mediaPlaybackEnded",
    /**
     * Triggered when the event connection to the BOSS has failed too many times too quickly.
     */
    EVENT_CONNECTION_FAILURE: "eventConnectionFailure",
	/** Triggers when the user requests the system interface for adjusting the suspension height.  When this event fires the data property of the {@link $system.SystemEvent} has the following definition:
	 * <pre>
	 * {
	 *    corner: "lf"" // valid values are lf, rf, lr, rr
	 * }
	 * </pre>
	 */
	ONREQUESTSUSPENSIONUI: 'onrequestsuspensionui',
	/** Triggers when the air presssure in either the tank, lf, rf, lr, rr changes or the system is asked for current pressure settings.  When this event fires the data property of the {@link $system.SystemEvent} has the following definition:
	 * <pre>
	 * {
	 *    tank: 73, // Current tank psi
	 *    lf: 40, // Current psi of the left front air bag
	 *    rf: 40, // Current psi of the right front air bag
	 *    lr: 51, // Current psi of the left rear air bag
	 *    rr: 52, // Current psi of the right rear air bag
	 * }
	 * </pre>
	 */
	ONSUSPENSIONDATA: 'onsuspensiondata'
}

/**
 * HVAC provides access to the vehicle's HVAC - if available.
 * @namespace HVAC
 * @memberof $system
 * @readonly
 * @property {$system.HVAC.FanDirection} fanDirection current direction of the fan - and flags for other system features.
 *           A global event of type <code>onfandirectionchanged</code> is raised when this value is changed.
 * @property {number} fanSpeed -1 is auto. 0 is off. 0 < n <= 1 to indicate power otherwise.
 *           An event of type <code>onfanspeedchanged</code> is raised when this value is changed.
 */
/**
 * @namespace FanDirection
 * @memberof $system.HVAC
 * @readonly
 * @property {bool} face Is air currently directed at the face.
 * @property {bool} feet Is air currently directed at the feet.
 * @property {bool} frontDemist Is air currently directed at the front windscreen.
 * @property {bool} rearDemist Is the rear window heating coil on
 * @property {bool} ac Is the AC on
 * @property {bool} recirc Recirculation mode. True for 'fresh', False for recirculated.
 * @property {bool} enabled Is the overall system enabled. Eg: Fan is off. In that
 *                  case though some features will still work, eg: rear demist.
 */
$system.hvac = new function() {

    this._private = {
        fanDirection: {
            face: false,
            feet: true,
            frontDemist: true,
            rearDemist: false,
            ac: false,
            recirc: false,
            enabled: true
        },
        fanSpeed: 0.5
    };

    this._private.validateDirection = function(direction) {
        for (var field in this._private.fanDirection) {
            if (field in direction && (direction[field] === true || direction[field] === false)) {} else {
                return false;
            }
        }
        return true;
    }.$bind(this);

    this._private.directionEquals = function(a, b) {
        for (var field in this._private.fanDirection) {
            if (field in a && field in b && a[field] === b[field]) {
                // good
            } else {
                return false;
            }
        }
        return true;
    }.$bind(this);

    this._private.copyDirection = function(src, dst) {
        for (var field in this._private.fanDirection) {
            dst[field] = src[field];
        }
    }.$bind(this);

    Object.defineProperty(this, "fanDirection", {
        get: function() {
            var toReturn = {};
            this._private.copyDirection(this._private.fanDirection, toReturn);
            return toReturn;
        },
        set: function(direction) {
            if (this._private.validateDirection(direction)) {
                if (this._private.directionEquals(this._private.fanDirection, direction)) {
                    // they match.. do nothing.
                } else {
                    this._private.copyDirection(direction, this._private.fanDirection);
                    var eventDirection = {};
                    this._private.copyDirection(direction, eventDirection);
                    var event = new $ui.DataEvent("onfandirectionchanged", {
                        fanDirection: eventDirection
                    });
                    $ui.raiseEvent(event);
                }
            } else {
                console.log("WARNING: Not a valid fan direction");
            }
        }.$bind(this)
    });

    Object.defineProperty(this, "fanSpeed", {
        get: function() {
            return this._private.fanSpeed;
        },
        set: function(speed) {
            if (typeof(speed) === 'number') {
                if (speed == -1 || (speed >= 0 && speed <= 1)) {
                    if (speed != this._private.fanSpeed) {
                        this._private.fanSpeed = speed;
                    }
                    var event = new $ui.DataEvent("onfanspeedchanged", { fanSpeed: speed });
                    $ui.raiseEvent(event);
                } else {
                    console.log("WARNING: fan speed out of range");
                }
            } else {
                console.log("WARNING: fan speed must be a number");
            }
        }
    });
}();
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
 * @namespace OBDii
 * @memberof $system
 * @readonly
 */
$system.obd = function() {
    function obd() {}

    { // callbacks
        // --------- Hex ---------

        /**
         * Callback for calling [sendPID()]{@link $system.OBDii#sendPID} and [clearDTC()]{@link $system.OBDii#clearDTC}.
         * Used when the OBD service will be sending back hex text or bytes.
         * @callback OBDHexCallback
         * @memberof $system.OBDii
         * @param {$system.OBDii.WrappedOBDHexResponse} response Response from the server.
         */

        /**
         * Payload received after calling [sendPID()]{@link $system.OBDii#sendPID} or [clearDTC()]{@link $system.OBDii#clearDTC}.
         * @namespace WrappedOBDHexResponse
         * @memberof $system.OBDii
         * @property {number} result Indication of server success.
         * @property {$system.OBDii.OBDHexResponse} obd OBD specific response.
         */

        /**
         * Inner payload received after calling [sendPID()]{@link $system.OBDii#sendPID} or [clearDTC()]{@link $system.OBDii#clearDTC}.
         * @namespace OBDHexResponse
         * @memberof $system.OBDii
         * @property {string} response Text response from the server. 
         *           May contain diagnostic messages. Should contain hex values.
         * @property {Array.<number>} responseBytes Array containing the
         *           hex string already converted to numbers.
         */

        // -------- DTC ---------

        /**
         * Callback for calling [getDTC()]{@link $system.OBDii#getDTC}.
         * @callback OBDDTCCallback
         * @memberof $system.OBDii
         * @param {$system.OBDii.WrappedOBDDTCResponse} response Response from the server.
         */

        /**
         * Payload received after calling [getDTC()]{@link $system.OBDii#getDTC}.
         * @namespace WrappedOBDDTCResponse
         * @memberof $system.OBDii
         * @property {number} result Indication of server success.
         * @property {$system.OBDii.OBDDTCResponse} obd OBD specific response.
         */

        /**
         * Inner payload received after calling [getDTC()]{@link $system.OBDii#getDTC}.
         * @namespace OBDDTCResponse
         * @memberof $system.OBDii
         * @property {Array.<string>} dtcCodes Possibly empty array of DTC codes.
         */

        // --------- OBD Status ---------

        /** 
         * Callback for calling [getOBDStatus()]{@link $system.OBDii#getOBDStatus}.
         * @callback OBDStatusCallback
         * @memberof $system.OBDii
         * @param {$system.OBDii.WrappedOBDStatusResponse} response
         */

        /**
         * Payload received after calling [getOBDStatus()]{@link $system.OBDii#getOBDStatus}.
         * @namespace WrappedOBDStatusResponse
         * @memberof $system.OBDii
         * @property {number} result Indication of server success.
         * @property {$system.OBDii.OBDStatusResponse} obd OBD specific response.
         */

        /**
         * Inner payload received after calling [getOBDStatus()]{@link $system.OBDii#getOBDStatus}.
         * @namespace OBDStatusResponse
         * @memberof $system.OBDii
         * @property {boolean} deviceConnected Flag indicating if an OBD device is connected.
         * @property {string} deviceVersion string indicating the version of the OBD device.
         * @property {string} vehicleConnected Flag indicating if a vehicle is detected / connected / on.
         */

        // --------- OBD Test ---------

        /** 
         * Callback for calling [getTestStatus()]{@link $system.OBDii#getTestStatus}.
         * @callback OBDTestCallback
         * @memberof $system.OBDii
         * @param {$system.OBDii.WrappedOBDTestResponse} response
         */

        /**
         * Payload received after calling [getTestStatus()]{@link $system.OBDii#getTestStatus}.
         * @namespace WrappedOBDTestResponse
         * @memberof $system.OBDii
         * @property {number} result Indication of server success.
         * @property {$system.OBDii.OBDTestResponse} obd OBD specific response.
         */

        /**
         * Inner payload received after calling [getTestStatus()]{@link $system.OBDii#getTestStatus}.
         * @namespace OBDTestResponse
         * @memberof $system.OBDii
         * @property {number} dtcCount Number of available DTCs.
         * @property {string} engineIgnitionType "spark" or "compression".
         * @property {boolean} milOn Shows if the MIL is (or should be) on.
         * @property {$system.OBDii.OBDTestResponseTests} tests Collection of test results.
         */

        /**
         * Collection of tests returned from [getTestStatus()]{@link $system.OBDii#getTestStatus}.
         * @namespace OBDTestResponseTests
         * @memberof $system.OBDii
         * @property {$system.OBDii.OBDTestSet} sinceDtcCleared Tests that have happened since the
         *           were cleared.
         * @property {$system.OBDii.OBDTestSet} thisDriveCycle Tests that have happened in this
         *           drive cycle.
         */

        /**
         * An OBDTestSet is a collection of tests reported by the OBD device. Most members are optional -
         * and depend on the ignition type of the attached vehicle.
         * These are returned from [getTestStatus()]{@link $system.OBDii#getTestStatus}.
         * @namespace OBDTestSet
         * @memberof $system.OBDii
         * @property {$system.OBDii.OBDTestResult} misFire Present for all engine types.
         * @property {$system.OBDii.OBDTestResult} fuelSystem Present for all engine types.
         * @property {$system.OBDii.OBDTestResult} components Present for all engine types.
         * @property {$system.OBDii.OBDTestResult} catalyst This test is optional. It is only present when the ignition type was "spark".
         * @property {$system.OBDii.OBDTestResult} heatedCatalyst This test is optional. It is only present when the ignition type was "spark".
         * @property {$system.OBDii.OBDTestResult} evaporativeSystem This test is optional. It is only present when the ignition type was "spark".
         * @property {$system.OBDii.OBDTestResult} secondaryAirSystem This test is optional. It is only present when the ignition type was "spark".
         * @property {$system.OBDii.OBDTestResult} acRefrigerant This test is optional. It is only present when the ignition type was "spark".
         * @property {$system.OBDii.OBDTestResult} oxygenSensor This test is optional. It is only present when the ignition type was "spark".
         * @property {$system.OBDii.OBDTestResult} oxygenSensorHeater This test is optional. It is only present when the ignition type was "spark".
         * @property {$system.OBDii.OBDTestResult} egrSystem This test is optional. It is only present when the ignition type was "spark".
         * @property {$system.OBDii.OBDTestResult} nmhcCatalystTest This test is optional. It is only present when the ignition type was "compression".
         * @property {$system.OBDii.OBDTestResult} noxScrMonitorTest This test is optional. It is only present when the ignition type was "compression".
         * @property {$system.OBDii.OBDTestResult} boostPressureTest This test is optional. It is only present when the ignition type was "compression".
         * @property {$system.OBDii.OBDTestResult} exhuastGasSensorTest This test is optional. It is only present when the ignition type was "compression".
         * @property {$system.OBDii.OBDTestResult} pmFilterMonitoringTest This test is optional. It is only present when the ignition type was "compression".
         * @property {$system.OBDii.OBDTestResult} egrVvtSystemTest This test is optional. It is only present when the ignition type was "compression".
         */

        /**
         * A result for an individual test. Note that the test may not be available
         * if not supported by the vehicle. Also note the negative meaning of incomplete.
         * @namespace OBDTestResult
         * @memberof $system.OBDii
         * @property {boolean} available Shows if this test is available on the vehicle.
         * @property {boolean} incomplete Shows if this test is incomplete.
         */
    }

    function remoteCall(what, onSuccess, onError) {
        $core._remoteCall("/brainiac/service/hardware/obd/" + what, onSuccess, onError);
    }

    /*
     * Capture the on success - and add responseBytes.
     */
    function getWrappedHandler(onSuccess) {
        return function(response) {
            if ("obd" in response) {
                var obd = response.obd;
                if ("response" in obd) {
                    obd["responseBytes"] = stringToIntArray(obd.response);
                }
            }
            if (onSuccess == null) {
                console.log("Wrapped response: " + JSON.stringify(response));
            } else {
                onSuccess(response);
            }
        }
    }

    function stringToIntArray(line) {
        // TODO - need a better strategy for multi line large responses.
        // Filter out multi line responses (for now)
        var lastCR = line.lastIndexOf("\r");
        if (lastCR != -1) {
            line = line.substring(lastCR + 1);
        }

        var toReturn = Array();
        var nextInt = 0;
        var state = 0;
        for (var i = 0; i < line.length; ++i) {
            nextInt <<= 4;

            var code = line.charCodeAt(i);
            if (code >= 0x30 && code <= 0x39) {
                nextInt |= code - 0x30;
                ++state;
            } else if (code >= 65 && code <= 70) {
                nextInt |= code - 65 + 10;
                ++state;
            } else if (code >= 97 && code <= 102) {
                nextInt |= code - 97 + 10;
                ++state;
            }

            if (state == 2) {
                toReturn.push(nextInt);
                state = 0;
                nextInt = 0;
            }
        }
        return toReturn;
    }

    /**
     * Get the Diagnostic Trouble Codes [DTC].
     * @function getDTC
     * @memberOf $system.OBDii#
     * @param {$system.OBDii.OBDDTCCallback} [onSuccess] Callback that will receive a successful response.
     * @param {$system.BossError.BossErrorCallback} [onError] Callback that will receive a [BossError]{@link $system.BossError} or string.
     */
    obd.prototype.getDTC = function getDTC(onSuccess, onError) {
        remoteCall("getDTC", onSuccess, onError);
    };

    /**
     * Get the system test status.
     * @function getTestStatus
     * @memberof $system.OBDii#
     * @param {$system.OBDii.OBDTestCallback} [onSuccess] Callback that will receive the test status response.
     * @param {$system.BossError.BossErrorCallback} [onError] Callback that will receive a [BossError]{@link $system.BossError} or string.
     */
    obd.prototype.getTestStatus = function getTestStatus(onSuccess, onError) {
        remoteCall("getTestStatus", onSuccess, onError);
    };

    /**
     * Send the given mode and pid to the vehicle.
     * @function sendPID
     * @memberof $system.OBDii#
     * @param {number} mode A number. Only 1 is currently supported.
     * @param {number} pid The PID to request.
     * @param {$system.OBDii.OBDHexCallback} [onSuccess] Callback that will receive the PID response.
     * @param {$system.BossError.BossErrorCallback} [onError] Callback that will receive a [BossError]{@link $system.BossError} or string.
     */
    obd.prototype.sendPID = function sendPID(mode, pid, onSuccess, onError) {
        try {
            mode = parseInt(mode);
            pid = parseInt(pid);

            remoteCall("sendPID?mode=" + mode + "&pid=" + pid, getWrappedHandler(onSuccess), onError);
        } catch (e) {
            if (onError != null) {
                onError(e);
            } else {
                console.log("Error setting up remote call " + e);
            }
        }
    };

    /**
     * Get the OBD status.
     * @memberof $system.OBDii#
     * @function getOBDStatus
     * @param {$system.OBDii.OBDStatusCallback} [onSuccess] Callback that will receive a successful response.
     * @param {$system.BossError.BossErrorCallback} [onError] Callback that will receive a [BossError]{@link $system.BossError} or string.
     */
    obd.prototype.getOBDStatus = function(onSuccess, onError) {
        remoteCall("getOBDStatus", onSuccess, onError);
    }

    /**
     * Clear any Diagnostic Trouble Codes [DTC].
     * @memberOf $system.OBDii#
     * @function clearDTC
     * @param {$system.OBDii.OBDHexCallback} [onSuccess] Callback that will receive a successful response.
     * @param {$system.BossError.BossErrorCallback} [onError] Callback that will receive a [BossError]{@link $system.BossError} or string.
     */
    obd.prototype.clearDTC = function(onSuccess, onError) {
        remoteCall("clearDTC", getWrappedHandler(onSuccess), onError);
    }

    return new obd();
}();
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
	object.getCallLog = object.getCallLog.$bind(object);
	
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
    function tidy(a) {
        a = a.toUpperCase().trim();
        a = a.replace(/^\'/g, "");
        a = a.replace(/^\"/g, "");
        return a;
    }

    function compareString(a, b) {
        if (a == null && b == null) {
            return 0;
        }
        if (a == null) {
            return 1;
        }
        if (b == null) {
            return -1;
        }
        a = tidy(a);
        b = tidy(b);
        if (a < b) {
            return -1;
        } else if (a > b) {
            return 1;
        } else {
            return 0;
        }
    }

    function compareNumber(a, b) {
        if (a == null && b == null) {
            return 0;
        }
        if (a == null) {
            return 1;
        }
        if (b == null) {
            return -1;
        }
        return a - b;
    }

    var object = {
        _private: {},
        uid: 'media.source.player',
        name: 'iPhone',
        type: $system.MediaSourceType.PLAYER,
    };

    // Private function to populate the media library
    object._populateLibrary = function(data) {
        this._library = data;
        // Now create our index
        this._library.index = {
            albums: {},
            songs: {},
            artists: {},
            genres: {},
            playlists: {}
        };
        var i,
            item;
        // Index Albums
        for (i = 0; i < data.albums.length; i++) {
            item = data.albums[i];
            this._library.index.albums[item.uid] = item;
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
        // Index Songs
        for (i = 0; i < data.songs.length; i++) {
            item = data.songs[i];
            this._library.index.songs[item.uid] = item;
        }
        // Index Playlists
        for (i = 0; i < data.playlists.length; ++i) {
            item = data.playlists[i];
            this._library.index.playlists[item.uid] = item;
        }

        // Create a redundant copy of the play count for each artist based on all of their
        // songs and albums.
        // TODO - server data should provide these numbers.
        this._library.artists.forEach(function(artist) {
            artist.playCount = 0;
            artist.albumCount = 0;
            artist.songCount = 0;
        });
        this._library.albums.forEach(function(album) {
            album.playCount = 0;
            album.songCount = 0;
        });
        this._library.genres.forEach(function(genre) {
            genre.artistCount = 0;
            genre.songCount = 0;
            genre.playCount = 0;
        });
        this._library.playlists.forEach(function(playlist) {
            playlist.artistCount = 0;
        });

        var index = this._library.index;
        this._library.songs.forEach(function(song) {
            var album = index.albums[song.albumUid];
            album.playCount += song.playCount;
            album.songCount++;
            var artist = index.artists[album.artistUid];
            artist.songCount++;
            artist.playCount += song.playCount;
            var genre = index.genres[artist.genreUid];
            genre.songCount++;
            genre.playCount += song.playCount;
        });

        this._library.artists.forEach(function(artist) {
            var genre = index.genres[artist.genreUid];
            genre.artistCount++;
        });

        // Give each artist artwork from one of their albums.
        this._library.albums.forEach(function(album) {
            if (album.artwork && album.artwork.length > 0) {
                var artist = index.artists[album.artistUid];
                ++artist.albumCount;
                if (artist.artwork == null || artist.artwork.length == 0) {
                    artist.artwork = album.artwork;
                }
            }
        });

        // Give each playlist artwork.
        this._library.playlists.forEach(function(playlist) {
            if (!playlist.duration) {
                playlist.duration = 0;
            }
            if (!playlist.songCount) {
                playlist.songCount = 0;
            }
            if (!playlist.playCount) {
                playlist.playCount = 0;
            }
            if (!playlist.artwork) {
                for (var i = 0; i < playlist.songs.length; ++i) {
                    var songUid = playlist.songs[i];
                    var song = index.songs[songUid];
                    var album = index.albums[song.albumUid];

                    playlist.songCount++;
                    playlist.duration += song.duration;
                    playlist.playCount += song.playCount;

                    if (album.artwork && !playlist.artwork) {
                        playlist.artwork = album.artwork;
                    }
                }
            }
        });
    }.$bind(object);

    object.getGenreSongs = function(uid, callback) {
        // TODO - this might be better pre-indexed - instead of this nested loop.
        var result = [];
        var _library = this._library;
        this._library.artists.forEach(function(artist) {
            if (artist.genreUid == uid) {
                _library.albums.forEach(function(album) {
                    if (album.artistUid == artist.uid) {
                        _library.songs.forEach(function(song) {
                            if (song.albumUid == album.uid) {
                                var copy = $system.util.clone(song);
                                copy.artistName = artist.name;
                                copy.albumName = album.name;
                                copy.artwork = album.artwork;
                                copy.startPlaying = function() {
                                    object.playWithContext(copy.uid, "genre", uid);
                                };
                                result.push(copy);
                            }
                        });
                    }
                });
            }
        });
        result.sort(function(a, b) {
            var result = compareString(a.name, b.name);
            if (result === 0) {
                result = compareString(a.albumName, b.albumName);
            }
            return result;
        });
        $system.util.callCallback(callback, result);
    }.$bind(object);

    object.getSongs = function(callback) {
        var result = [];
        var _library = this._library;
        this._library.songs.forEach(function(song) {
            var album = _library.index.albums[song.albumUid];
            var artist = _library.index.artists[album.artistUid];
            var copy = $system.util.clone(song);
            copy.artistName = artist.name;
            copy.albumName = album.name;
            copy.artwork = album.artwork;
            copy.startPlaying = function() {
                object.playWithContext(copy.uid);
            };
            result.push(copy);
        });
        result.sort(function(a, b) {
            var result = compareString(a.artistName, b.artistName);
            if (result === 0) {
                result = compareString(a.albumName, b.albumName);
            }
            if (result === 0) {
                result = compareNumber(a.trackNumber, b.trackNumber);
            }
            if (result === 0) {
                result = compareString(a.name, b.name);
            }
            return result;
        });
        $system.util.callCallback(callback, result);
    }.$bind(object);

    object.getAlbumSongs = function(uid, callback) {
        var result = [];
        if (this._library.index.albums[uid]) {
            var album = this._library.index.albums[uid];
            var artist = this._library.index.artists[album.artistUid];
            this._library.songs.forEach(function(song) {
                if (song.albumUid === uid) {
                    var entry = $system.util.clone(song);
                    entry.artwork = album.artwork;
                    entry.albumName = album.name;
                    entry.artistName = artist.name;
                    entry.startPlaying = function() {
                        object.playWithContext(entry.uid, "album", album.uid);
                    };
                    result.push(entry);
                }
            });
        }
        result.sort(function(a, b) {
            var result = compareNumber(a.trackNumber, b.trackNumber);

            if (result == 0) {
                result = compareString(a.name, b.name);
            }

            return result;
        });
        $system.util.callCallback(callback, result);
    }.$bind(object);

    object.getArtistSongs = function(artistUid, callback) {
        var result = [];
        var _library = this._library;
        var artist = this._library.index.artists[artistUid];
        this._library.songs.forEach(function(song) {
            var album = _library.index.albums[song.albumUid];
            if (album.artistUid == artistUid) {
                var copy = $system.util.clone(song);
                copy.albumName = album.name;
                copy.artistName = artist.name;
                copy.artwork = album.artwork;
                copy.startPlaying = function() {
                    object.playWithContext(copy.uid, "artist", artist.uid);
                };
                result.push(copy);
            }
        });
        result.sort(function(a, b) {
            var result = compareString(a.albumName, b.albumName);
            if (result === 0) {
                result = compareNumber(a.trackNumber, b.trackNumber);
                if (result === 0) {
                    result = compareString(a.name, b.name);
                }
            }
            return result;
        });
        $system.util.callCallback(callback, result);
    }.$bind(object);

    object.getMostPlayedArtists = function(callback) {
        var artists = this._library.artists.slice();
        artists.sort(function(a, b) {
            return a.name < b.name ? -1 : 1;
        });
        if (artists.length > 4) {
            artists = $system.util.clone(artists.slice(0, 4));
        }
        $system.util.callCallback(callback, artists);
    }.$bind(object);

    object.getArtists = function(callback) {
        var result = $system.util.clone(this._library.artists);
        result.sort(function(a, b) {
            return a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1;
        });
        $system.util.callCallback(callback, result);
    }.$bind(object);

    object.getGenres = function(callback) {
        var result = $system.util.clone(this._library.genres);
        result.sort(function(a, b) {
            return compareString(a.name, b.name);
        });
        $system.util.callCallback(callback, result);
    }.$bind(object);

    /** 
     * This function will return an array of albums, in alphabetical order, available to this media source
     * @function getAlbums
     * @memberof $system.PlayerMediaSource
     * @returns {$system.Album[]}
     */
    object.getAlbums = function(callback) {
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

            entry = $system.util.clone(newAlbum);
            entry.artistName = artist.name;
            entry.genre = this._library.index.genres[artist.genreUid].name;

            if (result.length === 0) {
                result.push(entry);
                continue;
            }
            // Insert sort the results
            for (j = 0; j < result.length; j++) {
                existingAlbum = result[j];
                // Skip a duplicate entry 
                if ((entry.name == existingAlbum.name) && (entry.uid == existingAlbum.uid)) {
                    continue;
                } else if (entry.name.toLowerCase() <= existingAlbum.name.toLowerCase()) {
                    // Insert before existing album entry and continue
                    result.splice(j, 0, entry);
                    break;
                }
                // If it is greater than 
                if ((j + 1) == result.length) {
                    result.push(entry);
                    break;
                }
            }
        }
        $system.util.callCallback(callback, result);
    }.$bind(object);

    /**
     * Get a sorted list of the most played playlists.
     */
    object.getMostPlayedPlaylists = function(callback) {
        var result = $system.util.clone(this._library.playlists);
        result.sort(function(a, b) {
            return -(a.playCount - b.playCount);
        });
        result = result.slice(0, 4);
        $system.util.callCallback(callback, result);
    }.$bind(object);

    /**
     * Get a sorted list of the playlists.
     */
    object.getPlaylists = function(callback) {
        var result = $system.util.clone(this._library.playlists);
        result.sort(function(a, b) {
            if (a.name < b.name) {
                return -1;
            } else if (a.name > b.name) {
                return 1;
            }
            return 0;
        });
        $system.util.callCallback(callback, result);
    }.$bind(object);

    /**
     * Get the songs for a playlist.
     */
    object.getPlaylistSongs = function(playlistUid, callback) {
        var result = [];
        var playlist = this._library.index.playlists[playlistUid];
        var index = this._library.index;
        if (playlist) {
            playlist.songs.forEach(function(songUid) {
                var song = index.songs[songUid];
                var album = index.albums[song.albumUid];
                var artist = index.artists[album.artistUid];

                var entry = $system.util.clone(song);
                if (!entry.artwork) {
                    entry.artwork = album.artwork;
                }
                entry.albumName = album.name;
                entry.artistName = artist.name;
                entry.startPlaying = function() {
                    object.playWithContext(entry.uid, "playlist", playlistUid);
                }
                result.push(entry);
            });
        }
        $system.util.callCallback(callback, result);
    }.$bind(object);

    /** 
     * This function will return an array of albums that have been played the most.  Maximum return of 4 items.
     * @function getMostPlayedAlbums
     * @memberof $system.PlayerMediaSource
     * @returns {$system.Album[]}
     */
    object.getMostPlayedAlbums = function(callback) {
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
                artwork: album.artwork,
                artistName: artist.name,
                genre: this._library.index.genres[artist.genreUid].name
            };
            result.push(entry);
        }
        $system.util.callCallback(callback, result);
    }.$bind(object);

    object.getCurrentSong = function(callback) {
        callback(null);
    }.$bind(object);

    object.registerInterest = function() {
        // do nothing.
    }.$bind(object);

    object.unregisterInterest = function() {
        // do nothing.
    }

    return object;
}

$system.property = function() {
    function Property() {}

    Property.prototype.get = function(names, a, b) {
        var callback = null;
        var defaultValues = null;

        if (typeof(a) === "function") {
            callback = a;
        } else if (typeof(b) === "function") {
            callback = b;
        }

        if (a != null && typeof(a) === "object") {
            defaultValues = a;
        } else if (b != null && typeof(b) === "object") {
            defaultValues = b;
        }

        if (window.chrome && chrome.storage && chrome.storage.local) {
            chrome.storage.local.get(names, function(items) {
                callback(items);
            });
        } else {
            var url = "brainiac/service/data/get";
            url += "?names=" + encodeURIComponent(JSON.stringify(names));
            if (defaultValues) {
                url += "&defaultValues=" + encodeURIComponent(JSON.stringify(defaultValues));
            }
            if (callback && typeof(callback) === "function") {
                $core._remoteCall(url, function(result) {
                    if (result && "values" in result) {
                        callback(result.values);
                    }
                });
            } else {
                console.log("No callback given to async get function.");
            }
        }
    };

    Property.prototype.set = function(values, callback) {
        if (window.chrome && chrome.storage && chrome.storage.local) {
            chrome.storage.local.set(values);
            if (callback && typeof(callback)==="function") {
                window.setTimeout(function() {
                    callback(values);
                }, 0);
            }
        } else {
            $core._remoteCall("brainiac/service/data/set?values=" + encodeURIComponent(JSON.stringify(values)), function(result) {
                if (result && "values" in result && typeof(callback) === "function") {
                    callback(result.values);
                }
            });
        }
    };

    return new Property();
}();
/**
 * The Relay interface provides information about a Relay from the connected relay accessory
 * @namespace Relay
 * @memberof $system
 * @property {string} board - Unique serial number for the relay board
 * @property {string} name - User defined name used for the relay
 * @property {boolean} [isMomentary=false] - Whether or not this is a momentary switch
 * @property {number} bank - The number of the switch bank on the relay accessory
 * @property {boolean} [isPolaritySwitch] - Whether or not this is an on-off-on reverse polarity switch
 * @property {string} [negativeLabel] - Optional label for the Negative position of an On-Off-On style toggle
 * @property {string} [positiveLabel] - Optional label for the Positive position of an On-Off-On style toggle
 * @property {number} [duration=0] - Duration in which the switch should stay in the on position in milliseconds. A value of 0 represents no duration.
 */
$system.Relay = {};

/**
 * The Relay Manager provides an interface between application JavaScript code and the relay accessories of Brainiac. 
 * @namespace RelayManager
 * @memberof $system
 */
function RelayManager() {
	// Initialize the return object
	var object = {
		_protected: {
			relays: []
		}
	};
	
	// Process and populate our object with data
	object._processInitialLoad = function(data) {
		if (data && data.relays) {
			this._protected.relays = data.relays;
		}
	}.$bind(object);
	
	// Load in our relay information
	$core._loadJSONFromUrl('data/data-relays.json', object._processInitialLoad);
	
	/** 
	 * This function will return the list of relays from the connected device
	 * @function getRelayList
	 * @memberof $system.RelayManager
	 * @param {RelayListCallback} callback - Function to be run when the list has been retrieved
	 */
	object.getRelayList = function(callback) {	
		if (callback) {
			var i,
				relay,
				result = [];
			for (i = 0; i < this._protected.relays.length; i++) {
				relay = $system.util.clone(this._protected.relays[i]);
				result.push(relay);
			}
			callback(result);
		}
	}.$bind(object);
	
	// Handle any config changes
	object._onswitchchange = function(event) {
		var i, 
			item;
		for (i = 0; i < this._protected.relays.length; i++) {
			item = this._protected.relays[i];
			if (item.board == event.data.board && item.bank == event.data.bank) {
				item.name = event.data.name;
				item.isMomentary = event.data.isMomentary;
				item.shown = event.data.shown;
				item.duration = event.data.duration;
				item.positiveLabel = event.data.positiveLabel;
				item.negativeLabel = event.data.negativeLabel;
				break;
			}
		}
	}.$bind(object);
	
	// Listen for changes for the relay configuration
	$ui.addEventListener('relay_switch_config_change', object._onswitchchange);
	
	return object;
}

/**
 * The {@link $system.RelayManager} <b>callback</b> event definition for <b>getRelayList</b>
 * @callback RelayListCallback
 * @param {$system.Relay[]} relays - List of relays that have been returned
 */


function RemoteEvents() {
	var doDebug = true;
	var log = function() {
		if (doDebug) {
			console.log.apply(console, arguments);
		}
	};

	this._private = {
		events: [],
		failCount: 0,
		id: "",
		lastSuccess: true,
		FAST_RESPONSE_MS: 1000,
		RETRY_DELAY_MS: 2000,
		SIMULTANEOUS_REQUESTS: 5,
		REGISTER_TIMEOUT_MS: 10000,
		LONG_POLL_TIMEOUT_MS: 240000,
		started: false,
		failed: false,
		requests: []
	};

	this.addEventListener = function(eventType) {
		if (window.chrome && chrome.runtime && chrome.runtime.id) {
			// No remote events in the chrome app...
			console.log("Not adding remote event listener - we are running in chrome app.");
			return;
		}
		if (!this._private.failed && this._private.events.indexOf(eventType) == -1) {
			if (this._private.id === "") {
				this._private.generateId();
			}
			this._private.events.push(eventType);
			var url = "/brainiac/events/addListener?id=" + encodeURIComponent(this._private.id) + "&eventType=" + encodeURIComponent(eventType);
			var attemptCount = 0;

			var attemptRegistration = function() {
				if (this._private.failed) {
					log("Aborting register due to failure");
					return;
				}
				var request = $core._remoteCall(url, function(response, requestInfo) {
					// Good - we've registered for (at least) one event - start the long polling.
					if (!this._private.started) {
						this._private.start();
					}
					this._private.removeRequest(requestInfo);
				}.$bind(this), function(error, requestInfo) {
					// decide if we should try again immediately - or delay.
					this._private.removeRequest(requestInfo);
					attemptCount++;
					log("Attempt count:", attemptCount, eventType);
					if (attemptCount == 20) {
						this._private.broadcastFailure();
					} else {
						var now = new Date().getTime();
						var delay = 0;
						if ((now - requestInfo.started) < this._private.FAST_RESPONSE_MS) {
							delay = this._private.RETRY_DELAY_MS;
						}
						log("Going to delay next registration attempt by", delay);
						window.setTimeout(attemptRegistration, delay);
					}
				}.$bind(this), 5000);
				this._private.requests.push(request);
			}.$bind(this);

			attemptRegistration();
		}
	}.$bind(this);

	this._private.broadcastFailure = function() {
		this._private.stop();
		this._private.failed = true;
		$ui.toast("Connection to event server broken.");
		log("Busted. :(");
	}.$bind(this);

	this.removeEventListener = function(eventType) {
		var where = this._private.events.indexOf(id);
		if (where != -1) {
			this._private.events.splice(where, 1);
			// TODO RPW - remote - unregister.
			if (this._private.events.length == 0) {
				this._private.stop();
			}
		}
	}.$bind(this);

	this._private.start = function() {
		log("Start called");
		if (this._private.started) {
			log("Already started");
			return;
		}
		this._private.started = true;
		for (var i = 0; i < this._private.SIMULTANEOUS_REQUESTS; ++i) {
			this._private.startRequest();
		}
	}.$bind(this);

	this._private.startRequest = function() {
		log("Starting a request");
		if (!this._private.started) {
			log("Not starting - we're already in progress...");
			return;
		}
		if (this._private.failed) {
			log("We have failed - not starting this request");
			return;
		}
		var url = "/brainiac/events/listen?id=" + encodeURIComponent(this._private.id);
		var requestInfo = $core._remoteCall(url, this._private.success, this._private.fail, this._private.LONG_POLL_TIMEOUT_MS);
		this._private.requests.push(requestInfo);
	}.$bind(this);

	this._private.success = function(result, requestInfo) {
		log("Long poll success", result);
		this._private.startRequest();
		this._private.lastSuccess = true;
		this._private.failCount = 0;
		this._private.removeRequest(requestInfo);
	}.$bind(this);

	this._private.fail = function(error, requestInfo) {
		log("Remote event fail");
		this._private.removeRequest(requestInfo);
		this._private.lastSuccess = false;
		this._private.failCount++;
		if (this._private.failCount >= 20) {
			this._private.broadcastFailure();
			return;
		}
		var now = new Date().getTime();
		var delay = 0;
		if ((now - requestInfo.started) < this._private.FAST_RESPONSE_MS) {
			delay = this._private.RETRY_DELAY_MS;
		}
		if (this._private.started) {
			window.setTimeout(this.startRequest, delay);
		} else {
			log("Not restarting - we've been stopped.");
		}
	}.$bind(this);

	this._private.removeRequest = function(requestInfo) {

	}

	/**
	 * Generate a new id for this connection.
	 */
	this._private.generateId = function() {
		var base64 = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ+/'
		var id = "";
		for (var i = 0; i < 32; ++i) {
			id += base64.charAt(Math.floor(Math.random() * base64.length));
		}
		console.log("Generated distinct id: " + id);
		this._private.id = id;
	}.$bind(this);

	this._private.stop = function() {
		this._private.started = false;
		for (var i = 0; i < this._private.requests.length; ++i) {
			try {
				log("Going to abort a request");
				this._private.requests[i].request.abort();
			} catch (e) {
				log(e);
			}
		}
	}.$bind(this);
}

$system.remoteEvents = new RemoteEvents();
function RemotePlayerMediaSource() {
    var object = new PlayerMediaSource();
    if (!object._private) {
        object._private = {};
    }
    if (!object._private.status) {
        object._private.status = {};
    }

    object._private.interested = [];

    object._private.forceStatusUpdate = true;

    object._private.wrappedWebSocket = null;

    $core._remoteCall('/brainiac/service/mm/getLibrary', function(result) {
        var good = false;
        if ("media" in result) {
            if ("library" in result.media) {
                object._populateLibrary(result.media.library);
                good = true;
            }
        }
        if (!good) {
            console.log("Result: " + JSON.stringify(result));
        }
    });

    object.broadcastStatus = function() {
        var status = this._private.status;
        this._private.status = {};
        this._private.processStatus(status);
    }.$bind(object);

    object._private.processStatus = function(status) {
        if (!("song" in status) || !("shuffle" in status) || !("repeat" in status) || !("playing" in status)) {
            console.log("Missing fields in status.");
            return;
        }

        var force = this._private.forceStatusUpdate;
        this._private.forceStatusUpdate = false;

        var oldStatus = this._private.status;
        this._private.status = status;

        if (force || oldStatus.repeat !== status.repeat) {
            var event = new $ui.DataEvent($system.EventType.MEDIA_REPEAT_CHANGED, status.repeat);
            $core.raiseEvent(event);
        }

        if (force || oldStatus.shuffle !== status.shuffle) {
            var event = new $ui.DataEvent($system.EventType.MEDIA_SHUFFLE_CHANGED, status.shuffle);
            $core.raiseEvent(event);
        }

        if (force || !("song" in oldStatus) || undefined===oldStatus.song || oldStatus.song.uid !== status.song.uid) {
            var event = new $ui.DataEvent($system.EventType.MEDIA_SONG_CHANGED, status.song);
            $core.raiseEvent(event);
        }

        if (force || !("playing" in oldStatus) || oldStatus.playing !== status.playing) {
            var event = new $ui.DataEvent(status.playing ? $system.EventType.MEDIA_PLAYBACK_STARTED : $system.EventType.MEDIA_PLAYBACK_ENDED);
            $core.raiseEvent(event);
        }
    }.$bind(object);

    object.playWithContext = function(uid, context, contextId) {
        var params = "?uid=" + encodeURIComponent(uid);
        params += "&context=" + encodeURIComponent(context);
        params += "&contextId=" + encodeURIComponent(contextId);

        $core._remoteCall('/brainiac/service/mm/playWithContext' + params, this._private.processStatus);
    }.$bind(object);

    object.skipForward = function() {
        $core._remoteCall('/brainiac/service/mm/skip?direction=forward',this._private.processStatus);
    }.$bind(object);

    object.skipBack = function() {
        $core._remoteCall('/brainiac/service/mm/skip?direction=back',this._private.processStatus);
    }.$bind(object);

    object.pause = function() {
        $core._remoteCall('/brainiac/service/mm/pause',this._private.processStatus);
    }.$bind(object);

    object.play = function() {
        $core._remoteCall('/brainiac/service/mm/play', this._private.processStatus);
    }.$bind(object);

    object.isPaused = function() {
        if ("playing" in this._private.status) {
            var toReturn = !this._private.status.playing;
            return toReturn;
        }
        return false;
    }.$bind(object);

    Object.defineProperty(object,"shuffle",{
        get: function() {
            if ("shuffle" in this._private.status) {
                return this._private.status.shuffle;
            }
            return false;
        }.$bind(object)
    });

    Object.defineProperty(object,"repeat", {
        get: function() {
            if ("repeat" in this._private.status) {
                return this._private.status.repeat;
            }
            return 0;
        }.$bind(object)
        // set: function(newRepeat) {
        //     if (this._private.repeat !== newRepeat) {
        //         this._private.repeat = newRepeat;
        //         var event = new $ui.DataEvent($system.EventType.MEDIA_REPEAT_CHANGED, newRepeat);
        //         $core.raiseEvent(event);
        //     }
        // }.$bind(object)
    });

    object.toggleShuffle = function() {
        $core._remoteCall('/brainiac/service/mm/shuffle',this._private.processStatus);
    };

    object.toggleRepeat = function() {
        $core._remoteCall('/brainiac/service/mm/repeat',this._private.processStatus);
    };

    object.getStatus = function() {
        $core._remoteCall('/brainiac/service/mm/getStatus',this._private.processStatus);
    }.$bind(object);

    object.registerInterest = function(what) {
        this._private.forceStatusUpdate = true;
        for (var i=0; i<this._private.interested.length; ++i) {
            if (this._private.interested[i] === what) {
                console.log("Object already registered.",what);
                this._private.wrappedWebSocket.send("ping");
                return;
            }
        }
        this._private.interested.push(what);

        if (this._private.interested.length === 1) {
            this._private.wrappedWebSocket = $system.util.wrapWebSocket("/brainiac/service/mm");
            this._private.wrappedWebSocket.onmessage = this._private.processStatus;
            this._private.wrappedWebSocket.start();
        }
    }.$bind(object);

    object.unregisterInterest = function(what) {
        console.log("Unregister interest");
        if (this._private.interested.length === 0) {
            return;
        }

        for (var i=0; i<this._private.interested.length; ++i) {
            if (this._private.interested[i] === what) {
                this._private.interested.splice(i,1);
                --i;
            }
        }

        if (this._private.interested.length === 0) {
            this._private.wrappedWebSocket.stop();
        }
    }.$bind(object);

    var events = [
        $system.EventType.MEDIA_SONG_CHANGED,
        $system.MEDIA_REPEAT_CHANGED,
        $system.MEDIA_SHUFFLE_CHANGED,
        $system.MEDIA_PLAYBACK_STARTED,
        $system.MEDIA_PLAYBACK_ENDED
    ];

    // for (var i=0; i<events.length; ++i) {
    //     $system.remoteEvents.addEventListener(events[i]);
    // }

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
 * @property {string} [artwork] - Image path for album art
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
/**
 * The Suspension Manager provides an interface between application JavaScript code and the suspension accessories of Brainiac. 
 * @namespace SuspensionManager
 * @memberof $system
 */
function SuspensionManager() {
	// Initialize the return object
	var object = {
		_protected: {
			lf: 20,
			rf: 20,
			lr: 45,
			rr: 47,
			tank: 112,

			// List of known/connected accessories.
			accessories: [],

			// Handle for timeout requesting data again.
			requestInterval: null,

			requestsInProgress: 0,

			valveMap: {
				addAir: {
					lf: "80",
					rf: "20",
					lr: "8",
					rr: "2"
				},

				releaseAir: {
					lf: "40",
					rf: "10",
					lr: "4",
					rr: "1"
				}
			}
		},
	};

	object.choosePreset = function(preset) {
		if (typeof(preset) != "number") {
			return;
		}
		if (this._protected.accessories.length > 0) {
			$system.accessoryManager.sendCommandToAccessory(this._protected.accessories[0], "s " + preset);
		}
	}.$bind(object);

	/** 
	 * This function will raise a {@link $system.EventType.ONSUSPENSIONDATA} event with the current suspension data
	 * @function requestCurrentData
	 * @memberof $system.SuspensionManager
	 */
	object.requestCurrentData = function() {
		if (window.$core) {
			if (this._protected.accessories.length > 0) {
				this._protected.requestsInProgress++;
				$system.accessoryManager.sendCommandToAccessory(this._protected.accessories[0], "g", this._protected.onPressureGet, this._protected.onPressureFail);
			} else {
				this._protected.firePressureEvent();
			}
		}
	}.$bind(object);

	object._protected.firePressureEvent = function() {
		if (window.$core) {
			var data = {
					lf: this._protected.lf,
					rf: this._protected.rf,
					lr: this._protected.lr,
					rr: this._protected.rr,
					tank: this._protected.tank
				},
				systemEvent = new $ui.DataEvent($system.EventType.ONSUSPENSIONDATA, data);
			$core.raiseEvent(systemEvent);
		}
	}.$bind(object);

	object._protected.onPressureGet = function(message) {
		this._protected.requestsInProgress--;
		var clearPressures = true;
		if (message && "response" in message && "result" in message && message.result == 1) {
			var lines = message.response.split("\n");
			if (lines.length < 2 || lines[0] != "g") {
				console.log("Unexpected response from accessory.");
			} else {
				try {
					console.log("Pressure coming from: " + lines[1]);
					var pressures = JSON.parse(lines[1]);
					if (Array.isArray(pressures)) {
						if (pressures.length == 5) {
							this._protected.lf = pressures[0];
							this._protected.rf = pressures[1];
							this._protected.lr = pressures[2];
							this._protected.rr = pressures[3];
							this._protected.tank = pressures[4];
							clearPressures = false;
						}
					}
				} catch (badResponse) {
					console.log(badResponse);
				}
			}
		}
		if (clearPressures) {
			this._protected.clearPressures();
		} else {
			if (this._protected.requestsInProgress==0) {
				window.setTimeout(this.requestCurrentData,250);
			} else {
				console.log("Not starting another request, there are already: " + this._protected.requestsInProgress);
			}
			this._protected.firePressureEvent();
		}
	}.$bind(object);

	object._protected.onPressureFail = function(message) {
		if (message) {
			console.log("Need to handle what to do when getting no pressures back - from the timeout...");
		}
		this._protected.clearPressures();
	}.$bind(object);

	object._protected.clearPressures = function() {
		this._protected.lf = 0;
		this._protected.rf = 0;
		this._protected.lr = 0;
		this._protected.rr = 0;
		this._protected.tank = 0;

		this._protected.firePressureEvent();
	}.$bind(object);


	/** 
	 * This function will release air on the specified corner
	 * @function releaseAir
	 * @memberof $system.SuspensionManager
	 * @param {string} corner - Valve corner to open. Valid values are lf, rf, lr, rr
	 */
	object.releaseAir = function(corner) {
		if (corner != 'lf' && corner != 'rf' && corner != 'lr' && corner != 'rr') return;
		if (this._protected.accessories.length != 0) {
			$system.accessoryManager.sendCommandToAccessory(this._protected.accessories[0], "v " + this._protected.valveMap.releaseAir[corner]);
		} else {
			var currentPressure = this._protected[corner];
			currentPressure = currentPressure - 4;
			if (currentPressure < 0) currentPressure = 0;
			this._protected[corner] = currentPressure;
			this.requestCurrentData();
		}
	}.$bind(object);

	/** 
	 * This function will close a valve on the specified corner
	 * @function closeValve
	 * @memberof $system.SuspensionManager
	 * @param {string} corner - Valve corner to open. Valid values are lf, rf, lr, rr
	 */
	object.closeValve = function(corner) {
		if (corner != 'lf' && corner != 'rf' && corner != 'lr' && corner != 'rr') return;
		if (this._protected.accessories.length != 0) {
			$system.accessoryManager.sendCommandToAccessory(this._protected.accessories[0], "v 0"); // This is ALL valves off...
		}
	}.$bind(object);

	/** 
	 * This function will add air on the specified corner
	 * @function releaseAir
	 * @memberof $system.SuspensionManager
	 * @param {string} corner - Valve corner to open. Valid values are lf, rf, lr, rr
	 */
	object.addAir = function(corner) {
		if (corner != 'lf' && corner != 'rf' && corner != 'lr' && corner != 'rr') return;
		if (this._protected.accessories.length != 0) {
			$system.accessoryManager.sendCommandToAccessory(this._protected.accessories[0], "v " + this._protected.valveMap.addAir[corner]);
		} else {
			var currentPressure = this._protected[corner];
			currentPressure = currentPressure + 4;
			this._protected[corner] = currentPressure;
			this.requestCurrentData();
		}
	}.$bind(object);

	object._protected.accessoriesFound = function(accessories) {
		if (!accessories || accessories.length == 0) {
			this._protected.accessories = [];			
		} else {
			this._protected.onPressureFail(); // 0 the values.
			this._protected.accessories = accessories;
		}
		this.requestCurrentData();
	}.$bind(object);

	// Check for accessories...
	var known = $system.accessoryManager.getConnectedAccessories("suspension");
	if (!known || known.length == 0) {
		$system.accessoryManager.updateConnectedAccessories(function() {
			object._protected.accessoriesFound($system.accessoryManager.getConnectedAccessories("suspension"));
		});
	} else {
		object._protected.accessoriesFound(known);
	}

	return object;
}
/**
 * Helpful utility functions.
 * @namespace Util
 * @memberof $system
 */
$system.util = function () {
    function Util() {
        function cloneImpl(toClone, depth) {
            var toReturn;
            if (toClone == null) {
                return null;
            }
            if (depth > 10) {
                throw "Cloning too deep: " + depth;
            }
            if (toClone instanceof Function) {
                return toClone;
            }
            if (toClone instanceof Array) {
                toReturn = new Array();
                for (var i = 0; i < toClone.length; ++i) {
                    toReturn[i] = cloneImpl(toClone[i], depth + 1);
                }
                return toReturn;
            }
            if (toClone instanceof Object) {
                toReturn = {};
                for (var prop in toClone) {
                    toReturn[prop] = cloneImpl(toClone[prop], depth + 1);
                }
                return toReturn;
            }
            return toClone;
        };
        
        /**
         * Try and clone a non-recursive/looping object.
         * @function clone
         * @param {object|Array} toClone The object to clone.
         * @return A clone of the object.
         */
        this.clone = function (toClone) {
            return cloneImpl(toClone, 0);
        };

        /**
         * Collection of conversion functions.
         * @namespace Converter
         * @memberof $system.Util
         */
        /**
         * Accessor for conversion functions.
         * @member {$system.Util.Converter} converter
         * @memberof $system.Util#
         */
        this.converter = {};
        
    	/**
    	 * Convert a number of seconds to a time. Example conversion: 0 -> 0:00,  60 -> 1:00,  3600 -> 1:00:00
    	 * @function secondsToTime
    	 * @memberof $system.Util.Converter#
    	 * @param {number} seconds The number of seconds to convert to a Time.
    	 */
        this.converter.secondsToTime = function (seconds) {
            if (seconds == null) {
                return "";
            }
            if (typeof (seconds) != "number") {
                seconds = parseInt(seconds);
            }
            seconds = Math.round(seconds);
            var hours = Math.floor(seconds / 3600);
            seconds %= 3600;
            var minutes = Math.floor(seconds / 60);
            seconds %= 60;

            var result = "";
            if (hours !== 0) {
                result += hours;
                result += ":";
                if (minutes < 10) {
                    result += "0";
                }
            }
            result += minutes;
            result += ":";
            if (seconds < 10) {
                result += "0";
            }
            result += seconds;
            return result;
        };
        
        /**
         * Convert degrees C to F.
         * @function degreesCtoF
         * @memberOf $system.Util.Converter#
         * @param {number} c Number of degrees in C.
         * @return An integer number of degrees in F.
         */
        this.degreesCtoF = function (c) {
            return Math.round(c * 9 / 5 + 32);
        };
	
        /**
         * Convert degrees F to C.
         * @function degreesFtoC
         * @memberOf $system.Util.Converter#
         * @param {number} Number of degrees in F.
         * @return An integer number of degrees in C.
         */
        this.degreesFtoC = function (f) {
            return Math.round((f - 32) * 5 / 9);
        };

        this.callCallback = function(callback) {
            if (typeof(callback)==="function") {
                try {
                    callback.apply(null,Array.prototype.slice.call(arguments,1));
                } catch (e) {
                    console.log("Caught problem in callback;");
                    console.log(e);
                }
            }
        };

        this.wrapWebSocket = function(partialUrl) {
            var protocol = window.location.protocol;
            var wsProtocol = "ws://";

            if (protocol === "http:") {
                // good
            } else if (protocol === "https:") {
                wsProtocol = "wss://";
            } else {
                console.log("Returning a dummy wrapped web socket - could not determine protocol");
                return {};
            }

            var host = window.location.host;

            var hostParts = host.split(":");
            if (hostParts.length!=2) {
                console.log("Returning a dummy wrapped web socket - could not determine a port");
                return {};
            }

            var port = -1;
            try {
                port = parseInt(hostParts[hostParts.length-1]);
                port -= 50;
            } catch (e) {
                console.log("Returning a dummy wrapped web socket - could not parse port");
                return {};
            }

            host = hostParts[0];

            var url = wsProtocol + host + ":" + port + "/" + partialUrl.replace(/^\/*/,"");

            var consecutiveFails = 0;
            var connections = 0;
            var messagesWhileOpen = 0;

            var socket = null;
            var stopped = false;

            function onerror(error) {
                console.log("Web socket error: TODO - try and connect again?"); // TODO - do more...
                socket = null;
                ++consecutiveFails;
                if (consecutiveFails < 20) {
                    createSocket();
                }
                toReturn.onerror(error);
            };

            function onclose() {
                console.log("Web socket closed: TODO - try and connect again?");
                if (stopped) {
                    // do nothing.
                } else {
                    if (messagesWhileOpen > 1) {
                        createSocket();
                    } else {
                        setTimeout(createSocket,5000);
                    }
                }
                toReturn.onclose();
            }

            function onopen() {
                toReturn.onopen();
            }

            function onmessage(message) {
                messagesWhileOpen++;
                if (message && ("data" in message)) {
                    var data = message.data;
                    var dataJ = JSON.parse(data);
                    toReturn.onmessage(dataJ);
                } else {
                    console.log("No data in websocket message");
                }
            }

            var createSocket = function() {
                if (stopped) {
                    return;
                }
                messagesWhileOpen = 0;
                console.log("Using URL: ",url);
                socket = new WebSocket(url);
                socket.onerror = onerror;
                socket.onopen = onopen;
                socket.onclose = onclose;
                socket.onmessage = onmessage;
            }.$bind(toReturn);

            var toReturn = {};

            toReturn.start = function() {
                createSocket();
            }.$bind(toReturn);

            toReturn.stop = function() {
                console.log("Stopping web socket");
                stopped = true;
                if (socket != null) {
                    socket.close();
                }
                socket = null;
            }.$bind(toReturn);

            toReturn.onmessage = function(a) {
                console.log("User has not set onmessage",a);
            }.$bind(toReturn);

            toReturn.onerror = function(error) {
                console.log("Error with web socket",error);
            };

            toReturn.onopen = function() {
            };

            toReturn.onclose = function() {
            };

            toReturn.send = function(toSend) {
                if (socket != null) {
                    socket.send(toSend);
                }
            };

            return toReturn;
        };

    }

    return new Util();
} ();
