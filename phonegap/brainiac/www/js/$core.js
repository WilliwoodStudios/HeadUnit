var $core = {
	version: {
		major: 1,
		minor: 0,
		revision: 0,
		build: 1
	},
	
	// Raise an event
	raiseEvent: function(systemEvent) {
		var i,
			item;
		for (i = 0; i < $system._events.length; i++) {
			item = $system._events[i];
			if (item.eventType == systemEvent.eventType) {
				try {
					item.callback(systemEvent.data)
				} catch (e) {
					console.log('ERROR: raiseEvent - ' + e.message);
				}
			}
		}
	},
	
	// Private function to load the data from a JSON URL
	_loadJSONFromUrl: function(url, callback) {
		var xhr = new XMLHttpRequest();
		xhr.callback = callback;
		// Handle our state changes
		xhr.onreadystatechange = function () {
			/* On readyState is 4, Determine if the request was successful or not. */
			if(this.readyState == 4) {
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
		xhr.send();
	},
	
	// Open up a new app
	openApp: function(manifest) {
		if ($ui.screens.length == 0) return;
		// Create the app viewer for the app path
		var chrome = $ui.screens[0],
			app = function() {this.component = $ui.AppContainer;},
			appPath = 'apps/' + manifest.id +'/';
		// Get our information for this app
		app.prototype.src = appPath + manifest.content;
		if (manifest.icon) {
			app.prototype.icon = appPath + manifest.icon;
		}
		if (manifest.iconSplash) {
			app.prototype.iconSplash = appPath + manifest.iconSplash;
		}
		// Open the app
		chrome._primaryWindow.push(app);
	},
	
	// Refreshes the list of installed apps and when finished calls the callback function
	getAppsList: function(callback) {
		this._loadJSONFromUrl('data/data-installed-aps.json',function(data) {
			var apps = [];
			if (data && data.apps) {
				apps = data.apps;
			} 
			callback(apps);
		});
	}
	
}