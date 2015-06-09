/* Copyright (c) 2015 Workshop 12 Inc. */
var $system;
// Initialize our toolkit
window.onload = function() {
	var theme;
	if (!$system) {
		if (window.location !== window.parent.location) {
			// We are in the emulator
			$system = window.parent.$system;
			theme = $system.config.theme;
		} else {
			console.log('WARNING: $system not defined');
		}
	} 
	// Initialize
	$ui.init(main, theme);	
}