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
	if (!window.$core) {
		if (window.location !== window.parent.location) {
			$core = window.parent.$core;
		} else {
			console.log("WARNING: $core not defined");
		}
	}
	// Initialize
	$ui.init(main, theme);	
}