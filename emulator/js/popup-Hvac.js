/* Copyright (c) 2015 Workshop 12 Inc. */
function popupHvac() {
	this.component = $ui.PopupHvac;
	
	this.onshow = function() {
		this.onthemechange();
	};
	
	this.onthemechange = function() {
		// Get our background image
		var backgroundImg = $core.getBackgroundImage($ui.theme.backgroundImageColor);
		if (backgroundImg) {
			this.setBackground(new ScreenBackground('../../'+backgroundImg));
		}
	};
}