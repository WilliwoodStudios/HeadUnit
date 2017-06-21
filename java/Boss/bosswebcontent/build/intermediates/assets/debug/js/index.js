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
		if (result && result.core_theme) {
			config.theme = result.core_theme;
		}
		$system.init(config);
		$system.registerApp('core.headunit', $ui);
		// Initialize UI
		$ui.init(screenChrome, config);
		$emulator.chrome = $ui.screens[0];
   	};

   	$system.property.get(["core_theme"],init);
}
