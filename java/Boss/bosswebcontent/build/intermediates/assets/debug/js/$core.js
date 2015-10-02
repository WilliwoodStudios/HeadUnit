/* [Copyright (c) 2015 Workshop 12 Inc.] $core VERSION: 1.0.0.1119*/

var $core = {
    version: {
        major: 1,
        minor: 0,
        revision: 0,
        build: 1
    },

    _debugUrlPrefix: "", // This can be set for local web testing against a real server instance.
	
	/**
	 * Raise an event for the system
	 * @param {$ui.DataEvent} event - Event to be raised to the system
	 */
	raiseEvent: function(event) {
		if (window.$system == undefined) return;
		var i,
			app;
		for (i = 0; i < $system._apps.length; i++) {
			app = $system._apps[i];
			if (app.instance) {
				app.instance.raiseEvent(event);
			}
		}
	},
	
	/**
	 * Update Theme
	 * @param {Object} theme - Theme to be updated across the system
	 */
	updateTheme: function(theme) {
		if (window.$system == undefined) return;
		if (theme == undefined) return;
		var i,
			app;
		for (i = 0; i < $system._apps.length; i++) {
			app = $system._apps[i];
			if (app.instance) {
				app.instance.theme = theme;
			}
		}
		$system.config.theme = theme;
        if ($system.property) {
            $system.property.set({"core_theme":theme});
        }
	},
	
	// Returns the background image based on the current color code
	getBackgroundImage: function(colorCode) {
		var key;
		switch (colorCode) {
			case $system.Color.TURQUOISE:
				key = 'turquoise';
				break;
			case $system.Color.EMERALD: 
				key = 'emerald';
				break;
			case $system.Color.PETER_RIVER: 
				key = 'peter.river';
				break;
			case $system.Color.AMETHYST: 
				key = 'amethyst';
				break;
			case $system.Color.WET_ASPHAULT: 
				key = 'wet.asphault';
				break;
			case $system.Color.GREEN_SEA:
				key = 'green.sea';
				break;
			case $system.Color.NEPHRITIS: 
				key = 'nephritis';
				break;
			case $system.Color.PINK: 
				key = 'pink';
				break;
			case $system.Color.BELIZE_HOLE:
				key = 'belize.hole';
				break;
			case $system.Color.WISTERIA: 
				key = 'wisteria';
				break;
			case $system.Color.MIDNIGHT_BLUE: 
				key = 'midnight.blue';
				break;
			case $system.Color.SUN_FLOWER: 
				key = 'sun.flower';
				break;
			case $system.Color.CARROT: 
				key = 'carrot';
				break;
			case $system.Color.ALIZARIN:
				key = 'alizarin';
				break;
			case $system.Color.CONCRETE: 
				key = 'concrete';
				break;
			case $system.Color.ORANGE: 
				key = 'orange';
				break;
			case $system.Color.PUMPKIN: 
				key = 'pumpkin';
				break;
			case $system.Color.POMEGRANATE: 
				key = 'pomegranate';
				break;
			case $system.Color.SILVER: 
				key = 'silver';
				break;
			case $system.Color.ASBESTOS: 
				key = 'asbestos';
				break;
		}
		if (key) {
			return 'img/background.' + key +'.png';
		} 
		return undefined;
	},
	
    // Private function to load the data from a JSON URL
    _loadJSONFromUrl: function(url, callback) {
        var xhr = new XMLHttpRequest();
        xhr.callback = callback;
        // Handle our state changes
        xhr.onreadystatechange = function() {
            /* On readyState is 4, Determine if the request was successful or not. */
            if (this.readyState == 4) {
                if (this.status == 200) {
                    try {
                        var result = JSON.parse(this.responseText);
                    } catch (ex) {
                        console.log('$emulator.loadJSONFromUrl: ' + ex);
                        return;
                    }
                    // Load our data
                    this.callback(result);
                }
            }
        }
        xhr.open('GET', url, true);
        try {
            xhr.send();
        } catch (e) {
            console.log(e);
        }
    },

    // Private function to make a server call - with explicit error callback.
    _remoteCall: function(url, onSuccess, onError, timeout) {
        if (window.chrome && chrome.runtime && chrome.runtime.id) {
            // We are running in the chrome app...
            var error = { error: "Running as a chrome app" };

            if (onError) {
                setTimeout(function() { onError(error); }, 0);
            } else if (onSuccess) {
                setTimeout(function() { onSuccess(error); }, 0);
            }
            return;
        }
        var request = new XMLHttpRequest();
        var timedout = false;
        var windowTimeout = null;
        var info = {
            request: request,
            started: new Date().getTime()
        };

        request.onreadystatechange = function() {
            if (!timedout && request.readyState == 4) {
                if (windowTimeout) {
                    window.clearTimeout(windowTimeout);
                    windowTimeout = null;
                }
                var status = request.status;
                var error = null;
                if (status != 200) {
                    error = request.status + " " + request.statusText;
                }
                var response = request.responseText;
                var responseObject = response;
                try {
                    if (response.length > 0) {
                        var first = response.charAt(0);
                        if (first == '[' || first == '{' || first == '"') {
                            responseObject = JSON.parse(response);
                            if (onError != null && "error" in responseObject) {
                                error = responseObject.error;
                            }
                        }
                    }
                } catch (e) {
                    // Log it...
                    console.log("Possibly bad JSON from server " + response + " " + e);
                }

                if (error != null) {
                    console.log("On error is: " + onError);
                    if (onError != null) {
                        onError(error,info);
                    } else {
                        // logging as there was no callback.
                        console.log("Error from server: " + JSON.stringify(error));
                    }
                } else {
                    if (onSuccess != null) {
                        onSuccess(responseObject,info);
                    } else {
                        // logging as there was no callback.
                        console.log("Response from server: " + JSON.stringify(responseObject));
                    }
                }
            }
        };
        try {
            request.open("GET", this._debugUrlPrefix + url, true);
            request.send();

            if (timeout) {
                console.log("Setting timeout");
                windowTimeout = window.setTimeout(function() {
                    console.log("Ready state: " + request.readyState);
                    console.log("Timeout fired");
                    if (request.readyState != 4) {
                        console.log("Timing out request");
                        request.abort();
                        timedout = true;
                        if (onError != null) {
                            onError({error: "Timedout"},info);
                        }
                    } else {
                        console.log("Request already finished.");
                    }
                }, timeout);
            }
            return info;
        } catch (e) {
            if (onError != null) {
                onError(error,info);
            } else {
                console.log("Error with connection " + error);
            }
        }

        return undefined;
    },

    // Open up a new app
    openSettings: function() {
        $core.getAppsList(function(apps) {
            var i,
                app;
            if (apps != undefined) {
                for (i = 0; i < apps.length; i++) {
                    app = apps[i];
                    if (app.id == 'core.settings') {
                        $core.openApp(app);
                        break;
                    }
                }
            }
        });
    },

    // Open up a new app
    openApp: function(manifest, targetWindow) {
        if ($ui.screens.length == 0) return;
        // Create the app viewer for the app path
        var chrome = $ui.screens[0],
            app = function() {
                this.component = $ui.AppContainer;
            },
            appPath = 'apps/' + manifest.id + '/';
        // Get our information for this app
        app.prototype.src = appPath + manifest.content;
        app.prototype._appId = manifest.id; // Used for deregistration of system events in window.js
        if (manifest.icon != undefined) {
            app.prototype.icon = appPath + manifest.icon;
        }
        if (manifest.iconSplash) {
            app.prototype.iconSplash = appPath + manifest.iconSplash;
        }
        // Open the app
        if (targetWindow == undefined) {
            chrome.primaryWindow.push(app);
        } else {
            targetWindow.push(app);
        }
    },

    // Refreshes the list of installed apps and when finished calls the callback function
    getAppsList: function(callback) {
        this._loadJSONFromUrl('data/data-installed-aps.json', function(data) {
            var i,
                app,
                apps = [];
            if (data && data.apps) {
                apps = data.apps;
            }
            callback(apps);
        });
    }
}
