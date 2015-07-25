/* Copyright (c) 2015 Workshop 12 Inc. */
window.onload = function() {
	// retrieve our saved theme settings
	function init(result) {
		// Initialize the system
		var config = {
			theme: $ui.themeDark,
			isEmulator: (window.chrome && chrome.runtime && chrome.runtime.id) ? true : false
		}
		// Apply our theme
		if (result && result.color != undefined) {
			var i,
				variable,
				color = result.color;
			// Update properties
			config.theme.backgroundImageColor = color;
			config.theme.chart.color_OK = color;
			config.theme.chart.color_GREAT = color;
			config.theme.chart.color_GOOD = color;
			config.theme.chart.color_RANDOM1 = color;
			// Update variables
			for (i = 0; i < config.theme.variables.length; i ++) {
				variable = config.theme.variables[i];
				if (variable.name == '@brand-color' || variable.name == '@profile-wedge-color') {
					variable.value = color;
				}
			}
		}
		$system.init(config);
		$system.registerApp('core.headunit', $ui);
		// Initialize UI
		$ui.init(screenChrome, config.theme);
		$emulator.chrome = $ui.screens[0];
   	};

	if (window.chrome && chrome.storage && chrome.storage.local) {
   		chrome.storage.local.get('color', init);
	} else {
		init();
	}

	
}
