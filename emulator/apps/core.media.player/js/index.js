/* Copyright (c) 2015 Workshop 12 Inc. */
var $core;
var $system;

// Initialize our toolkit
window.onload = function () {
	// Get the core object
	if (window.parent.$core) {
		$core = window.parent.$core;
	}
	if (!$system) {
		if (window.location !== window.parent.location) {
			// We are in the emulator
			$system = window.parent.$system;
			$system.registerApp('core.media.player', $ui);
		} else {
			console.log('WARNING: $system not defined');
		}
	} else {
		$system.registerApp('core.media.player', $ui);
	}
	if (!("$data" in window) && window.parent && window.parent.$data) {
		$data = window.parent.$data;
	} 
	// Initialize
	$ui.init(main, $system.config.theme);
}