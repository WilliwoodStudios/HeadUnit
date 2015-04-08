/* $emulator VERSION: 1.0.0.2814*/

var $emulator = {
	_panThreshold: 30,
	
	// Initialize the emulator
	init: function() {
		// Register our custom controls/screens
		$ui.addExtension(new UIExtension('HeadUnitChrome',emulator_HeadUnitChrome, $ui.UIExtensionType.SCREEN, {Fans : {AUTO: 0}}));
		$ui.addExtension(new UIExtension('WedgeTemperature',emulator_WedgeTemperature, $ui.UIExtensionType.SCREEN, {RIGHT:'right',LEFT:'left'}));
		$ui.addExtension(new UIExtension('AppContainer', emulator_AppContainer, $ui.UIExtensionType.SCREEN));
		
		// Handle our swipe gestures
		$emulator._hammer = new Hammer.Manager(document.body);
		$emulator._hammer.add( new Hammer.Pan({event: 'pan', pointers: 2, threshold: 20}));
		$emulator._hammer.on('panup',function(ev) {
			var distance = Math.floor(ev.distance);
			if (distance % $emulator._panThreshold == 0) {
				$emulator.chrome.volumeUp();
			}
		});
		$emulator._hammer.on('pandown',function(ev) {
			var distance = Math.floor(ev.distance);
			if (distance % $emulator._panThreshold == 0) {
				$emulator.chrome.volumeDown();
			}
		});
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
		object.dom.wedge.style.backgroundColor = $ui.getThemeColor();	
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
		dom.style.borderBottomColor = $ui.getThemeColor();
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
		
		// Create our volume area
		object.dom.volume = document.createElement('div');
		$ui.addClass(object.dom.volume,'volume');
		object.dom.volume.style.backgroundColor = $ui.getThemeColor();
		object.dom.appendChild(object.dom.volume);
		
		
		// Turn up the volume
		object.volumeUp = function() {			
			if (this._volumeHandle) {
				clearTimeout(this._volumeHandle);
			}
			this.dom.volume.style.display = 'block';
			this._volumeHandle = setTimeout(function() {
				object.dom.volume.style.display = 'none';
			}, 750);
		}
		object.volumeUp = object.volumeUp.bind(object);
		
		// Turn down the volume
		object.volumeDown = function() {			
			if (this._volumeHandle) {
				clearTimeout(this._volumeHandle);
			}
			this.dom.volume.style.display = 'block';
			this._volumeHandle = setTimeout(function() {
				object.dom.volume.style.display = 'none';
			}, 750);
		}
		object.volumeDown = object.volumeDown.bind(object);
		
		
		return object.dom;
	}
}

emulator_HeadUnitChrome.prototype = new $ui_CoreScreen();


function emulator_DefrostButton(object, screen) {
	$ui_CoreComponent.call(this, object, screen);
	$ui.addClass(object.dom,'defrost-button');
	$ui.addClass(object.dom,'off');
	object.dom.style.backgroundColor = $ui.getThemeColor();
	
	object.dom.onclick = function() {
		$ui.playTouchSound();
		/*if (this.model.onclick) {
			this.model.onclick();
		}*/
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
	object.dom.style.borderTopColor = $ui.getThemeColor();
	
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
	object.dom.style.color = $ui.getThemeColor();
	
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
		this.style.color = $ui.getThemeColor();
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
		var degree = ($system.isCelsius()) ? 'C' : 'F';
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
/*! Hammer.JS - v2.0.4 - 2014-09-28
 * http://hammerjs.github.io/
 *
 * Copyright (c) 2014 Jorik Tangelder;
 * Licensed under the MIT license */
!function(a,b,c,d){"use strict";function e(a,b,c){return setTimeout(k(a,c),b)}function f(a,b,c){return Array.isArray(a)?(g(a,c[b],c),!0):!1}function g(a,b,c){var e;if(a)if(a.forEach)a.forEach(b,c);else if(a.length!==d)for(e=0;e<a.length;)b.call(c,a[e],e,a),e++;else for(e in a)a.hasOwnProperty(e)&&b.call(c,a[e],e,a)}function h(a,b,c){for(var e=Object.keys(b),f=0;f<e.length;)(!c||c&&a[e[f]]===d)&&(a[e[f]]=b[e[f]]),f++;return a}function i(a,b){return h(a,b,!0)}function j(a,b,c){var d,e=b.prototype;d=a.prototype=Object.create(e),d.constructor=a,d._super=e,c&&h(d,c)}function k(a,b){return function(){return a.apply(b,arguments)}}function l(a,b){return typeof a==kb?a.apply(b?b[0]||d:d,b):a}function m(a,b){return a===d?b:a}function n(a,b,c){g(r(b),function(b){a.addEventListener(b,c,!1)})}function o(a,b,c){g(r(b),function(b){a.removeEventListener(b,c,!1)})}function p(a,b){for(;a;){if(a==b)return!0;a=a.parentNode}return!1}function q(a,b){return a.indexOf(b)>-1}function r(a){return a.trim().split(/\s+/g)}function s(a,b,c){if(a.indexOf&&!c)return a.indexOf(b);for(var d=0;d<a.length;){if(c&&a[d][c]==b||!c&&a[d]===b)return d;d++}return-1}function t(a){return Array.prototype.slice.call(a,0)}function u(a,b,c){for(var d=[],e=[],f=0;f<a.length;){var g=b?a[f][b]:a[f];s(e,g)<0&&d.push(a[f]),e[f]=g,f++}return c&&(d=b?d.sort(function(a,c){return a[b]>c[b]}):d.sort()),d}function v(a,b){for(var c,e,f=b[0].toUpperCase()+b.slice(1),g=0;g<ib.length;){if(c=ib[g],e=c?c+f:b,e in a)return e;g++}return d}function w(){return ob++}function x(a){var b=a.ownerDocument;return b.defaultView||b.parentWindow}function y(a,b){var c=this;this.manager=a,this.callback=b,this.element=a.element,this.target=a.options.inputTarget,this.domHandler=function(b){l(a.options.enable,[a])&&c.handler(b)},this.init()}function z(a){var b,c=a.options.inputClass;return new(b=c?c:rb?N:sb?Q:qb?S:M)(a,A)}function A(a,b,c){var d=c.pointers.length,e=c.changedPointers.length,f=b&yb&&d-e===0,g=b&(Ab|Bb)&&d-e===0;c.isFirst=!!f,c.isFinal=!!g,f&&(a.session={}),c.eventType=b,B(a,c),a.emit("hammer.input",c),a.recognize(c),a.session.prevInput=c}function B(a,b){var c=a.session,d=b.pointers,e=d.length;c.firstInput||(c.firstInput=E(b)),e>1&&!c.firstMultiple?c.firstMultiple=E(b):1===e&&(c.firstMultiple=!1);var f=c.firstInput,g=c.firstMultiple,h=g?g.center:f.center,i=b.center=F(d);b.timeStamp=nb(),b.deltaTime=b.timeStamp-f.timeStamp,b.angle=J(h,i),b.distance=I(h,i),C(c,b),b.offsetDirection=H(b.deltaX,b.deltaY),b.scale=g?L(g.pointers,d):1,b.rotation=g?K(g.pointers,d):0,D(c,b);var j=a.element;p(b.srcEvent.target,j)&&(j=b.srcEvent.target),b.target=j}function C(a,b){var c=b.center,d=a.offsetDelta||{},e=a.prevDelta||{},f=a.prevInput||{};(b.eventType===yb||f.eventType===Ab)&&(e=a.prevDelta={x:f.deltaX||0,y:f.deltaY||0},d=a.offsetDelta={x:c.x,y:c.y}),b.deltaX=e.x+(c.x-d.x),b.deltaY=e.y+(c.y-d.y)}function D(a,b){var c,e,f,g,h=a.lastInterval||b,i=b.timeStamp-h.timeStamp;if(b.eventType!=Bb&&(i>xb||h.velocity===d)){var j=h.deltaX-b.deltaX,k=h.deltaY-b.deltaY,l=G(i,j,k);e=l.x,f=l.y,c=mb(l.x)>mb(l.y)?l.x:l.y,g=H(j,k),a.lastInterval=b}else c=h.velocity,e=h.velocityX,f=h.velocityY,g=h.direction;b.velocity=c,b.velocityX=e,b.velocityY=f,b.direction=g}function E(a){for(var b=[],c=0;c<a.pointers.length;)b[c]={clientX:lb(a.pointers[c].clientX),clientY:lb(a.pointers[c].clientY)},c++;return{timeStamp:nb(),pointers:b,center:F(b),deltaX:a.deltaX,deltaY:a.deltaY}}function F(a){var b=a.length;if(1===b)return{x:lb(a[0].clientX),y:lb(a[0].clientY)};for(var c=0,d=0,e=0;b>e;)c+=a[e].clientX,d+=a[e].clientY,e++;return{x:lb(c/b),y:lb(d/b)}}function G(a,b,c){return{x:b/a||0,y:c/a||0}}function H(a,b){return a===b?Cb:mb(a)>=mb(b)?a>0?Db:Eb:b>0?Fb:Gb}function I(a,b,c){c||(c=Kb);var d=b[c[0]]-a[c[0]],e=b[c[1]]-a[c[1]];return Math.sqrt(d*d+e*e)}function J(a,b,c){c||(c=Kb);var d=b[c[0]]-a[c[0]],e=b[c[1]]-a[c[1]];return 180*Math.atan2(e,d)/Math.PI}function K(a,b){return J(b[1],b[0],Lb)-J(a[1],a[0],Lb)}function L(a,b){return I(b[0],b[1],Lb)/I(a[0],a[1],Lb)}function M(){this.evEl=Nb,this.evWin=Ob,this.allow=!0,this.pressed=!1,y.apply(this,arguments)}function N(){this.evEl=Rb,this.evWin=Sb,y.apply(this,arguments),this.store=this.manager.session.pointerEvents=[]}function O(){this.evTarget=Ub,this.evWin=Vb,this.started=!1,y.apply(this,arguments)}function P(a,b){var c=t(a.touches),d=t(a.changedTouches);return b&(Ab|Bb)&&(c=u(c.concat(d),"identifier",!0)),[c,d]}function Q(){this.evTarget=Xb,this.targetIds={},y.apply(this,arguments)}function R(a,b){var c=t(a.touches),d=this.targetIds;if(b&(yb|zb)&&1===c.length)return d[c[0].identifier]=!0,[c,c];var e,f,g=t(a.changedTouches),h=[],i=this.target;if(f=c.filter(function(a){return p(a.target,i)}),b===yb)for(e=0;e<f.length;)d[f[e].identifier]=!0,e++;for(e=0;e<g.length;)d[g[e].identifier]&&h.push(g[e]),b&(Ab|Bb)&&delete d[g[e].identifier],e++;return h.length?[u(f.concat(h),"identifier",!0),h]:void 0}function S(){y.apply(this,arguments);var a=k(this.handler,this);this.touch=new Q(this.manager,a),this.mouse=new M(this.manager,a)}function T(a,b){this.manager=a,this.set(b)}function U(a){if(q(a,bc))return bc;var b=q(a,cc),c=q(a,dc);return b&&c?cc+" "+dc:b||c?b?cc:dc:q(a,ac)?ac:_b}function V(a){this.id=w(),this.manager=null,this.options=i(a||{},this.defaults),this.options.enable=m(this.options.enable,!0),this.state=ec,this.simultaneous={},this.requireFail=[]}function W(a){return a&jc?"cancel":a&hc?"end":a&gc?"move":a&fc?"start":""}function X(a){return a==Gb?"down":a==Fb?"up":a==Db?"left":a==Eb?"right":""}function Y(a,b){var c=b.manager;return c?c.get(a):a}function Z(){V.apply(this,arguments)}function $(){Z.apply(this,arguments),this.pX=null,this.pY=null}function _(){Z.apply(this,arguments)}function ab(){V.apply(this,arguments),this._timer=null,this._input=null}function bb(){Z.apply(this,arguments)}function cb(){Z.apply(this,arguments)}function db(){V.apply(this,arguments),this.pTime=!1,this.pCenter=!1,this._timer=null,this._input=null,this.count=0}function eb(a,b){return b=b||{},b.recognizers=m(b.recognizers,eb.defaults.preset),new fb(a,b)}function fb(a,b){b=b||{},this.options=i(b,eb.defaults),this.options.inputTarget=this.options.inputTarget||a,this.handlers={},this.session={},this.recognizers=[],this.element=a,this.input=z(this),this.touchAction=new T(this,this.options.touchAction),gb(this,!0),g(b.recognizers,function(a){var b=this.add(new a[0](a[1]));a[2]&&b.recognizeWith(a[2]),a[3]&&b.requireFailure(a[3])},this)}function gb(a,b){var c=a.element;g(a.options.cssProps,function(a,d){c.style[v(c.style,d)]=b?a:""})}function hb(a,c){var d=b.createEvent("Event");d.initEvent(a,!0,!0),d.gesture=c,c.target.dispatchEvent(d)}var ib=["","webkit","moz","MS","ms","o"],jb=b.createElement("div"),kb="function",lb=Math.round,mb=Math.abs,nb=Date.now,ob=1,pb=/mobile|tablet|ip(ad|hone|od)|android/i,qb="ontouchstart"in a,rb=v(a,"PointerEvent")!==d,sb=qb&&pb.test(navigator.userAgent),tb="touch",ub="pen",vb="mouse",wb="kinect",xb=25,yb=1,zb=2,Ab=4,Bb=8,Cb=1,Db=2,Eb=4,Fb=8,Gb=16,Hb=Db|Eb,Ib=Fb|Gb,Jb=Hb|Ib,Kb=["x","y"],Lb=["clientX","clientY"];y.prototype={handler:function(){},init:function(){this.evEl&&n(this.element,this.evEl,this.domHandler),this.evTarget&&n(this.target,this.evTarget,this.domHandler),this.evWin&&n(x(this.element),this.evWin,this.domHandler)},destroy:function(){this.evEl&&o(this.element,this.evEl,this.domHandler),this.evTarget&&o(this.target,this.evTarget,this.domHandler),this.evWin&&o(x(this.element),this.evWin,this.domHandler)}};var Mb={mousedown:yb,mousemove:zb,mouseup:Ab},Nb="mousedown",Ob="mousemove mouseup";j(M,y,{handler:function(a){var b=Mb[a.type];b&yb&&0===a.button&&(this.pressed=!0),b&zb&&1!==a.which&&(b=Ab),this.pressed&&this.allow&&(b&Ab&&(this.pressed=!1),this.callback(this.manager,b,{pointers:[a],changedPointers:[a],pointerType:vb,srcEvent:a}))}});var Pb={pointerdown:yb,pointermove:zb,pointerup:Ab,pointercancel:Bb,pointerout:Bb},Qb={2:tb,3:ub,4:vb,5:wb},Rb="pointerdown",Sb="pointermove pointerup pointercancel";a.MSPointerEvent&&(Rb="MSPointerDown",Sb="MSPointerMove MSPointerUp MSPointerCancel"),j(N,y,{handler:function(a){var b=this.store,c=!1,d=a.type.toLowerCase().replace("ms",""),e=Pb[d],f=Qb[a.pointerType]||a.pointerType,g=f==tb,h=s(b,a.pointerId,"pointerId");e&yb&&(0===a.button||g)?0>h&&(b.push(a),h=b.length-1):e&(Ab|Bb)&&(c=!0),0>h||(b[h]=a,this.callback(this.manager,e,{pointers:b,changedPointers:[a],pointerType:f,srcEvent:a}),c&&b.splice(h,1))}});var Tb={touchstart:yb,touchmove:zb,touchend:Ab,touchcancel:Bb},Ub="touchstart",Vb="touchstart touchmove touchend touchcancel";j(O,y,{handler:function(a){var b=Tb[a.type];if(b===yb&&(this.started=!0),this.started){var c=P.call(this,a,b);b&(Ab|Bb)&&c[0].length-c[1].length===0&&(this.started=!1),this.callback(this.manager,b,{pointers:c[0],changedPointers:c[1],pointerType:tb,srcEvent:a})}}});var Wb={touchstart:yb,touchmove:zb,touchend:Ab,touchcancel:Bb},Xb="touchstart touchmove touchend touchcancel";j(Q,y,{handler:function(a){var b=Wb[a.type],c=R.call(this,a,b);c&&this.callback(this.manager,b,{pointers:c[0],changedPointers:c[1],pointerType:tb,srcEvent:a})}}),j(S,y,{handler:function(a,b,c){var d=c.pointerType==tb,e=c.pointerType==vb;if(d)this.mouse.allow=!1;else if(e&&!this.mouse.allow)return;b&(Ab|Bb)&&(this.mouse.allow=!0),this.callback(a,b,c)},destroy:function(){this.touch.destroy(),this.mouse.destroy()}});var Yb=v(jb.style,"touchAction"),Zb=Yb!==d,$b="compute",_b="auto",ac="manipulation",bc="none",cc="pan-x",dc="pan-y";T.prototype={set:function(a){a==$b&&(a=this.compute()),Zb&&(this.manager.element.style[Yb]=a),this.actions=a.toLowerCase().trim()},update:function(){this.set(this.manager.options.touchAction)},compute:function(){var a=[];return g(this.manager.recognizers,function(b){l(b.options.enable,[b])&&(a=a.concat(b.getTouchAction()))}),U(a.join(" "))},preventDefaults:function(a){if(!Zb){var b=a.srcEvent,c=a.offsetDirection;if(this.manager.session.prevented)return void b.preventDefault();var d=this.actions,e=q(d,bc),f=q(d,dc),g=q(d,cc);return e||f&&c&Hb||g&&c&Ib?this.preventSrc(b):void 0}},preventSrc:function(a){this.manager.session.prevented=!0,a.preventDefault()}};var ec=1,fc=2,gc=4,hc=8,ic=hc,jc=16,kc=32;V.prototype={defaults:{},set:function(a){return h(this.options,a),this.manager&&this.manager.touchAction.update(),this},recognizeWith:function(a){if(f(a,"recognizeWith",this))return this;var b=this.simultaneous;return a=Y(a,this),b[a.id]||(b[a.id]=a,a.recognizeWith(this)),this},dropRecognizeWith:function(a){return f(a,"dropRecognizeWith",this)?this:(a=Y(a,this),delete this.simultaneous[a.id],this)},requireFailure:function(a){if(f(a,"requireFailure",this))return this;var b=this.requireFail;return a=Y(a,this),-1===s(b,a)&&(b.push(a),a.requireFailure(this)),this},dropRequireFailure:function(a){if(f(a,"dropRequireFailure",this))return this;a=Y(a,this);var b=s(this.requireFail,a);return b>-1&&this.requireFail.splice(b,1),this},hasRequireFailures:function(){return this.requireFail.length>0},canRecognizeWith:function(a){return!!this.simultaneous[a.id]},emit:function(a){function b(b){c.manager.emit(c.options.event+(b?W(d):""),a)}var c=this,d=this.state;hc>d&&b(!0),b(),d>=hc&&b(!0)},tryEmit:function(a){return this.canEmit()?this.emit(a):void(this.state=kc)},canEmit:function(){for(var a=0;a<this.requireFail.length;){if(!(this.requireFail[a].state&(kc|ec)))return!1;a++}return!0},recognize:function(a){var b=h({},a);return l(this.options.enable,[this,b])?(this.state&(ic|jc|kc)&&(this.state=ec),this.state=this.process(b),void(this.state&(fc|gc|hc|jc)&&this.tryEmit(b))):(this.reset(),void(this.state=kc))},process:function(){},getTouchAction:function(){},reset:function(){}},j(Z,V,{defaults:{pointers:1},attrTest:function(a){var b=this.options.pointers;return 0===b||a.pointers.length===b},process:function(a){var b=this.state,c=a.eventType,d=b&(fc|gc),e=this.attrTest(a);return d&&(c&Bb||!e)?b|jc:d||e?c&Ab?b|hc:b&fc?b|gc:fc:kc}}),j($,Z,{defaults:{event:"pan",threshold:10,pointers:1,direction:Jb},getTouchAction:function(){var a=this.options.direction,b=[];return a&Hb&&b.push(dc),a&Ib&&b.push(cc),b},directionTest:function(a){var b=this.options,c=!0,d=a.distance,e=a.direction,f=a.deltaX,g=a.deltaY;return e&b.direction||(b.direction&Hb?(e=0===f?Cb:0>f?Db:Eb,c=f!=this.pX,d=Math.abs(a.deltaX)):(e=0===g?Cb:0>g?Fb:Gb,c=g!=this.pY,d=Math.abs(a.deltaY))),a.direction=e,c&&d>b.threshold&&e&b.direction},attrTest:function(a){return Z.prototype.attrTest.call(this,a)&&(this.state&fc||!(this.state&fc)&&this.directionTest(a))},emit:function(a){this.pX=a.deltaX,this.pY=a.deltaY;var b=X(a.direction);b&&this.manager.emit(this.options.event+b,a),this._super.emit.call(this,a)}}),j(_,Z,{defaults:{event:"pinch",threshold:0,pointers:2},getTouchAction:function(){return[bc]},attrTest:function(a){return this._super.attrTest.call(this,a)&&(Math.abs(a.scale-1)>this.options.threshold||this.state&fc)},emit:function(a){if(this._super.emit.call(this,a),1!==a.scale){var b=a.scale<1?"in":"out";this.manager.emit(this.options.event+b,a)}}}),j(ab,V,{defaults:{event:"press",pointers:1,time:500,threshold:5},getTouchAction:function(){return[_b]},process:function(a){var b=this.options,c=a.pointers.length===b.pointers,d=a.distance<b.threshold,f=a.deltaTime>b.time;if(this._input=a,!d||!c||a.eventType&(Ab|Bb)&&!f)this.reset();else if(a.eventType&yb)this.reset(),this._timer=e(function(){this.state=ic,this.tryEmit()},b.time,this);else if(a.eventType&Ab)return ic;return kc},reset:function(){clearTimeout(this._timer)},emit:function(a){this.state===ic&&(a&&a.eventType&Ab?this.manager.emit(this.options.event+"up",a):(this._input.timeStamp=nb(),this.manager.emit(this.options.event,this._input)))}}),j(bb,Z,{defaults:{event:"rotate",threshold:0,pointers:2},getTouchAction:function(){return[bc]},attrTest:function(a){return this._super.attrTest.call(this,a)&&(Math.abs(a.rotation)>this.options.threshold||this.state&fc)}}),j(cb,Z,{defaults:{event:"swipe",threshold:10,velocity:.65,direction:Hb|Ib,pointers:1},getTouchAction:function(){return $.prototype.getTouchAction.call(this)},attrTest:function(a){var b,c=this.options.direction;return c&(Hb|Ib)?b=a.velocity:c&Hb?b=a.velocityX:c&Ib&&(b=a.velocityY),this._super.attrTest.call(this,a)&&c&a.direction&&a.distance>this.options.threshold&&mb(b)>this.options.velocity&&a.eventType&Ab},emit:function(a){var b=X(a.direction);b&&this.manager.emit(this.options.event+b,a),this.manager.emit(this.options.event,a)}}),j(db,V,{defaults:{event:"tap",pointers:1,taps:1,interval:300,time:250,threshold:2,posThreshold:10},getTouchAction:function(){return[ac]},process:function(a){var b=this.options,c=a.pointers.length===b.pointers,d=a.distance<b.threshold,f=a.deltaTime<b.time;if(this.reset(),a.eventType&yb&&0===this.count)return this.failTimeout();if(d&&f&&c){if(a.eventType!=Ab)return this.failTimeout();var g=this.pTime?a.timeStamp-this.pTime<b.interval:!0,h=!this.pCenter||I(this.pCenter,a.center)<b.posThreshold;this.pTime=a.timeStamp,this.pCenter=a.center,h&&g?this.count+=1:this.count=1,this._input=a;var i=this.count%b.taps;if(0===i)return this.hasRequireFailures()?(this._timer=e(function(){this.state=ic,this.tryEmit()},b.interval,this),fc):ic}return kc},failTimeout:function(){return this._timer=e(function(){this.state=kc},this.options.interval,this),kc},reset:function(){clearTimeout(this._timer)},emit:function(){this.state==ic&&(this._input.tapCount=this.count,this.manager.emit(this.options.event,this._input))}}),eb.VERSION="2.0.4",eb.defaults={domEvents:!1,touchAction:$b,enable:!0,inputTarget:null,inputClass:null,preset:[[bb,{enable:!1}],[_,{enable:!1},["rotate"]],[cb,{direction:Hb}],[$,{direction:Hb},["swipe"]],[db],[db,{event:"doubletap",taps:2},["tap"]],[ab]],cssProps:{userSelect:"none",touchSelect:"none",touchCallout:"none",contentZooming:"none",userDrag:"none",tapHighlightColor:"rgba(0,0,0,0)"}};var lc=1,mc=2;fb.prototype={set:function(a){return h(this.options,a),a.touchAction&&this.touchAction.update(),a.inputTarget&&(this.input.destroy(),this.input.target=a.inputTarget,this.input.init()),this},stop:function(a){this.session.stopped=a?mc:lc},recognize:function(a){var b=this.session;if(!b.stopped){this.touchAction.preventDefaults(a);var c,d=this.recognizers,e=b.curRecognizer;(!e||e&&e.state&ic)&&(e=b.curRecognizer=null);for(var f=0;f<d.length;)c=d[f],b.stopped===mc||e&&c!=e&&!c.canRecognizeWith(e)?c.reset():c.recognize(a),!e&&c.state&(fc|gc|hc)&&(e=b.curRecognizer=c),f++}},get:function(a){if(a instanceof V)return a;for(var b=this.recognizers,c=0;c<b.length;c++)if(b[c].options.event==a)return b[c];return null},add:function(a){if(f(a,"add",this))return this;var b=this.get(a.options.event);return b&&this.remove(b),this.recognizers.push(a),a.manager=this,this.touchAction.update(),a},remove:function(a){if(f(a,"remove",this))return this;var b=this.recognizers;return a=this.get(a),b.splice(s(b,a),1),this.touchAction.update(),this},on:function(a,b){var c=this.handlers;return g(r(a),function(a){c[a]=c[a]||[],c[a].push(b)}),this},off:function(a,b){var c=this.handlers;return g(r(a),function(a){b?c[a].splice(s(c[a],b),1):delete c[a]}),this},emit:function(a,b){this.options.domEvents&&hb(a,b);var c=this.handlers[a]&&this.handlers[a].slice();if(c&&c.length){b.type=a,b.preventDefault=function(){b.srcEvent.preventDefault()};for(var d=0;d<c.length;)c[d](b),d++}},destroy:function(){this.element&&gb(this,!1),this.handlers={},this.session={},this.input.destroy(),this.element=null}},h(eb,{INPUT_START:yb,INPUT_MOVE:zb,INPUT_END:Ab,INPUT_CANCEL:Bb,STATE_POSSIBLE:ec,STATE_BEGAN:fc,STATE_CHANGED:gc,STATE_ENDED:hc,STATE_RECOGNIZED:ic,STATE_CANCELLED:jc,STATE_FAILED:kc,DIRECTION_NONE:Cb,DIRECTION_LEFT:Db,DIRECTION_RIGHT:Eb,DIRECTION_UP:Fb,DIRECTION_DOWN:Gb,DIRECTION_HORIZONTAL:Hb,DIRECTION_VERTICAL:Ib,DIRECTION_ALL:Jb,Manager:fb,Input:y,TouchAction:T,TouchInput:Q,MouseInput:M,PointerEventInput:N,TouchMouseInput:S,SingleTouchInput:O,Recognizer:V,AttrRecognizer:Z,Tap:db,Pan:$,Swipe:cb,Pinch:_,Rotate:bb,Press:ab,on:n,off:o,each:g,merge:i,extend:h,inherit:j,bindFn:k,prefixed:v}),typeof define==kb&&define.amd?define(function(){return eb}):"undefined"!=typeof module&&module.exports?module.exports=eb:a[c]=eb}(window,document,"Hammer");
//# sourceMappingURL=hammer.min.map
function emulator_NavigationBar(object, screen) {
	$ui_CoreComponent.call(this, object, screen);
	$ui.addClass(object.dom,'navigation');
	
	// Set our brand color
	object.dom.style.borderRightColor = $ui.getThemeColor();
	object.dom.style.borderBottomColor = $ui.getThemeColor();
	
	// Add our clock
	object.dom.clock = document.createElement('div');
	$ui.addClass(object.dom.clock,'clock');
	object.dom.clock.style.color = $ui.getThemeColor();
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
	object.dom.dot.style.backgroundColor = $ui.getThemeColor();
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
