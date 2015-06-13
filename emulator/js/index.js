/* Copyright (c) 2015 Workshop 12 Inc. */
window.onload = function() {
	// Initialize the system
	var config = {
		theme: $ui.themeDark,
		isEmulator: (window.chrome && chrome.runtime && chrome.runtime.id) ? true : false
	}
	$system.init(config);
	$system.registerApp('core.headunit', $ui);
	// Initialize UI
	$ui.init(screenChrome, config.theme);
	$emulator.chrome = $ui.screens[0];
}