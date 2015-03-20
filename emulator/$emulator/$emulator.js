/* $emulator VERSION: 1.0.0.2764*/

var $emulator = {
	
	// Initialize the emulator
	init: function(chrome) {
		$emulator.chrome = chrome;
		// Register our custom controls/screens
		$ui.addExtension(new UIExtension('HeadUnitChrome',emulator_HeadUnitChrome, $ui.UIExtensionType.SCREEN, {Fans : {AUTO: 0}}));
		$ui.addExtension(new UIExtension('WedgeTemperature',emulator_WedgeTemperature, $ui.UIExtensionType.SCREEN, {RIGHT:'right',LEFT:'left'}));
		$ui.addExtension(new UIExtension('AppContainer', emulator_AppContainer, $ui.UIExtensionType.SCREEN));
	}
}
function emulator_AppContainer(object, data) {
	$ui_CoreScreen.call(this, object, data);
	
	if (object) {
		$ui.addClass(object.dom,'emulator-app-container');
		
		// Set the width
		object.dom.style.width = (object.width == undefined) ? window.innerWidth + 'px' : object.width + 'px';

		// Create our content div for the controls
		object.dom.contentDiv = document.createElement('div');
		$ui.addClass(object.dom.contentDiv, 'inner');
		object.dom.appendChild(object.dom.contentDiv);
		if (object.iconSplash) {
			object.dom.contentDiv.style.backgroundImage = 'url("' + object.iconSplash + '")';
		}
		
		// Delay the visibilty so we don't get a white flash
		object._delayedVisibility = function(screen, data) {
			this.dom.iframe.style.visibility = 'visible';
		}
		object._delayedVisibility = object._delayedVisibility.bind(object);
		
		// Make the iframe area visible on load
		object._iframeLoad = function(screen, data) {
			setTimeout(this._delayedVisibility, 500);
		}
		object._iframeLoad = object._iframeLoad.bind(object);
		
		// Create our iframe for the app
		object.dom.iframe = document.createElement('iframe');
		object.dom.contentDiv.appendChild(object.dom.iframe);
		object.dom.iframe.onload = object._iframeLoad;
		
		// This function fires when this App Container has been successfully displayed
		object._initialize = function(screen, data) {
			this.dom.iframe.src = this.src;
		}
		object._initialize = object._initialize.bind(object);

		return object.dom;
	}
}

emulator_AppContainer.prototype = new $ui_CoreScreen();


function emulator_CoreWedgeScreen(object, data) {
	// Default disable some core screen features
	if (object) {
		object.disableAnimation = true;
		object.background = undefined;
	}
	$ui_CoreScreen.call(this, object, data);
	
	if (object) {
		$ui.addClass(object.dom,'emulator-core-wedge-screen');
		object.dom.style.backgroundColor = 'transparent';
		
		if (window.innerHeight > window.innerWidth) {
			$ui.addClass(object.dom,'portrait');
		}
		
		if (object.direction == undefined) {
			object.direction = 'left';
		}
		
		if (object.direction == 'right') {
			object._isRightToLeft = true;
		} else {
			object._isRightToLeft = false;
		}
		
		// Create our wedge
		object.dom.wedge = document.createElement('div');
		$ui.addClass(object.dom.wedge, 'wedge');
		object.dom.appendChild(object.dom.wedge);
		
		// Set our wedge dimensions and angle
		var wedgeWidth = (window.innerWidth > window.innerHeight) ? Math.floor(window.innerWidth/3) : Math.floor(window.innerHeight/3),
			buttonWidth = Math.floor(wedgeWidth/2),
			buttonBottom = 20,
			opposite = window.innerHeight,
		    adjacent = window.innerWidth,
			hypotenuse = Math.sqrt(Math.pow(opposite,2) + Math.pow(adjacent,2)),
			degrees = 90 - Math.asin(opposite/hypotenuse)*(180/Math.PI);
		object._degrees	= degrees;
		// Set our wedge values
		object.dom.wedge.style.width = wedgeWidth + 'px';
		object.dom.wedge.style.backgroundColor = $ui.config.brandColor;	
		if (object._isRightToLeft == true) {
			degrees = '-' + degrees;
			object.dom.wedge.style.right = (window.innerWidth > window.innerHeight) ? Math.floor(wedgeWidth/2) + 'px' : '-'+Math.floor(wedgeWidth/1.5) + 'px';
		} else {
			object.dom.wedge.style.left = (window.innerWidth > window.innerHeight) ? Math.floor(wedgeWidth/2) + 'px' : '-'+Math.floor(wedgeWidth/1.5) + 'px';
		}
		object.dom.wedge.style['-webkit-transform'] = 'rotate('+degrees+'deg)';
		
		// Create our back button
		object.dom.back = document.createElement('div');
		$ui.addClass(object.dom.back,'back');
		object.dom.appendChild(object.dom.back);
		object.dom.back.style.bottom = '-' + buttonWidth + 'px';
		object.dom.back.style.width = buttonWidth + 'px';
		object.dom.back.style.height = buttonWidth + 'px';
		object.dom.back.style.borderRadius = (Math.floor(buttonWidth/2) + 1) + 'px';
		object.dom.back.textDiv = document.createElement('div');
		$ui.addClass(object.dom.back.textDiv, 'back-text');
		object.dom.back.appendChild(object.dom.back.textDiv);
		if (object._isRightToLeft == true) {
			if ($system && ($system.isClientDevice == true)) {
				object.dom.back.style.right = '10px';
			} else {
				object.dom.back.style.right = (window.innerWidth > window.innerHeight) ? Math.floor(buttonWidth/3)+ 'px' : '20px';
			}
			$ui.addClass(object.dom.back.textDiv,'right-to-left');
		} else {
			if ($system && ($system.isClientDevice == true)) {
				object.dom.back.style.left = '10px';
			} else {
				object.dom.back.style.left = (window.innerWidth > window.innerHeight) ? Math.floor(buttonWidth/3)+ 'px' : '20px';
			}
		}
		
		// See if we have back button customization
		if (object.backButton && object.backButton.caption) {
				object.dom.back.textDiv.textContent = object.backButton.caption;
		} else {
			object.dom.back.textDiv.textContent = 'Back';
		}
		if (object.backButton && object.backButton.icon) {
			$ui.addClass(object.dom.back,object.backButton.icon);
		} else {
			$ui.addClass(object.dom.back,'emulator-icon-back-white');
		}
		
		// Handle our back click
		object.dom.back.onclick = function() {
			$ui.playTouchSound();
			$ui.pop();
		}
		object.dom.back.ontouchstart = function() {
			this.style.backgroundColor = 'rgba(0,0,0,0.3)';
		}
		object.dom.back.ontouchend = function() {
			this.style.backgroundColor = '';
		}
		object.dom.back.ontouchcancel = object.dom.back.ontouchend;
		if (!$ui.isMobileDevice()) {
			object.dom.back.onmousedown = object.dom.back.ontouchstart;
			object.dom.back.onmouseup = object.dom.back.ontouchend;
			object.dom.back.onmouseleave = object.dom.back.ontouchend;
		}
		
		// Trigger our animations
		window.setTimeout(function() {object.dom.wedge.style.opacity = '1.0';},0);
		window.setTimeout(function() { 
			object.dom.back.style['-webkit-transform'] = 'translateY(-'+(buttonWidth + buttonBottom) + 'px)';
			object.dom.back.addEventListener('webkitTransitionEnd', function(e) {
					this.textDiv.style.opacity = '1.0';
				}, false);
		},200);
		
		
		return object.dom;
	}
}

emulator_CoreWedgeScreen.prototype = new $ui_CoreScreen();


function emulator_HeadUnitChrome(object, data) {
	$ui_CoreScreen.call(this, object);
	
	if (object) {
		$ui.addClass(object.dom,'emulator-head-unit-chrome');

		// Determine if we are a stacked dual view
		object.isDualView = (window.innerHeight > window.innerWidth) && ($system.isClientDevice == false);
		if ((object.isDualView == true) || ($system.isClientDevice == true)) {
			$ui.addClass(object.dom,'portrait');
		}
		
		// Recalculate the layout of the different views
		object._recalculateLayout = function() {			
			// Make adjustments for HVAC
			if (this.hvac) {
				if (this.hvac.visible == true) {
					if ((this.isDualView == false) || ($system.isClientDevice == true)) {
						this._primaryWindow.dom.style.bottom = this.hvac._getHeight()+'px';
						this._primaryWindow.dom.style.height = 'inherit';
					} else if (this._secondaryWindow) {
						this._secondaryWindow.dom.style.bottom = this.hvac._getHeight()+'px';
					}
				}
			} 
		}
		object._recalculateLayout = object._recalculateLayout.bind(object);
		
		// Create our primary window area
		object._primaryWindow = {parent: object};
		var dom = new emulator_Window(object._primaryWindow,object);
		$ui.addClass(dom,'primary');
		dom.style.borderBottomColor = $ui.config.brandColor;
		object.dom.appendChild(dom);
		
		// Create our secondary view area
		if (object.isDualView == true) {
			object._secondaryWindow = {parent: object};
			dom = new emulator_Window(object._secondaryWindow,object);
			$ui.addClass(dom,'secondary');
			object.dom.appendChild(dom);
		}
		
		// Create our navigation bar
		object._navigation = {};
		object._navigation._chrome = object;
		dom = new emulator_NavigationBar(object._navigation,object);
		object.dom.appendChild(dom);

		// See if we have HVAC
		if (object.hvac) {
			dom = new emulator_HVACBar(object.hvac,object);
			object.dom.appendChild(dom);
		}
		
		// Get our home window pane
		if (object.homeWindowPane) {
			// We open on another thread so that the root HeadUnitChrome has been inserted into the DOM
			setTimeout(function(){
				//object.homeWindowPane.width = object._primaryWindow.dom.offsetWidth;
				object._primaryWindow.push(object.homeWindowPane);
			},0);
		}
		
		// Get our secondary window pane
		if (object.secondaryWindowPane && (object.isDualView == true)) {
			// Create the app viewer for the defined secondary pane
			var app = function() {
				this.component = $ui.AppContainer;
				this.disableAnimation = true;
			};
			app.prototype.src = object.secondaryWindowPane;
			// We open on another thread so that the root HeadUnitChrome has been inserted into the DOM
			setTimeout(function() {
				app.prototype.width = object._secondaryWindow.dom.offsetWidth;
				object._secondaryWindow.push(app);
			},0);
		}
		
		// Assign the middle navigation menu to the window pane provided
		object._setNavigationMenu = object._navigation._setNavigationMenu;
		
		
		return object.dom;
	}
}

emulator_HeadUnitChrome.prototype = new $ui_CoreScreen();


function emulator_DefrostButton(object, screen) {
	$ui_CoreComponent.call(this, object, screen);
	$ui.addClass(object.dom,'defrost-button');
	$ui.addClass(object.dom,'off');
	object.dom.style.backgroundColor = $ui.config.brandColor;
	
	object.dom.onclick = function() {
		$ui.playTouchSound();
		/*if (this.model.onclick) {
			this.model.onclick();
		}*/
	}
	object.dom.ontouchstart = function() {
		$ui.addClass(this,'selected');
		//this.style.backgroundColor = $ui.config.brandColor;
		//this.style.color = 'white';
	}
	object.dom.ontouchend = function() {
		$ui.removeClass(this,'selected');
		//this.style.backgroundColor = '';
		//this.style.color = $ui.config.brandColor;
	}
	object.dom.ontouchcancel = object.dom.ontouchend;
	if (!$ui.isMobileDevice()) {
		object.dom.onmousedown = object.dom.ontouchstart;
		object.dom.onmouseup = object.dom.ontouchend;
		object.dom.onmouseleave = object.dom.ontouchend;
	}
	
	return object.dom;
}

emulator_DefrostButton.prototype = new $ui_CoreComponent();
function emulator_FansButton(object, screen) {
	$ui_CoreComponent.call(this, object, screen);
	$ui.addClass(object.dom,'fans');
	
	// Set defaults
	if (object.value == undefined) {
		object.value = $ui.HeadUnitChrome.Fans.AUTO;
	}
	
	// Handle touch interaction
	object.dom.onclick = function() {
		$ui.playTouchSound();
		if (this.model.onclick) {
			this.model.onclick();
		}
	}
	object.dom.ontouchstart = function() {
		$ui.addClass(this,'selected');
	}
	object.dom.ontouchend = function() {
		$ui.removeClass(this,'selected');
	}
	object.dom.ontouchcancel = object.dom.ontouchend;
	if (!$ui.isMobileDevice()) {
		object.dom.onmousedown = object.dom.ontouchstart;
		object.dom.onmouseup = object.dom.ontouchend;
		object.dom.onmouseleave = object.dom.ontouchend;
	}
	
	// Set the current fan setting
	object.setValue = function(value) {
		var prevValue = (this.value == undefined) ? $ui.HeadUnitChrome.Fans.AUTO : this.value;
		if (value == undefined) value = $ui.HeadUnitChrome.Fans.AUTO;
		this.value = value;
		// Remove previous setting styling
		$ui.removeClass(this.dom,'emulator-icon-head-unit-fans-setting-'+prevValue);
		$ui.addClass(this.dom,'emulator-icon-head-unit-fans-setting-'+this.value);
	}
	object.setValue = object.setValue.bind(object);
	
	// Check for defined fan setting
	if (object.value != undefined) {
		object.setValue(object.value);	
	}
	
	// We need to make the opacity show up based on a delay because
	// opacity can't animate when display changes from a previous state of none
	object._onshow = function(value) {
		setTimeout(this._timedOpacity,500);
	}
	object._onshow = object._onshow.bind(object);
	
	// Make the button visible
	object._timedOpacity = function(value) {
		this.dom.style.opacity = '1.0';
	}
	object._timedOpacity = object._timedOpacity.bind(object);
	
	return object.dom;
}

emulator_FansButton.prototype = new $ui_CoreComponent();
function emulator_HVACBar(object, screen) {
	$ui_CoreComponent.call(this, object, screen);
	$ui.addClass(object.dom,'hvac');
	var dom;
	
	// Set our brand color
	object.dom.style.borderTopColor = $ui.config.brandColor;
	
	// Set driver defaults driver heat settings
	if (object.driver == undefined) {
		object.driver = {
			temperature: {
				value: 0, 
				side: 'left', 
				visible: false
			},
			seat: {
				value: 0,
				side: 'left',
				visible: false
			}
		}
	} else {
		if (object.driver.temperature == undefined) {
			object.driver.temperature = {
					value: 0, 
					visible: false
				}
		}
		if (object.driver.seat == undefined) {
			object.driver.seat = {
					value: 0, 
					visible: false
				}
		}
		object.driver.temperature.side = 'left';
		object.driver.seat.side = 'left';
	}
	// Create the driver temperature button
	dom = new emulator_TemperatureButton(object.driver.temperature, screen);
	object.dom.appendChild(dom);
	// Create the driver seat button
	dom = new emulator_SeatButton(object.driver.seat, screen);
	object.dom.appendChild(dom);
	
	// Create passenger heat settings
	if (object.passenger == undefined) {
		object.passenger = {
			temperature: {
				value: 0, 
				side: 'right', 
				visible: false
			},
			seat: {
				value: 0,
				side: 'right',
				visible: false
			}
		}
	} else {
		if (object.passenger.temperature == undefined) {
			object.passenger.temperature = {
					value: 0, 
					visible: false
				}
		} 
		if (object.passenger.seat == undefined) {
			object.passenger.seat = {
					value: 0, 
					visible: false
				}
		} 
		object.passenger.temperature.side = 'right';
		object.passenger.seat.side = 'right';
	}
	// Create passenger temperature button
	dom = new emulator_TemperatureButton(object.passenger.temperature, screen);
	object.dom.appendChild(dom);
	// Create the passenger seat button
	dom = new emulator_SeatButton(object.passenger.seat, screen);
	object.dom.appendChild(dom);
	
	// Create the rear defrost button
	if (object.showDefrostOnBar == true) {
		object._rearDefrost = {parent: object};
	} else {
		object._rearDefrost = {parent: object, visible: false};
	}
	dom = new emulator_DefrostButton(object._rearDefrost, screen);
	object.dom.appendChild(dom);
	
	// Create fan settings button
	if (object.fans) {
		object.fans.parent = object;
	} else {
		object.fans = {parent: object, visible: false};
	}
	dom = new emulator_FansButton(object.fans, screen);
	object.dom.appendChild(dom);
	
	// Get the height of the control
	object._getHeight = function() {
		if ($system.isClientDevice == true) return 60;
		return 120;
	}
	object._getHeight = object._getHeight.bind(object);
	
	// If this is visible then make the primary window bottom align with the
	// top of this control
	object._setVisible = function(value) {
		this.screen._recalculateLayout();
	}
	object._setVisible = object._setVisible.bind(object);
	object._setVisible(object.visible);
	

	
	
	return object.dom;
}

emulator_HVACBar.prototype = new $ui_CoreComponent();
function emulator_SeatButton(object, screen) {
	$ui_CoreComponent.call(this, object, screen);
	$ui.addClass(object.dom,'seat');
	
	// Set the side of the display
	if (object.side != undefined) {
		$ui.addClass(object.dom,object.side);
	}
	
	// Make sure we have a default max levels
	if (object.maxLevel == undefined) {
		object.maxLevel = 0;
	}
	
	// Handle our clicks
	object.dom.onclick = function() {
		if (this.model.level == this.model.maxLevel) {
			this.model.setLevel(0);
		} else {
			this.model.setLevel(this.model.level + 1);
		}
		$ui.playTouchSound();
		if (this.model.onclick) {
			this.model.onclick();
		}
	}
	object.dom.ontouchstart = function() {
		$ui.addClass(this,'selected');
	}
	object.dom.ontouchend = function() {
		$ui.removeClass(this,'selected');
	}
	object.dom.ontouchcancel = object.dom.ontouchend;
	if (!$ui.isMobileDevice()) {
		object.dom.onmousedown = object.dom.ontouchstart;
		object.dom.onmouseup = object.dom.ontouchend;
		object.dom.onmouseleave = object.dom.ontouchend;
	}
	
	// Set the level
	object.setLevel = function(value) {
		var prevLevel = (this.level == undefined) ? 0 : this.level;
		if (value == undefined) value = 0;
		this.level = value;
		// Remove previous level styling
		$ui.removeClass(this.dom,'level-'+prevLevel);
		$ui.addClass(this.dom,'level-'+this.level);
	}
	object.setLevel = object.setLevel.bind(object);
	
	// Check for defined seat level
	if (object.level != undefined) {
		object.setLevel(object.level);	
	}
	
	// We need to make the opacity show up based on a delay because
	// opacity can't animate when display changes from a previous state of none
	object._onshow = function(value) {
		setTimeout(this._timedOpacity,500);
	}
	object._onshow = object._onshow.bind(object);
	
	// Make the button visible
	object._timedOpacity = function(value) {
		this.dom.style.opacity = '1.0';
	}
	object._timedOpacity = object._timedOpacity.bind(object);
	
	return object.dom;
}

emulator_SeatButton.prototype = new $ui_CoreComponent();
function emulator_TemperatureButton(object, screen) {
	$ui_CoreComponent.call(this, object, screen);
	$ui.addClass(object.dom,'temperature');
	object.dom.style.color = $ui.config.brandColor;
	
	// Set the side of the display
	if (object.side != undefined) {
		$ui.addClass(object.dom,object.side);
	}
	
	// Handle our clicks
	object.dom.onclick = function() {
		$ui.playTouchSound();
		if (this.model.onclick) {
			this.model.onclick();
		}
	}
	object.dom.ontouchstart = function() {
		this.style.color = 'white';
	}
	object.dom.ontouchend = function() {
		this.style.color = $ui.config.brandColor;
	}
	object.dom.ontouchcancel = object.dom.ontouchend;
	if (!$ui.isMobileDevice()) {
		object.dom.onmousedown = object.dom.ontouchstart;
		object.dom.onmouseup = object.dom.ontouchend;
		object.dom.onmouseleave = object.dom.ontouchend;
	}
	
	// Set the temperature
	object.setTemperature = function(value) {
		this.value = value;
		var degree = ($ui.config.celsius == true) ? 'C' : 'F';
		this.dom.innerHTML = value+'<span class="small">&deg;'+degree+'</span>';
	}
	object.setTemperature = object.setTemperature.bind(object);
	
	// Driver control decisions
	if (object.value) {
		object.setTemperature(object.value);	
	}
	
	return object.dom;
}

emulator_TemperatureButton.prototype = new $ui_CoreComponent();
function emulator_NavigationBar(object, screen) {
	$ui_CoreComponent.call(this, object, screen);
	$ui.addClass(object.dom,'navigation');
	
	// Set our brand color
	object.dom.style.borderRightColor = $ui.config.brandColor;
	object.dom.style.borderBottomColor = $ui.config.brandColor;
	
	// Add our clock
	object.dom.clock = document.createElement('div');
	$ui.addClass(object.dom.clock,'clock');
	object.dom.clock.style.color = $ui.config.brandColor;
	object.dom.appendChild(object.dom.clock);
	object._updateClock = function() {
		var date = new Date(),
			hour = date.getHours(),
			min = date.getMinutes();
			
		hour = (hour > 12) ? (hour - 12) : hour;
		min = (min < 10) ? ('0' + min) : min;
		this.dom.clock.textContent = hour + ':' + min;	
	}
	object._updateClock = object._updateClock.bind(object);
	window.setInterval(object._updateClock,10000); // update every 10 seconds
	object._updateClock();
	
	// Create the home line
	object.dom.homeLine = document.createElement('div');
	$ui.addClass(object.dom.homeLine,'line');
	$ui.addClass(object.dom.homeLine,'home');
	object.dom.appendChild(object.dom.homeLine);
	
	// Create the center line
	object.dom.centerLine = document.createElement('div');
	$ui.addClass(object.dom.centerLine,'line');
	$ui.addClass(object.dom.centerLine,'center');
	object.dom.appendChild(object.dom.centerLine);

	// Create the more line
	object.dom.moreLine = document.createElement('div');
	$ui.addClass(object.dom.moreLine,'line');
	$ui.addClass(object.dom.moreLine,'more');
	object.dom.appendChild(object.dom.moreLine);
	
	// Create our highlight dot
	object.dom.dot = document.createElement('div');
	$ui.addClass(object.dom.dot,'dot');
	object.dom.dot.style.backgroundColor = $ui.config.brandColor;
	object.dom.appendChild(object.dom.dot);
	
	// Create the home button
	object.dom.homeBtn = document.createElement('div');
	object.dom.homeBtn.model = object;
	object._selectedButton = object.dom.homeBtn;
	$ui.addClass(object.dom.homeBtn,'circle-button');
	$ui.addClass(object.dom.homeBtn,'home');
	object.dom.appendChild(object.dom.homeBtn);
	object.dom.homeBtn.onclick = function() {
		if (this.model._selectedButton == this) return;
		this.model._selectedButton = this;
		if (this.model._chrome.isDualView || ($system.isClientDevice == true)) {
			this.model.dom.dot.style['-webkit-transform'] = 'translateX(0px)';
		} else {
			this.model.dom.dot.style['-webkit-transform'] = 'translateY(0px)';
		}
		this.model.dom.centerBtn._hide();
		// Clear out existing screens in the primary display
		this.model._chrome._primaryWindow.popToHome();
		$ui.playTouchSound();
	}
	
	// Create the center button
	object.dom.centerBtn = document.createElement('div');
	object.dom.centerBtn.model = object;
	object.dom.centerBtn._hidden = true;
	$ui.addClass(object.dom.centerBtn,'circle-button');
	$ui.addClass(object.dom.centerBtn,'center');
	object.dom.appendChild(object.dom.centerBtn);
	object.dom.centerBtn.onclick = function() {
		if (this._hidden === true) return;
		if (this.model._selectedButton == this) return;
		this.model._selectedButton = this;
		if (this.model._chrome.isDualView || ($system.isClientDevice == true)) {
			this.model.dom.dot.style['-webkit-transform'] = 'translateX('+(this.offsetLeft - this.model.dom.homeBtn.offsetLeft)+'px)';
		} else {
			this.model.dom.dot.style['-webkit-transform'] = 'translateY('+(this.offsetTop - this.model.dom.homeBtn.offsetTop)+'px)';
		}
		$ui.playTouchSound();
	}
	object.dom.centerBtn._hide = function() {
		this.model.dom.centerBtn.style.opacity = '0';
		this.model.dom.centerLine.style.opacity = '1.0';
		this._hidden = true;
	}
	object.dom.centerBtn._hide = object.dom.centerBtn._hide.bind(object.dom.centerBtn);
	object.dom.centerBtn._show = function() {
		this.model.dom.centerBtn.style.opacity = '1.0';
		this.model.dom.centerLine.style.opacity = '0';
		this._hidden = false;
	}
	object.dom.centerBtn._show = object.dom.centerBtn._show.bind(object.dom.centerBtn);

	// Create the more button
	object.dom.moreBtn = document.createElement('div');
	object.dom.moreBtn.model = object;
	$ui.addClass(object.dom.moreBtn,'circle-button');
	$ui.addClass(object.dom.moreBtn,'more');
	object.dom.appendChild(object.dom.moreBtn);
	object.dom.moreBtn.onclick = function() {
		if (this.model._selectedButton == this) return;
		this.model._selectedButton = this;
		if (this.model._chrome.isDualView || ($system.isClientDevice == true)) {
			this.model.dom.dot.style['-webkit-transform'] = 'translateX('+(this.offsetLeft - this.model.dom.homeBtn.offsetLeft)+'px)';
		} else {
			this.model.dom.dot.style['-webkit-transform'] = 'translateY('+(this.offsetTop - this.model.dom.homeBtn.offsetTop)+'px)';
		}
		$ui.playTouchSound();
	}
	
	// This will re-layout the control based on screen dimensions
	object._recalculateLayout = function() {
		if (this._chrome.isDualView || ($system.isClientDevice == true)) {
			var leftThreshold = this.dom.homeBtn.offsetLeft + this.dom.homeBtn.offsetWidth,
				rightThreshold = this.dom.moreBtn.offsetLeft,
				center = Math.floor((rightThreshold - leftThreshold)/2),
				centerLeft;
			// Adjust our center button
			centerLeft = (rightThreshold - center - Math.floor(this.dom.centerBtn.offsetWidth/2));
			this.dom.centerBtn.style.left = centerLeft + 'px';
			// Adjust our lines
			this.dom.homeLine.style.width = (centerLeft - leftThreshold + 2) + 'px';
			this.dom.moreLine.style.width = (rightThreshold - centerLeft - this.dom.centerBtn.offsetHeight + 2) + 'px';
			// Update our dot position
			this.dom.dot.style['-webkit-transform'] = 'translateX('+(this._selectedButton.offsetLeft - this.dom.homeBtn.offsetLeft)+'px)';	
		} else {
			var topThreshold = this.dom.homeBtn.offsetTop + this.dom.homeBtn.offsetHeight,
				bottomThreshold = this.dom.moreBtn.offsetTop,
				center = Math.floor((bottomThreshold - topThreshold)/2),
				centerTop;
			// Adjust our center button
			centerTop = (bottomThreshold - center - Math.floor(this.dom.centerBtn.offsetHeight/2));
			this.dom.centerBtn.style.top = centerTop + 'px';
			// Adjust our lines
			this.dom.homeLine.style.height = (centerTop - topThreshold) + 'px';
			this.dom.moreLine.style.height = (bottomThreshold - centerTop - this.dom.centerBtn.offsetHeight) + 'px';
			// Update our dot position
			this.dom.dot.style['-webkit-transform'] = 'translateY('+(this._selectedButton.offsetTop - this.dom.homeBtn.offsetTop)+'px)';
		}
	}
	object._recalculateLayout = object._recalculateLayout.bind(object);
	
	// Clean up any pointers
	object._onresize = function() {
		this._recalculateLayout();
	}
	object._onresize = object._onresize.bind(object);
	
	// Get the height of the control
	object._getHeight = function() {
		if ($system.isClientDevice == true) {
			return 86
		} else if (window.innerHeight > window.innerWidth) {
			return 126;
		}
		return 150;
	}
	object._getHeight = object._getHeight.bind(object);
	
	// Assign the middle navigation menu to the window pane provided
	object._setNavigationMenu = function(appContainer) {
		if (this.dom.centerBtn._appContainer == appContainer) return;
		this.dom.centerBtn._hidden = false;
		this.dom.centerBtn.style.opacity = '1.0';
		this.dom.centerBtn._appContainer = appContainer;
		// Set our icon
		this.dom.centerBtn.style.backgroundImage = 'url("'+appContainer.icon+'")'; 
		this.dom.centerLine.style.opacity = '0';
		this._selectedButton = this.dom.centerBtn
		if (this._chrome.isDualView || ($system.isClientDevice == true)) {
			this.dom.dot.style['-webkit-transform'] = 'translateX('+(this.dom.centerBtn.offsetLeft - this.dom.homeBtn.offsetLeft)+'px)';
		} else {
			this.dom.dot.style['-webkit-transform'] = 'translateY('+(this.dom.centerBtn.offsetTop - this.dom.homeBtn.offsetTop)+'px)';
		}
	}
	object._setNavigationMenu = object._setNavigationMenu.bind(object);

	// Immediately redraw the control
	setTimeout(object._recalculateLayout,0);
	return object.dom;
}

emulator_NavigationBar.prototype = new $ui_CoreComponent();
function emulator_WedgeTemperature(object, data) {
	emulator_CoreWedgeScreen.call(this, object, data);
	$ui.addClass(object.dom,'emulator-wedge-temperature');
	
	// Set our max and min
	object._max = 85;
	object._min = 55;
	
	// Create our temperature box
	object.dom.box = document.createElement('div');
	$ui.addClass(object.dom.box,'box');
	object.dom.wedge.appendChild(object.dom.box);
	
	var dom,
		degrees = object._degrees;
	if (object._isRightToLeft != true) {
		degrees = '-' + degrees;
	}
	object.dom.box.style['-webkit-transform'] = 'rotate('+degrees+'deg)'
		
	// Increase Temperature
	object._increaseTemperature = function() {
		if (this.temperature < this._max) {
			this.setTemperature(this.temperature + 1);
			if (this.onchange) {
				this.onchange();
			}
		}
	}
	object._increaseTemperature = object._increaseTemperature.bind(object);	
		
	// Decrease Temperature
	object._decreaseTemperature = function() {
		if (this.temperature > this._min) {
			this.setTemperature(this.temperature - 1);
			if (this.onchange) {
				this.onchange();
			}
		}
	}
	object._decreaseTemperature = object._decreaseTemperature.bind(object);	
		
	// Create the up button
	object._upButton = {direction: 'up', onclick: object._increaseTemperature};
	dom = new emulator_WedgeTemperatureButton(object._upButton, object);
	object.dom.box.appendChild(dom);
	
	// Create the down button
	object._downButton = {direction: 'down', onclick: object._decreaseTemperature};
	dom = new emulator_WedgeTemperatureButton(object._downButton, object);
	object.dom.box.appendChild(dom);
	
	// Create the temperature display area
	object.dom.temperature = document.createElement('div');
	$ui.addClass(object.dom.temperature, 'temperature');
	object.dom.box.appendChild(object.dom.temperature);
	
	// Set the temperature
	object.setTemperature = function(value) {
		this.temperature = value;
		this.dom.temperature.textContent = value;
	}
	object.setTemperature = object.setTemperature.bind(object);
	
	// Set our temperature if defined
	if (object.temperature) {
		object.setTemperature(object.temperature);
	}
	return object.dom;
}

emulator_WedgeTemperature.prototype = new emulator_CoreWedgeScreen();


function emulator_WedgeTemperatureButton(object, screen) {
	$ui_CoreComponent.call(this, object, screen);
	$ui.addClass(object.dom,'button');
	
	// Set the side of the display
	if (object.direction != undefined) {
		$ui.addClass(object.dom,object.direction);
	} else {
		$ui.addClass(object.dom,'up');
	}
	
	// Add our arrow
	object.dom.arrow = document.createElement('div');
	$ui.addClass(object.dom.arrow,'arrow');
	object.dom.appendChild(object.dom.arrow);
	
	// Handle our clicks
	object.dom.onclick = function() {
		$ui.playTouchSound();
		if (this.model.onclick) {
			this.model.onclick();
		}
	}
	object.dom.ontouchstart = function() {
		this.style.opacity = '0.5';
	}
	object.dom.ontouchend = function() {
		this.style.opacity = '';
	}
	object.dom.ontouchcancel = object.dom.ontouchend;
	if (!$ui.isMobileDevice()) {
		object.dom.onmousedown = object.dom.ontouchstart;
		object.dom.onmouseup = object.dom.ontouchend;
		object.dom.onmouseleave = object.dom.ontouchend;
	}
	
	return object.dom;
}

emulator_WedgeTemperatureButton.prototype = new $ui_CoreComponent();
function emulator_Window(object, screen) {
	$ui_CoreComponent.call(this, object, screen);
	$ui.addClass(object.dom,'emulator-window');
	
	object.screens = [];
	
	// Push a screen into this window
	object.push = function(screen, data) {
		screen = new screen();
		screen.container = this;
		screen.chrome = this.parent;
		if (!screen.width) {
			screen.width = this.dom.offsetWidth;
		}
		if (screen.component == $ui.AppContainer) {
			var dom = new emulator_AppContainer(screen, data);
		} else if (screen.component == $ui.WindowPane) {
			var dom = new $ui_WindowPane(screen, data);
		} else {
			return;
		}
		this.screens.push(screen);
		// See if we have an icon to set
		if (screen.icon) {
			this.screen._setNavigationMenu(screen); // this.screen is the HeadUnitChrome
		}
		this.dom.appendChild(dom);
		// If there is no animation then initialize the screen
		if (screen.disableAnimation === true) {
			screen.initialize();
		}	
	}
	object.push = object.push.bind(object);

	// This will pop/destroy all of the screens stacked in this window except the first one
	object.popToHome = function() {
		if (this.screens.length <= 1) return;
		$ui.inScreenTransition = true;
		$ui.blockAllTapEvent(true);
		this.screens[0].dom.style.visibility = '';
		if (this.screens.length > 1) {
			var screen = this.screens[this.screens.length - 1];
			// Let the top most screen know it is going to be popped
			if (screen._onbeforepop) {
				screen._onbeforepop();
			}
			// Remove any global event listeners
			$system.removeEventListenersForScreen(screen);
		}
		setTimeout(this._popToHome, 0);
	}
	object.popToHome = object.popToHome.bind(object);
	
	// Internal function to do the dirty work after the root page has been re-drawn
	object._popToHome = function() {
		if (this.screens.length <= 1) return;
		var i,
			screen;
		// Take the top most screen and animate out it as long as animation is not disabled
		screen = this.screens[this.screens.length-1];
		if (screen.disableAnimation === true) {
			this._removeScreen(screen);
			$ui.inScreenTransition = false;
			$ui.blockAllTapEvent(false);
		} else {
			screen.dom.style['-webkit-animation-delay'] = '';
			screen.dom.style['-webkit-animation-name'] = 'ui-pane-slide-right';
			screen.dom.addEventListener('webkitAnimationEnd', function(e) {
				this.model.container._removeScreen(this.model);
				$ui.inScreenTransition = false;
				$ui.blockAllTapEvent(false);
			}, false);
		}
		// Remove all the middle screens
		for (i = this.screens.length - 2; i > 0; i--) {
			this._removeScreen(this.screens[i]);
		}
	}
	object._popToHome = object._popToHome.bind(object);
	
	// Public function to pop the top most screen
	object.pop = function() {
		if (this.screens.length <= 1) return;
		$ui.inScreenTransition = true;
		$ui.blockAllTapEvent(true);
		var screenBelow = this.screens[this.screens.length-2];
		screenBelow.dom.style.visibility = '';
		// See if we have an icon to set
		if (screenBelow.menuImgClass) {
			this.screen._setNavigationMenu(screenBelow); // this.screen is the HeadUnitChrome
		}
		if (this.screens.length > 1) {
			var screen = this.screens[this.screens.length - 1];
			// Let the top most screen know it is going to be popped
			if (screen._onbeforepop) {
				screen._onbeforepop();
			}
			// Clear the screen
			if (screen.disableAnimation === true) {
				this._removeScreen(screen);
				$ui.inScreenTransition = false;
				$ui.blockAllTapEvent(false);
			} else {
				screen.dom.style['-webkit-animation-delay'] = '';
				screen.dom.style['-webkit-animation-name'] = 'pane-slide-right';
				screen.dom.addEventListener('webkitAnimationEnd', function(e) {
					this.model.container._removeScreen(this.model);
					$ui.inScreenTransition = false;
					$ui.blockAllTapEvent(false);
				}, false);
			}
		}
		
	}
	object.pop = object.pop.bind(object);
	
	// Remove the screen from the dom and the array
	object._removeScreen = function(screen) {
		screen.dom.style.display = 'none';
		this.dom.removeChild(screen.dom);
		// Remove any global event listeners
		$system.removeEventListenersForScreen(screen);
		screen.destroy();
		this.screens.pop();
	}
	object._removeScreen = object._removeScreen.bind(object);
	

	// Dispatch the resize event to nested screens
	object._resizeListener = function() {
		// Fire any screen resize events needed
		var i, 
			screen;
		for (i = 0; i < this.screens.length; i++) {
			screen = this.screens[i];
			// Run internal resize
			if (screen._onresize) {
				screen._onresize();
			}
			// Run internal Window pane resize
			if (screen._onwindowpaneresize) {
				screen._onwindowpaneresize();
			}
			// Fire the screen's public event
			if (screen.onresize) {
				screen.onresize();
			}
		}
	}
	object._resizeListener = object._resizeListener.bind(object);
	window.addEventListener('resize', object._resizeListener, false);
	
	return object.dom;
}

emulator_Window.prototype = new $ui_CoreComponent();
