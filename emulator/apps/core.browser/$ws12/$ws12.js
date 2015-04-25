/* $ws12 VERSION: 1.0.0.2961*/

/**
 * $ui provides an extendible out of the box UI framework which provides a pre-defined user experience.
 * The main object that is used for creating this framework is the <b>$ui</b> object.
 * @namespace $ui
 * @property {$ui.CoreScreen[]} screens - The screen stack of currently loaded screens
 * @property {UIEvent} oninteraction - Assign this property to a callback function which you desire to handle any interaction logging from UI controls.  This is intended to provide a single point of filtering
 * of user interactions to be used with an analytics engine
 */
var $ui = {
	// Protected variables which should not be directly accessed from outside the toolkit
	_protected: {
		PROPERTY_WARNING: 'WARNING: Property "[prop]" cannot be dynamically updated',
		screens : [],  // Contains all of the current screens on the stack;
		definitions: [], // Contains all of the component definitions
		extensions: [], // Contains all of the extension functions to be called
		inScreenTransition: false,
		theme: {}, // This contains our core theme information
	},
	
	/**
	 * Standard Sizing used in the toolkit
	 * @namespace Size
	 * @readonly
	 * @memberof $ui
	 */
	Size: {
		/** Largest possible size */
		HUGE: 'huge',
		/** Larger than normal size */
		LARGE: 'large',
		/** Normal default size */
		NORMAL: 'normal',
		/** Smaller than normal size */
		SMALL: 'small',
		/** Smallest possible size */
		TINY: 'tiny'
	},
	
	/**
	 * Type of extension to be used for extending the <b>$ui</b> framework when using a {@link UIExtension}
	 * @namespace UIExtensionType
	 * @readonly
	 * @memberof $ui
	 */
	UIExtensionType: {
		/** Extension is a control */
		CONTROL: 0,
		/** Extension is a new type of screen */
		SCREEN: 1,
		/** Extension is a new type of list item */
		LISTITEM: 2
	},
	
	/** 
	 * This function will initialize the toolkit and create the first screen provided by the screen parameter.
	 * @param {$ui.CoreScreen} screen - Initial screen to open
	 * @param {$ui.Theme} theme - Theme to use for the toolkit
	 */
	init: function(screen, theme) {	
		// Apply any theme settings
		if (theme) {
			this.theme = theme;
		}
		// before push the initial page, add _blockAllTapEvent function to body
		document.body._blockAllTapEvent = function(e) {
			e.preventDefault();
			e.stopPropagation();
		}
		document.body._blockAllTapEvent = document.body._blockAllTapEvent.bind(document.body);
		// Handle fast clicks in mobile browsers
		FastClick.attach(document.body);
		// Run all our registered extensions
		for (var i = 0; i < this._protected.extensions.length; i++) {
			this._protected.extensions[i](); // Call the extension
		}
		// Push the first screen
		this.push(screen);
		// Handle window resize
		window.addEventListener('resize', function() {
			// Fire any screen resize events needed
			var i, 
				screen;
			for (i = 0; i < $ui.screens.length; i++) {
				screen = $ui.screens[i];
				// Run internal resize
				if (screen._onresize) {
					screen._onresize();
				}
				// Fire the screen's public event
				if (screen.onresize) {
					screen.onresize();
				}
			}
		}, false);
	},
	
	/** 
	 * You are able to register your $ui extensions by calling the extend function and providing it a callback function to fire when $ui is ready to
	 * load its extensions.  This function should be called before you call the $ui.init() function.  Within the callback function you will call the $ui.addExtension() functions
	 * to load your custom extensions
	 * @param {function} callback - Function to fire when $ui is ready for its extensions to be loaded
	 */
	extend: function(callback) {
		if (callback) {
			this._protected.extensions.push(callback);
		}
	},
			
	/** 
	 * You are able to extend the UI framework by registering your own control extensions. You must first register your extension with the framework by calling this function.
	 * @param {$ui.UIExtension} extension - Extension object to be added to the framework
	 */
	addExtension: function(extension) {
		if (extension.type == undefined) extension.type = $ui.UIExtensionType.CONTROL;
		if (extension.definition == undefined) extension.definition = {};
		$ui[extension.name] = extension.definition;
		extension.component = $ui[extension.name];
		if (extension.type == undefined) extension.type = $ui.UIExtensionType.CONTROL;
		this._protected.definitions.push(extension);
	},	
	
	
	// Internal function to raises an event for a user interaction
	_raiseInteractionEvent: function(event) {
		if (this.oninteraction == undefined) return;
		if (event == undefined || event == null) return;
		if (event.screenId == undefined || event.screenId == null) return;
		if (event.controlId == undefined || event.controlId == null) return;
		if (event.interaction == undefined || event.interaction == null) return;
		var interactionHandler = this.oninteraction;
		setTimeout(function() {
			interactionHandler(event);
		},0);
	},
	
	// Create any control that is passed in and return the DOM
	createControl: function(control, screen) {
		if (control == undefined) {
			throw '$ui.createControl: "control" is not defined';
		} 
		if (screen == undefined) {
			throw '$ui.createControl: "screen" is not defined';
		}
		// Find and create the component
		var i,
			extension,
			controlDom = undefined;
		for (i = 0; i < this._protected.definitions.length; i++) {
			extension = this._protected.definitions[i];
			if (extension.type != $ui.UIExtensionType.CONTROL) continue;
			if (extension.component == control.component) {
				controlDom = new extension.constructor(control,screen);
				break;
			}
		}
		return controlDom;
	},

	// Check to see if this is a mobile device
	isMobileDevice: function() {
		var check = false;
		(function(a,b){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|android|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true})(navigator.userAgent||navigator.vendor||window.opera);
		return check;
	},

	_blockAllTapEvent: function(value) {
		if(value == undefined) return;
		if(value === true) {
			document.body.addEventListener('click', document.body._blockAllTapEvent, true);
			document.body.addEventListener('touchstart', document.body._blockAllTapEvent, true);
		} else if (value === false) {
			document.body.removeEventListener('click', document.body._blockAllTapEvent, true);
			document.body.removeEventListener('touchstart', document.body._blockAllTapEvent, true);
		}
	},
	
	/** 
	 * This function will push a new screen on the stack and pass the optional data provided as a parameter to that screen's onshow() event.
	 * @param {$ui.CoreScreen} screen - Screen to open and push onto the top of the screen stack
	 * @param {object} data - Data to pass to the new screen that is opened
	 * @param {number} [numScreensToClose] - Optional number of screens to close below the new screen pushed onto the stack
	 */
	push: function(screen, data, numScreensToClose) {
		if ($ui._protected.inScreenTransition === true) {
			setTimeout(function() {
				$ui.push(screen, data);
			}, 100);
		} else {
			screen = new screen();
			// Find and create the screen
			var dom,
				i,
				extension;
			for (i = 0; i < this._protected.definitions.length; i++) {
				extension = this._protected.definitions[i];
				if (extension.type != $ui.UIExtensionType.SCREEN) continue;
				if (extension.component == screen.component) {
					dom = new extension.constructor(screen,data);
					break;
				}
			}
			if (dom == undefined) return;
			$ui._blockAllTapEvent(true);
			$ui._protected.inScreenTransition = true;
			$ui.screens.push(screen);
			dom.style['z-index'] = $ui.screens.length+1;
			document.body.appendChild(dom);
			
			// Initialize our new screen
			if (screen.animated == true) {
				screen._numScreensToClose = numScreensToClose;
				// Raise our onshow event when the animation ends
				screen.dom.pushAnimationEnd = function(e) {
					if (e.target == this.model.dom){
						this.removeEventListener('webkitAnimationEnd', this.pushAnimationEnd); // Webkit
						// Close any underlying screens if necessary
						$ui._popBelowTop(this.model._numScreensToClose);
						this.model.initialize();
					}
				}
				screen.dom.pushAnimationEnd = screen.dom.pushAnimationEnd.bind(screen.dom);
				screen.dom.addEventListener('webkitAnimationEnd', screen.dom.pushAnimationEnd, false); // Webkit
			} else {
				// Close any underlying screens if necessary
				$ui._popBelowTop(numScreensToClose);
				screen.initialize();
			}
		}
	},
	
	// This functions will pop of screens below the top screen.  The number of screens to pop off is supplied by the parameter "number"
	_popBelowTop: function(number) {
		if (number != undefined && number > 0) {
			// Make sure there is a screen beneath this new one
			if ($ui.screens.length-2 > -1) {
				var i,
					count = 0,
					screen;
				// Loop until we have no more screens or if the number of screens removed matches the number provided
				for (i = $ui.screens.length - 2; (i > -1) && (count < number); i--) {
					screen = $ui.screens[i];
					if (screen.onbeforepop) {
						screen.onbeforepop();
					}
					$ui._removeScreen(screen);
					count++;
				}
			}
		}
	},
	
	/** 
	 * To close the top-most screen on the stack you can call the pop() function.
	 */
	pop: function() {
		// Return if the screen is in transition.
		if ($ui._protected.inScreenTransition === true) {
			setTimeout(function() {
				$ui.pop();
			}, 100);
		} else {
			$ui._blockAllTapEvent(true);
			$ui._protected.inScreenTransition = true;
			// Remove the top most screen
			var screen = $ui.screens[$ui.screens.length-1];
			if (screen.animated == true) {
				screen.dom.addEventListener('webkitAnimationEnd', function(e) {
					$ui._removeScreen(this.model);
				}, false);
				// Call this so that the screen has a chance to set its animation
				if (screen.onbeforepop) {
					screen.onbeforepop();
				}
			} else {
				if (screen.onbeforepop) {
					screen.onbeforepop();
				}
				$ui._removeScreen(screen);
			} 
		}
	},

	// Remove a screen from the stack
	_removeScreen: function(screen) {
		screen.dom.style.display = 'none';
		document.body.removeChild(screen.dom);
		screen.destroy();
		// Handle finalization
		$ui._protected.inScreenTransition = false;
		$ui._blockAllTapEvent(false);
		var index = $ui.screens.indexOf(screen);
		$ui.screens.splice(index, 1);
	},

	// Determines if an element has the class specified in it's class name
	hasClass: function(element, name){
		var re = new RegExp('(^| )' + name + '( |$)');
		return re.test(element.className);
	},
	
	// Adds a class name to an element
	addClass: function(element, name){
		if (!$ui.hasClass(element, name)){
			if (element.className) {
				element.className += ' ' + name;
			} else {
				element.className = name;
			}
		}
	},
	
	// Removes a class from an element
	removeClass: function(element, name){
		var re = new RegExp('(^| )' + name + '( |$)');
		element.className = element.className.replace(re, ' ').replace(/^\s+|\s+$/g, "");
	},
	
	/**
	* Convert a HEX color value to an RGB object. This will return an object with properties R, G and B
	* @function hexToRgb
	* @memberof $ui
	* @param {string} value - The HEX string value to convert to RGB
	*/
	hexToRgb: function(value) {
		if (value == undefined || value == null) return {};
		function cutHex(h) {
			return (h.charAt(0)=="#") ? h.substring(1,7):h
		}
		// convert the color
		var R = parseInt((cutHex($ui.theme.color)).substring(0,2),16),
			G = parseInt((cutHex($ui.theme.color)).substring(2,4),16),
			B = parseInt((cutHex($ui.theme.color)).substring(4,6),16);
		return { R: R, G: G, B: B};
	},
	
	// guid(uuid) Generator
	guid: function() {
	   function guidS4() {
		   return (((1 + Math.random()) * 0x10000)|0).toString(16).substring(1);
		}
	   return (guidS4() + guidS4() + "-" + guidS4() + "-" + guidS4() + "-" + guidS4() + "-" + guidS4() + guidS4() + guidS4());
	}
}

// Screen property handling
Object.defineProperty($ui, 'screens', {
	get: function() {return this._protected.screens;},
	set: function() {
		console.log(this._protected.PROPERTY_WARNING.replace('[prop]','screens'));
	},
	configurable: false}
);

// Theme property
Object.defineProperty($ui, 'theme', {
	get: function() {return this._protected.theme;},
	set: function(value) {
		this._protected.theme = value;
		var i,
			screen;
		for (i = 0; i < this.screens.length; i++) {
			screen = this.screens[i];
			screen._fireThemeChange();
		}
	},
	configurable: false}
);

// This function is called as part of the extension registration
function $ui_RegisterRootExtensions() {
	// Register our extensions
	$ui.addExtension(new UIExtension('List', $ui_List));
	def = {
			/**
			 * Color of {@link $ui.Spinner} control
			 * @namespace
			 * @readonly
			 * @memberof $ui.Spinner
			 */
			SpinnerColor: {
				/** Light spinner Color */
				LIGHT: 'light',
				/** Dark spinner color */
				DARK: 'dark'
			}
		};
	$ui.addExtension(new UIExtension('Spinner', $ui_Spinner, undefined,def));
	def = {
		  /**
		 * Type of error related to retrieving information via a {@link $ui.DataProvider} 
		 * @namespace
		 * @readonly
		 * @memberof $ui.DataProvider
		 */
		ProviderError: {
			/** Head unit does not have a network connection */
			OFFLINE: -1,
			/** Data returned was invalid JSON */
			INVALID_JSON: -2,
			/** Network timed out */
			TIMEOUT: -3,
			/** Access to url denied */
			ACCESS_DENIED: -4,
			/** Invalid URL location */
			NOT_FOUND: -5
		}
	};
	$ui.addExtension(new UIExtension('DataProvider', $ui_DataProvider, undefined, def));
}

Function.prototype.bind = function(object){ 
  var fn = this; 
  return function(){ 
    return fn.apply(object, arguments); 
  }; 
}; 

// Register our root extensions
$ui.extend($ui_RegisterRootExtensions);

/**
 * General event that fires without any parameters
 * @callback GenericEvent
 */

/**
 * The {@link $ui} <b>oninteraction</b> fires when a user has interacted with the interface
 * @callback UIEvent
 * @param {$ui.InteractionEvent} event - Interaction event which was triggered by the UI
 */
/**
 * @preserve FastClick: polyfill to remove click delays on browsers with touch UIs.
 *
 * @version 1.0.0
 * @codingstandard ftlabs-jsv2
 * @copyright The Financial Times Limited [All Rights Reserved]
 * @license MIT License (see LICENSE.txt)
 */

/*jslint browser:true, node:true*/
/*global define, Event, Node*/


/**
 * Instantiate fast-clicking listeners on the specificed layer.
 *
 * @constructor
 * @param {Element} layer The layer to listen on
 * @param {Object} options The options to override the defaults
 */
function FastClick(layer, options) {
	'use strict';
	var oldOnClick;

	options = options || {};

	/**
	 * Whether a click is currently being tracked.
	 *
	 * @type boolean
	 */
	this.trackingClick = false;


	/**
	 * Timestamp for when click tracking started.
	 *
	 * @type number
	 */
	this.trackingClickStart = 0;


	/**
	 * The element being tracked for a click.
	 *
	 * @type EventTarget
	 */
	this.targetElement = null;


	/**
	 * X-coordinate of touch start event.
	 *
	 * @type number
	 */
	this.touchStartX = 0;


	/**
	 * Y-coordinate of touch start event.
	 *
	 * @type number
	 */
	this.touchStartY = 0;


	/**
	 * ID of the last touch, retrieved from Touch.identifier.
	 *
	 * @type number
	 */
	this.lastTouchIdentifier = 0;


	/**
	 * Touchmove boundary, beyond which a click will be cancelled.
	 *
	 * @type number
	 */
	this.touchBoundary = options.touchBoundary || 10;


	/**
	 * The FastClick layer.
	 *
	 * @type Element
	 */
	this.layer = layer;
	
	/**
	 * The minimum time between tap(touchstart and touchend) events
	 * 
	 * @type number
	 */
	this.tapDelay = options.tapDelay || 200;

	if (FastClick.notNeeded(layer)) {
		return;
	}

	// Some old versions of Android don't have Function.prototype.bind
	function bind(method, context) {
		return function() { return method.apply(context, arguments); };
	}

	// Set up event handlers as required
	if (deviceIsAndroid) {
		layer.addEventListener('mouseover', bind(this.onMouse, this), true);
		layer.addEventListener('mousedown', bind(this.onMouse, this), true);
		layer.addEventListener('mouseup', bind(this.onMouse, this), true);
	}

	layer.addEventListener('click', bind(this.onClick, this), true);
	layer.addEventListener('touchstart', bind(this.onTouchStart, this), false);
	layer.addEventListener('touchmove', bind(this.onTouchMove, this), false);
	layer.addEventListener('touchend', bind(this.onTouchEnd, this), false);
	layer.addEventListener('touchcancel', bind(this.onTouchCancel, this), false);

	// Hack is required for browsers that don't support Event#stopImmediatePropagation (e.g. Android 2)
	// which is how FastClick normally stops click events bubbling to callbacks registered on the FastClick
	// layer when they are cancelled.
	if (!Event.prototype.stopImmediatePropagation) {
		layer.removeEventListener = function(type, callback, capture) {
			var rmv = Node.prototype.removeEventListener;
			if (type === 'click') {
				rmv.call(layer, type, callback.hijacked || callback, capture);
			} else {
				rmv.call(layer, type, callback, capture);
			}
		};

		layer.addEventListener = function(type, callback, capture) {
			var adv = Node.prototype.addEventListener;
			if (type === 'click') {
				adv.call(layer, type, callback.hijacked || (callback.hijacked = function(event) {
					if (!event.propagationStopped) {
						callback(event);
					}
				}), capture);
			} else {
				adv.call(layer, type, callback, capture);
			}
		};
	}

	// If a handler is already declared in the element's onclick attribute, it will be fired before
	// FastClick's onClick handler. Fix this by pulling out the user-defined handler function and
	// adding it as listener.
	if (typeof layer.onclick === 'function') {

		// Android browser on at least 3.2 requires a new reference to the function in layer.onclick
		// - the old one won't work if passed to addEventListener directly.
		oldOnClick = layer.onclick;
		layer.addEventListener('click', function(event) {
			oldOnClick(event);
		}, false);
		layer.onclick = null;
	}
}


/**
 * Android requires exceptions.
 *
 * @type boolean
 */
var deviceIsAndroid = navigator.userAgent.indexOf('Android') > 0;


/**
 * iOS requires exceptions.
 *
 * @type boolean
 */
var deviceIsIOS = /iP(ad|hone|od)/.test(navigator.userAgent);


/**
 * iOS 4 requires an exception for select elements.
 *
 * @type boolean
 */
var deviceIsIOS4 = deviceIsIOS && (/OS 4_\d(_\d)?/).test(navigator.userAgent);


/**
 * iOS 6.0(+?) requires the target element to be manually derived
 *
 * @type boolean
 */
var deviceIsIOSWithBadTarget = deviceIsIOS && (/OS ([6-9]|\d{2})_\d/).test(navigator.userAgent);


/**
 * Determine whether a given element requires a native click.
 *
 * @param {EventTarget|Element} target Target DOM element
 * @returns {boolean} Returns true if the element needs a native click
 */
FastClick.prototype.needsClick = function(target) {
	'use strict';
	switch (target.nodeName.toLowerCase()) {

	// Don't send a synthetic click to disabled inputs (issue #62)
	case 'button':
	case 'select':
	case 'textarea':
		if (target.disabled) {
			return true;
		}

		break;
	case 'input':

		// File inputs need real clicks on iOS 6 due to a browser bug (issue #68)
		if ((deviceIsIOS && target.type === 'file') || target.disabled) {
			return true;
		}

		break;
	case 'label':
	case 'video':
		return true;
	}

	return (/\bneedsclick\b/).test(target.className);
};


/**
 * Determine whether a given element requires a call to focus to simulate click into element.
 *
 * @param {EventTarget|Element} target Target DOM element
 * @returns {boolean} Returns true if the element requires a call to focus to simulate native click.
 */
FastClick.prototype.needsFocus = function(target) {
	'use strict';
	switch (target.nodeName.toLowerCase()) {
	case 'textarea':
		return true;
	case 'select':
		return !deviceIsAndroid;
	case 'input':
		switch (target.type) {
		case 'button':
		case 'checkbox':
		case 'file':
		case 'image':
		case 'radio':
		case 'submit':
			return false;
		}

		// No point in attempting to focus disabled inputs
		return !target.disabled && !target.readOnly;
	default:
		return (/\bneedsfocus\b/).test(target.className);
	}
};


/**
 * Send a click event to the specified element.
 *
 * @param {EventTarget|Element} targetElement
 * @param {Event} event
 */
FastClick.prototype.sendClick = function(targetElement, event) {
	'use strict';
	var clickEvent, touch;

	// On some Android devices activeElement needs to be blurred otherwise the synthetic click will have no effect (#24)
	if (document.activeElement && document.activeElement !== targetElement) {
		document.activeElement.blur();
	}

	touch = event.changedTouches[0];

	// Synthesise a click event, with an extra attribute so it can be tracked
	clickEvent = document.createEvent('MouseEvents');
	clickEvent.initMouseEvent(this.determineEventType(targetElement), true, true, window, 1, touch.screenX, touch.screenY, touch.clientX, touch.clientY, false, false, false, false, 0, null);
	clickEvent.forwardedTouchEvent = true;
	targetElement.dispatchEvent(clickEvent);
};

FastClick.prototype.determineEventType = function(targetElement) {
	'use strict';

	//Issue #159: Android Chrome Select Box does not open with a synthetic click event
	if (deviceIsAndroid && targetElement.tagName.toLowerCase() === 'select') {
		return 'mousedown';
	}

	return 'click';
};


/**
 * @param {EventTarget|Element} targetElement
 */
FastClick.prototype.focus = function(targetElement) {
	'use strict';
	var length;

	// Issue #160: on iOS 7, some input elements (e.g. date datetime) throw a vague TypeError on setSelectionRange. These elements don't have an integer value for the selectionStart and selectionEnd properties, but unfortunately that can't be used for detection because accessing the properties also throws a TypeError. Just check the type instead. Filed as Apple bug #15122724.
	if (deviceIsIOS && targetElement.setSelectionRange && targetElement.type.indexOf('date') !== 0 && targetElement.type !== 'time') {
		length = targetElement.value.length;
		targetElement.setSelectionRange(length, length);
	} else {
		targetElement.focus();
	}
};


/**
 * Check whether the given target element is a child of a scrollable layer and if so, set a flag on it.
 *
 * @param {EventTarget|Element} targetElement
 */
FastClick.prototype.updateScrollParent = function(targetElement) {
	'use strict';
	var scrollParent, parentElement;

	scrollParent = targetElement.fastClickScrollParent;

	// Attempt to discover whether the target element is contained within a scrollable layer. Re-check if the
	// target element was moved to another parent.
	if (!scrollParent || !scrollParent.contains(targetElement)) {
		parentElement = targetElement;
		do {
			if (parentElement.scrollHeight > parentElement.offsetHeight) {
				scrollParent = parentElement;
				targetElement.fastClickScrollParent = parentElement;
				break;
			}

			parentElement = parentElement.parentElement;
		} while (parentElement);
	}

	// Always update the scroll top tracker if possible.
	if (scrollParent) {
		scrollParent.fastClickLastScrollTop = scrollParent.scrollTop;
	}
};


/**
 * @param {EventTarget} targetElement
 * @returns {Element|EventTarget}
 */
FastClick.prototype.getTargetElementFromEventTarget = function(eventTarget) {
	'use strict';

	// On some older browsers (notably Safari on iOS 4.1 - see issue #56) the event target may be a text node.
	if (eventTarget.nodeType === Node.TEXT_NODE) {
		return eventTarget.parentNode;
	}

	return eventTarget;
};


/**
 * On touch start, record the position and scroll offset.
 *
 * @param {Event} event
 * @returns {boolean}
 */
FastClick.prototype.onTouchStart = function(event) {
	'use strict';
	var targetElement, touch, selection;
	
	// Ignore multiple touches, otherwise pinch-to-zoom is prevented if both fingers are on the FastClick element (issue #111).
	if (event.targetTouches.length > 1) {
		return true;
	}

	targetElement = this.getTargetElementFromEventTarget(event.target);
	touch = event.targetTouches[0];

	
	
	if (deviceIsIOS) {

		// Only trusted events will deselect text on iOS (issue #49)
		selection = window.getSelection();
		if (selection.rangeCount && !selection.isCollapsed) {
			return true;
		}

		if (!deviceIsIOS4 && soloUI.isPhoneGap === true) {

			// Weird things happen on iOS when an alert or confirm dialog is opened from a click event callback (issue #23):
			// when the user next taps anywhere else on the page, new touchstart and touchend events are dispatched
			// with the same identifier as the touch event that previously triggered the click that triggered the alert.
			// Sadly, there is an issue on iOS 4 that causes some normal touch events to have the same identifier as an
			// immediately preceeding touch event (issue #52), so this fix is unavailable on that platform.
			if (touch.identifier === this.lastTouchIdentifier) {
				event.preventDefault();
				return false;
			}

			this.lastTouchIdentifier = touch.identifier;

			// If the target element is a child of a scrollable layer (using -webkit-overflow-scrolling: touch) and:
			// 1) the user does a fling scroll on the scrollable layer
			// 2) the user stops the fling scroll with another tap
			// then the event.target of the last 'touchend' event will be the element that was under the user's finger
			// when the fling scroll was started, causing FastClick to send a click event to that layer - unless a check
			// is made to ensure that a parent layer was not scrolled before sending a synthetic click (issue #42).
			this.updateScrollParent(targetElement);
		}
	}

	this.trackingClick = true;
	this.trackingClickStart = event.timeStamp;
	this.targetElement = targetElement;

	this.touchStartX = touch.pageX;
	this.touchStartY = touch.pageY;

	// Prevent phantom clicks on fast double-tap (issue #36)
	if ((event.timeStamp - this.lastClickTime) < this.tapDelay) {
		event.preventDefault();
	}
	
	return true;
};


/**
 * Based on a touchmove event object, check whether the touch has moved past a boundary since it started.
 *
 * @param {Event} event
 * @returns {boolean}
 */
FastClick.prototype.touchHasMoved = function(event) {
	'use strict';
	var touch = event.changedTouches[0], boundary = this.touchBoundary;

	if (Math.abs(touch.pageX - this.touchStartX) > boundary || Math.abs(touch.pageY - this.touchStartY) > boundary) {
		return true;
	}

	return false;
};


/**
 * Update the last position.
 *
 * @param {Event} event
 * @returns {boolean}
 */
FastClick.prototype.onTouchMove = function(event) {
	'use strict';
	
	if (!this.trackingClick) {
		return true;
	}

	// If the touch has moved, cancel the click tracking
	if (this.targetElement !== this.getTargetElementFromEventTarget(event.target) || this.touchHasMoved(event)) {
		this.trackingClick = false;
		this.targetElement = null;
	}
	
	
	
	return true;
};


/**
 * Attempt to find the labelled control for the given label element.
 *
 * @param {EventTarget|HTMLLabelElement} labelElement
 * @returns {Element|null}
 */
FastClick.prototype.findControl = function(labelElement) {
	'use strict';

	// Fast path for newer browsers supporting the HTML5 control attribute
	if (labelElement.control !== undefined) {
		return labelElement.control;
	}

	// All browsers under test that support touch events also support the HTML5 htmlFor attribute
	if (labelElement.htmlFor) {
		return document.getElementById(labelElement.htmlFor);
	}

	// If no for attribute exists, attempt to retrieve the first labellable descendant element
	// the list of which is defined here: http://www.w3.org/TR/html5/forms.html#category-label
	return labelElement.querySelector('button, input:not([type=hidden]), keygen, meter, output, progress, select, textarea');
};


/**
 * On touch end, determine whether to send a click event at once.
 *
 * @param {Event} event
 * @returns {boolean}
 */
FastClick.prototype.onTouchEnd = function(event) {
	'use strict';
	var forElement, trackingClickStart, targetTagName, scrollParent, touch, targetElement = this.targetElement;

	if (!this.trackingClick) {
		return true;
	}

	// Prevent phantom clicks on fast double-tap (issue #36)
	if ((event.timeStamp - this.lastClickTime) < this.tapDelay) {
		this.cancelNextClick = true;
		return true;
	}

	// Reset to prevent wrong click cancel on input (issue #156).
	this.cancelNextClick = false;

	this.lastClickTime = event.timeStamp;

	trackingClickStart = this.trackingClickStart;
	this.trackingClick = false;
	this.trackingClickStart = 0;

	
	// On some iOS devices, the targetElement supplied with the event is invalid if the layer
	// is performing a transition or scroll, and has to be re-detected manually. Note that
	// for this to function correctly, it must be called *after* the event target is checked!
	// See issue #57; also filed as rdar://13048589 .
	if (deviceIsIOSWithBadTarget) {
		touch = event.changedTouches[0];
		// In certain cases arguments of elementFromPoint can be negative, so prevent setting targetElement to null
		targetElement = document.elementFromPoint(touch.pageX - window.pageXOffset, touch.pageY - window.pageYOffset) || targetElement;
		targetElement.fastClickScrollParent = this.targetElement.fastClickScrollParent;
	}

	targetTagName = targetElement.tagName.toLowerCase();
	if (targetTagName === 'label') {
		forElement = this.findControl(targetElement);
		if (forElement) {
			this.focus(targetElement);
			if (deviceIsAndroid) {
				return false;
			}

			targetElement = forElement;
		}
	} else if (this.needsFocus(targetElement)) {

		// Case 1: If the touch started a while ago (best guess is 100ms based on tests for issue #36) then focus will be triggered anyway. Return early and unset the target element reference so that the subsequent click will be allowed through.
		// Case 2: Without this exception for input elements tapped when the document is contained in an iframe, then any inputted text won't be visible even though the value attribute is updated as the user types (issue #37).
		if ((event.timeStamp - trackingClickStart) > 100 || (deviceIsIOS && window.top !== window && targetTagName === 'input')) {
			this.targetElement = null;
			return false;
		}

		this.focus(targetElement);
		this.sendClick(targetElement, event);

		// Select elements need the event to go through on iOS 4, otherwise the selector menu won't open.
		if (!deviceIsIOS4 || targetTagName !== 'select') {
			this.targetElement = null;
			event.preventDefault();
		}

		return false;
	}

	if (deviceIsIOS && !deviceIsIOS4) {

		// Don't send a synthetic click event if the target element is contained within a parent layer that was scrolled
		// and this tap is being used to stop the scrolling (usually initiated by a fling - issue #42).
		scrollParent = targetElement.fastClickScrollParent;
		if (scrollParent && scrollParent.fastClickLastScrollTop !== scrollParent.scrollTop) {
			return true;
		}
	}
	

	// Prevent the actual click from going though - unless the target node is marked as requiring
	// real clicks or if it is in the whitelist in which case only non-programmatic clicks are permitted.
	if (!this.needsClick(targetElement)) {
		event.preventDefault();
		this.sendClick(targetElement, event);
	}

	return false;
};


/**
 * On touch cancel, stop tracking the click.
 *
 * @returns {void}
 */
FastClick.prototype.onTouchCancel = function() {
	'use strict';
	
	this.trackingClick = false;
	this.targetElement = null;
};


/**
 * Determine mouse events which should be permitted.
 *
 * @param {Event} event
 * @returns {boolean}
 */
FastClick.prototype.onMouse = function(event) {
	'use strict';

	// If a target element was never set (because a touch event was never fired) allow the event
	if (!this.targetElement) {
		return true;
	}

	if (event.forwardedTouchEvent) {
		return true;
	}

	// Programmatically generated events targeting a specific element should be permitted
	if (!event.cancelable) {
		return true;
	}

	// Derive and check the target element to see whether the mouse event needs to be permitted;
	// unless explicitly enabled, prevent non-touch click events from triggering actions,
	// to prevent ghost/doubleclicks.
	if (!this.needsClick(this.targetElement) || this.cancelNextClick) {

		// Prevent any user-added listeners declared on FastClick element from being fired.
		if (event.stopImmediatePropagation) {
			event.stopImmediatePropagation();
		} else {

			// Part of the hack for browsers that don't support Event#stopImmediatePropagation (e.g. Android 2)
			event.propagationStopped = true;
		}

		// Cancel the event
		event.stopPropagation();
		event.preventDefault();

		return false;
	}

	// If the mouse event is permitted, return true for the action to go through.
	return true;
};


/**
 * On actual clicks, determine whether this is a touch-generated click, a click action occurring
 * naturally after a delay after a touch (which needs to be cancelled to avoid duplication), or
 * an actual click which should be permitted.
 *
 * @param {Event} event
 * @returns {boolean}
 */
FastClick.prototype.onClick = function(event) {
	'use strict';
	var permitted;

	// It's possible for another FastClick-like library delivered with third-party code to fire a click event before FastClick does (issue #44). In that case, set the click-tracking flag back to false and return early. This will cause onTouchEnd to return early.
	if (this.trackingClick) {
		this.targetElement = null;
		this.trackingClick = false;
		return true;
	}

	// Very odd behaviour on iOS (issue #18): if a submit element is present inside a form and the user hits enter in the iOS simulator or clicks the Go button on the pop-up OS keyboard the a kind of 'fake' click event will be triggered with the submit-type input element as the target.
	if (event.target.type === 'submit' && event.detail === 0) {
		return true;
	}

	permitted = this.onMouse(event);

	// Only unset targetElement if the click is not permitted. This will ensure that the check for !targetElement in onMouse fails and the browser's click doesn't go through.
	if (!permitted) {
		this.targetElement = null;
	}

	// If clicks are permitted, return true for the action to go through.
	return permitted;
};


/**
 * Remove all FastClick's event listeners.
 *
 * @returns {void}
 */
FastClick.prototype.destroy = function() {
	'use strict';
	var layer = this.layer;

	if (deviceIsAndroid) {
		layer.removeEventListener('mouseover', this.onMouse, true);
		layer.removeEventListener('mousedown', this.onMouse, true);
		layer.removeEventListener('mouseup', this.onMouse, true);
	}

	layer.removeEventListener('click', this.onClick, true);
	layer.removeEventListener('touchstart', this.onTouchStart, false);
	layer.removeEventListener('touchmove', this.onTouchMove, false);
	layer.removeEventListener('touchend', this.onTouchEnd, false);
	layer.removeEventListener('touchcancel', this.onTouchCancel, false);
};


/**
 * Check whether FastClick is needed.
 *
 * @param {Element} layer The layer to listen on
 */
FastClick.notNeeded = function(layer) {
	'use strict';
	var metaViewport;
	var chromeVersion;

	// Devices that don't support touch don't need FastClick
	if (typeof window.ontouchstart === 'undefined') {
		return true;
	}

	// Chrome version - zero for other browsers
	chromeVersion = +(/Chrome\/([0-9]+)/.exec(navigator.userAgent) || [,0])[1];

	if (chromeVersion) {

		if (deviceIsAndroid) {
			metaViewport = document.querySelector('meta[name=viewport]');

			if (metaViewport) {
				// Chrome on Android with user-scalable="no" doesn't need FastClick (issue #89)
				if (metaViewport.content.indexOf('user-scalable=no') !== -1) {
					return true;
				}
				// Chrome 32 and above with width=device-width or less don't need FastClick
				if (chromeVersion > 31 && window.innerWidth <= window.screen.width) {
					return true;
				}
			}

		// Chrome desktop doesn't need FastClick (issue #15)
		} else {
			return true;
		}
	}

	// IE10 with -ms-touch-action: none, which disables double-tap-to-zoom (issue #97)
	if (layer.style.msTouchAction === 'none') {
		return true;
	}

	return false;
};


/**
 * Factory method for creating a FastClick object
 *
 * @param {Element} layer The layer to listen on
 * @param {Object} options The options to override the defaults
 */
FastClick.attach = function(layer, options) {
	'use strict';
	return new FastClick(layer, options);
};


if (typeof define !== 'undefined' && define.amd) {

	// AMD. Register as an anonymous module.
	define(function() {
		'use strict';
		return FastClick;
	});
} else if (typeof module !== 'undefined' && module.exports) {
	module.exports = FastClick.attach;
	module.exports.FastClick = FastClick;
} else {
	window.FastClick = FastClick;
}
/**
 * Every component in the UI follows the same general patterns. This is to keep consistency and make coding easier.
 * <br><br><b>NOTE: The core component is an abstract base class and cannot be created as an instance on its own</b>
 * @namespace
 * @name CoreComponent
 * @memberof $ui
 * @property {namespace} component - The <b>mandatory</b> component property defines what type of component is being defined. This property always starts with a <b>$ui.</b> defining the component to be used for generating the UI.
 * @property {string} [id] - The id property is used to uniquely define the control in the screen for which it belongs. <br><br>Providing an id for your control is very convenient because you can easily access your control through your javascript coding. Each id is added as a direct handle on the screen object for access.
 * @property {boolean} [animated=false] - Set this value to <b>true</b> for the control to have animation.  NOTE: Each derivative control is responsible for their animation styling. Setting this property to true will add the ".animated" CSS class to the root element of the control.  Feel free to define your own CSS for the ".animated" property
 * @property {boolean} [visible=true] - The visible property specifies the visibility of the control. 
 * @property {boolean} [enabled=true] - The enabled property specifies the initial enabled state of the control.  <i>NOTE: Not all controls will render a disabled state. If you wish to render a disabled state simply override the ".disabled" CSS for the root of your control</i>
 * @property {$ui.CoreScreen} screen - This <b>readonly</b> property allows for you to reference the screen from the control. This will be the screen in which the control is embedded
 * @property {$ui.DataProviderLink} [provider] - This property allows you to bind the control to a [data provider]{@link $ui.DataProvider} in the application. 
 * @property {object[]} attachedObjects - This property specifies an array of objects that can be attached to the control. These could be objects such as data providers and usually entail a component that does not provide a user interface.
 * @property {boolean} [marginTop=false] - A boolean property which when set to true will place a standard margin on the top of the control. 
 * @property {boolean} [marginBottom=false] - A boolean property which when set to true will place a standard margin on the bottom of the control.
 * @property {boolean} [marginLeft=false] - A boolean property which when set to true will place a standard margin on the left of the control
 * @property {boolean} [marginRight=false] - A boolean property which when set to true will place a standard margin on the right of the control.
 */
function $ui_CoreComponent(object, screen) {
	if (object) {
		this.object = object;
		// The protected object is where we store our dynamic object variables
		object._protected = {
			model: object
		};
		
		// Create our base container for the control 
		object.dom = document.createElement('div');
		object.dom.model = object;
		$ui.addClass(object.dom, 'ui-core-component');
		
		// Assign our control name for automation & analytics
		if (object.id) {
			object.dom.setAttribute('data-id',object.id);
		}
		
		// Component Property
		object._protected.component = object.component;
		Object.defineProperty(object, 'component', {
			get: function() {return this._protected.component;},
			set: function() {
				console.log($ui._protected.PROPERTY_WARNING.replace('[prop]','component'));
			},
			configurable: false}
		);
		
		// Screen Property
		if (screen != undefined) {
			object.screen = screen;
			screen.children.push(object);
			if (object.id) {
				screen[object.id] = object;
			}
		}
		object._protected.screen = object.screen;
		Object.defineProperty(object, 'screen', {
			get: function() {return this._protected.screen;},
			set: function() {
				console.log($ui._protected.PROPERTY_WARNING.replace('[prop]','screen'));
			},
			configurable: false}
		);
		
		// Apply our current theme style
		if ($ui.theme.rootClass) {
			$ui.addClass(object.dom,$ui.theme.rootClass);
		}
		
		// id property
		object._protected.id = object.id;
		Object.defineProperty(object, 'id', {
			get: function() {return this._protected.id;},
			set: function() {
				console.log($ui._protected.PROPERTY_WARNING.replace('[prop]','id'));
			},
			configurable: false}
		);
		
		// Enabled Property
		if (object.enabled != false) {
			object.enabled = true;
		} else {
			$ui.addClass(object.dom, 'disabled');
		}
		object._protected.enabled = object.enabled;
		Object.defineProperty(object, 'enabled', {
			get: function() {return this._protected.enabled;},
			set: function(value) {
				if (value == this._protected.enabled) return;
				if (this._protected.enabled && (value == false)) {
					this._protected.enabled = false;
					$ui.addClass(this.dom, 'disabled');
				} else if ((this._protected.enabled == false) && (value == true)) {
					this._protected.enabled = true;
					$ui.removeClass(this.dom, 'disabled');
				}
				// Call a child class' protected function if they need
				// to do special handling for enabling
				if (this._setEnabled) {
					this._setEnabled(value);
				}
			},
			configurable: false}
		);		

		
		// Animated property
		if (object.animated == true) {
			$ui.addClass(object.dom, 'animated');
		} else {
			object.animated = false;
		}
		object._protected.animated = object.animated;
		Object.defineProperty(object, 'animated', {
			get: function() {return this._protected.animated;},
			set: function() {
				console.log($ui._protected.PROPERTY_WARNING.replace('[prop]','animated'));
			},
			configurable: false}
		);
		
		// Set our initial visibility
		if ((object.visible != undefined) && (object.visible == false)) {
			object.dom.style.display = 'none';
		} else {
			object.visible = true;
		}
		object._protected.visible = object.visible;
		// Set our modification rules for 'visible'
		Object.defineProperty(object, 'visible', {
			get: function() {return this._protected.visible;},
			set: function(value) {
				if (value != this._protected.visible) {
					if (value == true) {
						this._protected.visible = true;
						if (this.dom != undefined) {
							this.dom.style.display = '';
						}
					} else {
						this._protected.visible = false;
						if (this.dom != undefined) {
							this.dom.style.display = 'none';
						}
					}
					// Allow of the top level control to also react to the visibility change
					if (this._setVisible) {
						this._setVisible(value);
					}
				} 
			},
			configurable: false}
		);
		
		// Margin Top Property
		if (object.marginTop === true) {
			$ui.addClass(object.dom,'marginTop');
		} else {
			object.marginTop = false;
		}
		object._protected.marginTop = object.marginTop;
		Object.defineProperty(object, 'marginTop', {
			get: function() {return this._protected.marginTop;},
			set: function(value) {
				if (value == this._protected.marginTop) return;
				this._protected.marginTop = value;
				if (value == false) {
					$ui.removeClass(object.dom,'marginTop');
				} else {
					$ui.addClass(object.dom,'marginTop');
				}
			},
			configurable: false}
		);
		
		// Margin Bottom Property
		if (object.marginBottom === true) {
			$ui.addClass(object.dom,'marginBottom');
		} else {
			object.marginBottom = false;
		}
		object._protected.marginBottom = object.marginBottom;
		Object.defineProperty(object, 'marginBottom', {
			get: function() {return this._protected.marginBottom;},
			set: function(value) {
				if (value == this._protected.marginBottom) return;
				this._protected.marginBottom = value;
				if (value == false) {
					$ui.removeClass(object.dom,'marginBottom');
				} else {
					$ui.addClass(object.dom,'marginBottom');
				}
			},
			configurable: false}
		);
		
		// Margin Left Property
		if (object.marginLeft === true) {
			$ui.addClass(object.dom,'marginLeft');
		} else {
			object.marginLeft = false;
		}
		object._protected.marginLeft = object.marginLeft;
		Object.defineProperty(object, 'marginLeft', {
			get: function() {return this._protected.marginLeft;},
			set: function(value) {
				if (value == this._protected.marginLeft) return;
				this._protected.marginLeft = value;
				if (value == false) {
					$ui.removeClass(object.dom,'marginLeft');
				} else {
					$ui.addClass(object.dom,'marginLeft');
				}
			},
			configurable: false}
		);
		
		// Margin Right Property
		if (object.marginRight === true) {
			$ui.addClass(object.dom,'marginRight');
		} else {
			object.marginRight = false;
		}
		object._protected.marginRight = object.marginRight;
		Object.defineProperty(object, 'marginRight', {
			get: function() {return this._protected.marginRight;},
			set: function(value) {
				if (value == this._protected.marginRight) return;
				this._protected.marginRight = value;
				if (value == false) {
					$ui.removeClass(object.dom,'marginRight');
				} else {
					$ui.addClass(object.dom,'marginRight');
				}
			},
			configurable: false}
		);
		
		// Attached Objects Property
		if (object.attachedObjects) {
			var i,
				control,
				controlDom,
				targetScreen = (object.screen != undefined) ? object.screen : object; // The only control without a screen is a screen
			for (i = 0; i < object.attachedObjects.length; i++) {
				control = object.attachedObjects[i];
				controlDom = $ui.createControl(control, targetScreen);
				// If this control needs to be in the DOM add it
				if (controlDom instanceof HTMLElement) {
					object.dom.appendChild(controlDom);
				}
			}
		} else {
			object.attachedObjects = [];
		}
		object._protected.attachedObjects = object.attachedObjects;
		Object.defineProperty(object, 'attachedObjects', {
			get: function() {return this._protected.attachedObjects;},
			set: function(value) {
				console.log($ui._protected.PROPERTY_WARNING.replace('[prop]','attachedObjects'));
			},
			configurable: false}
		);
		
		/** 
		 * This protected function will raise an interaction event for the <b>oninteraction</b> callback assigned to the {@link $ui} object.
		 * @memberof $ui.CoreComponent
		 * @protected 
		 * @function _raiseInteractionEvent
		 * @param {string} interaction - Desired interaction to raise
		 */
		object._raiseInteractionEvent = function(interaction) {
			var event = new InteractionEvent(this.screen.id, this.id, interaction, this.component);
			$ui._raiseInteractionEvent(event);
		}
		object._raiseInteractionEvent = object._raiseInteractionEvent.bind(object);
		
		
		// Private function to animate scrolling the control into view 
		object._scrollIntoView = function() {
			var step = 20,
				rect = this.dom.getBoundingClientRect(),
				scrollArea = (this.tab != undefined) ? this.tab.dom.content : this.screen.dom.content;
				
			this._scrollIterationCounter = this._scrollIterationCounter + 1;
			// See if it has reached the top of the screen
			if (rect.top == scrollArea.offsetTop) { 
				return;
			}
			
			// If the bottom and top of the control is visible
			if ((rect.bottom < (scrollArea.offsetTop + scrollArea.offsetHeight)) && (rect.top > scrollArea.offsetTop)) {
				return;
			}
				
			if (rect.top > scrollArea.offsetTop) { // Need to scroll down
				if (rect.top - scrollArea.offsetTop < step) {
					step = 1;
				}
				scrollArea.scrollTop = scrollArea.scrollTop + step;
			} else { // Need to scroll up
				if (scrollArea.offsetTop - rect.top < step) {
					step = 1;
				}
				scrollArea.scrollTop = scrollArea.scrollTop - step;
			}
			
			if (this._scrollIterationCounter > 100) { // Equivalent to moving something 2000 pixels
				console.log('fail safe scroll counter exceeded');
				return;
			}
			requestAnimationFrame(this._scrollIntoView);
		}
		object._scrollIntoView = object._scrollIntoView.bind(object);
		
		/** 
		 * This function will scroll the control into view for the user.
		 * @memberof $ui.CoreComponent
		 * @function scrollIntoView
		 */
		object.scrollIntoView = function() {
			if (this.dom) {
				this._scrollIterationCounter = 0;
				requestAnimationFrame(this._scrollIntoView);
			}
		}
		object.scrollIntoView = object.scrollIntoView.bind(object);
		
		// Public base destructor for the component
		object.destroy = function() {	
			// Call private destructor of control if it is there
			if (object._destroy) {
				object._destroy();
			}
			// Remove the provider listener
			if (this.provider != undefined) {
				if (this.provider.id != undefined) {
					window.removeEventListener(this.screen.guid+'-'+this.provider.id+'-updated', this._providerRefresh, false);
				}
			}	
			// Clean-up any attached objects
			var i,
				attachedObject;
			if (this.attachedObjects && this.attachedObjects.length > 0) {
				for (i = 0; i < this.attachedObjects.length; i++) {
					attachedObject = this.attachedObjects[i];
					if (attachedObject._destroy) {
						attachedObject._destroy();
					}
				}
			}
			this.dom = undefined;
		}
		object.destroy = object.destroy.bind(object);
		
		// Handle a provider update
		object._providerRefresh = function() {
			// Find the data provider
			var dataProvider = this.screen[this.provider.id];
			if (dataProvider != undefined) {
				// Make sure it has some data assigned to it
				if (dataProvider.data != undefined) {
					var properties = this.provider.property.split('.'),
						i,
						data = dataProvider.data,
						found = true;
					// traverse it's hierarchy for our data value	
					for (i = 0; i < properties.length; i++) {
						data = data[properties[i]];
						if (data == undefined) {
							found = false;
							break;
						}
					}
					if (found) {
						if (this._providerUpdate) {
							this._providerUpdate(data);
						}
						return;
					}
				} else {
					// If there was data we would not reach this point other wise it is undefined
					// so we have to check to see if it is an initial load so that we don't trigger 
					// the control's update unnecessarily 
					if (!dataProvider._untouched && this._providerUpdate) {
						this._providerUpdate(undefined);
					}
				}
			} 
		}
		object._providerRefresh = object._providerRefresh.bind(object);
		
		
		// This function will update the provider data source with new data from the control
		object._updateData = function(value) {
			// Find the data provider
			var dataProvider = (this.provider == undefined) ? undefined : this.screen[this.provider.id];
			if (dataProvider != undefined) {
				// Make sure it has some data assigned to it
				if (dataProvider.data != undefined) {
					var properties = this.provider.property.split('.'),
						i,
						data = dataProvider.data,
						currentValue;
					// traverse it's hierarchy for our data value	
					for (i = 0; i < properties.length; i++) {
						currentValue = data[properties[i]];
						if ((currentValue == undefined) && (i < (properties.length -1))) {
							break;
						} else if (i == (properties.length -1)) {
							data[properties[i]] = value;
							break;
						}
						data = currentValue;
					}
				}
			}
		}
		object._updateData = object._updateData.bind(object);
		
		// Data Provider Property
		if (object.provider != undefined) {
			if (object.provider.id != undefined) {
				// unique event listener for this provider on this screen
				window.addEventListener(object.screen.guid+'-'+object.provider.id+'-updated', object._providerRefresh, false);
				// Evaluate our bindings 
				object._providerRefresh();
			}
		}
		object._protected.provider = object.provider;
		Object.defineProperty(object, 'provider', {
			get: function() {return this._protected.provider;},
			set: function(value) {
				console.log($ui._protected.PROPERTY_WARNING.replace('[prop]','provider'));
			},
			configurable: false}
		);
	}
}

/** 
 * The function assigned to this member will fire when the screen the component belongs to receives an onshow event. This is an <b>internal protected</b> member to be used by derivative controls and should not be bound to by application code
 * @name _onshow
 * @memberof $ui.CoreComponent
 * @protected
 * @type {function} 
 */
 
 /** 
 * The function assigned to this member will fire when the theme for the $ui tookit changes. This is an <b>internal protected</b> member to be used by derivative controls and should not be bound to by application code
 * @name _onthemechange
 * @memberof $ui.CoreComponent
 * @protected
 * @type {function} 
 */
 
/** 
 * The function assigned to this member will fire when the screen that the component belongs to has it's viewport size changed. This is an <b>internal protected</b> member to be used by derivative controls and should not be bound to by application code
 * @name _onresize
 * @memberof $ui.CoreComponent
 * @protected
 * @type {function} 
 */

/** 
 * The function assigned to this member will fire when the screen that the component belongs to is just about to be popped. This will only fire if the screen is the top most screen in the stack. It allows for any clean-up that might need to be done before animating. This is an <b>internal protected</b> member to be used by derivative controls and should not be bound to by application code
 * @name _onbeforepop
 * @memberof $ui.CoreComponent
 * @protected
 * @type {function} 
 */

/**
 * This is the abstract base class that represents a screen instance. It derives from {@link $ui.CoreComponent}. 
 * A screen is declared as a JavaScript function and has various different properties. When a screen is pushed onto the stack a new instance of the screen will be created and rendered.<br><br>
 * If a derivative screen is using the <b>animated</b> property to animate a screen transition to show the screen, it must also provide a reverse animation effect within its <b>_onbeforepop</b> event.
 * <br><br><b>NOTE: This is an abstract class </b>
 * @namespace
 * @name CoreScreen
 * @memberof $ui
 * @extends $ui.CoreComponent 
 * @property {GenericEvent} [onresize] - This event will fire when the viewport of the screen changes size
 * @property {GenericEvent} [onshow] - This event will fire when the screen has been displayed
 * @property {GenericEvent} [ondestroy] - This event will fire when the screen is about to be destroyed. Allowing for any memory clean-up routines
 */
function $ui_CoreScreen(object, data) {
	$ui_CoreComponent.call(this, object);
	if (object) {
		object.data = data;
		object.guid = $ui.guid();
		object.children = []; // Contains all child controls in the screen
		$ui.addClass(object.dom,'ui-core-screen');
		
		/**
		* Protected internal function for derivative screens to implement if they have specific functionality they wish to
		* do when the screen initializes.  This function will fire just before the <b>onshow</b> event is triggered for the screen.
		* @function _intitialize
		* @memberof $ui.CoreScreen
		* @protected
		*/
		
		// Initialize the screen
		object.initialize = function() {
			$ui._protected.inScreenTransition = false;
			$ui._blockAllTapEvent(false);
			// See if there is an internal implementation of _initialize
			if (this._initialize) {
				this._initialize();
			}
			// Raise our onshow event
			if (this.onshow) {
				this.onshow(this.data);
			}
			// Fire the _onshow for all the controls
			var i,
				control;
			for (i = 0; i < this.children.length;i++) {
				control = this.children[i];
				if (control._onshow) {
					control._onshow();
				}
			}
		}
		object.initialize = object.initialize.bind(object);
		
		// Internal Resize event
		object._onresize = function() {
			// Fire the _onresize for all the controls
			var i,
				control;
			for (i = 0; i < this.children.length;i++) {
				control = this.children[i];
				if (control._onresize) {
					control._onresize();
				}
			}
		}
		object._onresize = object._onresize.bind(object);
		
		// Internal before pop event
		object.onbeforepop = function() {
			if (this._onbeforepop) {
				this._onbeforepop();
			}
			// Fire the _onbeforepop for all the controls
			var i,
				control;
			for (i = 0; i < this.children.length;i++) {
				control = this.children[i];
				if (control._onbeforepop) {
					control._onbeforepop();
				}
			}
		}
		object.onbeforepop = object.onbeforepop.bind(object);
		
		// Internal function to trigger all theme change internal assignments
		object._fireThemeChange = function() {
			if (this._onthemechange) {
				this._onthemechange();
			}
			// Fire the _onthemechange for all the controls
			var i,
				control;
			for (i = 0; i < this.children.length;i++) {
				control = this.children[i];
				if (control._onthemechange) {
					control._onthemechange();
				}
			}
		}
		object._fireThemeChange = object._fireThemeChange.bind(object);
		
		// Destroy screen
		object._destroy = function() {
			if (this.ondestroy) {
				this.ondestroy();
			}
			// Loop through all the children and call their destroy
			var i;
			for (i = 0; i < this.children.length; i++) {
				this.children[i].destroy();
			}
		}
		object._destroy = object._destroy.bind(object);
		
		return object.dom;
	}
}

$ui_CoreScreen.prototype = new $ui_CoreComponent();

/**
 * The DataProvider component provides a data source that can be bound to controls on a screen. This provides the ability to both populate controls with data, as well as automatically save the data based on user interaction with the controls.<br><br>
 * <b>NOTE: The DataProvider should be attached to a screen or control using its [attachedObjects]{@link $ui.CoreComponent} property.</b><br><br>
 * <b>Sample Declaration</b>
 * <pre>
 * {
 *   component: $ui.DataProvider,
 *   id: 'myProvider',
 *   data: {
 *      account: {
 *         username: '@brcewane' 
 *      }
 *   }
 *}
 * </pre>
 * @namespace
 * @name DataProvider
 * @memberof $ui
 * @property {string} component - The <b>required</b> component property defines what type of component is being defined. This property must be $ui.DataProvider
 * @property {string} id - The <b>required</b> id property is used to uniquely define the data provider in the scope of the screen in which it belongs. Providing an id for your data provider is required because you can easily access your provider through your javascript coding and also reference it as the provider for a control.
 * @property {object} [data] - The data property by default is undefined. You can populate the data property by calling the load or set functions listed in the functions area, or you can define it as any kind of object. The data property holds the object that represents the data for the provider
 * @property {GenericEvent} [onload] - This event will fire when the data has been successfully loaded into the provider and controls have been updated
 * @property {GenericEvent} [onbeforeupdate] - This event will fire when the data property has been successfully set, but has not yet been used to update any controls connected to the provider. This gives you an opportunity to manipulate the data property of the data provider <b>before</b> controls are updated
 */
function $ui_DataProvider(object, screen){
	object.screen = screen;
	object._url = undefined;
	object._parameters = undefined;
	object._untouched = true;
	
	// Attach the ID to the main screen object
	if (object.id && screen) {
		screen[object.id] = object;
	}
	
	/** 
	 * You can set the data property for any data provider directly by passing it an object that you want to use as the data source. Setting this property will trigger the <i>onbeforeupdate</i>, <i>onloaded</i> event and update the controls which are using this provider
	 * @function setData
	 * @memberof $ui.DataProvider
	 * @param {object} value - Object to set as data for the data provider
	 */
	object.setData = function(value) {
 		this._untouched = false;
		this.data = value;
		if (this.onbeforeupdate) {
			this.onbeforeupdate();
		}
		this._raiseEvent();
		if (value == undefined) return;
		if (this.onload) {
			this.onload();
		}
	}
	object.setData = object.setData.bind(object);
	
	/** 
	 * The refresh function will send a signal out to all connected components to refresh their data from the current content in memory from the provider. <b>NOTE: No <i>onbeforeupdate</i> or <i>onload</i> event will fire on the provider</b>
	 * @function refresh
	 * @memberof $ui.DataProvider
	 */
	object.refresh = function() {
		this._raiseEvent();
	}
	object.refresh = object.refresh.bind(object);
	
	// Raise our event to let the rest of the app know to refresh
	object._raiseEvent = function() {
		var evt = document.createEvent('Events');
		evt.initEvent(this.screen.guid+'-'+this.id+'-updated', true, true);
		window.dispatchEvent(evt);
	}
	object._raiseEvent = object._raiseEvent.bind(object);
	
	// Private function to handle clean-up
	object._destroy = function() {
		this.data = undefined;
	}
	object._destroy = object._destroy.bind(object);
	
	// See if the data was pre-defined
	if (object.data != undefined) {
		if (object.onbeforeupdate) {
			object.onbeforeupdate();
		}
		if (object.onload) {
			object.onload();
		}
	}
	
	return undefined;
}

/**
 * A data provider link provides a binding between a [control]{@link $ui.CoreComponent} and a data provider. The path for the <b>property</b> attribute starts at the root of the object that is provided as the data source for the data provider.<br><br>
 * The type of object that the property path should point to is dependent on the control and the data it uses to display and/or edit. If the control also allows the user to edit data or change settings, these changes will be applied to the property value in the data provider.<br><br>
 * <b>Sample Code:</b><br>
 * <pre>provider: {
 *    id: 'myProvider',
 *    property: 'posts'
 * }
 * </pre>
 * <br>
 * To access sub objects in the object chain from the data provider you can use normal <b>dot</b> notation:<br><br>
 * <b>Sample Code:</b><br>
 * <pre>provider: {
 *    id: 'myProvider',
 *    property: 'posts.item.thingy'
 * }
 * </pre>
 * <br>
 * @namespace
 * @name DataProviderLink
 * @memberof $ui
 * @property {string} id - This is the <b>mandatory</b> id of the data provider belonging to the screen which will be linked to this control.  
 * @property {string} property - This is the property path/name of the object to be used as the bound data for this control. A nested property can be defined simply by providing a path using <b>.</b> dot separators just like you were referring to the object via JavaScript
 */
 
 

/**
 * Represents an interaction event from the user interface.  This event is raised when a user interacts with a part of the interface. All interation events are sent to the $ui.oninteraction 
 * assigned function.  If valid values are not passed in for all of the parameters no event will be raised.
 * @class InteractionEvent
 * @param {string} screenId - The <b>id</b> property of the screen which contains the control providing the interaction
 * @param {string} controlID - The <b>id</b> property of the control in which the user interacted
 * @param {string} interaction - The interaction which took place
 * @param {object} component - The component type definition for which this interaction took place.   An example could be the value $ui.List.  This is <b>not</b> a pointer to the control.
 */
function InteractionEvent(screenId, controlId, interaction, component) {
	/**
	 * The <b>id</b> property of the screen which contains the control providing the interaction
	 * @member {string} screenId
	 * @memberOf InteractionEvent
	 */
	this.screenId = screenId;
	
	 /**
	 * The <b>id</b> property of the control in which the user interacted
	 * @member {string} controlId
	 * @memberOf InteractionEvent
	 */
	this.controlId = controlId;
	
	 
	 /**
	 * The interaction which took place
	 * @member {string} interaction
	 * @memberOf InteractionEvent
	 */
	this.interaction = interaction;
	
	/**
	 * The component type definition for which this interaction took place.  An example could be the value $ui.List.  This is <b>not</b> a pointer to the control
	 * @member {object} component
	 * @memberOf InteractionEvent
	 */
	this.component = component;
}


 


/**
 * A List object will display multiple list items based on the data provided to the control.  The type of item objects that are used should match the declaration of the <b>style</b> of the list control<br><br>
 * <b>Sample Declaration</b><br>
 * <pre>
 * {
 *   component: $ui.List,
 *   style: $ui.GenericListItem,
 *   items: [
 *      {
 *         img: 'thumbnails/foo.png',
 *         title: 'This is my title',
 *         accent: '6 hours ago',
 *         caption: 'My summary description'
 *      }
 *   ]
 *}
 * @namespace
 * @name List
 * @memberof $ui
 * @extends $ui.CoreComponent
 * @property {object[]} [items] - The items property is an array of objects who's definition matches that of the requirements of the <b>style</b> property of the list
 * @property {object} style - This is a list item decalaration so that the list knows how to render. For example this could be set to {@link $ui.GenericListItem}
 * @property {$ui.DataProviderLink} [provider] - The type of data provider value for a list control should point to a property in the data provider that would follow the same rules as hard coding an array of items.
 * @property {ListActionEvent} [onaction] - The onaction event will fire when an action from a list item is triggered. Some list items may have multiple actions that can be taken. When one of these actions is selected by the user the onaction event will fire.
 */
function $ui_List(object, screen) {
	$ui_CoreComponent.call(this, object, screen);
	$ui.addClass(object.dom,'ui-list');
	
	// Set our initial properties that can be modified
	if (object.items) {
		object._original.items = [];
		for (var i = 0; i < object.items.length; i++) {
			object._original.items.push(object.items[i]);
		}
	}

	// Broker the onaction from a list item
	object._onaction = function(item, event) {
		if (this.onaction) {
			this.onaction(event);
		}
	}
	object._onaction = object._onaction.bind(object);
	
	// Create the DOM for a list item depending on the list type
	object._createItemDom = function(item) {
		var dom;
		// See if the item is a header
		if (item.component && (item.component == $ui.Header)) {
			dom = $ui.createControl(item,this.screen);
		} else if (this._itemConstructor != undefined) {
			dom = new this._itemConstructor(item,this.screen);
		}
		return dom;
	}
	object._createItemDom = object._createItemDom.bind(object);
	
	// Private function to add a new item to the list
	object._addItem = function(item) {
		item.parent = this;
		itemDom = this._createItemDom(item);
		if (itemDom) {
			this.dom.appendChild(itemDom);
			if (item._onafterinsert) {
				item._onafterinsert();
			}
			return true;
		} else {
			return false;
		}
	}
	object._addItem = object._addItem.bind(object);
	
	/** 
	 * You can add an item to the end of the list by calling the addItem function and passing in an object that matches the a list item
	 * @function addItem
	 * @memberof $ui.List
	 * @param {object} item - Item to be added to the list
	 */
	object.addItem = function(item) {
		if (this._addItem(item)) {
			this.items.push(item);
			// if there is data provider, add the item to provider
			if (this._providerItems != undefined) {
				this._providerItems.push(item);
			}
			return true;
		} else {
			return false;
		}
	}
	object.addItem = object.addItem.bind(object);
	
	/** 
	 * The remove item function will remove an existing item from a list. If an invalid item is specified the removal will fail
	 * @function removeItem
	 * @memberof $ui.List
	 * @param {object} item - Item to be removed from the list
	 */
	object.removeItem = function(item) {
		if (item == undefined) return false;
		var index = this.items.indexOf(item);
		if (index < 0) return false;
		try {
			this.dom.removeChild(item.dom);
		} catch (ex) {
			console.log('$ui.List: ' + ex);
		}
		this.items.splice(index, 1);
		// See if we have items on a provider that we should remove
		if (this._providerItems != undefined) {
			this._providerItems.splice(index, 1);
		}
		if (item._destroy) {
			item._destroy();
		}
	}
	object.removeItem = object.removeItem.bind(object);
	
	/** 
	 * Insert item works similar to addItem but instead will insert the item into the list at the index specified. If an invalid index is specified it will result in failure to insert the item. To insert an item at the top of a list call insert with the index of 0.
	 * @function insertItem
	 * @memberOf $ui.List
	 * @param {object} item - Item to be inserted into the list
	 * @param {number} index - Index to insert the item
	 */
	object.insertItem = function(item, index) {
		item.parent = this;
		if (index < 0) {
			return false;
		} else if (this.items.length == 0) {
			this.addItem(item);
			return true;
		} else if (index > this.items.length - 1) {
			this.addItem(item);
			return true;
		} else { // Insert it at the index
			var existingItem = this.items[index],
				itemDom = this._createItemDom(item);
			this.items.splice(index, 0, item);
			this.dom.insertBefore(itemDom, existingItem.dom);
			// if there is data provider, insert the item to provider
			if (this._providerItems != undefined) {
				this._providerItems.splice(index, 0, item);
			}
			return true;
		} 
		return false;
	}
	object.insertItem = object.insertItem.bind(object);
	
	/** 
	 * You can refresh all the items in a list by calling the refreshItems function with an array of new items
	 * @function refreshItems
	 * @memberof $ui.List
	 * @param {object[]} items - Array of items to refresh the list
	 */
	object.refreshItems = function(itemArray) {
		if (itemArray == undefined) return; // No data provided
		var i,
			item;
		if (this.items) {
			// Remove all existing items first
			for (i = this.items.length - 1; i >= 0; i--) {
				item = this.items[i];
				try {
					this.dom.removeChild(item.dom);
				} catch (ex) {
					console.log('$ui.List: ' + ex);
				}
				this.items.pop();
				if (item._destroy) {
					item._destroy();
				}
			}
			// See if there is data from provider, and make it blank.
			if (this._providerItems != undefined) {
				this._providerItems = [];
			}
		}
		this.addItemBatch(itemArray);
	}
	object.refreshItems = object.refreshItems.bind(object);
	
	/** 
	 * This function is much like the refreshItems function but instead it loads a list of circle list items to the end of the current list and does not replace the existing list items.
	 * @function addItemBatch
	 * @memberof $ui.List
	 * @param {object[]} items - Array of items to be added to the list
	 */
	object.addItemBatch = function(itemArray) {
		var i,
			item;
		if (!this.items) {
			this.items = [];
		}
		// Add all new items into the list
		for (i = 0; i < itemArray.length; i++) {
			item = itemArray[i];
			this.addItem(item);
		}
	}
	object.addItemBatch = object.addItemBatch.bind(object);
	
	// Private function to handle provider updates
	object._providerUpdate = function(value) {
		this.refreshItems(value);
		this._providerItems = value;
	}
	object._providerUpdate = object._providerUpdate.bind(object);
	
	
	var i,
		extension;
	// Determine our item constructor
	for (i = 0; i < $ui._protected.definitions.length; i++) {
		extension = $ui._protected.definitions[i];
		if (extension.type != $ui.UIExtensionType.LISTITEM) continue;
		if (extension.component == object.style) {
			object._itemConstructor = extension.constructor;
			break;
		}
	}

	// Cycle through list items
	var	item,
		index;
	if (object.items) {
		for (i = 0; i < object.items.length; i++) {
			item = object.items[i];
			object._addItem(item);
		}
	} else {
		object.items = [];
	}
	
	return object.dom;
}

$ui_List.prototype = new $ui_CoreComponent();

/**
 * The {@link $ui.List} <b>onaction</b> event will fire when the user interacts with a list item
 * @callback ListActionEvent
 * @param {ListEvent} event - The list event which was raised
 */
/**
 * The list event is what is triggered when a user interacts with the List control. It contains the target list item that the user was interacting with, the type of event which was triggered 
 * and an optional data property that contains extra data about the event.
 * @class ListEvent
 * @param {object} target - Target list item where the event originated
 * @param {string} eventType - The type of event that was triggered. Each list item has its own set of possible events that can be raised
 * @param {object} [data] - Optional data that can be passed with a list event
 */
function ListEvent(target, eventType, data) {
	/** 
	 * Target list item where the event originated
	 * @member {object} target
	 * @memberOf ListEvent
	 */
	this.target = target;
	
	/** 
	 * The type of event that was triggered. Each list item has its own set of possible events that can be raised
	 * @member {string} eventType
	 * @memberOf ListEvent
	 */
	this.eventType = eventType;
	
	/** 
	 * Optional data that can be passed with a list event
	 * @member {object} [data]
	 * @memberOf ListEvent
	 */
	this.data = data;
}


/**
 * The spinner control provides you the ability to give a visual indicator when your content is loading. The spinner has one main property <b>size</b>. <br><br>
 * <b>Sample Declaration</b><br>
 * <pre>
 * {
 *   component: $ui.Spinner,
 *   size: $ui.Spinner.SpinnerSize.LARGE
 *}
 * @namespace Spinner
 * @memberof $ui
 * @extends $ui.CoreComponent
 * @property {$ui.Size} [size=$ui.Size.NORMAL] - Represents the size of the spinner component.
 * @property {$ui.Spinner.SpinnerColor} [forceColor] - This property specifies if the color should be forced to be dark or light. By default the system figures this out and does not need to be set. However, if you want to force a color in a certain scenario you can use this property.
 */
function $ui_Spinner(object, screen){
	$ui_CoreComponent.call(this, object, screen);
	object.size = (object.size) ? object.size : $ui.Size.NORMAL;
	$ui.addClass(object.dom, 'ui-spinner')
	$ui.addClass(object.dom, object.size);
	$ui.addClass(object.dom, 'center');
	
	// Create the inner div
	object.dom.innerDiv = document.createElement('div');
	$ui.addClass(object.dom.innerDiv, 'inner');
	object.dom.appendChild(object.dom.innerDiv);
	
	// Check our coloring
	if (object.forceColor) {
		$ui.addClass(object.dom.innerDiv, object.forceColor);
	} else {
		if ($ui.theme.rootClass && $ui.theme.rootClass.indexOf('ui-theme-dark') > -1)  {
			$ui.addClass(object.dom.innerDiv, 'light');
		} else {
			$ui.addClass(object.dom.innerDiv, 'dark');
		}
	}

	return object.dom
}

$ui_Spinner.prototype = new $ui_CoreComponent();
/**
 * The definition of an extension to be used in extending the <b>$ui</b> framework.
 * @class
 * @param {string} name - This would be the value you set as the <b>component</b> property for your control
 * @param {function} constructor - The function to be used as your control constructor
 * @param {$ui.UIExtensionType} [type=$ui.UIExtensionType.CONTROL] - The type of extension you are registering
 * @param {object} [definition] - Class definition for your extension, you can include properties such as constants here
 */
function UIExtension(name, constructor, type, definition) {
	/** 
	 * This would be the value you set as the <b>component</b> property for your control
	 * @member {string} name
	 * @memberOf UIExtension
	 */
	if (name == null) throw new Error('UIExtension: name cannot be null');
	if (name == undefined) throw new Error('UIExtension: name cannot be undefined');
	this.name = name;
	/** 
	 * The function to be used as your control constructor
	 * @member {function} constructor
	 * @memberOf UIExtension
	 */
	if (constructor == null) throw new Error('UIExtension: constructor cannot be null');
	if (constructor == undefined) throw new Error('UIExtension: constructor cannot be undefined');
	this.constructor = constructor;
	/** 
	 * The type of extension you are registering
	 * @member {$ui.UIExtensionType} [type=$ui.UIExtensionType.CONTROL]
	 * @memberOf UIExtension
	 */
	if (type == null || type == undefined) {
		this.type = $ui.UIExtensionType.CONTROL;
	} else if ((type != $ui.UIExtensionType.CONTROL) && (type != $ui.UIExtensionType.SCREEN) && (type != $ui.UIExtensionType.LISTITEM)) {
		throw new Error('UIExtension: type is an invalid value');
	} else {
		this.type = type;
	}
	/** 
	 * Class definition for your extension, you can include properties such as constants here
	 * @member {object} [definition]
	 * @memberOf UIExtension
	 */
	if (definition == null || definition == undefined) {
		this.definition = {};
	} else {
		this.definition = definition;
	}
}
function $ui_ExtendSDK() {
	
	// Play the touch sound
	$ui.playTouchSound = function() {
		if ($system && $system.audio) {
			$system.audio.playSoundEffect($system.SoundEffect.TOUCH);
		}
	}
	$ui.playTouchSound = $ui.playTouchSound.bind($ui);
	
	var def = {
		/**
		 * Location of where to display docked content in a {@link $ui.DockLayout} 
		 * @namespace DockLocation
		 * @readonly
		 * @memberof $ui.DockLayout
		 */
		DockLocation: {
			/** Dock located at the top 
			* @memberof $ui.DockLayout.DockLocation
			*/
			TOP: 'top',
			/** Dock located at the bottom
			* @memberof $ui.DockLayout.DockLocation
			*/
			BOTTOM: 'bottom'
		}
	};
	$ui.addExtension(new UIExtension('DockLayout', $ui_DockLayout, undefined, def));
	$ui.addExtension(new UIExtension('CircleMenu', $ui_CircleMenu));
	$ui.addExtension(new UIExtension('SegmentedControl', $ui_SegmentedControl));
	$ui.addExtension(new UIExtension('Tab', $ui_Tab));
	$ui.addExtension(new UIExtension('TabbedPane', $ui_TabbedPane));
	$ui.addExtension(new UIExtension('SplitView', $ui_SplitView));
	$ui.addExtension(new UIExtension('ControlGroup', $ui_ControlGroup));
	$ui.addExtension(new UIExtension('Header', $ui_Header));
	def = {
		SpinnerSize: {
			LARGE: 'large', 
			MEDIUM: 'medium', 
			SMALL: 'small', 
			TINY: 'tiny'
		},
		SpinnerColor: {
			LIGHT: 'light',
			DARK: 'dark'
		}
	};
	$ui.addExtension(new UIExtension('TileGroup', $ui_TileGroup));
	$ui.addExtension(new UIExtension('CoreTileGauge', $ui_CoreTileGauge));
	$ui.addExtension(new UIExtension('CoreTileDonutChart', $ui_CoreTileDonutChart));
	// Add our list item extensions
	def = { 
		/**
		 * Event type of an event raised from a {@link $ui.GenericListItem} 
		 * @namespace GenericListEvent
		 * @readonly
		 * @memberof $ui.GenericListItem
		 */
		GenericListEvent: {
			/** Click of a generic list item 
			* @memberof $ui.GenericListItem.GenericListEvent
			*/
			ONCLICK:'onclick' 
		}
	};
	$ui.addExtension(new UIExtension('GenericListItem', $ui_GenericListItem, $ui.UIExtensionType.LISTITEM, def));
	def = { 
		/**
		 * Event type of an event raised from a {@link $ui.ImageListItem} 
		 * @namespace ImageListEvent
		 * @readonly
		 * @memberof $ui.ImageListItem
		 */
		ImageListEvent: {
			/** Click of an image list item 
			* @memberof $ui.ImageListItem.ImageListEvent
			*/
			ONCLICK:'onclick' 
		}
	};
	$ui.addExtension(new UIExtension('ImageListItem', $ui_ImageListItem, $ui.UIExtensionType.LISTITEM, def));
	// Add our screen extensions
	$ui.addExtension(new UIExtension('WindowPane', $ui_WindowPane, $ui.UIExtensionType.SCREEN));
}

$ui.extend($ui_ExtendSDK);

/**
 * Internal Tile sizing used with {@link $ui.CoreTile} 
 * @namespace TileSize
 * @readonly
 * @memberof $ui
 */
$ui.TileSize = {
	/** Standard 1 x 1 tile size */
	STANDARD: 'standard',
	/** Wide 1 x 2 tile size */
	WIDE: 'wide',
	/** Tall 2 x 1 tile size */
	TALL: 'tall'
};

/**
 * Theme properties that can be used with the {@link $ui}($ui.init()) function
 * @namespace TileSize
 * @readonly
 * @memberof $ui
 */
$ui.Theme = {
	/** main root class for light, dark, normal or bold effects */
	rootClass: undefined,
	/** main root class for light, dark, normal or bold effects */
	color: '#D94646'
}

// Graph Colors
$ui.color_LIGHT = '#F0F0F0';
$ui.color_DARK = '#747474';
$ui.color_OK = '#FAD60A';
$ui.color_GOOD = '#FDBF2F';
$ui.color_GREAT = '#A3D525';
/**
 * @preserve FastClick: polyfill to remove click delays on browsers with touch UIs.
 *
 * @version 1.0.0
 * @codingstandard ftlabs-jsv2
 * @copyright The Financial Times Limited [All Rights Reserved]
 * @license MIT License (see LICENSE.txt)
 */

/*jslint browser:true, node:true*/
/*global define, Event, Node*/


/**
 * Instantiate fast-clicking listeners on the specificed layer.
 *
 * @constructor
 * @param {Element} layer The layer to listen on
 * @param {Object} options The options to override the defaults
 */
function FastClick(layer, options) {
	'use strict';
	var oldOnClick;

	options = options || {};

	/**
	 * Whether a click is currently being tracked.
	 *
	 * @type boolean
	 */
	this.trackingClick = false;


	/**
	 * Timestamp for when click tracking started.
	 *
	 * @type number
	 */
	this.trackingClickStart = 0;


	/**
	 * The element being tracked for a click.
	 *
	 * @type EventTarget
	 */
	this.targetElement = null;


	/**
	 * X-coordinate of touch start event.
	 *
	 * @type number
	 */
	this.touchStartX = 0;


	/**
	 * Y-coordinate of touch start event.
	 *
	 * @type number
	 */
	this.touchStartY = 0;


	/**
	 * ID of the last touch, retrieved from Touch.identifier.
	 *
	 * @type number
	 */
	this.lastTouchIdentifier = 0;


	/**
	 * Touchmove boundary, beyond which a click will be cancelled.
	 *
	 * @type number
	 */
	this.touchBoundary = options.touchBoundary || 10;


	/**
	 * The FastClick layer.
	 *
	 * @type Element
	 */
	this.layer = layer;
	
	/**
	 * The minimum time between tap(touchstart and touchend) events
	 * 
	 * @type number
	 */
	this.tapDelay = options.tapDelay || 200;

	if (FastClick.notNeeded(layer)) {
		return;
	}

	// Some old versions of Android don't have Function.prototype.bind
	function bind(method, context) {
		return function() { return method.apply(context, arguments); };
	}

	// Set up event handlers as required
	if (deviceIsAndroid) {
		layer.addEventListener('mouseover', bind(this.onMouse, this), true);
		layer.addEventListener('mousedown', bind(this.onMouse, this), true);
		layer.addEventListener('mouseup', bind(this.onMouse, this), true);
	}

	layer.addEventListener('click', bind(this.onClick, this), true);
	layer.addEventListener('touchstart', bind(this.onTouchStart, this), false);
	layer.addEventListener('touchmove', bind(this.onTouchMove, this), false);
	layer.addEventListener('touchend', bind(this.onTouchEnd, this), false);
	layer.addEventListener('touchcancel', bind(this.onTouchCancel, this), false);

	// Hack is required for browsers that don't support Event#stopImmediatePropagation (e.g. Android 2)
	// which is how FastClick normally stops click events bubbling to callbacks registered on the FastClick
	// layer when they are cancelled.
	if (!Event.prototype.stopImmediatePropagation) {
		layer.removeEventListener = function(type, callback, capture) {
			var rmv = Node.prototype.removeEventListener;
			if (type === 'click') {
				rmv.call(layer, type, callback.hijacked || callback, capture);
			} else {
				rmv.call(layer, type, callback, capture);
			}
		};

		layer.addEventListener = function(type, callback, capture) {
			var adv = Node.prototype.addEventListener;
			if (type === 'click') {
				adv.call(layer, type, callback.hijacked || (callback.hijacked = function(event) {
					if (!event.propagationStopped) {
						callback(event);
					}
				}), capture);
			} else {
				adv.call(layer, type, callback, capture);
			}
		};
	}

	// If a handler is already declared in the element's onclick attribute, it will be fired before
	// FastClick's onClick handler. Fix this by pulling out the user-defined handler function and
	// adding it as listener.
	if (typeof layer.onclick === 'function') {

		// Android browser on at least 3.2 requires a new reference to the function in layer.onclick
		// - the old one won't work if passed to addEventListener directly.
		oldOnClick = layer.onclick;
		layer.addEventListener('click', function(event) {
			oldOnClick(event);
		}, false);
		layer.onclick = null;
	}
}


/**
 * Android requires exceptions.
 *
 * @type boolean
 */
var deviceIsAndroid = navigator.userAgent.indexOf('Android') > 0;


/**
 * iOS requires exceptions.
 *
 * @type boolean
 */
var deviceIsIOS = /iP(ad|hone|od)/.test(navigator.userAgent);


/**
 * iOS 4 requires an exception for select elements.
 *
 * @type boolean
 */
var deviceIsIOS4 = deviceIsIOS && (/OS 4_\d(_\d)?/).test(navigator.userAgent);


/**
 * iOS 6.0(+?) requires the target element to be manually derived
 *
 * @type boolean
 */
var deviceIsIOSWithBadTarget = deviceIsIOS && (/OS ([6-9]|\d{2})_\d/).test(navigator.userAgent);


/**
 * Determine whether a given element requires a native click.
 *
 * @param {EventTarget|Element} target Target DOM element
 * @returns {boolean} Returns true if the element needs a native click
 */
FastClick.prototype.needsClick = function(target) {
	'use strict';
	switch (target.nodeName.toLowerCase()) {

	// Don't send a synthetic click to disabled inputs (issue #62)
	case 'button':
	case 'select':
	case 'textarea':
		if (target.disabled) {
			return true;
		}

		break;
	case 'input':

		// File inputs need real clicks on iOS 6 due to a browser bug (issue #68)
		if ((deviceIsIOS && target.type === 'file') || target.disabled) {
			return true;
		}

		break;
	case 'label':
	case 'video':
		return true;
	}

	return (/\bneedsclick\b/).test(target.className);
};


/**
 * Determine whether a given element requires a call to focus to simulate click into element.
 *
 * @param {EventTarget|Element} target Target DOM element
 * @returns {boolean} Returns true if the element requires a call to focus to simulate native click.
 */
FastClick.prototype.needsFocus = function(target) {
	'use strict';
	switch (target.nodeName.toLowerCase()) {
	case 'textarea':
		return true;
	case 'select':
		return !deviceIsAndroid;
	case 'input':
		switch (target.type) {
		case 'button':
		case 'checkbox':
		case 'file':
		case 'image':
		case 'radio':
		case 'submit':
			return false;
		}

		// No point in attempting to focus disabled inputs
		return !target.disabled && !target.readOnly;
	default:
		return (/\bneedsfocus\b/).test(target.className);
	}
};


/**
 * Send a click event to the specified element.
 *
 * @param {EventTarget|Element} targetElement
 * @param {Event} event
 */
FastClick.prototype.sendClick = function(targetElement, event) {
	'use strict';
	var clickEvent, touch;

	// On some Android devices activeElement needs to be blurred otherwise the synthetic click will have no effect (#24)
	if (document.activeElement && document.activeElement !== targetElement) {
		document.activeElement.blur();
	}

	touch = event.changedTouches[0];

	// Synthesise a click event, with an extra attribute so it can be tracked
	clickEvent = document.createEvent('MouseEvents');
	clickEvent.initMouseEvent(this.determineEventType(targetElement), true, true, window, 1, touch.screenX, touch.screenY, touch.clientX, touch.clientY, false, false, false, false, 0, null);
	clickEvent.forwardedTouchEvent = true;
	targetElement.dispatchEvent(clickEvent);
};

FastClick.prototype.determineEventType = function(targetElement) {
	'use strict';

	//Issue #159: Android Chrome Select Box does not open with a synthetic click event
	if (deviceIsAndroid && targetElement.tagName.toLowerCase() === 'select') {
		return 'mousedown';
	}

	return 'click';
};


/**
 * @param {EventTarget|Element} targetElement
 */
FastClick.prototype.focus = function(targetElement) {
	'use strict';
	var length;

	// Issue #160: on iOS 7, some input elements (e.g. date datetime) throw a vague TypeError on setSelectionRange. These elements don't have an integer value for the selectionStart and selectionEnd properties, but unfortunately that can't be used for detection because accessing the properties also throws a TypeError. Just check the type instead. Filed as Apple bug #15122724.
	if (deviceIsIOS && targetElement.setSelectionRange && targetElement.type.indexOf('date') !== 0 && targetElement.type !== 'time') {
		length = targetElement.value.length;
		targetElement.setSelectionRange(length, length);
	} else {
		targetElement.focus();
	}
};


/**
 * Check whether the given target element is a child of a scrollable layer and if so, set a flag on it.
 *
 * @param {EventTarget|Element} targetElement
 */
FastClick.prototype.updateScrollParent = function(targetElement) {
	'use strict';
	var scrollParent, parentElement;

	scrollParent = targetElement.fastClickScrollParent;

	// Attempt to discover whether the target element is contained within a scrollable layer. Re-check if the
	// target element was moved to another parent.
	if (!scrollParent || !scrollParent.contains(targetElement)) {
		parentElement = targetElement;
		do {
			if (parentElement.scrollHeight > parentElement.offsetHeight) {
				scrollParent = parentElement;
				targetElement.fastClickScrollParent = parentElement;
				break;
			}

			parentElement = parentElement.parentElement;
		} while (parentElement);
	}

	// Always update the scroll top tracker if possible.
	if (scrollParent) {
		scrollParent.fastClickLastScrollTop = scrollParent.scrollTop;
	}
};


/**
 * @param {EventTarget} targetElement
 * @returns {Element|EventTarget}
 */
FastClick.prototype.getTargetElementFromEventTarget = function(eventTarget) {
	'use strict';

	// On some older browsers (notably Safari on iOS 4.1 - see issue #56) the event target may be a text node.
	if (eventTarget.nodeType === Node.TEXT_NODE) {
		return eventTarget.parentNode;
	}

	return eventTarget;
};


/**
 * On touch start, record the position and scroll offset.
 *
 * @param {Event} event
 * @returns {boolean}
 */
FastClick.prototype.onTouchStart = function(event) {
	'use strict';
	var targetElement, touch, selection;
	
	// Ignore multiple touches, otherwise pinch-to-zoom is prevented if both fingers are on the FastClick element (issue #111).
	if (event.targetTouches.length > 1) {
		return true;
	}

	targetElement = this.getTargetElementFromEventTarget(event.target);
	touch = event.targetTouches[0];

	
	
	if (deviceIsIOS) {

		// Only trusted events will deselect text on iOS (issue #49)
		selection = window.getSelection();
		if (selection.rangeCount && !selection.isCollapsed) {
			return true;
		}

		if (!deviceIsIOS4 && soloUI.isPhoneGap === true) {

			// Weird things happen on iOS when an alert or confirm dialog is opened from a click event callback (issue #23):
			// when the user next taps anywhere else on the page, new touchstart and touchend events are dispatched
			// with the same identifier as the touch event that previously triggered the click that triggered the alert.
			// Sadly, there is an issue on iOS 4 that causes some normal touch events to have the same identifier as an
			// immediately preceeding touch event (issue #52), so this fix is unavailable on that platform.
			if (touch.identifier === this.lastTouchIdentifier) {
				event.preventDefault();
				return false;
			}

			this.lastTouchIdentifier = touch.identifier;

			// If the target element is a child of a scrollable layer (using -webkit-overflow-scrolling: touch) and:
			// 1) the user does a fling scroll on the scrollable layer
			// 2) the user stops the fling scroll with another tap
			// then the event.target of the last 'touchend' event will be the element that was under the user's finger
			// when the fling scroll was started, causing FastClick to send a click event to that layer - unless a check
			// is made to ensure that a parent layer was not scrolled before sending a synthetic click (issue #42).
			this.updateScrollParent(targetElement);
		}
	}

	this.trackingClick = true;
	this.trackingClickStart = event.timeStamp;
	this.targetElement = targetElement;

	this.touchStartX = touch.pageX;
	this.touchStartY = touch.pageY;

	// Prevent phantom clicks on fast double-tap (issue #36)
	if ((event.timeStamp - this.lastClickTime) < this.tapDelay) {
		event.preventDefault();
	}
	
	return true;
};


/**
 * Based on a touchmove event object, check whether the touch has moved past a boundary since it started.
 *
 * @param {Event} event
 * @returns {boolean}
 */
FastClick.prototype.touchHasMoved = function(event) {
	'use strict';
	var touch = event.changedTouches[0], boundary = this.touchBoundary;

	if (Math.abs(touch.pageX - this.touchStartX) > boundary || Math.abs(touch.pageY - this.touchStartY) > boundary) {
		return true;
	}

	return false;
};


/**
 * Update the last position.
 *
 * @param {Event} event
 * @returns {boolean}
 */
FastClick.prototype.onTouchMove = function(event) {
	'use strict';
	
	if (!this.trackingClick) {
		return true;
	}

	// If the touch has moved, cancel the click tracking
	if (this.targetElement !== this.getTargetElementFromEventTarget(event.target) || this.touchHasMoved(event)) {
		this.trackingClick = false;
		this.targetElement = null;
	}
	
	
	
	return true;
};


/**
 * Attempt to find the labelled control for the given label element.
 *
 * @param {EventTarget|HTMLLabelElement} labelElement
 * @returns {Element|null}
 */
FastClick.prototype.findControl = function(labelElement) {
	'use strict';

	// Fast path for newer browsers supporting the HTML5 control attribute
	if (labelElement.control !== undefined) {
		return labelElement.control;
	}

	// All browsers under test that support touch events also support the HTML5 htmlFor attribute
	if (labelElement.htmlFor) {
		return document.getElementById(labelElement.htmlFor);
	}

	// If no for attribute exists, attempt to retrieve the first labellable descendant element
	// the list of which is defined here: http://www.w3.org/TR/html5/forms.html#category-label
	return labelElement.querySelector('button, input:not([type=hidden]), keygen, meter, output, progress, select, textarea');
};


/**
 * On touch end, determine whether to send a click event at once.
 *
 * @param {Event} event
 * @returns {boolean}
 */
FastClick.prototype.onTouchEnd = function(event) {
	'use strict';
	var forElement, trackingClickStart, targetTagName, scrollParent, touch, targetElement = this.targetElement;

	if (!this.trackingClick) {
		return true;
	}

	// Prevent phantom clicks on fast double-tap (issue #36)
	if ((event.timeStamp - this.lastClickTime) < this.tapDelay) {
		this.cancelNextClick = true;
		return true;
	}

	// Reset to prevent wrong click cancel on input (issue #156).
	this.cancelNextClick = false;

	this.lastClickTime = event.timeStamp;

	trackingClickStart = this.trackingClickStart;
	this.trackingClick = false;
	this.trackingClickStart = 0;

	
	// On some iOS devices, the targetElement supplied with the event is invalid if the layer
	// is performing a transition or scroll, and has to be re-detected manually. Note that
	// for this to function correctly, it must be called *after* the event target is checked!
	// See issue #57; also filed as rdar://13048589 .
	if (deviceIsIOSWithBadTarget) {
		touch = event.changedTouches[0];
		// In certain cases arguments of elementFromPoint can be negative, so prevent setting targetElement to null
		targetElement = document.elementFromPoint(touch.pageX - window.pageXOffset, touch.pageY - window.pageYOffset) || targetElement;
		targetElement.fastClickScrollParent = this.targetElement.fastClickScrollParent;
	}

	targetTagName = targetElement.tagName.toLowerCase();
	if (targetTagName === 'label') {
		forElement = this.findControl(targetElement);
		if (forElement) {
			this.focus(targetElement);
			if (deviceIsAndroid) {
				return false;
			}

			targetElement = forElement;
		}
	} else if (this.needsFocus(targetElement)) {

		// Case 1: If the touch started a while ago (best guess is 100ms based on tests for issue #36) then focus will be triggered anyway. Return early and unset the target element reference so that the subsequent click will be allowed through.
		// Case 2: Without this exception for input elements tapped when the document is contained in an iframe, then any inputted text won't be visible even though the value attribute is updated as the user types (issue #37).
		if ((event.timeStamp - trackingClickStart) > 100 || (deviceIsIOS && window.top !== window && targetTagName === 'input')) {
			this.targetElement = null;
			return false;
		}

		this.focus(targetElement);
		this.sendClick(targetElement, event);

		// Select elements need the event to go through on iOS 4, otherwise the selector menu won't open.
		if (!deviceIsIOS4 || targetTagName !== 'select') {
			this.targetElement = null;
			event.preventDefault();
		}

		return false;
	}

	if (deviceIsIOS && !deviceIsIOS4) {

		// Don't send a synthetic click event if the target element is contained within a parent layer that was scrolled
		// and this tap is being used to stop the scrolling (usually initiated by a fling - issue #42).
		scrollParent = targetElement.fastClickScrollParent;
		if (scrollParent && scrollParent.fastClickLastScrollTop !== scrollParent.scrollTop) {
			return true;
		}
	}
	

	// Prevent the actual click from going though - unless the target node is marked as requiring
	// real clicks or if it is in the whitelist in which case only non-programmatic clicks are permitted.
	if (!this.needsClick(targetElement)) {
		event.preventDefault();
		this.sendClick(targetElement, event);
	}

	return false;
};


/**
 * On touch cancel, stop tracking the click.
 *
 * @returns {void}
 */
FastClick.prototype.onTouchCancel = function() {
	'use strict';
	
	this.trackingClick = false;
	this.targetElement = null;
};


/**
 * Determine mouse events which should be permitted.
 *
 * @param {Event} event
 * @returns {boolean}
 */
FastClick.prototype.onMouse = function(event) {
	'use strict';

	// If a target element was never set (because a touch event was never fired) allow the event
	if (!this.targetElement) {
		return true;
	}

	if (event.forwardedTouchEvent) {
		return true;
	}

	// Programmatically generated events targeting a specific element should be permitted
	if (!event.cancelable) {
		return true;
	}

	// Derive and check the target element to see whether the mouse event needs to be permitted;
	// unless explicitly enabled, prevent non-touch click events from triggering actions,
	// to prevent ghost/doubleclicks.
	if (!this.needsClick(this.targetElement) || this.cancelNextClick) {

		// Prevent any user-added listeners declared on FastClick element from being fired.
		if (event.stopImmediatePropagation) {
			event.stopImmediatePropagation();
		} else {

			// Part of the hack for browsers that don't support Event#stopImmediatePropagation (e.g. Android 2)
			event.propagationStopped = true;
		}

		// Cancel the event
		event.stopPropagation();
		event.preventDefault();

		return false;
	}

	// If the mouse event is permitted, return true for the action to go through.
	return true;
};


/**
 * On actual clicks, determine whether this is a touch-generated click, a click action occurring
 * naturally after a delay after a touch (which needs to be cancelled to avoid duplication), or
 * an actual click which should be permitted.
 *
 * @param {Event} event
 * @returns {boolean}
 */
FastClick.prototype.onClick = function(event) {
	'use strict';
	var permitted;

	// It's possible for another FastClick-like library delivered with third-party code to fire a click event before FastClick does (issue #44). In that case, set the click-tracking flag back to false and return early. This will cause onTouchEnd to return early.
	if (this.trackingClick) {
		this.targetElement = null;
		this.trackingClick = false;
		return true;
	}

	// Very odd behaviour on iOS (issue #18): if a submit element is present inside a form and the user hits enter in the iOS simulator or clicks the Go button on the pop-up OS keyboard the a kind of 'fake' click event will be triggered with the submit-type input element as the target.
	if (event.target.type === 'submit' && event.detail === 0) {
		return true;
	}

	permitted = this.onMouse(event);

	// Only unset targetElement if the click is not permitted. This will ensure that the check for !targetElement in onMouse fails and the browser's click doesn't go through.
	if (!permitted) {
		this.targetElement = null;
	}

	// If clicks are permitted, return true for the action to go through.
	return permitted;
};


/**
 * Remove all FastClick's event listeners.
 *
 * @returns {void}
 */
FastClick.prototype.destroy = function() {
	'use strict';
	var layer = this.layer;

	if (deviceIsAndroid) {
		layer.removeEventListener('mouseover', this.onMouse, true);
		layer.removeEventListener('mousedown', this.onMouse, true);
		layer.removeEventListener('mouseup', this.onMouse, true);
	}

	layer.removeEventListener('click', this.onClick, true);
	layer.removeEventListener('touchstart', this.onTouchStart, false);
	layer.removeEventListener('touchmove', this.onTouchMove, false);
	layer.removeEventListener('touchend', this.onTouchEnd, false);
	layer.removeEventListener('touchcancel', this.onTouchCancel, false);
};


/**
 * Check whether FastClick is needed.
 *
 * @param {Element} layer The layer to listen on
 */
FastClick.notNeeded = function(layer) {
	'use strict';
	var metaViewport;
	var chromeVersion;

	// Devices that don't support touch don't need FastClick
	if (typeof window.ontouchstart === 'undefined') {
		return true;
	}

	// Chrome version - zero for other browsers
	chromeVersion = +(/Chrome\/([0-9]+)/.exec(navigator.userAgent) || [,0])[1];

	if (chromeVersion) {

		if (deviceIsAndroid) {
			metaViewport = document.querySelector('meta[name=viewport]');

			if (metaViewport) {
				// Chrome on Android with user-scalable="no" doesn't need FastClick (issue #89)
				if (metaViewport.content.indexOf('user-scalable=no') !== -1) {
					return true;
				}
				// Chrome 32 and above with width=device-width or less don't need FastClick
				if (chromeVersion > 31 && window.innerWidth <= window.screen.width) {
					return true;
				}
			}

		// Chrome desktop doesn't need FastClick (issue #15)
		} else {
			return true;
		}
	}

	// IE10 with -ms-touch-action: none, which disables double-tap-to-zoom (issue #97)
	if (layer.style.msTouchAction === 'none') {
		return true;
	}

	return false;
};


/**
 * Factory method for creating a FastClick object
 *
 * @param {Element} layer The layer to listen on
 * @param {Object} options The options to override the defaults
 */
FastClick.attach = function(layer, options) {
	'use strict';
	return new FastClick(layer, options);
};


if (typeof define !== 'undefined' && define.amd) {

	// AMD. Register as an anonymous module.
	define(function() {
		'use strict';
		return FastClick;
	});
} else if (typeof module !== 'undefined' && module.exports) {
	module.exports = FastClick.attach;
	module.exports.FastClick = FastClick;
} else {
	window.FastClick = FastClick;
}
/**
 * Every component in the UI follows the same general patterns. This is to keep consistency and make coding easier.
 * <br><br><b>NOTE: The core component is an abstract base class and cannot be created as an instance on its own</b>
 * @namespace
 * @name CoreComponent
 * @memberof $ui
 * @property {namespace} component - The <b>mandatory</b> component property defines what type of component is being defined. This property always starts with a <b>$ui.</b> defining the component to be used for generating the UI.
 * @property {string} [id] - The id property is used to uniquely define the control in the screen for which it belongs. <br><br>Providing an id for your control is very convenient because you can easily access your control through your javascript coding. Each id is added as a direct handle on the screen object for access.
 * @property {boolean} [animated=false] - Set this value to <b>true</b> for the control to have animation.  NOTE: Each derivative control is responsible for their animation styling. Setting this property to true will add the ".animated" CSS class to the root element of the control.  Feel free to define your own CSS for the ".animated" property
 * @property {boolean} [visible=true] - The visible property specifies the visibility of the control. 
 * @property {boolean} [enabled=true] - The enabled property specifies the initial enabled state of the control.  <i>NOTE: Not all controls will render a disabled state. If you wish to render a disabled state simply override the ".disabled" CSS for the root of your control</i>
 * @property {$ui.CoreScreen} screen - This <b>readonly</b> property allows for you to reference the screen from the control. This will be the screen in which the control is embedded
 * @property {$ui.DataProviderLink} [provider] - This property allows you to bind the control to a [data provider]{@link $ui.DataProvider} in the application. 
 * @property {object[]} attachedObjects - This property specifies an array of objects that can be attached to the control. These could be objects such as data providers and usually entail a component that does not provide a user interface.
 * @property {boolean} [marginTop=false] - A boolean property which when set to true will place a standard margin on the top of the control. 
 * @property {boolean} [marginBottom=false] - A boolean property which when set to true will place a standard margin on the bottom of the control.
 * @property {boolean} [marginLeft=false] - A boolean property which when set to true will place a standard margin on the left of the control
 * @property {boolean} [marginRight=false] - A boolean property which when set to true will place a standard margin on the right of the control.
 */
function $ui_CoreComponent(object, screen) {
	if (object) {
		this.object = object;
		// The protected object is where we store our dynamic object variables
		object._protected = {
			model: object
		};
		
		// Create our base container for the control 
		object.dom = document.createElement('div');
		object.dom.model = object;
		$ui.addClass(object.dom, 'ui-core-component');
		
		// Assign our control name for automation & analytics
		if (object.id) {
			object.dom.setAttribute('data-id',object.id);
		}
		
		// Component Property
		object._protected.component = object.component;
		Object.defineProperty(object, 'component', {
			get: function() {return this._protected.component;},
			set: function() {
				console.log($ui._protected.PROPERTY_WARNING.replace('[prop]','component'));
			},
			configurable: false}
		);
		
		// Screen Property
		if (screen != undefined) {
			object.screen = screen;
			screen.children.push(object);
			if (object.id) {
				screen[object.id] = object;
			}
		}
		object._protected.screen = object.screen;
		Object.defineProperty(object, 'screen', {
			get: function() {return this._protected.screen;},
			set: function() {
				console.log($ui._protected.PROPERTY_WARNING.replace('[prop]','screen'));
			},
			configurable: false}
		);
		
		// Apply our current theme style
		if ($ui.theme.rootClass) {
			$ui.addClass(object.dom,$ui.theme.rootClass);
		}
		
		// id property
		object._protected.id = object.id;
		Object.defineProperty(object, 'id', {
			get: function() {return this._protected.id;},
			set: function() {
				console.log($ui._protected.PROPERTY_WARNING.replace('[prop]','id'));
			},
			configurable: false}
		);
		
		// Enabled Property
		if (object.enabled != false) {
			object.enabled = true;
		} else {
			$ui.addClass(object.dom, 'disabled');
		}
		object._protected.enabled = object.enabled;
		Object.defineProperty(object, 'enabled', {
			get: function() {return this._protected.enabled;},
			set: function(value) {
				if (value == this._protected.enabled) return;
				if (this._protected.enabled && (value == false)) {
					this._protected.enabled = false;
					$ui.addClass(this.dom, 'disabled');
				} else if ((this._protected.enabled == false) && (value == true)) {
					this._protected.enabled = true;
					$ui.removeClass(this.dom, 'disabled');
				}
				// Call a child class' protected function if they need
				// to do special handling for enabling
				if (this._setEnabled) {
					this._setEnabled(value);
				}
			},
			configurable: false}
		);		

		
		// Animated property
		if (object.animated == true) {
			$ui.addClass(object.dom, 'animated');
		} else {
			object.animated = false;
		}
		object._protected.animated = object.animated;
		Object.defineProperty(object, 'animated', {
			get: function() {return this._protected.animated;},
			set: function() {
				console.log($ui._protected.PROPERTY_WARNING.replace('[prop]','animated'));
			},
			configurable: false}
		);
		
		// Set our initial visibility
		if ((object.visible != undefined) && (object.visible == false)) {
			object.dom.style.display = 'none';
		} else {
			object.visible = true;
		}
		object._protected.visible = object.visible;
		// Set our modification rules for 'visible'
		Object.defineProperty(object, 'visible', {
			get: function() {return this._protected.visible;},
			set: function(value) {
				if (value != this._protected.visible) {
					if (value == true) {
						this._protected.visible = true;
						if (this.dom != undefined) {
							this.dom.style.display = '';
						}
					} else {
						this._protected.visible = false;
						if (this.dom != undefined) {
							this.dom.style.display = 'none';
						}
					}
					// Allow of the top level control to also react to the visibility change
					if (this._setVisible) {
						this._setVisible(value);
					}
				} 
			},
			configurable: false}
		);
		
		// Margin Top Property
		if (object.marginTop === true) {
			$ui.addClass(object.dom,'marginTop');
		} else {
			object.marginTop = false;
		}
		object._protected.marginTop = object.marginTop;
		Object.defineProperty(object, 'marginTop', {
			get: function() {return this._protected.marginTop;},
			set: function(value) {
				if (value == this._protected.marginTop) return;
				this._protected.marginTop = value;
				if (value == false) {
					$ui.removeClass(object.dom,'marginTop');
				} else {
					$ui.addClass(object.dom,'marginTop');
				}
			},
			configurable: false}
		);
		
		// Margin Bottom Property
		if (object.marginBottom === true) {
			$ui.addClass(object.dom,'marginBottom');
		} else {
			object.marginBottom = false;
		}
		object._protected.marginBottom = object.marginBottom;
		Object.defineProperty(object, 'marginBottom', {
			get: function() {return this._protected.marginBottom;},
			set: function(value) {
				if (value == this._protected.marginBottom) return;
				this._protected.marginBottom = value;
				if (value == false) {
					$ui.removeClass(object.dom,'marginBottom');
				} else {
					$ui.addClass(object.dom,'marginBottom');
				}
			},
			configurable: false}
		);
		
		// Margin Left Property
		if (object.marginLeft === true) {
			$ui.addClass(object.dom,'marginLeft');
		} else {
			object.marginLeft = false;
		}
		object._protected.marginLeft = object.marginLeft;
		Object.defineProperty(object, 'marginLeft', {
			get: function() {return this._protected.marginLeft;},
			set: function(value) {
				if (value == this._protected.marginLeft) return;
				this._protected.marginLeft = value;
				if (value == false) {
					$ui.removeClass(object.dom,'marginLeft');
				} else {
					$ui.addClass(object.dom,'marginLeft');
				}
			},
			configurable: false}
		);
		
		// Margin Right Property
		if (object.marginRight === true) {
			$ui.addClass(object.dom,'marginRight');
		} else {
			object.marginRight = false;
		}
		object._protected.marginRight = object.marginRight;
		Object.defineProperty(object, 'marginRight', {
			get: function() {return this._protected.marginRight;},
			set: function(value) {
				if (value == this._protected.marginRight) return;
				this._protected.marginRight = value;
				if (value == false) {
					$ui.removeClass(object.dom,'marginRight');
				} else {
					$ui.addClass(object.dom,'marginRight');
				}
			},
			configurable: false}
		);
		
		// Attached Objects Property
		if (object.attachedObjects) {
			var i,
				control,
				controlDom,
				targetScreen = (object.screen != undefined) ? object.screen : object; // The only control without a screen is a screen
			for (i = 0; i < object.attachedObjects.length; i++) {
				control = object.attachedObjects[i];
				controlDom = $ui.createControl(control, targetScreen);
				// If this control needs to be in the DOM add it
				if (controlDom instanceof HTMLElement) {
					object.dom.appendChild(controlDom);
				}
			}
		} else {
			object.attachedObjects = [];
		}
		object._protected.attachedObjects = object.attachedObjects;
		Object.defineProperty(object, 'attachedObjects', {
			get: function() {return this._protected.attachedObjects;},
			set: function(value) {
				console.log($ui._protected.PROPERTY_WARNING.replace('[prop]','attachedObjects'));
			},
			configurable: false}
		);
		
		/** 
		 * This protected function will raise an interaction event for the <b>oninteraction</b> callback assigned to the {@link $ui} object.
		 * @memberof $ui.CoreComponent
		 * @protected 
		 * @function _raiseInteractionEvent
		 * @param {string} interaction - Desired interaction to raise
		 */
		object._raiseInteractionEvent = function(interaction) {
			var event = new InteractionEvent(this.screen.id, this.id, interaction, this.component);
			$ui._raiseInteractionEvent(event);
		}
		object._raiseInteractionEvent = object._raiseInteractionEvent.bind(object);
		
		
		// Private function to animate scrolling the control into view 
		object._scrollIntoView = function() {
			var step = 20,
				rect = this.dom.getBoundingClientRect(),
				scrollArea = (this.tab != undefined) ? this.tab.dom.content : this.screen.dom.content;
				
			this._scrollIterationCounter = this._scrollIterationCounter + 1;
			// See if it has reached the top of the screen
			if (rect.top == scrollArea.offsetTop) { 
				return;
			}
			
			// If the bottom and top of the control is visible
			if ((rect.bottom < (scrollArea.offsetTop + scrollArea.offsetHeight)) && (rect.top > scrollArea.offsetTop)) {
				return;
			}
				
			if (rect.top > scrollArea.offsetTop) { // Need to scroll down
				if (rect.top - scrollArea.offsetTop < step) {
					step = 1;
				}
				scrollArea.scrollTop = scrollArea.scrollTop + step;
			} else { // Need to scroll up
				if (scrollArea.offsetTop - rect.top < step) {
					step = 1;
				}
				scrollArea.scrollTop = scrollArea.scrollTop - step;
			}
			
			if (this._scrollIterationCounter > 100) { // Equivalent to moving something 2000 pixels
				console.log('fail safe scroll counter exceeded');
				return;
			}
			requestAnimationFrame(this._scrollIntoView);
		}
		object._scrollIntoView = object._scrollIntoView.bind(object);
		
		/** 
		 * This function will scroll the control into view for the user.
		 * @memberof $ui.CoreComponent
		 * @function scrollIntoView
		 */
		object.scrollIntoView = function() {
			if (this.dom) {
				this._scrollIterationCounter = 0;
				requestAnimationFrame(this._scrollIntoView);
			}
		}
		object.scrollIntoView = object.scrollIntoView.bind(object);
		
		// Public base destructor for the component
		object.destroy = function() {	
			// Call private destructor of control if it is there
			if (object._destroy) {
				object._destroy();
			}
			// Remove the provider listener
			if (this.provider != undefined) {
				if (this.provider.id != undefined) {
					window.removeEventListener(this.screen.guid+'-'+this.provider.id+'-updated', this._providerRefresh, false);
				}
			}	
			// Clean-up any attached objects
			var i,
				attachedObject;
			if (this.attachedObjects && this.attachedObjects.length > 0) {
				for (i = 0; i < this.attachedObjects.length; i++) {
					attachedObject = this.attachedObjects[i];
					if (attachedObject._destroy) {
						attachedObject._destroy();
					}
				}
			}
			this.dom = undefined;
		}
		object.destroy = object.destroy.bind(object);
		
		// Handle a provider update
		object._providerRefresh = function() {
			// Find the data provider
			var dataProvider = this.screen[this.provider.id];
			if (dataProvider != undefined) {
				// Make sure it has some data assigned to it
				if (dataProvider.data != undefined) {
					var properties = this.provider.property.split('.'),
						i,
						data = dataProvider.data,
						found = true;
					// traverse it's hierarchy for our data value	
					for (i = 0; i < properties.length; i++) {
						data = data[properties[i]];
						if (data == undefined) {
							found = false;
							break;
						}
					}
					if (found) {
						if (this._providerUpdate) {
							this._providerUpdate(data);
						}
						return;
					}
				} else {
					// If there was data we would not reach this point other wise it is undefined
					// so we have to check to see if it is an initial load so that we don't trigger 
					// the control's update unnecessarily 
					if (!dataProvider._untouched && this._providerUpdate) {
						this._providerUpdate(undefined);
					}
				}
			} 
		}
		object._providerRefresh = object._providerRefresh.bind(object);
		
		
		// This function will update the provider data source with new data from the control
		object._updateData = function(value) {
			// Find the data provider
			var dataProvider = (this.provider == undefined) ? undefined : this.screen[this.provider.id];
			if (dataProvider != undefined) {
				// Make sure it has some data assigned to it
				if (dataProvider.data != undefined) {
					var properties = this.provider.property.split('.'),
						i,
						data = dataProvider.data,
						currentValue;
					// traverse it's hierarchy for our data value	
					for (i = 0; i < properties.length; i++) {
						currentValue = data[properties[i]];
						if ((currentValue == undefined) && (i < (properties.length -1))) {
							break;
						} else if (i == (properties.length -1)) {
							data[properties[i]] = value;
							break;
						}
						data = currentValue;
					}
				}
			}
		}
		object._updateData = object._updateData.bind(object);
		
		// Data Provider Property
		if (object.provider != undefined) {
			if (object.provider.id != undefined) {
				// unique event listener for this provider on this screen
				window.addEventListener(object.screen.guid+'-'+object.provider.id+'-updated', object._providerRefresh, false);
				// Evaluate our bindings 
				object._providerRefresh();
			}
		}
		object._protected.provider = object.provider;
		Object.defineProperty(object, 'provider', {
			get: function() {return this._protected.provider;},
			set: function(value) {
				console.log($ui._protected.PROPERTY_WARNING.replace('[prop]','provider'));
			},
			configurable: false}
		);
	}
}

/** 
 * The function assigned to this member will fire when the screen the component belongs to receives an onshow event. This is an <b>internal protected</b> member to be used by derivative controls and should not be bound to by application code
 * @name _onshow
 * @memberof $ui.CoreComponent
 * @protected
 * @type {function} 
 */
 
 /** 
 * The function assigned to this member will fire when the theme for the $ui tookit changes. This is an <b>internal protected</b> member to be used by derivative controls and should not be bound to by application code
 * @name _onthemechange
 * @memberof $ui.CoreComponent
 * @protected
 * @type {function} 
 */
 
/** 
 * The function assigned to this member will fire when the screen that the component belongs to has it's viewport size changed. This is an <b>internal protected</b> member to be used by derivative controls and should not be bound to by application code
 * @name _onresize
 * @memberof $ui.CoreComponent
 * @protected
 * @type {function} 
 */

/** 
 * The function assigned to this member will fire when the screen that the component belongs to is just about to be popped. This will only fire if the screen is the top most screen in the stack. It allows for any clean-up that might need to be done before animating. This is an <b>internal protected</b> member to be used by derivative controls and should not be bound to by application code
 * @name _onbeforepop
 * @memberof $ui.CoreComponent
 * @protected
 * @type {function} 
 */

/**
 * This is the abstract base class that represents a screen instance. It derives from {@link $ui.CoreComponent}. 
 * A screen is declared as a JavaScript function and has various different properties. When a screen is pushed onto the stack a new instance of the screen will be created and rendered.<br><br>
 * If a derivative screen is using the <b>animated</b> property to animate a screen transition to show the screen, it must also provide a reverse animation effect within its <b>_onbeforepop</b> event.
 * <br><br><b>NOTE: This is an abstract class </b>
 * @namespace
 * @name CoreScreen
 * @memberof $ui
 * @extends $ui.CoreComponent 
 * @property {GenericEvent} [onresize] - This event will fire when the viewport of the screen changes size
 * @property {GenericEvent} [onshow] - This event will fire when the screen has been displayed
 * @property {GenericEvent} [ondestroy] - This event will fire when the screen is about to be destroyed. Allowing for any memory clean-up routines
 */
function $ui_CoreScreen(object, data) {
	$ui_CoreComponent.call(this, object);
	if (object) {
		object.data = data;
		object.guid = $ui.guid();
		object.children = []; // Contains all child controls in the screen
		$ui.addClass(object.dom,'ui-core-screen');
		
		/**
		* Protected internal function for derivative screens to implement if they have specific functionality they wish to
		* do when the screen initializes.  This function will fire just before the <b>onshow</b> event is triggered for the screen.
		* @function _intitialize
		* @memberof $ui.CoreScreen
		* @protected
		*/
		
		// Initialize the screen
		object.initialize = function() {
			$ui._protected.inScreenTransition = false;
			$ui._blockAllTapEvent(false);
			// See if there is an internal implementation of _initialize
			if (this._initialize) {
				this._initialize();
			}
			// Raise our onshow event
			if (this.onshow) {
				this.onshow(this.data);
			}
			// Fire the _onshow for all the controls
			var i,
				control;
			for (i = 0; i < this.children.length;i++) {
				control = this.children[i];
				if (control._onshow) {
					control._onshow();
				}
			}
		}
		object.initialize = object.initialize.bind(object);
		
		// Internal Resize event
		object._onresize = function() {
			// Fire the _onresize for all the controls
			var i,
				control;
			for (i = 0; i < this.children.length;i++) {
				control = this.children[i];
				if (control._onresize) {
					control._onresize();
				}
			}
		}
		object._onresize = object._onresize.bind(object);
		
		// Internal before pop event
		object.onbeforepop = function() {
			if (this._onbeforepop) {
				this._onbeforepop();
			}
			// Fire the _onbeforepop for all the controls
			var i,
				control;
			for (i = 0; i < this.children.length;i++) {
				control = this.children[i];
				if (control._onbeforepop) {
					control._onbeforepop();
				}
			}
		}
		object.onbeforepop = object.onbeforepop.bind(object);
		
		// Internal function to trigger all theme change internal assignments
		object._fireThemeChange = function() {
			if (this._onthemechange) {
				this._onthemechange();
			}
			// Fire the _onthemechange for all the controls
			var i,
				control;
			for (i = 0; i < this.children.length;i++) {
				control = this.children[i];
				if (control._onthemechange) {
					control._onthemechange();
				}
			}
		}
		object._fireThemeChange = object._fireThemeChange.bind(object);
		
		// Destroy screen
		object._destroy = function() {
			if (this.ondestroy) {
				this.ondestroy();
			}
			// Loop through all the children and call their destroy
			var i;
			for (i = 0; i < this.children.length; i++) {
				this.children[i].destroy();
			}
		}
		object._destroy = object._destroy.bind(object);
		
		return object.dom;
	}
}

$ui_CoreScreen.prototype = new $ui_CoreComponent();

/**
 * The DataProvider component provides a data source that can be bound to controls on a screen. This provides the ability to both populate controls with data, as well as automatically save the data based on user interaction with the controls.<br><br>
 * <b>NOTE: The DataProvider should be attached to a screen or control using its [attachedObjects]{@link $ui.CoreComponent} property.</b><br><br>
 * <b>Sample Declaration</b>
 * <pre>
 * {
 *   component: $ui.DataProvider,
 *   id: 'myProvider',
 *   data: {
 *      account: {
 *         username: '@brcewane' 
 *      }
 *   }
 *}
 * </pre>
 * @namespace
 * @name DataProvider
 * @memberof $ui
 * @property {string} component - The <b>required</b> component property defines what type of component is being defined. This property must be $ui.DataProvider
 * @property {string} id - The <b>required</b> id property is used to uniquely define the data provider in the scope of the screen in which it belongs. Providing an id for your data provider is required because you can easily access your provider through your javascript coding and also reference it as the provider for a control.
 * @property {object} [data] - The data property by default is undefined. You can populate the data property by calling the load or set functions listed in the functions area, or you can define it as any kind of object. The data property holds the object that represents the data for the provider
 * @property {GenericEvent} [onload] - This event will fire when the data has been successfully loaded into the provider and controls have been updated
 * @property {GenericEvent} [onbeforeupdate] - This event will fire when the data property has been successfully set, but has not yet been used to update any controls connected to the provider. This gives you an opportunity to manipulate the data property of the data provider <b>before</b> controls are updated
 */
function $ui_DataProvider(object, screen){
	object.screen = screen;
	object._url = undefined;
	object._parameters = undefined;
	object._untouched = true;
	
	// Attach the ID to the main screen object
	if (object.id && screen) {
		screen[object.id] = object;
	}
	
	/** 
	 * You can set the data property for any data provider directly by passing it an object that you want to use as the data source. Setting this property will trigger the <i>onbeforeupdate</i>, <i>onloaded</i> event and update the controls which are using this provider
	 * @function setData
	 * @memberof $ui.DataProvider
	 * @param {object} value - Object to set as data for the data provider
	 */
	object.setData = function(value) {
 		this._untouched = false;
		this.data = value;
		if (this.onbeforeupdate) {
			this.onbeforeupdate();
		}
		this._raiseEvent();
		if (value == undefined) return;
		if (this.onload) {
			this.onload();
		}
	}
	object.setData = object.setData.bind(object);
	
	/** 
	 * The refresh function will send a signal out to all connected components to refresh their data from the current content in memory from the provider. <b>NOTE: No <i>onbeforeupdate</i> or <i>onload</i> event will fire on the provider</b>
	 * @function refresh
	 * @memberof $ui.DataProvider
	 */
	object.refresh = function() {
		this._raiseEvent();
	}
	object.refresh = object.refresh.bind(object);
	
	// Raise our event to let the rest of the app know to refresh
	object._raiseEvent = function() {
		var evt = document.createEvent('Events');
		evt.initEvent(this.screen.guid+'-'+this.id+'-updated', true, true);
		window.dispatchEvent(evt);
	}
	object._raiseEvent = object._raiseEvent.bind(object);
	
	// Private function to handle clean-up
	object._destroy = function() {
		this.data = undefined;
	}
	object._destroy = object._destroy.bind(object);
	
	// See if the data was pre-defined
	if (object.data != undefined) {
		if (object.onbeforeupdate) {
			object.onbeforeupdate();
		}
		if (object.onload) {
			object.onload();
		}
	}
	
	return undefined;
}

/**
 * A data provider link provides a binding between a [control]{@link $ui.CoreComponent} and a data provider. The path for the <b>property</b> attribute starts at the root of the object that is provided as the data source for the data provider.<br><br>
 * The type of object that the property path should point to is dependent on the control and the data it uses to display and/or edit. If the control also allows the user to edit data or change settings, these changes will be applied to the property value in the data provider.<br><br>
 * <b>Sample Code:</b><br>
 * <pre>provider: {
 *    id: 'myProvider',
 *    property: 'posts'
 * }
 * </pre>
 * <br>
 * To access sub objects in the object chain from the data provider you can use normal <b>dot</b> notation:<br><br>
 * <b>Sample Code:</b><br>
 * <pre>provider: {
 *    id: 'myProvider',
 *    property: 'posts.item.thingy'
 * }
 * </pre>
 * <br>
 * @namespace
 * @name DataProviderLink
 * @memberof $ui
 * @property {string} id - This is the <b>mandatory</b> id of the data provider belonging to the screen which will be linked to this control.  
 * @property {string} property - This is the property path/name of the object to be used as the bound data for this control. A nested property can be defined simply by providing a path using <b>.</b> dot separators just like you were referring to the object via JavaScript
 */
 
 

/**
 * Represents an interaction event from the user interface.  This event is raised when a user interacts with a part of the interface. All interation events are sent to the $ui.oninteraction 
 * assigned function.  If valid values are not passed in for all of the parameters no event will be raised.
 * @class InteractionEvent
 * @param {string} screenId - The <b>id</b> property of the screen which contains the control providing the interaction
 * @param {string} controlID - The <b>id</b> property of the control in which the user interacted
 * @param {string} interaction - The interaction which took place
 * @param {object} component - The component type definition for which this interaction took place.   An example could be the value $ui.List.  This is <b>not</b> a pointer to the control.
 */
function InteractionEvent(screenId, controlId, interaction, component) {
	/**
	 * The <b>id</b> property of the screen which contains the control providing the interaction
	 * @member {string} screenId
	 * @memberOf InteractionEvent
	 */
	this.screenId = screenId;
	
	 /**
	 * The <b>id</b> property of the control in which the user interacted
	 * @member {string} controlId
	 * @memberOf InteractionEvent
	 */
	this.controlId = controlId;
	
	 
	 /**
	 * The interaction which took place
	 * @member {string} interaction
	 * @memberOf InteractionEvent
	 */
	this.interaction = interaction;
	
	/**
	 * The component type definition for which this interaction took place.  An example could be the value $ui.List.  This is <b>not</b> a pointer to the control
	 * @member {object} component
	 * @memberOf InteractionEvent
	 */
	this.component = component;
}


 


/**
 * A List object will display multiple list items based on the data provided to the control.  The type of item objects that are used should match the declaration of the <b>style</b> of the list control<br><br>
 * <b>Sample Declaration</b><br>
 * <pre>
 * {
 *   component: $ui.List,
 *   style: $ui.GenericListItem,
 *   items: [
 *      {
 *         img: 'thumbnails/foo.png',
 *         title: 'This is my title',
 *         accent: '6 hours ago',
 *         caption: 'My summary description'
 *      }
 *   ]
 *}
 * @namespace
 * @name List
 * @memberof $ui
 * @extends $ui.CoreComponent
 * @property {object[]} [items] - The items property is an array of objects who's definition matches that of the requirements of the <b>style</b> property of the list
 * @property {object} style - This is a list item decalaration so that the list knows how to render. For example this could be set to {@link $ui.GenericListItem}
 * @property {$ui.DataProviderLink} [provider] - The type of data provider value for a list control should point to a property in the data provider that would follow the same rules as hard coding an array of items.
 * @property {ListActionEvent} [onaction] - The onaction event will fire when an action from a list item is triggered. Some list items may have multiple actions that can be taken. When one of these actions is selected by the user the onaction event will fire.
 */
function $ui_List(object, screen) {
	$ui_CoreComponent.call(this, object, screen);
	$ui.addClass(object.dom,'ui-list');
	
	// Set our initial properties that can be modified
	if (object.items) {
		object._original.items = [];
		for (var i = 0; i < object.items.length; i++) {
			object._original.items.push(object.items[i]);
		}
	}

	// Broker the onaction from a list item
	object._onaction = function(item, event) {
		if (this.onaction) {
			this.onaction(event);
		}
	}
	object._onaction = object._onaction.bind(object);
	
	// Create the DOM for a list item depending on the list type
	object._createItemDom = function(item) {
		var dom;
		// See if the item is a header
		if (item.component && (item.component == $ui.Header)) {
			dom = $ui.createControl(item,this.screen);
		} else if (this._itemConstructor != undefined) {
			dom = new this._itemConstructor(item,this.screen);
		}
		return dom;
	}
	object._createItemDom = object._createItemDom.bind(object);
	
	// Private function to add a new item to the list
	object._addItem = function(item) {
		item.parent = this;
		itemDom = this._createItemDom(item);
		if (itemDom) {
			this.dom.appendChild(itemDom);
			if (item._onafterinsert) {
				item._onafterinsert();
			}
			return true;
		} else {
			return false;
		}
	}
	object._addItem = object._addItem.bind(object);
	
	/** 
	 * You can add an item to the end of the list by calling the addItem function and passing in an object that matches the a list item
	 * @function addItem
	 * @memberof $ui.List
	 * @param {object} item - Item to be added to the list
	 */
	object.addItem = function(item) {
		if (this._addItem(item)) {
			this.items.push(item);
			// if there is data provider, add the item to provider
			if (this._providerItems != undefined) {
				this._providerItems.push(item);
			}
			return true;
		} else {
			return false;
		}
	}
	object.addItem = object.addItem.bind(object);
	
	/** 
	 * The remove item function will remove an existing item from a list. If an invalid item is specified the removal will fail
	 * @function removeItem
	 * @memberof $ui.List
	 * @param {object} item - Item to be removed from the list
	 */
	object.removeItem = function(item) {
		if (item == undefined) return false;
		var index = this.items.indexOf(item);
		if (index < 0) return false;
		try {
			this.dom.removeChild(item.dom);
		} catch (ex) {
			console.log('$ui.List: ' + ex);
		}
		this.items.splice(index, 1);
		// See if we have items on a provider that we should remove
		if (this._providerItems != undefined) {
			this._providerItems.splice(index, 1);
		}
		if (item._destroy) {
			item._destroy();
		}
	}
	object.removeItem = object.removeItem.bind(object);
	
	/** 
	 * Insert item works similar to addItem but instead will insert the item into the list at the index specified. If an invalid index is specified it will result in failure to insert the item. To insert an item at the top of a list call insert with the index of 0.
	 * @function insertItem
	 * @memberOf $ui.List
	 * @param {object} item - Item to be inserted into the list
	 * @param {number} index - Index to insert the item
	 */
	object.insertItem = function(item, index) {
		item.parent = this;
		if (index < 0) {
			return false;
		} else if (this.items.length == 0) {
			this.addItem(item);
			return true;
		} else if (index > this.items.length - 1) {
			this.addItem(item);
			return true;
		} else { // Insert it at the index
			var existingItem = this.items[index],
				itemDom = this._createItemDom(item);
			this.items.splice(index, 0, item);
			this.dom.insertBefore(itemDom, existingItem.dom);
			// if there is data provider, insert the item to provider
			if (this._providerItems != undefined) {
				this._providerItems.splice(index, 0, item);
			}
			return true;
		} 
		return false;
	}
	object.insertItem = object.insertItem.bind(object);
	
	/** 
	 * You can refresh all the items in a list by calling the refreshItems function with an array of new items
	 * @function refreshItems
	 * @memberof $ui.List
	 * @param {object[]} items - Array of items to refresh the list
	 */
	object.refreshItems = function(itemArray) {
		if (itemArray == undefined) return; // No data provided
		var i,
			item;
		if (this.items) {
			// Remove all existing items first
			for (i = this.items.length - 1; i >= 0; i--) {
				item = this.items[i];
				try {
					this.dom.removeChild(item.dom);
				} catch (ex) {
					console.log('$ui.List: ' + ex);
				}
				this.items.pop();
				if (item._destroy) {
					item._destroy();
				}
			}
			// See if there is data from provider, and make it blank.
			if (this._providerItems != undefined) {
				this._providerItems = [];
			}
		}
		this.addItemBatch(itemArray);
	}
	object.refreshItems = object.refreshItems.bind(object);
	
	/** 
	 * This function is much like the refreshItems function but instead it loads a list of circle list items to the end of the current list and does not replace the existing list items.
	 * @function addItemBatch
	 * @memberof $ui.List
	 * @param {object[]} items - Array of items to be added to the list
	 */
	object.addItemBatch = function(itemArray) {
		var i,
			item;
		if (!this.items) {
			this.items = [];
		}
		// Add all new items into the list
		for (i = 0; i < itemArray.length; i++) {
			item = itemArray[i];
			this.addItem(item);
		}
	}
	object.addItemBatch = object.addItemBatch.bind(object);
	
	// Private function to handle provider updates
	object._providerUpdate = function(value) {
		this.refreshItems(value);
		this._providerItems = value;
	}
	object._providerUpdate = object._providerUpdate.bind(object);
	
	
	var i,
		extension;
	// Determine our item constructor
	for (i = 0; i < $ui._protected.definitions.length; i++) {
		extension = $ui._protected.definitions[i];
		if (extension.type != $ui.UIExtensionType.LISTITEM) continue;
		if (extension.component == object.style) {
			object._itemConstructor = extension.constructor;
			break;
		}
	}

	// Cycle through list items
	var	item,
		index;
	if (object.items) {
		for (i = 0; i < object.items.length; i++) {
			item = object.items[i];
			object._addItem(item);
		}
	} else {
		object.items = [];
	}
	
	return object.dom;
}

$ui_List.prototype = new $ui_CoreComponent();

/**
 * The {@link $ui.List} <b>onaction</b> event will fire when the user interacts with a list item
 * @callback ListActionEvent
 * @param {ListEvent} event - The list event which was raised
 */
/**
 * The list event is what is triggered when a user interacts with the List control. It contains the target list item that the user was interacting with, the type of event which was triggered 
 * and an optional data property that contains extra data about the event.
 * @class ListEvent
 * @param {object} target - Target list item where the event originated
 * @param {string} eventType - The type of event that was triggered. Each list item has its own set of possible events that can be raised
 * @param {object} [data] - Optional data that can be passed with a list event
 */
function ListEvent(target, eventType, data) {
	/** 
	 * Target list item where the event originated
	 * @member {object} target
	 * @memberOf ListEvent
	 */
	this.target = target;
	
	/** 
	 * The type of event that was triggered. Each list item has its own set of possible events that can be raised
	 * @member {string} eventType
	 * @memberOf ListEvent
	 */
	this.eventType = eventType;
	
	/** 
	 * Optional data that can be passed with a list event
	 * @member {object} [data]
	 * @memberOf ListEvent
	 */
	this.data = data;
}


/**
 * The spinner control provides you the ability to give a visual indicator when your content is loading. The spinner has one main property <b>size</b>. <br><br>
 * <b>Sample Declaration</b><br>
 * <pre>
 * {
 *   component: $ui.Spinner,
 *   size: $ui.Spinner.SpinnerSize.LARGE
 *}
 * @namespace Spinner
 * @memberof $ui
 * @extends $ui.CoreComponent
 * @property {$ui.Size} [size=$ui.Size.NORMAL] - Represents the size of the spinner component.
 * @property {$ui.Spinner.SpinnerColor} [forceColor] - This property specifies if the color should be forced to be dark or light. By default the system figures this out and does not need to be set. However, if you want to force a color in a certain scenario you can use this property.
 */
function $ui_Spinner(object, screen){
	$ui_CoreComponent.call(this, object, screen);
	object.size = (object.size) ? object.size : $ui.Size.NORMAL;
	$ui.addClass(object.dom, 'ui-spinner')
	$ui.addClass(object.dom, object.size);
	$ui.addClass(object.dom, 'center');
	
	// Create the inner div
	object.dom.innerDiv = document.createElement('div');
	$ui.addClass(object.dom.innerDiv, 'inner');
	object.dom.appendChild(object.dom.innerDiv);
	
	// Check our coloring
	if (object.forceColor) {
		$ui.addClass(object.dom.innerDiv, object.forceColor);
	} else {
		if ($ui.theme.rootClass && $ui.theme.rootClass.indexOf('ui-theme-dark') > -1)  {
			$ui.addClass(object.dom.innerDiv, 'light');
		} else {
			$ui.addClass(object.dom.innerDiv, 'dark');
		}
	}

	return object.dom
}

$ui_Spinner.prototype = new $ui_CoreComponent();
/**
 * The definition of an extension to be used in extending the <b>$ui</b> framework.
 * @class
 * @param {string} name - This would be the value you set as the <b>component</b> property for your control
 * @param {function} constructor - The function to be used as your control constructor
 * @param {$ui.UIExtensionType} [type=$ui.UIExtensionType.CONTROL] - The type of extension you are registering
 * @param {object} [definition] - Class definition for your extension, you can include properties such as constants here
 */
function UIExtension(name, constructor, type, definition) {
	/** 
	 * This would be the value you set as the <b>component</b> property for your control
	 * @member {string} name
	 * @memberOf UIExtension
	 */
	if (name == null) throw new Error('UIExtension: name cannot be null');
	if (name == undefined) throw new Error('UIExtension: name cannot be undefined');
	this.name = name;
	/** 
	 * The function to be used as your control constructor
	 * @member {function} constructor
	 * @memberOf UIExtension
	 */
	if (constructor == null) throw new Error('UIExtension: constructor cannot be null');
	if (constructor == undefined) throw new Error('UIExtension: constructor cannot be undefined');
	this.constructor = constructor;
	/** 
	 * The type of extension you are registering
	 * @member {$ui.UIExtensionType} [type=$ui.UIExtensionType.CONTROL]
	 * @memberOf UIExtension
	 */
	if (type == null || type == undefined) {
		this.type = $ui.UIExtensionType.CONTROL;
	} else if ((type != $ui.UIExtensionType.CONTROL) && (type != $ui.UIExtensionType.SCREEN) && (type != $ui.UIExtensionType.LISTITEM)) {
		throw new Error('UIExtension: type is an invalid value');
	} else {
		this.type = type;
	}
	/** 
	 * Class definition for your extension, you can include properties such as constants here
	 * @member {object} [definition]
	 * @memberOf UIExtension
	 */
	if (definition == null || definition == undefined) {
		this.definition = {};
	} else {
		this.definition = definition;
	}
}
/*!
 * Chart.js
 * http://chartjs.org/
 * Version: 1.0.1
 *
 * Copyright 2015 Nick Downie
 * Released under the MIT license
 * https://github.com/nnnick/Chart.js/blob/master/LICENSE.md
 */
(function(){"use strict";var t=this,i=t.Chart,e=function(t){this.canvas=t.canvas,this.ctx=t;this.width=t.canvas.width,this.height=t.canvas.height;return this.aspectRatio=this.width/this.height,s.retinaScale(this),this};e.defaults={global:{animation:!0,animationSteps:60,animationEasing:"easeOutQuart",showScale:!0,scaleOverride:!1,scaleSteps:null,scaleStepWidth:null,scaleStartValue:null,scaleLineColor:"rgba(0,0,0,.1)",scaleLineWidth:1,scaleShowLabels:!0,scaleLabel:"<%=value%>",scaleIntegersOnly:!0,scaleBeginAtZero:!1,scaleFontFamily:"'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",scaleFontSize:12,scaleFontStyle:"normal",scaleFontColor:"#666",responsive:!1,maintainAspectRatio:!0,showTooltips:!0,customTooltips:!1,tooltipEvents:["mousemove","touchstart","touchmove","mouseout"],tooltipFillColor:"rgba(0,0,0,0.8)",tooltipFontFamily:"'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",tooltipFontSize:14,tooltipFontStyle:"normal",tooltipFontColor:"#fff",tooltipTitleFontFamily:"'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",tooltipTitleFontSize:14,tooltipTitleFontStyle:"bold",tooltipTitleFontColor:"#fff",tooltipYPadding:6,tooltipXPadding:6,tooltipCaretSize:8,tooltipCornerRadius:6,tooltipXOffset:10,tooltipTemplate:"<%if (label){%><%=label%>: <%}%><%= value %>",multiTooltipTemplate:"<%= value %>",multiTooltipKeyBackground:"#fff",onAnimationProgress:function(){},onAnimationComplete:function(){}}},e.types={};var s=e.helpers={},n=s.each=function(t,i,e){var s=Array.prototype.slice.call(arguments,3);if(t)if(t.length===+t.length){var n;for(n=0;n<t.length;n++)i.apply(e,[t[n],n].concat(s))}else for(var o in t)i.apply(e,[t[o],o].concat(s))},o=s.clone=function(t){var i={};return n(t,function(e,s){t.hasOwnProperty(s)&&(i[s]=e)}),i},a=s.extend=function(t){return n(Array.prototype.slice.call(arguments,1),function(i){n(i,function(e,s){i.hasOwnProperty(s)&&(t[s]=e)})}),t},h=s.merge=function(){var t=Array.prototype.slice.call(arguments,0);return t.unshift({}),a.apply(null,t)},l=s.indexOf=function(t,i){if(Array.prototype.indexOf)return t.indexOf(i);for(var e=0;e<t.length;e++)if(t[e]===i)return e;return-1},r=(s.where=function(t,i){var e=[];return s.each(t,function(t){i(t)&&e.push(t)}),e},s.findNextWhere=function(t,i,e){e||(e=-1);for(var s=e+1;s<t.length;s++){var n=t[s];if(i(n))return n}},s.findPreviousWhere=function(t,i,e){e||(e=t.length);for(var s=e-1;s>=0;s--){var n=t[s];if(i(n))return n}},s.inherits=function(t){var i=this,e=t&&t.hasOwnProperty("constructor")?t.constructor:function(){return i.apply(this,arguments)},s=function(){this.constructor=e};return s.prototype=i.prototype,e.prototype=new s,e.extend=r,t&&a(e.prototype,t),e.__super__=i.prototype,e}),c=s.noop=function(){},u=s.uid=function(){var t=0;return function(){return"chart-"+t++}}(),d=s.warn=function(t){window.console&&"function"==typeof window.console.warn&&console.warn(t)},p=s.amd="function"==typeof define&&define.amd,f=s.isNumber=function(t){return!isNaN(parseFloat(t))&&isFinite(t)},g=s.max=function(t){return Math.max.apply(Math,t)},m=s.min=function(t){return Math.min.apply(Math,t)},v=(s.cap=function(t,i,e){if(f(i)){if(t>i)return i}else if(f(e)&&e>t)return e;return t},s.getDecimalPlaces=function(t){return t%1!==0&&f(t)?t.toString().split(".")[1].length:0}),S=s.radians=function(t){return t*(Math.PI/180)},x=(s.getAngleFromPoint=function(t,i){var e=i.x-t.x,s=i.y-t.y,n=Math.sqrt(e*e+s*s),o=2*Math.PI+Math.atan2(s,e);return 0>e&&0>s&&(o+=2*Math.PI),{angle:o,distance:n}},s.aliasPixel=function(t){return t%2===0?0:.5}),y=(s.splineCurve=function(t,i,e,s){var n=Math.sqrt(Math.pow(i.x-t.x,2)+Math.pow(i.y-t.y,2)),o=Math.sqrt(Math.pow(e.x-i.x,2)+Math.pow(e.y-i.y,2)),a=s*n/(n+o),h=s*o/(n+o);return{inner:{x:i.x-a*(e.x-t.x),y:i.y-a*(e.y-t.y)},outer:{x:i.x+h*(e.x-t.x),y:i.y+h*(e.y-t.y)}}},s.calculateOrderOfMagnitude=function(t){return Math.floor(Math.log(t)/Math.LN10)}),C=(s.calculateScaleRange=function(t,i,e,s,n){var o=2,a=Math.floor(i/(1.5*e)),h=o>=a,l=g(t),r=m(t);l===r&&(l+=.5,r>=.5&&!s?r-=.5:l+=.5);for(var c=Math.abs(l-r),u=y(c),d=Math.ceil(l/(1*Math.pow(10,u)))*Math.pow(10,u),p=s?0:Math.floor(r/(1*Math.pow(10,u)))*Math.pow(10,u),f=d-p,v=Math.pow(10,u),S=Math.round(f/v);(S>a||a>2*S)&&!h;)if(S>a)v*=2,S=Math.round(f/v),S%1!==0&&(h=!0);else if(n&&u>=0){if(v/2%1!==0)break;v/=2,S=Math.round(f/v)}else v/=2,S=Math.round(f/v);return h&&(S=o,v=f/S),{steps:S,stepValue:v,min:p,max:p+S*v}},s.template=function(t,i){function e(t,i){var e=/\W/.test(t)?new Function("obj","var p=[],print=function(){p.push.apply(p,arguments);};with(obj){p.push('"+t.replace(/[\r\t\n]/g," ").split("<%").join("	").replace(/((^|%>)[^\t]*)'/g,"$1\r").replace(/\t=(.*?)%>/g,"',$1,'").split("	").join("');").split("%>").join("p.push('").split("\r").join("\\'")+"');}return p.join('');"):s[t]=s[t];return i?e(i):e}if(t instanceof Function)return t(i);var s={};return e(t,i)}),w=(s.generateLabels=function(t,i,e,s){var o=new Array(i);return labelTemplateString&&n(o,function(i,n){o[n]=C(t,{value:e+s*(n+1)})}),o},s.easingEffects={linear:function(t){return t},easeInQuad:function(t){return t*t},easeOutQuad:function(t){return-1*t*(t-2)},easeInOutQuad:function(t){return(t/=.5)<1?.5*t*t:-0.5*(--t*(t-2)-1)},easeInCubic:function(t){return t*t*t},easeOutCubic:function(t){return 1*((t=t/1-1)*t*t+1)},easeInOutCubic:function(t){return(t/=.5)<1?.5*t*t*t:.5*((t-=2)*t*t+2)},easeInQuart:function(t){return t*t*t*t},easeOutQuart:function(t){return-1*((t=t/1-1)*t*t*t-1)},easeInOutQuart:function(t){return(t/=.5)<1?.5*t*t*t*t:-0.5*((t-=2)*t*t*t-2)},easeInQuint:function(t){return 1*(t/=1)*t*t*t*t},easeOutQuint:function(t){return 1*((t=t/1-1)*t*t*t*t+1)},easeInOutQuint:function(t){return(t/=.5)<1?.5*t*t*t*t*t:.5*((t-=2)*t*t*t*t+2)},easeInSine:function(t){return-1*Math.cos(t/1*(Math.PI/2))+1},easeOutSine:function(t){return 1*Math.sin(t/1*(Math.PI/2))},easeInOutSine:function(t){return-0.5*(Math.cos(Math.PI*t/1)-1)},easeInExpo:function(t){return 0===t?1:1*Math.pow(2,10*(t/1-1))},easeOutExpo:function(t){return 1===t?1:1*(-Math.pow(2,-10*t/1)+1)},easeInOutExpo:function(t){return 0===t?0:1===t?1:(t/=.5)<1?.5*Math.pow(2,10*(t-1)):.5*(-Math.pow(2,-10*--t)+2)},easeInCirc:function(t){return t>=1?t:-1*(Math.sqrt(1-(t/=1)*t)-1)},easeOutCirc:function(t){return 1*Math.sqrt(1-(t=t/1-1)*t)},easeInOutCirc:function(t){return(t/=.5)<1?-0.5*(Math.sqrt(1-t*t)-1):.5*(Math.sqrt(1-(t-=2)*t)+1)},easeInElastic:function(t){var i=1.70158,e=0,s=1;return 0===t?0:1==(t/=1)?1:(e||(e=.3),s<Math.abs(1)?(s=1,i=e/4):i=e/(2*Math.PI)*Math.asin(1/s),-(s*Math.pow(2,10*(t-=1))*Math.sin(2*(1*t-i)*Math.PI/e)))},easeOutElastic:function(t){var i=1.70158,e=0,s=1;return 0===t?0:1==(t/=1)?1:(e||(e=.3),s<Math.abs(1)?(s=1,i=e/4):i=e/(2*Math.PI)*Math.asin(1/s),s*Math.pow(2,-10*t)*Math.sin(2*(1*t-i)*Math.PI/e)+1)},easeInOutElastic:function(t){var i=1.70158,e=0,s=1;return 0===t?0:2==(t/=.5)?1:(e||(e=.3*1.5),s<Math.abs(1)?(s=1,i=e/4):i=e/(2*Math.PI)*Math.asin(1/s),1>t?-.5*s*Math.pow(2,10*(t-=1))*Math.sin(2*(1*t-i)*Math.PI/e):s*Math.pow(2,-10*(t-=1))*Math.sin(2*(1*t-i)*Math.PI/e)*.5+1)},easeInBack:function(t){var i=1.70158;return 1*(t/=1)*t*((i+1)*t-i)},easeOutBack:function(t){var i=1.70158;return 1*((t=t/1-1)*t*((i+1)*t+i)+1)},easeInOutBack:function(t){var i=1.70158;return(t/=.5)<1?.5*t*t*(((i*=1.525)+1)*t-i):.5*((t-=2)*t*(((i*=1.525)+1)*t+i)+2)},easeInBounce:function(t){return 1-w.easeOutBounce(1-t)},easeOutBounce:function(t){return(t/=1)<1/2.75?7.5625*t*t:2/2.75>t?1*(7.5625*(t-=1.5/2.75)*t+.75):2.5/2.75>t?1*(7.5625*(t-=2.25/2.75)*t+.9375):1*(7.5625*(t-=2.625/2.75)*t+.984375)},easeInOutBounce:function(t){return.5>t?.5*w.easeInBounce(2*t):.5*w.easeOutBounce(2*t-1)+.5}}),b=s.requestAnimFrame=function(){return window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||window.oRequestAnimationFrame||window.msRequestAnimationFrame||function(t){return window.setTimeout(t,1e3/60)}}(),P=(s.cancelAnimFrame=function(){return window.cancelAnimationFrame||window.webkitCancelAnimationFrame||window.mozCancelAnimationFrame||window.oCancelAnimationFrame||window.msCancelAnimationFrame||function(t){return window.clearTimeout(t,1e3/60)}}(),s.animationLoop=function(t,i,e,s,n,o){var a=0,h=w[e]||w.linear,l=function(){a++;var e=a/i,r=h(e);t.call(o,r,e,a),s.call(o,r,e),i>a?o.animationFrame=b(l):n.apply(o)};b(l)},s.getRelativePosition=function(t){var i,e,s=t.originalEvent||t,n=t.currentTarget||t.srcElement,o=n.getBoundingClientRect();return s.touches?(i=s.touches[0].clientX-o.left,e=s.touches[0].clientY-o.top):(i=s.clientX-o.left,e=s.clientY-o.top),{x:i,y:e}},s.addEvent=function(t,i,e){t.addEventListener?t.addEventListener(i,e):t.attachEvent?t.attachEvent("on"+i,e):t["on"+i]=e}),L=s.removeEvent=function(t,i,e){t.removeEventListener?t.removeEventListener(i,e,!1):t.detachEvent?t.detachEvent("on"+i,e):t["on"+i]=c},k=(s.bindEvents=function(t,i,e){t.events||(t.events={}),n(i,function(i){t.events[i]=function(){e.apply(t,arguments)},P(t.chart.canvas,i,t.events[i])})},s.unbindEvents=function(t,i){n(i,function(i,e){L(t.chart.canvas,e,i)})}),F=s.getMaximumWidth=function(t){var i=t.parentNode;return i.clientWidth},R=s.getMaximumHeight=function(t){var i=t.parentNode;return i.clientHeight},T=(s.getMaximumSize=s.getMaximumWidth,s.retinaScale=function(t){var i=t.ctx,e=t.canvas.width,s=t.canvas.height;window.devicePixelRatio&&(i.canvas.style.width=e+"px",i.canvas.style.height=s+"px",i.canvas.height=s*window.devicePixelRatio,i.canvas.width=e*window.devicePixelRatio,i.scale(window.devicePixelRatio,window.devicePixelRatio))}),A=s.clear=function(t){t.ctx.clearRect(0,0,t.width,t.height)},M=s.fontString=function(t,i,e){return i+" "+t+"px "+e},W=s.longestText=function(t,i,e){t.font=i;var s=0;return n(e,function(i){var e=t.measureText(i).width;s=e>s?e:s}),s},z=s.drawRoundedRectangle=function(t,i,e,s,n,o){t.beginPath(),t.moveTo(i+o,e),t.lineTo(i+s-o,e),t.quadraticCurveTo(i+s,e,i+s,e+o),t.lineTo(i+s,e+n-o),t.quadraticCurveTo(i+s,e+n,i+s-o,e+n),t.lineTo(i+o,e+n),t.quadraticCurveTo(i,e+n,i,e+n-o),t.lineTo(i,e+o),t.quadraticCurveTo(i,e,i+o,e),t.closePath()};e.instances={},e.Type=function(t,i,s){this.options=i,this.chart=s,this.id=u(),e.instances[this.id]=this,i.responsive&&this.resize(),this.initialize.call(this,t)},a(e.Type.prototype,{initialize:function(){return this},clear:function(){return A(this.chart),this},stop:function(){return s.cancelAnimFrame.call(t,this.animationFrame),this},resize:function(t){this.stop();var i=this.chart.canvas,e=F(this.chart.canvas),s=this.options.maintainAspectRatio?e/this.chart.aspectRatio:R(this.chart.canvas);return i.width=this.chart.width=e,i.height=this.chart.height=s,T(this.chart),"function"==typeof t&&t.apply(this,Array.prototype.slice.call(arguments,1)),this},reflow:c,render:function(t){return t&&this.reflow(),this.options.animation&&!t?s.animationLoop(this.draw,this.options.animationSteps,this.options.animationEasing,this.options.onAnimationProgress,this.options.onAnimationComplete,this):(this.draw(),this.options.onAnimationComplete.call(this)),this},generateLegend:function(){return C(this.options.legendTemplate,this)},destroy:function(){this.clear(),k(this,this.events);var t=this.chart.canvas;t.width=this.chart.width,t.height=this.chart.height,t.style.removeProperty?(t.style.removeProperty("width"),t.style.removeProperty("height")):(t.style.removeAttribute("width"),t.style.removeAttribute("height")),delete e.instances[this.id]},showTooltip:function(t,i){"undefined"==typeof this.activeElements&&(this.activeElements=[]);var o=function(t){var i=!1;return t.length!==this.activeElements.length?i=!0:(n(t,function(t,e){t!==this.activeElements[e]&&(i=!0)},this),i)}.call(this,t);if(o||i){if(this.activeElements=t,this.draw(),this.options.customTooltips&&this.options.customTooltips(!1),t.length>0)if(this.datasets&&this.datasets.length>1){for(var a,h,r=this.datasets.length-1;r>=0&&(a=this.datasets[r].points||this.datasets[r].bars||this.datasets[r].segments,h=l(a,t[0]),-1===h);r--);var c=[],u=[],d=function(){var t,i,e,n,o,a=[],l=[],r=[];return s.each(this.datasets,function(i){t=i.points||i.bars||i.segments,t[h]&&t[h].hasValue()&&a.push(t[h])}),s.each(a,function(t){l.push(t.x),r.push(t.y),c.push(s.template(this.options.multiTooltipTemplate,t)),u.push({fill:t._saved.fillColor||t.fillColor,stroke:t._saved.strokeColor||t.strokeColor})},this),o=m(r),e=g(r),n=m(l),i=g(l),{x:n>this.chart.width/2?n:i,y:(o+e)/2}}.call(this,h);new e.MultiTooltip({x:d.x,y:d.y,xPadding:this.options.tooltipXPadding,yPadding:this.options.tooltipYPadding,xOffset:this.options.tooltipXOffset,fillColor:this.options.tooltipFillColor,textColor:this.options.tooltipFontColor,fontFamily:this.options.tooltipFontFamily,fontStyle:this.options.tooltipFontStyle,fontSize:this.options.tooltipFontSize,titleTextColor:this.options.tooltipTitleFontColor,titleFontFamily:this.options.tooltipTitleFontFamily,titleFontStyle:this.options.tooltipTitleFontStyle,titleFontSize:this.options.tooltipTitleFontSize,cornerRadius:this.options.tooltipCornerRadius,labels:c,legendColors:u,legendColorBackground:this.options.multiTooltipKeyBackground,title:t[0].label,chart:this.chart,ctx:this.chart.ctx,custom:this.options.customTooltips}).draw()}else n(t,function(t){var i=t.tooltipPosition();new e.Tooltip({x:Math.round(i.x),y:Math.round(i.y),xPadding:this.options.tooltipXPadding,yPadding:this.options.tooltipYPadding,fillColor:this.options.tooltipFillColor,textColor:this.options.tooltipFontColor,fontFamily:this.options.tooltipFontFamily,fontStyle:this.options.tooltipFontStyle,fontSize:this.options.tooltipFontSize,caretHeight:this.options.tooltipCaretSize,cornerRadius:this.options.tooltipCornerRadius,text:C(this.options.tooltipTemplate,t),chart:this.chart,custom:this.options.customTooltips}).draw()},this);return this}},toBase64Image:function(){return this.chart.canvas.toDataURL.apply(this.chart.canvas,arguments)}}),e.Type.extend=function(t){var i=this,s=function(){return i.apply(this,arguments)};if(s.prototype=o(i.prototype),a(s.prototype,t),s.extend=e.Type.extend,t.name||i.prototype.name){var n=t.name||i.prototype.name,l=e.defaults[i.prototype.name]?o(e.defaults[i.prototype.name]):{};e.defaults[n]=a(l,t.defaults),e.types[n]=s,e.prototype[n]=function(t,i){var o=h(e.defaults.global,e.defaults[n],i||{});return new s(t,o,this)}}else d("Name not provided for this chart, so it hasn't been registered");return i},e.Element=function(t){a(this,t),this.initialize.apply(this,arguments),this.save()},a(e.Element.prototype,{initialize:function(){},restore:function(t){return t?n(t,function(t){this[t]=this._saved[t]},this):a(this,this._saved),this},save:function(){return this._saved=o(this),delete this._saved._saved,this},update:function(t){return n(t,function(t,i){this._saved[i]=this[i],this[i]=t},this),this},transition:function(t,i){return n(t,function(t,e){this[e]=(t-this._saved[e])*i+this._saved[e]},this),this},tooltipPosition:function(){return{x:this.x,y:this.y}},hasValue:function(){return f(this.value)}}),e.Element.extend=r,e.Point=e.Element.extend({display:!0,inRange:function(t,i){var e=this.hitDetectionRadius+this.radius;return Math.pow(t-this.x,2)+Math.pow(i-this.y,2)<Math.pow(e,2)},draw:function(){if(this.display){var t=this.ctx;t.beginPath(),t.arc(this.x,this.y,this.radius,0,2*Math.PI),t.closePath(),t.strokeStyle=this.strokeColor,t.lineWidth=this.strokeWidth,t.fillStyle=this.fillColor,t.fill(),t.stroke()}}}),e.Arc=e.Element.extend({inRange:function(t,i){var e=s.getAngleFromPoint(this,{x:t,y:i}),n=e.angle>=this.startAngle&&e.angle<=this.endAngle,o=e.distance>=this.innerRadius&&e.distance<=this.outerRadius;return n&&o},tooltipPosition:function(){var t=this.startAngle+(this.endAngle-this.startAngle)/2,i=(this.outerRadius-this.innerRadius)/2+this.innerRadius;return{x:this.x+Math.cos(t)*i,y:this.y+Math.sin(t)*i}},draw:function(t){var i=this.ctx;i.beginPath(),i.arc(this.x,this.y,this.outerRadius,this.startAngle,this.endAngle),i.arc(this.x,this.y,this.innerRadius,this.endAngle,this.startAngle,!0),i.closePath(),i.strokeStyle=this.strokeColor,i.lineWidth=this.strokeWidth,i.fillStyle=this.fillColor,i.fill(),i.lineJoin="bevel",this.showStroke&&i.stroke()}}),e.Rectangle=e.Element.extend({draw:function(){var t=this.ctx,i=this.width/2,e=this.x-i,s=this.x+i,n=this.base-(this.base-this.y),o=this.strokeWidth/2;this.showStroke&&(e+=o,s-=o,n+=o),t.beginPath(),t.fillStyle=this.fillColor,t.strokeStyle=this.strokeColor,t.lineWidth=this.strokeWidth,t.moveTo(e,this.base),t.lineTo(e,n),t.lineTo(s,n),t.lineTo(s,this.base),t.fill(),this.showStroke&&t.stroke()},height:function(){return this.base-this.y},inRange:function(t,i){return t>=this.x-this.width/2&&t<=this.x+this.width/2&&i>=this.y&&i<=this.base}}),e.Tooltip=e.Element.extend({draw:function(){var t=this.chart.ctx;t.font=M(this.fontSize,this.fontStyle,this.fontFamily),this.xAlign="center",this.yAlign="above";var i=this.caretPadding=2,e=t.measureText(this.text).width+2*this.xPadding,s=this.fontSize+2*this.yPadding,n=s+this.caretHeight+i;this.x+e/2>this.chart.width?this.xAlign="left":this.x-e/2<0&&(this.xAlign="right"),this.y-n<0&&(this.yAlign="below");var o=this.x-e/2,a=this.y-n;if(t.fillStyle=this.fillColor,this.custom)this.custom(this);else{switch(this.yAlign){case"above":t.beginPath(),t.moveTo(this.x,this.y-i),t.lineTo(this.x+this.caretHeight,this.y-(i+this.caretHeight)),t.lineTo(this.x-this.caretHeight,this.y-(i+this.caretHeight)),t.closePath(),t.fill();break;case"below":a=this.y+i+this.caretHeight,t.beginPath(),t.moveTo(this.x,this.y+i),t.lineTo(this.x+this.caretHeight,this.y+i+this.caretHeight),t.lineTo(this.x-this.caretHeight,this.y+i+this.caretHeight),t.closePath(),t.fill()}switch(this.xAlign){case"left":o=this.x-e+(this.cornerRadius+this.caretHeight);break;case"right":o=this.x-(this.cornerRadius+this.caretHeight)}z(t,o,a,e,s,this.cornerRadius),t.fill(),t.fillStyle=this.textColor,t.textAlign="center",t.textBaseline="middle",t.fillText(this.text,o+e/2,a+s/2)}}}),e.MultiTooltip=e.Element.extend({initialize:function(){this.font=M(this.fontSize,this.fontStyle,this.fontFamily),this.titleFont=M(this.titleFontSize,this.titleFontStyle,this.titleFontFamily),this.height=this.labels.length*this.fontSize+(this.labels.length-1)*(this.fontSize/2)+2*this.yPadding+1.5*this.titleFontSize,this.ctx.font=this.titleFont;var t=this.ctx.measureText(this.title).width,i=W(this.ctx,this.font,this.labels)+this.fontSize+3,e=g([i,t]);this.width=e+2*this.xPadding;var s=this.height/2;this.y-s<0?this.y=s:this.y+s>this.chart.height&&(this.y=this.chart.height-s),this.x>this.chart.width/2?this.x-=this.xOffset+this.width:this.x+=this.xOffset},getLineHeight:function(t){var i=this.y-this.height/2+this.yPadding,e=t-1;return 0===t?i+this.titleFontSize/2:i+(1.5*this.fontSize*e+this.fontSize/2)+1.5*this.titleFontSize},draw:function(){if(this.custom)this.custom(this);else{z(this.ctx,this.x,this.y-this.height/2,this.width,this.height,this.cornerRadius);var t=this.ctx;t.fillStyle=this.fillColor,t.fill(),t.closePath(),t.textAlign="left",t.textBaseline="middle",t.fillStyle=this.titleTextColor,t.font=this.titleFont,t.fillText(this.title,this.x+this.xPadding,this.getLineHeight(0)),t.font=this.font,s.each(this.labels,function(i,e){t.fillStyle=this.textColor,t.fillText(i,this.x+this.xPadding+this.fontSize+3,this.getLineHeight(e+1)),t.fillStyle=this.legendColorBackground,t.fillRect(this.x+this.xPadding,this.getLineHeight(e+1)-this.fontSize/2,this.fontSize,this.fontSize),t.fillStyle=this.legendColors[e].fill,t.fillRect(this.x+this.xPadding,this.getLineHeight(e+1)-this.fontSize/2,this.fontSize,this.fontSize)},this)}}}),e.Scale=e.Element.extend({initialize:function(){this.fit()},buildYLabels:function(){this.yLabels=[];for(var t=v(this.stepValue),i=0;i<=this.steps;i++)this.yLabels.push(C(this.templateString,{value:(this.min+i*this.stepValue).toFixed(t)}));this.yLabelWidth=this.display&&this.showLabels?W(this.ctx,this.font,this.yLabels):0},addXLabel:function(t){this.xLabels.push(t),this.valuesCount++,this.fit()},removeXLabel:function(){this.xLabels.shift(),this.valuesCount--,this.fit()},fit:function(){this.startPoint=this.display?this.fontSize:0,this.endPoint=this.display?this.height-1.5*this.fontSize-5:this.height,this.startPoint+=this.padding,this.endPoint-=this.padding;var t,i=this.endPoint-this.startPoint;for(this.calculateYRange(i),this.buildYLabels(),this.calculateXLabelRotation();i>this.endPoint-this.startPoint;)i=this.endPoint-this.startPoint,t=this.yLabelWidth,this.calculateYRange(i),this.buildYLabels(),t<this.yLabelWidth&&this.calculateXLabelRotation()},calculateXLabelRotation:function(){this.ctx.font=this.font;var t,i,e=this.ctx.measureText(this.xLabels[0]).width,s=this.ctx.measureText(this.xLabels[this.xLabels.length-1]).width;if(this.xScalePaddingRight=s/2+3,this.xScalePaddingLeft=e/2>this.yLabelWidth+10?e/2:this.yLabelWidth+10,this.xLabelRotation=0,this.display){var n,o=W(this.ctx,this.font,this.xLabels);this.xLabelWidth=o;for(var a=Math.floor(this.calculateX(1)-this.calculateX(0))-6;this.xLabelWidth>a&&0===this.xLabelRotation||this.xLabelWidth>a&&this.xLabelRotation<=90&&this.xLabelRotation>0;)n=Math.cos(S(this.xLabelRotation)),t=n*e,i=n*s,t+this.fontSize/2>this.yLabelWidth+8&&(this.xScalePaddingLeft=t+this.fontSize/2),this.xScalePaddingRight=this.fontSize/2,this.xLabelRotation++,this.xLabelWidth=n*o;this.xLabelRotation>0&&(this.endPoint-=Math.sin(S(this.xLabelRotation))*o+3)}else this.xLabelWidth=0,this.xScalePaddingRight=this.padding,this.xScalePaddingLeft=this.padding},calculateYRange:c,drawingArea:function(){return this.startPoint-this.endPoint},calculateY:function(t){var i=this.drawingArea()/(this.min-this.max);return this.endPoint-i*(t-this.min)},calculateX:function(t){var i=(this.xLabelRotation>0,this.width-(this.xScalePaddingLeft+this.xScalePaddingRight)),e=i/(this.valuesCount-(this.offsetGridLines?0:1)),s=e*t+this.xScalePaddingLeft;return this.offsetGridLines&&(s+=e/2),Math.round(s)},update:function(t){s.extend(this,t),this.fit()},draw:function(){var t=this.ctx,i=(this.endPoint-this.startPoint)/this.steps,e=Math.round(this.xScalePaddingLeft);this.display&&(t.fillStyle=this.textColor,t.font=this.font,n(this.yLabels,function(n,o){var a=this.endPoint-i*o,h=Math.round(a),l=this.showHorizontalLines;t.textAlign="right",t.textBaseline="middle",this.showLabels&&t.fillText(n,e-10,a),0!==o||l||(l=!0),l&&t.beginPath(),o>0?(t.lineWidth=this.gridLineWidth,t.strokeStyle=this.gridLineColor):(t.lineWidth=this.lineWidth,t.strokeStyle=this.lineColor),h+=s.aliasPixel(t.lineWidth),l&&(t.moveTo(e,h),t.lineTo(this.width,h),t.stroke(),t.closePath()),t.lineWidth=this.lineWidth,t.strokeStyle=this.lineColor,t.beginPath(),t.moveTo(e-5,h),t.lineTo(e,h),t.stroke(),t.closePath()},this),n(this.xLabels,function(i,e){var s=this.calculateX(e)+x(this.lineWidth),n=this.calculateX(e-(this.offsetGridLines?.5:0))+x(this.lineWidth),o=this.xLabelRotation>0,a=this.showVerticalLines;0!==e||a||(a=!0),a&&t.beginPath(),e>0?(t.lineWidth=this.gridLineWidth,t.strokeStyle=this.gridLineColor):(t.lineWidth=this.lineWidth,t.strokeStyle=this.lineColor),a&&(t.moveTo(n,this.endPoint),t.lineTo(n,this.startPoint-3),t.stroke(),t.closePath()),t.lineWidth=this.lineWidth,t.strokeStyle=this.lineColor,t.beginPath(),t.moveTo(n,this.endPoint),t.lineTo(n,this.endPoint+5),t.stroke(),t.closePath(),t.save(),t.translate(s,o?this.endPoint+12:this.endPoint+8),t.rotate(-1*S(this.xLabelRotation)),t.font=this.font,t.textAlign=o?"right":"center",t.textBaseline=o?"middle":"top",t.fillText(i,0,0),t.restore()},this))}}),e.RadialScale=e.Element.extend({initialize:function(){this.size=m([this.height,this.width]),this.drawingArea=this.display?this.size/2-(this.fontSize/2+this.backdropPaddingY):this.size/2},calculateCenterOffset:function(t){var i=this.drawingArea/(this.max-this.min);return(t-this.min)*i},update:function(){this.lineArc?this.drawingArea=this.display?this.size/2-(this.fontSize/2+this.backdropPaddingY):this.size/2:this.setScaleSize(),this.buildYLabels()},buildYLabels:function(){this.yLabels=[];for(var t=v(this.stepValue),i=0;i<=this.steps;i++)this.yLabels.push(C(this.templateString,{value:(this.min+i*this.stepValue).toFixed(t)}))},getCircumference:function(){return 2*Math.PI/this.valuesCount},setScaleSize:function(){var t,i,e,s,n,o,a,h,l,r,c,u,d=m([this.height/2-this.pointLabelFontSize-5,this.width/2]),p=this.width,g=0;for(this.ctx.font=M(this.pointLabelFontSize,this.pointLabelFontStyle,this.pointLabelFontFamily),i=0;i<this.valuesCount;i++)t=this.getPointPosition(i,d),e=this.ctx.measureText(C(this.templateString,{value:this.labels[i]})).width+5,0===i||i===this.valuesCount/2?(s=e/2,t.x+s>p&&(p=t.x+s,n=i),t.x-s<g&&(g=t.x-s,a=i)):i<this.valuesCount/2?t.x+e>p&&(p=t.x+e,n=i):i>this.valuesCount/2&&t.x-e<g&&(g=t.x-e,a=i);l=g,r=Math.ceil(p-this.width),o=this.getIndexAngle(n),h=this.getIndexAngle(a),c=r/Math.sin(o+Math.PI/2),u=l/Math.sin(h+Math.PI/2),c=f(c)?c:0,u=f(u)?u:0,this.drawingArea=d-(u+c)/2,this.setCenterPoint(u,c)},setCenterPoint:function(t,i){var e=this.width-i-this.drawingArea,s=t+this.drawingArea;this.xCenter=(s+e)/2,this.yCenter=this.height/2},getIndexAngle:function(t){var i=2*Math.PI/this.valuesCount;return t*i-Math.PI/2},getPointPosition:function(t,i){var e=this.getIndexAngle(t);return{x:Math.cos(e)*i+this.xCenter,y:Math.sin(e)*i+this.yCenter}},draw:function(){if(this.display){var t=this.ctx;if(n(this.yLabels,function(i,e){if(e>0){var s,n=e*(this.drawingArea/this.steps),o=this.yCenter-n;if(this.lineWidth>0)if(t.strokeStyle=this.lineColor,t.lineWidth=this.lineWidth,this.lineArc)t.beginPath(),t.arc(this.xCenter,this.yCenter,n,0,2*Math.PI),t.closePath(),t.stroke();else{t.beginPath();for(var a=0;a<this.valuesCount;a++)s=this.getPointPosition(a,this.calculateCenterOffset(this.min+e*this.stepValue)),0===a?t.moveTo(s.x,s.y):t.lineTo(s.x,s.y);t.closePath(),t.stroke()}if(this.showLabels){if(t.font=M(this.fontSize,this.fontStyle,this.fontFamily),this.showLabelBackdrop){var h=t.measureText(i).width;t.fillStyle=this.backdropColor,t.fillRect(this.xCenter-h/2-this.backdropPaddingX,o-this.fontSize/2-this.backdropPaddingY,h+2*this.backdropPaddingX,this.fontSize+2*this.backdropPaddingY)}t.textAlign="center",t.textBaseline="middle",t.fillStyle=this.fontColor,t.fillText(i,this.xCenter,o)}}},this),!this.lineArc){t.lineWidth=this.angleLineWidth,t.strokeStyle=this.angleLineColor;for(var i=this.valuesCount-1;i>=0;i--){if(this.angleLineWidth>0){var e=this.getPointPosition(i,this.calculateCenterOffset(this.max));t.beginPath(),t.moveTo(this.xCenter,this.yCenter),t.lineTo(e.x,e.y),t.stroke(),t.closePath()}var s=this.getPointPosition(i,this.calculateCenterOffset(this.max)+5);t.font=M(this.pointLabelFontSize,this.pointLabelFontStyle,this.pointLabelFontFamily),t.fillStyle=this.pointLabelFontColor;var o=this.labels.length,a=this.labels.length/2,h=a/2,l=h>i||i>o-h,r=i===h||i===o-h;t.textAlign=0===i?"center":i===a?"center":a>i?"left":"right",t.textBaseline=r?"middle":l?"bottom":"top",t.fillText(this.labels[i],s.x,s.y)}}}}}),s.addEvent(window,"resize",function(){var t;return function(){clearTimeout(t),t=setTimeout(function(){n(e.instances,function(t){t.options.responsive&&t.resize(t.render,!0)})},50)}}()),p?define(function(){return e}):"object"==typeof module&&module.exports&&(module.exports=e),t.Chart=e,e.noConflict=function(){return t.Chart=i,e}}).call(this),function(){"use strict";var t=this,i=t.Chart,e=i.helpers,s={scaleBeginAtZero:!0,scaleShowGridLines:!0,scaleGridLineColor:"rgba(0,0,0,.05)",scaleGridLineWidth:1,scaleShowHorizontalLines:!0,scaleShowVerticalLines:!0,barShowStroke:!0,barStrokeWidth:2,barValueSpacing:5,barDatasetSpacing:1,legendTemplate:'<ul class="<%=name.toLowerCase()%>-legend"><% for (var i=0; i<datasets.length; i++){%><li><span style="background-color:<%=datasets[i].fillColor%>"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>'};i.Type.extend({name:"Bar",defaults:s,initialize:function(t){var s=this.options;this.ScaleClass=i.Scale.extend({offsetGridLines:!0,calculateBarX:function(t,i,e){var n=this.calculateBaseWidth(),o=this.calculateX(e)-n/2,a=this.calculateBarWidth(t);return o+a*i+i*s.barDatasetSpacing+a/2},calculateBaseWidth:function(){return this.calculateX(1)-this.calculateX(0)-2*s.barValueSpacing},calculateBarWidth:function(t){var i=this.calculateBaseWidth()-(t-1)*s.barDatasetSpacing;return i/t}}),this.datasets=[],this.options.showTooltips&&e.bindEvents(this,this.options.tooltipEvents,function(t){var i="mouseout"!==t.type?this.getBarsAtEvent(t):[];this.eachBars(function(t){t.restore(["fillColor","strokeColor"])}),e.each(i,function(t){t.fillColor=t.highlightFill,t.strokeColor=t.highlightStroke}),this.showTooltip(i)}),this.BarClass=i.Rectangle.extend({strokeWidth:this.options.barStrokeWidth,showStroke:this.options.barShowStroke,ctx:this.chart.ctx}),e.each(t.datasets,function(i){var s={label:i.label||null,fillColor:i.fillColor,strokeColor:i.strokeColor,bars:[]};this.datasets.push(s),e.each(i.data,function(e,n){s.bars.push(new this.BarClass({value:e,label:t.labels[n],datasetLabel:i.label,strokeColor:i.strokeColor,fillColor:i.fillColor,highlightFill:i.highlightFill||i.fillColor,highlightStroke:i.highlightStroke||i.strokeColor}))},this)},this),this.buildScale(t.labels),this.BarClass.prototype.base=this.scale.endPoint,this.eachBars(function(t,i,s){e.extend(t,{width:this.scale.calculateBarWidth(this.datasets.length),x:this.scale.calculateBarX(this.datasets.length,s,i),y:this.scale.endPoint}),t.save()},this),this.render()},update:function(){this.scale.update(),e.each(this.activeElements,function(t){t.restore(["fillColor","strokeColor"])}),this.eachBars(function(t){t.save()}),this.render()},eachBars:function(t){e.each(this.datasets,function(i,s){e.each(i.bars,t,this,s)},this)},getBarsAtEvent:function(t){for(var i,s=[],n=e.getRelativePosition(t),o=function(t){s.push(t.bars[i])},a=0;a<this.datasets.length;a++)for(i=0;i<this.datasets[a].bars.length;i++)if(this.datasets[a].bars[i].inRange(n.x,n.y))return e.each(this.datasets,o),s;return s},buildScale:function(t){var i=this,s=function(){var t=[];return i.eachBars(function(i){t.push(i.value)}),t},n={templateString:this.options.scaleLabel,height:this.chart.height,width:this.chart.width,ctx:this.chart.ctx,textColor:this.options.scaleFontColor,fontSize:this.options.scaleFontSize,fontStyle:this.options.scaleFontStyle,fontFamily:this.options.scaleFontFamily,valuesCount:t.length,beginAtZero:this.options.scaleBeginAtZero,integersOnly:this.options.scaleIntegersOnly,calculateYRange:function(t){var i=e.calculateScaleRange(s(),t,this.fontSize,this.beginAtZero,this.integersOnly);e.extend(this,i)},xLabels:t,font:e.fontString(this.options.scaleFontSize,this.options.scaleFontStyle,this.options.scaleFontFamily),lineWidth:this.options.scaleLineWidth,lineColor:this.options.scaleLineColor,showHorizontalLines:this.options.scaleShowHorizontalLines,showVerticalLines:this.options.scaleShowVerticalLines,gridLineWidth:this.options.scaleShowGridLines?this.options.scaleGridLineWidth:0,gridLineColor:this.options.scaleShowGridLines?this.options.scaleGridLineColor:"rgba(0,0,0,0)",padding:this.options.showScale?0:this.options.barShowStroke?this.options.barStrokeWidth:0,showLabels:this.options.scaleShowLabels,display:this.options.showScale};this.options.scaleOverride&&e.extend(n,{calculateYRange:e.noop,steps:this.options.scaleSteps,stepValue:this.options.scaleStepWidth,min:this.options.scaleStartValue,max:this.options.scaleStartValue+this.options.scaleSteps*this.options.scaleStepWidth}),this.scale=new this.ScaleClass(n)},addData:function(t,i){e.each(t,function(t,e){this.datasets[e].bars.push(new this.BarClass({value:t,label:i,x:this.scale.calculateBarX(this.datasets.length,e,this.scale.valuesCount+1),y:this.scale.endPoint,width:this.scale.calculateBarWidth(this.datasets.length),base:this.scale.endPoint,strokeColor:this.datasets[e].strokeColor,fillColor:this.datasets[e].fillColor}))},this),this.scale.addXLabel(i),this.update()},removeData:function(){this.scale.removeXLabel(),e.each(this.datasets,function(t){t.bars.shift()},this),this.update()},reflow:function(){e.extend(this.BarClass.prototype,{y:this.scale.endPoint,base:this.scale.endPoint});
var t=e.extend({height:this.chart.height,width:this.chart.width});this.scale.update(t)},draw:function(t){var i=t||1;this.clear();this.chart.ctx;this.scale.draw(i),e.each(this.datasets,function(t,s){e.each(t.bars,function(t,e){t.hasValue()&&(t.base=this.scale.endPoint,t.transition({x:this.scale.calculateBarX(this.datasets.length,s,e),y:this.scale.calculateY(t.value),width:this.scale.calculateBarWidth(this.datasets.length)},i).draw())},this)},this)}})}.call(this),function(){"use strict";var t=this,i=t.Chart,e=i.helpers,s={segmentShowStroke:!0,segmentStrokeColor:"#fff",segmentStrokeWidth:2,percentageInnerCutout:50,animationSteps:100,animationEasing:"easeOutBounce",animateRotate:!0,animateScale:!1,legendTemplate:'<ul class="<%=name.toLowerCase()%>-legend"><% for (var i=0; i<segments.length; i++){%><li><span style="background-color:<%=segments[i].fillColor%>"></span><%if(segments[i].label){%><%=segments[i].label%><%}%></li><%}%></ul>'};i.Type.extend({name:"Doughnut",defaults:s,initialize:function(t){this.segments=[],this.outerRadius=(e.min([this.chart.width,this.chart.height])-this.options.segmentStrokeWidth/2)/2,this.SegmentArc=i.Arc.extend({ctx:this.chart.ctx,x:this.chart.width/2,y:this.chart.height/2}),this.options.showTooltips&&e.bindEvents(this,this.options.tooltipEvents,function(t){var i="mouseout"!==t.type?this.getSegmentsAtEvent(t):[];e.each(this.segments,function(t){t.restore(["fillColor"])}),e.each(i,function(t){t.fillColor=t.highlightColor}),this.showTooltip(i)}),this.calculateTotal(t),e.each(t,function(t,i){this.addData(t,i,!0)},this),this.render()},getSegmentsAtEvent:function(t){var i=[],s=e.getRelativePosition(t);return e.each(this.segments,function(t){t.inRange(s.x,s.y)&&i.push(t)},this),i},addData:function(t,i,e){var s=i||this.segments.length;this.segments.splice(s,0,new this.SegmentArc({value:t.value,outerRadius:this.options.animateScale?0:this.outerRadius,innerRadius:this.options.animateScale?0:this.outerRadius/100*this.options.percentageInnerCutout,fillColor:t.color,highlightColor:t.highlight||t.color,showStroke:this.options.segmentShowStroke,strokeWidth:this.options.segmentStrokeWidth,strokeColor:this.options.segmentStrokeColor,startAngle:1.5*Math.PI,circumference:this.options.animateRotate?0:this.calculateCircumference(t.value),label:t.label})),e||(this.reflow(),this.update())},calculateCircumference:function(t){return 2*Math.PI*(t/this.total)},calculateTotal:function(t){this.total=0,e.each(t,function(t){this.total+=t.value},this)},update:function(){this.calculateTotal(this.segments),e.each(this.activeElements,function(t){t.restore(["fillColor"])}),e.each(this.segments,function(t){t.save()}),this.render()},removeData:function(t){var i=e.isNumber(t)?t:this.segments.length-1;this.segments.splice(i,1),this.reflow(),this.update()},reflow:function(){e.extend(this.SegmentArc.prototype,{x:this.chart.width/2,y:this.chart.height/2}),this.outerRadius=(e.min([this.chart.width,this.chart.height])-this.options.segmentStrokeWidth/2)/2,e.each(this.segments,function(t){t.update({outerRadius:this.outerRadius,innerRadius:this.outerRadius/100*this.options.percentageInnerCutout})},this)},draw:function(t){var i=t?t:1;this.clear(),e.each(this.segments,function(t,e){t.transition({circumference:this.calculateCircumference(t.value),outerRadius:this.outerRadius,innerRadius:this.outerRadius/100*this.options.percentageInnerCutout},i),t.endAngle=t.startAngle+t.circumference,t.draw(),0===e&&(t.startAngle=1.5*Math.PI),e<this.segments.length-1&&(this.segments[e+1].startAngle=t.endAngle)},this)}}),i.types.Doughnut.extend({name:"Pie",defaults:e.merge(s,{percentageInnerCutout:0})})}.call(this),function(){"use strict";var t=this,i=t.Chart,e=i.helpers,s={scaleShowGridLines:!0,scaleGridLineColor:"rgba(0,0,0,.05)",scaleGridLineWidth:1,scaleShowHorizontalLines:!0,scaleShowVerticalLines:!0,bezierCurve:!0,bezierCurveTension:.4,pointDot:!0,pointDotRadius:4,pointDotStrokeWidth:1,pointHitDetectionRadius:20,datasetStroke:!0,datasetStrokeWidth:2,datasetFill:!0,legendTemplate:'<ul class="<%=name.toLowerCase()%>-legend"><% for (var i=0; i<datasets.length; i++){%><li><span style="background-color:<%=datasets[i].strokeColor%>"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>'};i.Type.extend({name:"Line",defaults:s,initialize:function(t){this.PointClass=i.Point.extend({strokeWidth:this.options.pointDotStrokeWidth,radius:this.options.pointDotRadius,display:this.options.pointDot,hitDetectionRadius:this.options.pointHitDetectionRadius,ctx:this.chart.ctx,inRange:function(t){return Math.pow(t-this.x,2)<Math.pow(this.radius+this.hitDetectionRadius,2)}}),this.datasets=[],this.options.showTooltips&&e.bindEvents(this,this.options.tooltipEvents,function(t){var i="mouseout"!==t.type?this.getPointsAtEvent(t):[];this.eachPoints(function(t){t.restore(["fillColor","strokeColor"])}),e.each(i,function(t){t.fillColor=t.highlightFill,t.strokeColor=t.highlightStroke}),this.showTooltip(i)}),e.each(t.datasets,function(i){var s={label:i.label||null,fillColor:i.fillColor,strokeColor:i.strokeColor,pointColor:i.pointColor,pointStrokeColor:i.pointStrokeColor,points:[]};this.datasets.push(s),e.each(i.data,function(e,n){s.points.push(new this.PointClass({value:e,label:t.labels[n],datasetLabel:i.label,strokeColor:i.pointStrokeColor,fillColor:i.pointColor,highlightFill:i.pointHighlightFill||i.pointColor,highlightStroke:i.pointHighlightStroke||i.pointStrokeColor}))},this),this.buildScale(t.labels),this.eachPoints(function(t,i){e.extend(t,{x:this.scale.calculateX(i),y:this.scale.endPoint}),t.save()},this)},this),this.render()},update:function(){this.scale.update(),e.each(this.activeElements,function(t){t.restore(["fillColor","strokeColor"])}),this.eachPoints(function(t){t.save()}),this.render()},eachPoints:function(t){e.each(this.datasets,function(i){e.each(i.points,t,this)},this)},getPointsAtEvent:function(t){var i=[],s=e.getRelativePosition(t);return e.each(this.datasets,function(t){e.each(t.points,function(t){t.inRange(s.x,s.y)&&i.push(t)})},this),i},buildScale:function(t){var s=this,n=function(){var t=[];return s.eachPoints(function(i){t.push(i.value)}),t},o={templateString:this.options.scaleLabel,height:this.chart.height,width:this.chart.width,ctx:this.chart.ctx,textColor:this.options.scaleFontColor,fontSize:this.options.scaleFontSize,fontStyle:this.options.scaleFontStyle,fontFamily:this.options.scaleFontFamily,valuesCount:t.length,beginAtZero:this.options.scaleBeginAtZero,integersOnly:this.options.scaleIntegersOnly,calculateYRange:function(t){var i=e.calculateScaleRange(n(),t,this.fontSize,this.beginAtZero,this.integersOnly);e.extend(this,i)},xLabels:t,font:e.fontString(this.options.scaleFontSize,this.options.scaleFontStyle,this.options.scaleFontFamily),lineWidth:this.options.scaleLineWidth,lineColor:this.options.scaleLineColor,showHorizontalLines:this.options.scaleShowHorizontalLines,showVerticalLines:this.options.scaleShowVerticalLines,gridLineWidth:this.options.scaleShowGridLines?this.options.scaleGridLineWidth:0,gridLineColor:this.options.scaleShowGridLines?this.options.scaleGridLineColor:"rgba(0,0,0,0)",padding:this.options.showScale?0:this.options.pointDotRadius+this.options.pointDotStrokeWidth,showLabels:this.options.scaleShowLabels,display:this.options.showScale};this.options.scaleOverride&&e.extend(o,{calculateYRange:e.noop,steps:this.options.scaleSteps,stepValue:this.options.scaleStepWidth,min:this.options.scaleStartValue,max:this.options.scaleStartValue+this.options.scaleSteps*this.options.scaleStepWidth}),this.scale=new i.Scale(o)},addData:function(t,i){e.each(t,function(t,e){this.datasets[e].points.push(new this.PointClass({value:t,label:i,x:this.scale.calculateX(this.scale.valuesCount+1),y:this.scale.endPoint,strokeColor:this.datasets[e].pointStrokeColor,fillColor:this.datasets[e].pointColor}))},this),this.scale.addXLabel(i),this.update()},removeData:function(){this.scale.removeXLabel(),e.each(this.datasets,function(t){t.points.shift()},this),this.update()},reflow:function(){var t=e.extend({height:this.chart.height,width:this.chart.width});this.scale.update(t)},draw:function(t){var i=t||1;this.clear();var s=this.chart.ctx,n=function(t){return null!==t.value},o=function(t,i,s){return e.findNextWhere(i,n,s)||t},a=function(t,i,s){return e.findPreviousWhere(i,n,s)||t};this.scale.draw(i),e.each(this.datasets,function(t){var h=e.where(t.points,n);e.each(t.points,function(t,e){t.hasValue()&&t.transition({y:this.scale.calculateY(t.value),x:this.scale.calculateX(e)},i)},this),this.options.bezierCurve&&e.each(h,function(t,i){var s=i>0&&i<h.length-1?this.options.bezierCurveTension:0;t.controlPoints=e.splineCurve(a(t,h,i),t,o(t,h,i),s),t.controlPoints.outer.y>this.scale.endPoint?t.controlPoints.outer.y=this.scale.endPoint:t.controlPoints.outer.y<this.scale.startPoint&&(t.controlPoints.outer.y=this.scale.startPoint),t.controlPoints.inner.y>this.scale.endPoint?t.controlPoints.inner.y=this.scale.endPoint:t.controlPoints.inner.y<this.scale.startPoint&&(t.controlPoints.inner.y=this.scale.startPoint)},this),s.lineWidth=this.options.datasetStrokeWidth,s.strokeStyle=t.strokeColor,s.beginPath(),e.each(h,function(t,i){if(0===i)s.moveTo(t.x,t.y);else if(this.options.bezierCurve){var e=a(t,h,i);s.bezierCurveTo(e.controlPoints.outer.x,e.controlPoints.outer.y,t.controlPoints.inner.x,t.controlPoints.inner.y,t.x,t.y)}else s.lineTo(t.x,t.y)},this),s.stroke(),this.options.datasetFill&&h.length>0&&(s.lineTo(h[h.length-1].x,this.scale.endPoint),s.lineTo(h[0].x,this.scale.endPoint),s.fillStyle=t.fillColor,s.closePath(),s.fill()),e.each(h,function(t){t.draw()})},this)}})}.call(this),function(){"use strict";var t=this,i=t.Chart,e=i.helpers,s={scaleShowLabelBackdrop:!0,scaleBackdropColor:"rgba(255,255,255,0.75)",scaleBeginAtZero:!0,scaleBackdropPaddingY:2,scaleBackdropPaddingX:2,scaleShowLine:!0,segmentShowStroke:!0,segmentStrokeColor:"#fff",segmentStrokeWidth:2,animationSteps:100,animationEasing:"easeOutBounce",animateRotate:!0,animateScale:!1,legendTemplate:'<ul class="<%=name.toLowerCase()%>-legend"><% for (var i=0; i<segments.length; i++){%><li><span style="background-color:<%=segments[i].fillColor%>"></span><%if(segments[i].label){%><%=segments[i].label%><%}%></li><%}%></ul>'};i.Type.extend({name:"PolarArea",defaults:s,initialize:function(t){this.segments=[],this.SegmentArc=i.Arc.extend({showStroke:this.options.segmentShowStroke,strokeWidth:this.options.segmentStrokeWidth,strokeColor:this.options.segmentStrokeColor,ctx:this.chart.ctx,innerRadius:0,x:this.chart.width/2,y:this.chart.height/2}),this.scale=new i.RadialScale({display:this.options.showScale,fontStyle:this.options.scaleFontStyle,fontSize:this.options.scaleFontSize,fontFamily:this.options.scaleFontFamily,fontColor:this.options.scaleFontColor,showLabels:this.options.scaleShowLabels,showLabelBackdrop:this.options.scaleShowLabelBackdrop,backdropColor:this.options.scaleBackdropColor,backdropPaddingY:this.options.scaleBackdropPaddingY,backdropPaddingX:this.options.scaleBackdropPaddingX,lineWidth:this.options.scaleShowLine?this.options.scaleLineWidth:0,lineColor:this.options.scaleLineColor,lineArc:!0,width:this.chart.width,height:this.chart.height,xCenter:this.chart.width/2,yCenter:this.chart.height/2,ctx:this.chart.ctx,templateString:this.options.scaleLabel,valuesCount:t.length}),this.updateScaleRange(t),this.scale.update(),e.each(t,function(t,i){this.addData(t,i,!0)},this),this.options.showTooltips&&e.bindEvents(this,this.options.tooltipEvents,function(t){var i="mouseout"!==t.type?this.getSegmentsAtEvent(t):[];e.each(this.segments,function(t){t.restore(["fillColor"])}),e.each(i,function(t){t.fillColor=t.highlightColor}),this.showTooltip(i)}),this.render()},getSegmentsAtEvent:function(t){var i=[],s=e.getRelativePosition(t);return e.each(this.segments,function(t){t.inRange(s.x,s.y)&&i.push(t)},this),i},addData:function(t,i,e){var s=i||this.segments.length;this.segments.splice(s,0,new this.SegmentArc({fillColor:t.color,highlightColor:t.highlight||t.color,label:t.label,value:t.value,outerRadius:this.options.animateScale?0:this.scale.calculateCenterOffset(t.value),circumference:this.options.animateRotate?0:this.scale.getCircumference(),startAngle:1.5*Math.PI})),e||(this.reflow(),this.update())},removeData:function(t){var i=e.isNumber(t)?t:this.segments.length-1;this.segments.splice(i,1),this.reflow(),this.update()},calculateTotal:function(t){this.total=0,e.each(t,function(t){this.total+=t.value},this),this.scale.valuesCount=this.segments.length},updateScaleRange:function(t){var i=[];e.each(t,function(t){i.push(t.value)});var s=this.options.scaleOverride?{steps:this.options.scaleSteps,stepValue:this.options.scaleStepWidth,min:this.options.scaleStartValue,max:this.options.scaleStartValue+this.options.scaleSteps*this.options.scaleStepWidth}:e.calculateScaleRange(i,e.min([this.chart.width,this.chart.height])/2,this.options.scaleFontSize,this.options.scaleBeginAtZero,this.options.scaleIntegersOnly);e.extend(this.scale,s,{size:e.min([this.chart.width,this.chart.height]),xCenter:this.chart.width/2,yCenter:this.chart.height/2})},update:function(){this.calculateTotal(this.segments),e.each(this.segments,function(t){t.save()}),this.render()},reflow:function(){e.extend(this.SegmentArc.prototype,{x:this.chart.width/2,y:this.chart.height/2}),this.updateScaleRange(this.segments),this.scale.update(),e.extend(this.scale,{xCenter:this.chart.width/2,yCenter:this.chart.height/2}),e.each(this.segments,function(t){t.update({outerRadius:this.scale.calculateCenterOffset(t.value)})},this)},draw:function(t){var i=t||1;this.clear(),e.each(this.segments,function(t,e){t.transition({circumference:this.scale.getCircumference(),outerRadius:this.scale.calculateCenterOffset(t.value)},i),t.endAngle=t.startAngle+t.circumference,0===e&&(t.startAngle=1.5*Math.PI),e<this.segments.length-1&&(this.segments[e+1].startAngle=t.endAngle),t.draw()},this),this.scale.draw()}})}.call(this),function(){"use strict";var t=this,i=t.Chart,e=i.helpers;i.Type.extend({name:"Radar",defaults:{scaleShowLine:!0,angleShowLineOut:!0,scaleShowLabels:!1,scaleBeginAtZero:!0,angleLineColor:"rgba(0,0,0,.1)",angleLineWidth:1,pointLabelFontFamily:"'Arial'",pointLabelFontStyle:"normal",pointLabelFontSize:10,pointLabelFontColor:"#666",pointDot:!0,pointDotRadius:3,pointDotStrokeWidth:1,pointHitDetectionRadius:20,datasetStroke:!0,datasetStrokeWidth:2,datasetFill:!0,legendTemplate:'<ul class="<%=name.toLowerCase()%>-legend"><% for (var i=0; i<datasets.length; i++){%><li><span style="background-color:<%=datasets[i].strokeColor%>"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>'},initialize:function(t){this.PointClass=i.Point.extend({strokeWidth:this.options.pointDotStrokeWidth,radius:this.options.pointDotRadius,display:this.options.pointDot,hitDetectionRadius:this.options.pointHitDetectionRadius,ctx:this.chart.ctx}),this.datasets=[],this.buildScale(t),this.options.showTooltips&&e.bindEvents(this,this.options.tooltipEvents,function(t){var i="mouseout"!==t.type?this.getPointsAtEvent(t):[];this.eachPoints(function(t){t.restore(["fillColor","strokeColor"])}),e.each(i,function(t){t.fillColor=t.highlightFill,t.strokeColor=t.highlightStroke}),this.showTooltip(i)}),e.each(t.datasets,function(i){var s={label:i.label||null,fillColor:i.fillColor,strokeColor:i.strokeColor,pointColor:i.pointColor,pointStrokeColor:i.pointStrokeColor,points:[]};this.datasets.push(s),e.each(i.data,function(e,n){var o;this.scale.animation||(o=this.scale.getPointPosition(n,this.scale.calculateCenterOffset(e))),s.points.push(new this.PointClass({value:e,label:t.labels[n],datasetLabel:i.label,x:this.options.animation?this.scale.xCenter:o.x,y:this.options.animation?this.scale.yCenter:o.y,strokeColor:i.pointStrokeColor,fillColor:i.pointColor,highlightFill:i.pointHighlightFill||i.pointColor,highlightStroke:i.pointHighlightStroke||i.pointStrokeColor}))},this)},this),this.render()},eachPoints:function(t){e.each(this.datasets,function(i){e.each(i.points,t,this)},this)},getPointsAtEvent:function(t){var i=e.getRelativePosition(t),s=e.getAngleFromPoint({x:this.scale.xCenter,y:this.scale.yCenter},i),n=2*Math.PI/this.scale.valuesCount,o=Math.round((s.angle-1.5*Math.PI)/n),a=[];return(o>=this.scale.valuesCount||0>o)&&(o=0),s.distance<=this.scale.drawingArea&&e.each(this.datasets,function(t){a.push(t.points[o])}),a},buildScale:function(t){this.scale=new i.RadialScale({display:this.options.showScale,fontStyle:this.options.scaleFontStyle,fontSize:this.options.scaleFontSize,fontFamily:this.options.scaleFontFamily,fontColor:this.options.scaleFontColor,showLabels:this.options.scaleShowLabels,showLabelBackdrop:this.options.scaleShowLabelBackdrop,backdropColor:this.options.scaleBackdropColor,backdropPaddingY:this.options.scaleBackdropPaddingY,backdropPaddingX:this.options.scaleBackdropPaddingX,lineWidth:this.options.scaleShowLine?this.options.scaleLineWidth:0,lineColor:this.options.scaleLineColor,angleLineColor:this.options.angleLineColor,angleLineWidth:this.options.angleShowLineOut?this.options.angleLineWidth:0,pointLabelFontColor:this.options.pointLabelFontColor,pointLabelFontSize:this.options.pointLabelFontSize,pointLabelFontFamily:this.options.pointLabelFontFamily,pointLabelFontStyle:this.options.pointLabelFontStyle,height:this.chart.height,width:this.chart.width,xCenter:this.chart.width/2,yCenter:this.chart.height/2,ctx:this.chart.ctx,templateString:this.options.scaleLabel,labels:t.labels,valuesCount:t.datasets[0].data.length}),this.scale.setScaleSize(),this.updateScaleRange(t.datasets),this.scale.buildYLabels()},updateScaleRange:function(t){var i=function(){var i=[];return e.each(t,function(t){t.data?i=i.concat(t.data):e.each(t.points,function(t){i.push(t.value)})}),i}(),s=this.options.scaleOverride?{steps:this.options.scaleSteps,stepValue:this.options.scaleStepWidth,min:this.options.scaleStartValue,max:this.options.scaleStartValue+this.options.scaleSteps*this.options.scaleStepWidth}:e.calculateScaleRange(i,e.min([this.chart.width,this.chart.height])/2,this.options.scaleFontSize,this.options.scaleBeginAtZero,this.options.scaleIntegersOnly);e.extend(this.scale,s)},addData:function(t,i){this.scale.valuesCount++,e.each(t,function(t,e){var s=this.scale.getPointPosition(this.scale.valuesCount,this.scale.calculateCenterOffset(t));this.datasets[e].points.push(new this.PointClass({value:t,label:i,x:s.x,y:s.y,strokeColor:this.datasets[e].pointStrokeColor,fillColor:this.datasets[e].pointColor}))},this),this.scale.labels.push(i),this.reflow(),this.update()},removeData:function(){this.scale.valuesCount--,this.scale.labels.shift(),e.each(this.datasets,function(t){t.points.shift()},this),this.reflow(),this.update()},update:function(){this.eachPoints(function(t){t.save()}),this.reflow(),this.render()},reflow:function(){e.extend(this.scale,{width:this.chart.width,height:this.chart.height,size:e.min([this.chart.width,this.chart.height]),xCenter:this.chart.width/2,yCenter:this.chart.height/2}),this.updateScaleRange(this.datasets),this.scale.setScaleSize(),this.scale.buildYLabels()},draw:function(t){var i=t||1,s=this.chart.ctx;this.clear(),this.scale.draw(),e.each(this.datasets,function(t){e.each(t.points,function(t,e){t.hasValue()&&t.transition(this.scale.getPointPosition(e,this.scale.calculateCenterOffset(t.value)),i)},this),s.lineWidth=this.options.datasetStrokeWidth,s.strokeStyle=t.strokeColor,s.beginPath(),e.each(t.points,function(t,i){0===i?s.moveTo(t.x,t.y):s.lineTo(t.x,t.y)},this),s.closePath(),s.stroke(),s.fillStyle=t.fillColor,s.fill(),e.each(t.points,function(t){t.hasValue()&&t.draw()})},this)}})}.call(this);
/**
 * The Circle Menu object represents a choice menu of multiple menu items.<br><br>
 * <b>Sample Declaration</b><br>
 * <pre>
 * {
 *   component: $ui.CircleMenu,
 *    items: [
 *    {
 *        caption: 'music',
 *        visible: false,
 *        img: 'img/music.png'
 *    },
 *    {
 *        caption: 'maps',
 *        img: 'img/maps.png'
 *    }],
 *    onclick: function(item) {
 *        console.log(item.caption + ' clicked');
 *    }
 *}
 * @namespace CircleMenu
 * @memberof $ui
 * @extends $ui.CoreComponent
 * @property {$ui.CircleMenuItem[]} [items] - The items property is an array of menu items to be displayed in the control
 * @property {$ui.DataProviderLink} [provider] - The type of data provider value for a circle menu control should point to a property in the data provider that would follow the same rules as hard coding an array of items.
 * @property {CircleMenuClickEvent} [onclick] - This event fires when an item in the menu is clicked. The parameter passed to the event is [the item]{@link $ui.CircleMenuItem} which was clicked.
 */
function $ui_CircleMenu(object, screen) {
	$ui_CoreComponent.call(this, object, screen);
	$ui.addClass(object.dom,'ui-circle-menu');
	
	// Re layout the menu items
	object._recalculateLayout = function() {
		if (this.items.length === 0) return;
		var i,
			x,
			y,
			item,
			coord,
			visibleItems = [],
			offsetHeight = this.dom.offsetHeight,
			offsetWidth = this.dom.offsetWidth,
			coordinates = [];
		// Gather only our visible items
		for (i = 0; i < this.items.length; i++) {
			item = this.items[i];
			if (item.visible == true) {
				visibleItems.push(item);
			}
		}
		var numItems = visibleItems.length,
			size = visibleItems[0].getSize();
		// Determine our layout
		if ($system && $system.isClientDevice) {
			var coord,
				row = 0,
				col = 0,
				maxItems = (numItems > 6) ? 6 : numItems,
				slot = Math.floor(offsetWidth/2),
				xOffset = Math.floor(slot/2 - size/2),
				rowHeight = Math.floor(offsetHeight/3),
				yOffset = Math.floor(rowHeight/2 - size/2);
			// Loop through and set our coordinates
			for (i = 0; i < maxItems; i++) {
				coord = {
					X: (col * slot) + xOffset,
					Y: (row * rowHeight) + yOffset
				};
				coordinates.push(coord);
				col++
				if (col > 1) {
					row++;
					col = 0;
				}
			}
		} else {
			switch (true) {
				case (numItems <= 3):
					var buffer = (numItems === 2) ? Math.floor(size/2) : 0, // This provides some spacing on the left/right
						slot = Math.floor((offsetWidth-(buffer*2))/numItems),
						xOffset = Math.floor(slot/2 - size/2);
					y = Math.floor(offsetHeight/2 - size/2);
					for (i = 0; i < numItems; i++) {
						coord = {
							X: (i * slot) + buffer + xOffset,
							Y: y
						};
						coordinates.push(coord);
					}
					break;
				case (numItems <= 6):
					var slot = Math.floor(offsetWidth/3),
						xOffset = Math.floor(slot/2 - size/2),
						row = Math.floor(offsetHeight/2),
						yOffset = Math.floor(row/2 - size/2);
					// Top row
					for (i = 0; i < 3; i++) {
						coord = {
							X: (i * slot) + xOffset,
							Y: yOffset
						};
						coordinates.push(coord);
					}
					// Now bottom row
					var buffer = ((numItems-3) === 2) ? Math.floor(size/2) : 0;
					slot = Math.floor((offsetWidth-(buffer*2))/(numItems-3));
					xOffset = Math.floor(slot/2 - size/2);
					for (i = 3; i < numItems; i++) {
						coord = {
							X: ((i-3) * slot) + buffer + xOffset,
							Y: row + yOffset
						};
						coordinates.push(coord);
					}
					break;
			}
		}
		// Set our coordinates
		for (i = 0; i < visibleItems.length; i++) {
			item = visibleItems[i];
			coord = coordinates[i];
			item.dom.style['-webkit-transform'] = 'translate('+coord.X+'px,'+coord.Y+'px)';
		}
	}
	object._recalculateLayout = object._recalculateLayout.bind(object);
	
	// Private function to add a new item to the list
	object._addItem = function(item) {
		item.parent = this;
		itemDom = new $ui_CircleMenuItem(item, this.screen);
		if (itemDom) {
			object.dom.appendChild(itemDom);
			return true;
		} else {
			return false;
		}
	}
	object._addItem = object._addItem.bind(object);
	
	/** 
	 * You can add an item to the end of the menu by calling the addItem function and passing in an object that matches the a menu item
	 * @function addItem
	 * @memberof $ui.CircleMenu
	 * @param {$ui.CircleMenuItem} item - Item to be added to the menu
	 */
	object.addItem = function(item) {
		if (this._addItem(item)) {
			this.items.push(item);
			return true;
		} else {
			return false;
		}
		this._recalculateLayout();
	}
	object.addItem = object.addItem.bind(object);
	
	/** 
	 * You can refresh all the items in a menu by calling the refreshItems function with an array of new items
	 * @function refreshItems
	 * @memberof $ui.CircleMenu
	 * @param {$ui.CircleMenuItem[]} items - Array of items to refresh the menu
	 */
	object.refreshItems = function(itemArray) {
		if (itemArray == undefined) return; // No data provided
		var i,
			item;
		if (this.items) {
			// Remove all existing items first
			for (i = this.items.length - 1; i >= 0; i--) {
				item = this.items[i];
				try {
					if (item.dom) {
						this.dom.removeChild(item.dom);
					}
				} catch (ex) {
					console.log('$ui.List: ' + ex);
				}
				this.items.pop();
				if (item._destroy) {
					item._destroy();
				}
			}
		}
		this.addItemBatch(itemArray);
	}
	object.refreshItems = object.refreshItems.bind(object);
	
	/** 
	 * This function is much like the refreshItems function but instead it loads a list of circle menu items to the end of the current menu and does not replace the existing menu items.
	 * @function addItemBatch
	 * @memberof $ui.CircleMenu
	 * @param {$ui.CircleMenuItem[]} items - Array of items to be added to the menu
	 */
	object.addItemBatch = function(itemArray) {
		var i,
			item;
		if (!this.items) {
			this.items = [];
		}
		// Add all new items into the list
		for (i = 0; i < itemArray.length; i++) {
			item = itemArray[i];
			if (this._addItem(item)) {
				this.items.push(item);
			}
		}
		this._recalculateLayout();
	}
	object.addItemBatch = object.addItemBatch.bind(object);
	
	/** 
	 * Insert item works similar to addItem but instead will insert the item into the menu at the index specified. If an invalid index is specified it will result in failure to insert the item. To insert an item at the top of a menu call insert with the index of 0.
	 * @function insertItem
	 * @memberof $ui.CircleMenu
	 * @param {$ui.CircleMenuItem} item - Item to be inserted into the menu
	 * @param {number} index - Index to insert the item
	 */
	object.insertItem = function(item, index) {
		item.parent = this;
		if (index < 0) {
			return false;
		} else if (this.items.length == 0) {
			this.addItem(item);
			return true;
		} else if (index > this.items.length - 1) {
			this.addItem(item);
			return true;
		} else { // Insert it at the index
			var existingItem = this.items[index],
				itemDom = new $ui_CircleMenuItem(item, this.screen);
			this.items.splice(index, 0, item);
			this.dom.insertBefore(itemDom, existingItem.dom);
			return true;
		} 
		return false;
	}
	object.insertItem = object.insertItem.bind(object);
	
	// Private function to handle provider updates
	object._providerUpdate = function(value) {
		this.refreshItems(value);
	}
	object._providerUpdate = object._providerUpdate.bind(object);
	
	// Handle resize of screen
	object._onresize = function() {
		this._recalculateLayout();
	}
	object._onresize = object._onresize.bind(object);
	
	// If there is no data provider then just create the items
	if (!object.provider) {
		var i,
			item,
			itemDom;
		for (i = 0; i < object.items.length; i++) {
			item = object.items[i];
			object._addItem(item);
		}
		// Re-calculate once the screen dimensions have been calculated
		setTimeout(object._onresize,0); 
	}	
	
	return object.dom;
}
$ui_CircleMenu.prototype = new $ui_CoreComponent();

/**
 * The {@link $ui.CircleMenu} <b>onclick</b> event will fire when the user clicks a menu item
 * @callback CircleMenuClickEvent
 * @param {$ui.CircleMenuItem} item - The menu item that the user clicked
 */
/**
 * A circle menu item is used within a [Circle Menu]{@link $ui.CircleMenu}.  <b>NOTE: It cannot be defined on its own outside of a circle menu</b> 
 * @namespace CircleMenuItem
 * @memberof $ui
 * @extends $ui.CoreComponent
 * @property {string} caption - Text to appear on the menu item
 * @property {boolean} [visible=true] - Visibility state of the menu item
 * @property {string} img - Path to the image to be displayed in the menu item
 */
function $ui_CircleMenuItem(object, screen) {
	$ui_CoreComponent.call(this, object, screen);
	$ui.addClass(object.dom,'menu-item');
	
	// Create inner circle
	object.dom.inner = document.createElement('div');
	object.dom.inner.model = object;
	$ui.addClass(object.dom.inner,'circle');
	object.dom.appendChild(object.dom.inner);
	object.dom.inner.onclick = function() {
		this.model._raiseInteractionEvent('data-interaction-click');
		$ui.playTouchSound();
		if (this.model.parent.onclick) {
			this.model.parent.onclick(this.model);
		}
	}
	object.dom.inner.ontouchstart = function() {
		this.style.backgroundColor = $ui.theme.color;
	}
	object.dom.inner.ontouchend = function() {
		this.style.backgroundColor = '';
	}
	object.dom.inner.ontouchcancel = object.dom.inner.ontouchend;
	if (!$ui.isMobileDevice()) {
		object.dom.inner.onmousedown = object.dom.inner.ontouchstart;
		object.dom.inner.onmouseup = object.dom.inner.ontouchend;
		object.dom.inner.onmouseleave = object.dom.inner.ontouchend;
	}
	// Add our mark for automation
	if (object.id) {
		object.dom.inner.setAttribute('data-interaction-click', object.id);
	}
	
	// Create the icon area 
	object.dom.icon = document.createElement('div');
	$ui.addClass(object.dom.icon,'icon');
	object.dom.inner.appendChild(object.dom.icon);
	
	// Set the image
	if (object.img) {
		object.dom.icon.style.backgroundImage = 'url("'+ object.img + '")';
	}
	
	// Add our caption
	object.dom.captionDiv = document.createElement('div');
	$ui.addClass(object.dom.captionDiv,'caption');
	object.dom.appendChild(object.dom.captionDiv);
	if (object.caption) {
		object.dom.captionDiv.textContent = object.caption;
	}
	
	// Returns the size of the menu item
	object.getSize = function() {
		return this.dom.offsetWidth;
	}
	object.getSize = object.getSize.bind(object);
	
	// Handle Visibility change
	object._setVisible = function(value) {
		if (this.parent) {
			this.parent._recalculateLayout();
		}
	}
	object._setVisible = object._setVisible.bind(object);
	
	return object.dom;
}

$ui_CircleMenuItem.prototype = new $ui_CoreComponent();
/**
 * The Control Group object represents a grouping of multiple different controls.  This component can be useful when you want to group different controls together for toggling visibility.<br><br>
 * <b>Sample Declaration</b><br>
 * <pre>
 * {
 *   component: $ui.ControlGroup,
 *    id: 'myGrouping',
 *    content: [
 *       {
 *           component: $ui.Header,
 *           caption: 'My Header',
 *       },
 *       {
 *           component: $ui.List,
 *           style: $ui.GenericListItem
 *       }
 *    ]
 *}
 * @namespace ControlGroup
 * @memberof $ui
 * @extends $ui.CoreComponent
 * @property {$ui.CoreComponent[]} [content] - The content property is an array of control definitions to be displayed in the control
*/
function $ui_ControlGroup(object, screen) {
	$ui_CoreComponent.call(this, object, screen);
	$ui.addClass(object.dom,'ui-control-group');
	
	// If there is no data provider then just create the items
	if (object.content) {
		var i,
			item,
			itemDom;
		for (i = 0; i < object.content.length; i++) {
			item = object.content[i];
			itemDom = $ui.createControl(item, object.screen);
			if (itemDom) {
				object.dom.appendChild(itemDom);
			}
		}
	}	
	
	return object.dom;
}

$ui_ControlGroup.prototype = new $ui_CoreComponent();
/**
 * The CoreTile object represents the abstract base class for all tile controls. <br><br>
 * <b>NOTE: This base class should never be declared in a screen's declaration. It will not actually render and return a tile. It is simply an abstract base class.</b>
 * @namespace CoreTile
 * @memberof $ui
 * @extends $ui.CoreComponent
 */
function $ui_CoreTile(object, screen) {
	$ui_CoreComponent.call(this, object, screen);
	if (object) {
		$ui.addClass(object.dom,'ui-tile');
		object._contentShowing = false;
		if ($ui.theme.rootClass && $ui.theme.rootClass.indexOf('ui-theme-dark') > -1) {
			object.dom.style.borderColor = $ui.theme.color;
		}
		
		/** 
		 * The size of a tile. This property should be set by the internal code of a derivative Tile class.
		 * @name _size
		 * @memberof $ui.CoreTile
		 * @protected
		 * @type {$ui.TileSize}
		 */
		if (object._size && (object._size != $ui.TileSize.STANDARD)) {
			$ui.addClass(object.dom, object._size);
		}
		
		// Create our loading area
		object.dom.loadingDiv = document.createElement('div');
		$ui.addClass(object.dom.loadingDiv, 'loading');
		object.dom.appendChild(object.dom.loadingDiv);
		object.dom.spinner = new $ui_Spinner({component: $ui.Spinner, size: $ui.Spinner.SMALL},screen);
		object.dom.loadingDiv.appendChild(object.dom.spinner);
		
		// Create our content area
		object.dom.contentDiv = document.createElement('div');
		$ui.addClass(object.dom.contentDiv, 'content');
		object.dom.appendChild(object.dom.contentDiv);	
		
		/** 
		 * This function is to be called when a tile needs to be toggled between the loading state and content state. 
		 * @function showContent
		 * @memberof $ui.CoreTile
		 * @param {boolean} value - The value parameter represents the boolean state of visibility of the tile content.
		 */
		object.showContent = function(value) {
			if (value == this._contentShowing) return;
			if (value) {
				this.dom.loadingDiv.style.display = 'none';
				this.dom.contentDiv.style.display = 'inherit';
			} else {
				this.dom.loadingDiv.style.display = 'inline';
				this.dom.contentDiv.style.display = 'none';
			}
			this._contentShowing = value;
		}
		object.showContent = object.showContent.bind(object);
	}
}
$ui_CoreTile.prototype = new $ui_CoreComponent();


/**
 * The CoreTileDonutChart is the abstract base class of any donut chart tiles. This base class should never be declared in a screen's declaration.
 * <b>NOTE: It will not actually render and return a tile. It is simply an abstract base class.</b>
 * @namespace CoreTileDonutChart
 * @memberof $ui
 * @extends $ui.CoreTile
 */
function $ui_CoreTileDonutChart(object, screen) {
	$ui_CoreTile.call(this, object, screen);
	if (object) {
		$ui.addClass(object.dom,'ui-tile-donut-chart');
		
		// Create our chart area
		object.dom.chartDiv = document.createElement('div');
		$ui.addClass(object.dom.chartDiv, 'chart'); // Base class styling
		object.dom.contentDiv.appendChild(object.dom.chartDiv);
		
		// Create our canvas area
		object.dom.canvas = document.createElement('canvas');
		object.dom.chartDiv.appendChild(object.dom.canvas);

		// Create our chart
		object.chart = new Chart(object.dom.canvas.getContext('2d'));
		
		/** 
		 * This function takes a value parameter which is an array of data point objects. These data point objects defined a section of the chart and consist of two properties representing value and color
		 * @function _setData
		 * @memberof $ui.CoreTileDonutChart
		 * @param {object[]} value - Array of data points. <br/><b>Example:</b>
		 * <pre>
		 * [
		 *   {
		 *      value: 10,
		 *      color: '#000000',
		 *   },
		 *   {
		 *      value: 90,
		 *      color: '#FEFEFE',
		 *   }
		 * ]
		 * </pre>
		 * @protected
		 */
		object._setData = function(data) {
			this.chart.Doughnut(data,{showTooltips: false, segmentStrokeColor : "transparent",});
		}
		object._setData = object._setData.bind(object);
		
		// Create the caption area
		object.dom.caption = document.createElement('div');
		$ui.addClass(object.dom.caption,'caption');
		object.dom.contentDiv.appendChild(object.dom.caption);
		
		/** 
		 * This function will set the caption of the Donut chart.
		 * @function _setCaption
		 * @memberof $ui.CoreTileDonutChart
		 * @param {string} value - Text for the caption
		 * @protected
		 */
		object._setCaption = function(value) {
			this.dom.caption.innerHTML = value;
		}
		object._setCaption = object._setCaption.bind(object);
		
		// Create the accent area
		object.dom.accent = document.createElement('div');
		$ui.addClass(object.dom.accent,'accent');
		object.dom.contentDiv.appendChild(object.dom.accent);
		var color = ($ui.theme.rootClass && $ui.theme.rootClass.indexOf('ui-theme-dark') > -1)  ? $ui.color_DARK : $ui.color_LIGHT
		object.dom.accent.style.color = color;
		
		/** 
		 * This function will set the accent text of the Donut chart
		 * @function _setAccent
		 * @memberof $ui.CoreTileDonutChart
		 * @param {string} value - Text for the accent
		 * @protected
		 */
		object._setAccent = function(value) {
			if (value == undefined) {
				$ui.removeClass(this.dom.contentDiv, 'has-accent');
				this.dom.accent.textContent = '';
				this.accent = value;
				return;
			}
			this.accent = value;
			$ui.addClass(this.dom.contentDiv, 'has-accent');
			this.dom.accent.textContent = value;
		}
		object._setAccent = object._setAccent.bind(object);
	}
}

$ui_CoreTileDonutChart.prototype = new $ui_CoreTile();
/**
 * The CoreTileGauge is the abstract base class of any gauge chart tiles.
 * <b>NOTE: It will not actually render and return a tile. It is simply an abstract base class.</b><br><br>
 * <b>Sample Declaration:</b>
 * <pre>
 * {
 *    min: 0,
 *    max: 1.5,
 *    value: 1
 *}
 * </pre>
 * @namespace CoreTileGauge
 * @memberof $ui
 * @extends $ui.CoreTile
 * @property {number} min - This is the minimum numeric value that you want to display at the left hand side of the gauge
 * @property {number} max - This is the maximum numeric value that you want to display at the right hand side of the gauge
 * @property {number} value - The numeric value you want to display. This should be between min and max.
 */
function $ui_CoreTileGauge(object, screen) {
	if (object) object._size = undefined; // Always square
	$ui_CoreTile.call(this, object, screen);
	if (object) {
		$ui.addClass(object.dom,'ui-tile-gauge');

		// Create our title area
		object.dom.titleDiv = document.createElement('div');
		$ui.addClass(object.dom.titleDiv,'title');
		object.dom.contentDiv.appendChild(object.dom.titleDiv);
		
		/** 
		 * This function will set the title of the gauge chart.
		 * @function _setTitle
		 * @memberof $ui.CoreTileGauge
		 * @param {string} value - Value to be used as the title
		 * @protected
		 */
		object._setTitle = function(value) {
			if (value == undefined || value == null) value = '';
			object.dom.titleDiv.textContent = value;
		}
		object._setTitle = object._setTitle.bind(object);
		
		// Create our chart area
		object.dom.chartDiv = document.createElement('div');
		$ui.addClass(object.dom.chartDiv, 'chart'); // Base class styling
		object.dom.contentDiv.appendChild(object.dom.chartDiv);
		
		// Create our canvas area
		object.dom.canvas = document.createElement('canvas');
		object.dom.canvas.width = 200;
		object.dom.canvas.height = 200;
		$ui.addClass(object.dom.canvas,'graph-canvas');
		object.dom.chartDiv.appendChild(object.dom.canvas);

		// Add our bottom labels
		object.dom.labels = document.createElement('div');
		$ui.addClass(object.dom.labels, 'labels-area');
		object.dom.chartDiv.appendChild(object.dom.labels);
		
		// Min Label
		object.dom.minLabel = document.createElement('div');
		$ui.addClass(object.dom.minLabel, 'label');
		$ui.addClass(object.dom.minLabel, 'left');
		object.dom.labels.appendChild(object.dom.minLabel);
		
		// Max Label
		object.dom.maxLabel = document.createElement('div');
		$ui.addClass(object.dom.maxLabel, 'label');
		$ui.addClass(object.dom.maxLabel, 'right');
		object.dom.labels.appendChild(object.dom.maxLabel);
		
		// Accent Label
		object.dom.accentLabel = document.createElement('div');
		$ui.addClass(object.dom.accentLabel, 'label');
		$ui.addClass(object.dom.accentLabel, 'center');
		object.dom.labels.appendChild(object.dom.accentLabel);
		/** 
		 * This function will set the title of the gauge chart.
		 * @function _setAccent
		 * @memberof $ui.CoreTileGauge
		 * @param {string} value - Value to use as the accent text
		 * @protected
		 */
		object._setAccent = function(value) {
			if (value == undefined || value == null) value = '';
			object.dom.accentLabel.textContent = value;
		}
		object._setAccent = object._setAccent.bind(object);
		
		// Value Label
		object.dom.valueDiv = document.createElement('div');
		$ui.addClass(object.dom.valueDiv, 'value');
		object.dom.chartDiv.appendChild(object.dom.valueDiv);
		
		// Create our chart Context 
		var ctx = object.dom.canvas.getContext('2d');
		object.dom.ctx = ctx;
		object._width = object.dom.canvas.width;
		object._height = object.dom.canvas.height;
		
		// This will render our filled in area
		object._renderLoop = function() {
			if (this._degrees > this._newDegrees) {
				return;
			}
			requestAnimationFrame(this._renderLoop)
			
			//Angle in radians = angle in degrees * PI / 180
			var ctx = this.dom.ctx,
				radians = this._degrees * Math.PI / 180;
			
			//Clear the canvas every time a chart is drawn
			ctx.clearRect(0, 0, this._width, this._height);
		
			//Background 180 degree arc
			ctx.beginPath();
			ctx.strokeStyle = ($ui.theme.rootClass && $ui.theme.rootClass.indexOf('ui-theme-dark') > -1) ? $ui.color_DARK : $ui.color_LIGHT;
			ctx.lineWidth = 40;
			ctx.arc(this._width/2, this._height/2, 80, 0 - 180*Math.PI/180, Math.PI/180, false); //you can see the arc now
			ctx.stroke();
			
			// Now render our value
			ctx.beginPath();
			ctx.strokeStyle = this._color;
			//The arc starts from the rightmost end. If we deduct 180 degrees from the angles
			//the arc will start from the leftmost end
			ctx.arc(this._width/2, this._height/2, 80, 0 - 180*Math.PI/180, radians - 180*Math.PI/180, false); 
			//you can see the arc now
			ctx.stroke();
			
			if (this._degrees <= this._newDegrees) {
				this._degrees = this._degrees + this._step;
			}
			
		}
		object._renderLoop = object._renderLoop.bind(object);
		
		// This function will populate the control with the current values and then render the control
		object._populateData = function() {
			// Correct any bad data
			if (this.min == undefined) this.min = 0;
			if (this.max == undefined) this.max = 100;
			if (this.value == undefined) this.value = this.min;
			if (this.value < this.min) this.value = this.min;
			
			// Set our labels
			this.dom.minLabel.textContent = this.min;
			this.dom.maxLabel.textContent = this.max;
			this.dom.valueDiv.textContent = this.value;
			
			var percent = ((this.value - this.min)/this.max);
			this._newDegrees = percent * 180;
			switch (true) {
				case (percent < 0.33):
					this._color = ($ui.theme.rootClass && $ui.theme.rootClass.indexOf('ui-theme-dark') > -1) ? $ui.theme.color : $ui.color_GREAT;
					this._step = 2;
					break;
				case (percent < 0.77):
					this._color = ($ui.theme.rootClass && $ui.theme.rootClass.indexOf('ui-theme-dark') > -1) ? $ui.theme.color : $ui.color_GOOD;
					this._step = 7;
					break;
				default:
					this._color = ($ui.theme.rootClass && $ui.theme.rootClass.indexOf('ui-theme-dark') > -1) ? $ui.theme.color : $ui.color_OK;
					this._step = 10;
					break;
			}
			//this._degrees = 0;
			this._degrees = this._newDegrees - this._step;// temporary to stop slow animation
			this._renderLoop();
		}
		object._populateData = object._populateData.bind(object);
	}
}

$ui_CoreTileGauge.prototype = new $ui_CoreTile();
/**
 * The DockLayout object represents a layout that allows for a static content and also scrolling content. The DockLayout will size itself to all the available space provided by its parent control.
 * <br><br><b>Sample Declaration</b>
 * <pre>
 * {
 *    component: $ui.DockLayout,
 *    dock: [
 *        {
 *            component: $ui.SegmentedControl,
 *            options: ['one','two']
 *        }
 *    ],
 *    content: [
 *        {
 *            component: $ui.List
 *        }
 *    ]
 *}
 * </pre>
 * @namespace DockLayout
 * @memberof $ui
 * @extends $ui.CoreComponent
 * @property {$ui.CoreComponent[]} dock - This array holds all of the component definitions for the docked content
 * @property {$ui.CoreComponent[]} content - This array holds all of the component definitions for the scrollable area of the dock layout
 * @property {$ui.DockLayout.DockLocation} [location=$ui.DockLayout.DockLocation.TOP] - This property allows you to set the location of the docked content.
 */
function $ui_DockLayout(object, screen) {
	$ui_CoreComponent.call(this, object, screen);
	$ui.addClass(object.dom,'ui-dock-layout');
	
	var i,
		control,
		controlDom;
	
	// Create our dock area
	object.dom.dock = document.createElement('div');
	$ui.addClass(object.dom.dock, 'dock');
	
	// Load our dock
	if (object.dock) {
		for (i = 0; i < object.dock.length; i++) {
			control = object.dock[i];
			controlDom = $ui.createControl(control, screen);
			if (controlDom) {
				object.dom.dock.appendChild(controlDom);
			}
		}
	}
	
	// Create our contents area
	object.dom.contentDiv = document.createElement('div');
	$ui.addClass(object.dom.contentDiv, 'contents');
	
	// Load our contents
	if (object.content) {
		for (i = 0; i < object.content.length; i++) {
			control = object.content[i];
			controlDom = $ui.createControl(control, screen);
			if (controlDom) {
				object.dom.contentDiv.appendChild(controlDom);
			}
		}
	}
	
	// Check our dock location
	if (object.location === $ui.DockLayout.DockLocation.BOTTOM) {
		object.dom.appendChild(object.dom.contentDiv);
		object.dom.appendChild(object.dom.dock)
	} else {
		object.dom.appendChild(object.dom.dock)
		object.dom.appendChild(object.dom.contentDiv);
	}
	
	return object.dom;
}

$ui_DockLayout.prototype = new $ui_CoreComponent();
/**
 * The generic list item type is used with the {@link $ui.List} component. A List component will define the type of list item it wishes to display by setting the <b>style</b> property of the control. 
 * <br><br><b>Sample Declaration</b>
 * <pre>
 * {
 *   img: 'thumbnails/foo.png',
 *   title: 'This is my title',
 *   accent: '6 hours ago',
 *   caption: 'My summary description'
 *}
 * </pre>
 * @namespace GenericListItem
 * @memberof $ui
 * @extends $ui.CoreComponent
 * @property {string} [img] - Represents the path to the image that will appear in the list item
 * @property {string} title - Represents the main title to display
 * @property {string} [accent] - Represents the accent text to go along with the title and caption
 * @property {string} [caption] - Represents the main text to show in the list item
 */
function $ui_GenericListItem(object, screen) {
	$ui_CoreComponent.call(this, object, screen);
	$ui.addClass(object.dom, 'ui-generic-list-item');
	
	// Create the image
	object.dom.img = document.createElement('div');
	$ui.addClass(object.dom.img,'img');
	object.dom.appendChild(object.dom.img);
	
	if(object.img != undefined && object.img != null && object.img != '') {
		// Image Loader
		object._loader = new Image();
		object._loader.model = object;
		object._loader.onload = function() {
			this.model.dom.img.style.backgroundImage = 'url("'+ this.model.img + '")';
			this.model.dom.img.style.opacity = '1.0';
			this.model._loader = undefined;
		}
		object._loader.onerror = function() {
			this.model.dom.img.style.backgroundImage = '';
			this.model.dom.img.style.opacity = '1.0';
			this.model._loader = undefined;
		}
		object._loader.src = object.img;
	} else {
		object.dom.img.style.opacity = '1.0';
		object.dom.loader = undefined;
	}
	
	// Details section
	object.dom.details = document.createElement('div');
	$ui.addClass(object.dom.details,'details');
	object.dom.appendChild(object.dom.details);
	
	// Title
	object.dom.titleArea = document.createElement('div');
	$ui.addClass(object.dom.titleArea,'title');
	object.dom.titleArea.textContent = object.title;
	object.dom.details.appendChild(object.dom.titleArea);

	// Caption
	object.dom.captionDiv = document.createElement('div');
	$ui.addClass(object.dom.captionDiv,'caption');
	object.dom.details.appendChild(object.dom.captionDiv);
	if (object.caption) {
		object.dom.captionDiv.textContent = object.caption;
	} else {
		$ui.addClass(object.dom, 'no-caption');
	}
	
	// Accent
	object.dom.accent = document.createElement('div');
	$ui.addClass(object.dom.accent,'accent');
	object.dom.details.appendChild(object.dom.accent);
	if ($ui.theme.rootClass && $ui.theme.rootClass.indexOf('ui-theme-dark') > -1) {
		object.dom.accent.style.color = $ui.theme.color;
	}
	if(object.accent != undefined) {
		object.dom.accent.textContent = object.accent;
		$ui.addClass(object.dom, 'has-accent');
	} 
	
	// Handle our touch events
	object.dom.ontouchstart = function() {
		this.style.backgroundColor = $ui.theme.color;
		if ($ui.theme.rootClass && $ui.theme.rootClass.indexOf('ui-theme-dark') > -1) {
			object.dom.accent.style.color = '';
		}
	}
	object.dom.ontouchend = function() {
		this.style.backgroundColor = '';
		if ($ui.theme.rootClass && $ui.theme.rootClass.indexOf('ui-theme-dark') > -1) {
			object.dom.accent.style.color = $ui.theme.color;
		}
	}
	object.dom.ontouchcancel = object.dom.ontouchend;
	if (!$ui.isMobileDevice()) {
		object.dom.onmousedown = object.dom.ontouchstart;
		object.dom.onmouseup = object.dom.ontouchend;
		object.dom.onmouseleave = object.dom.ontouchend;
	}

	// Pass the onclick back to the list
	object.dom.addEventListener('click', function() {
		if (this.model.parent.onaction == undefined) return;
		var event = new ListEvent(this.model, $ui.GenericListItem.GenericListEvent.ONCLICK);
		this.model.parent._onaction(this.model, event);
	},false);

	return object.dom;
}

$ui_GenericListItem.prototype = new $ui_CoreComponent();
/**
 * The Header object represents a screen separator with a caption.  This component can be useful when you wish to label different areas of the screen.  Headers can also be used as
 * an item in a {@link $ui.List} control<br><br>
 * <b>Sample Declaration</b><br>
 * <pre>
 * {
 *   component: $ui.Header,
 *   caption: 'My Lovely Header'
 * }
 * @namespace Header
 * @memberof $ui
 * @extends $ui.CoreComponent
 * @property {string} [caption] - The caption to be displayed in the control
*/
function $ui_Header(object, screen) {
	$ui_CoreComponent.call(this, object, screen);
	$ui.addClass(object.dom,'ui-header');
	object.dom.style['border-bottom-color'] = $ui.theme.color;
	
	if (object.caption) {
		object.dom.textContent = object.caption;
	}
	
	return object.dom;
}

$ui_Header.prototype = new $ui_CoreComponent();
/**
 * The image list item type is used with the {@link $ui.List} component. A List component will define the type of list item it wishes to display by setting the <b>style</b> property of the control. 
 * <br><br><b>Sample Declaration</b>
 * <pre>
 * {
 *   img: 'thumbnails/foo.png',
 *   caption: 'My summary description'
 *}
 * </pre>
 * @namespace ImageListItem
 * @memberof $ui
 * @extends $ui.CoreComponent
 * @property {string} img - Represents the path to the image that will appear in the list item
 * @property {string} [caption] - Represents the main text to show in the list item
 */
function $ui_ImageListItem(object, screen) {
	$ui_CoreComponent.call(this, object, screen);
	$ui.addClass(object.dom, 'ui-image-list-item');
	
	// Create the image
	object.dom.img = document.createElement('div');
	$ui.addClass(object.dom.img,'img');
	object.dom.appendChild(object.dom.img);
	
	if(object.img != undefined && object.img != null && object.img != '') {
		// Image Loader
		object._loader = new Image();
		object._loader.model = object;
		object._loader.onload = function() {
			this.model.dom.img.style.backgroundImage = 'url("'+ this.model.img + '")';
			this.model.dom.img.style.opacity = '1.0';
			this.model._loader = undefined;
		}
		object._loader.onerror = function() {
			this.model.dom.img.style.backgroundImage = '';
			this.model.dom.img.style.opacity = '1.0';
			this.model._loader = undefined;
		}
		object._loader.src = object.img;
	} else {
		object.dom.img.style.opacity = '1.0';
		object.dom.loader = undefined;
	}
	

	// Caption
	object.dom.captionDiv = document.createElement('div');
	$ui.addClass(object.dom.captionDiv,'caption');
	object.dom.appendChild(object.dom.captionDiv);
	if (object.caption) {
		object.dom.captionDiv.textContent = object.caption;
	} else {
		$ui.addClass(object.dom.captionDiv, 'no-caption');
	}

	// Pass the onclick back to the list
	object.dom.addEventListener('click', function() {
		if (this.model.parent.onaction == undefined) return;
		var event = new ListEvent(this.model, $ui.ImageListItem.ImageListEvent.ONCLICK);
		this.model.parent._onaction(this.model, event);
	},false);

	return object.dom;
}

$ui_ImageListItem.prototype = new $ui_CoreComponent();
/**
 * This object defines the type of background to be shown on the screen.<br><br>
 * <b>Sample Code:</b><br>
 * <pre>
 * {
 *   img: 'img/background.png', 
 *   repeat: true, 
 *}
 * </pre>
 * @class ScreenBackground
 * @param {string} img - Path to the background image
 * @param {boolean} [repeat=false] - Whether or not you want the background repeated/tiled
 */
function ScreenBackground(img, repeat) {
	/** 
	 * Path to the background image
	 * @member {string} img
	 * @memberOf ScreenBackground
	 */
	if (img == null) throw new Error('ScreenBackground: img cannot be null');
	if (img == undefined) throw new Error('ScreenBackground: img cannot be undefined');
	this.img = img;
	/** 
	 * Whether or not you want the background repeated/tiled
	 * @member {boolean} [repeat=false]
	 * @memberOf ScreenBackground
	 */
	if (repeat == undefined || repeat == null) {
		this.repeat = false;
	}
}
/**
 * The segmented control provides an actionable item for the user to choose between multiple options.
 * A segmented control's width will fill the width of the container in which it is a member.<br><br>
 * <b>Sample Declaration</b><br>
 * <pre>
 * {
 *   component: $ui.SegmentedControl,
 *   selectedIndex: 0,
 *   options: ['One', 'Two', 'Three'],
 *   onclick: function() {
 *      alert('You clicked: ' + this.options[this.selectedIndex]);
 *   }
 *}
 * @namespace SegmentedControl
 * @memberof $ui
 * @extends $ui.CoreComponent
 * @property {number} [selectedIndex=0] - Represents the index of the option you want to be selected. This property will also be updated whenever a user selects an option from the control. 
 * @property {string[]} options - This property represents the options provided by the control. It is an array of string values that will be displayed
 * @property {GenericEvent} [onclick] - The onclick event will fire when the user selects/clicks an option in the control. You can retrieve which option was selected by inspecting the <b>selectedIndex</b> property.
 */
function $ui_SegmentedControl(object, screen) {
	$ui_CoreComponent.call(this, object, screen);
	$ui.addClass(object.dom,'ui-segmented-control');	
	object.domOptions = [];
	
	/** 
	 * You can set the selected index for the control by using this function. This function will also raise the <i>onclick</i> event as though a user just clicked the control.
	 * @function setSelectedIndex
	 * @memberof $ui.SegmentedControl
	 * @param {number} index - Item to be added to the menu
	 */
	object.setSelectedIndex = function(index) {
		if (this.selectedIndex != index) {
			this.selectedIndex = index;
			// Trigger the onclick
			if (this.onclick) {
				this.onclick(); 
			}
		} 
		this._setSelectedIndex(index);
	}
	object.setSelectedIndex = object.setSelectedIndex.bind(object);
	
	// Private function to set the selected index for the control
	object._setSelectedIndex = function(index) {
		if (this.options) {
			var i,
				option;
			for (i = 0; i < this.domOptions.length; i++) {
				option = this.domOptions[i];
				if (i == index) {
					option._setSelected(true);
				} else {
					option._setSelected(false);
				}
			}
		}
	}
	object._setSelectedIndex = object._setSelectedIndex.bind(object);
	
	// Go through our options
	if (object.options) {
		var i,
			option, 
			percentage = 100/object.options.length;
		
		for (i = 0; i < object.options.length; i++) {
			option = document.createElement('div');
			$ui.addClass(option,'button');
			if (i == 0) {
				$ui.addClass(option,'left');
			} else if (i == object.options.length -1) {
				$ui.addClass(option,'right');
			}
			option.model = object;
			option.index = i;
			option.selected = false;
			option.style.width = percentage + '%';
			option.style.left = (i * percentage) + '%';
			option.textContent = object.options[i];
			object.domOptions.push(option);
			object.dom.appendChild(option);
			
			// Pass the onclick back to the list
			option.addEventListener('click', function() {
				if (this.model.enabled == false) return;
				if (this.selected) return;
				this.model.setSelectedIndex(this.index);
			},false);
			
			// Change the selected state for the button
			option._setSelected = function(value) {
				this.selected = value;
				if (value == true) {
					$ui.addClass(this,'selected');
					this.style.backgroundColor = $ui.theme.color;
				} else {
					$ui.removeClass(this,'selected');
					this.style.backgroundColor = '';
				}
			}
			option._setSelected = option._setSelected.bind(option);
		}
	}
	// Set our selected index
	if (object.selectedIndex) {
		object._setSelectedIndex(object.selectedIndex);
	} else {
		object.selectedIndex = 0;
		object._setSelectedIndex(0);
	}
	
	return object.dom;
}
$ui_SegmentedControl.prototype = new $ui_CoreComponent();

/**
 * The SplitView object represents two vertical columns for layout components. The SplitView will size itself to all the available space provided by its parent control.
 * <br><br><b>Sample Declaration</b>
 * <pre>
 * {
 *    component: $ui.SplitView,
 *    left: [
 *        {
 *            component: $ui.SegmentedControl
 *        }
 *    ],
 *    right: [
 *        {
 *            component: $ui.Spinner
 *        }
 *    ]
 * }
 * </pre>
 * @namespace SplitView
 * @memberof $ui
 * @extends $ui.CoreComponent
 * @property {$ui.CoreComponent[]} left - This array holds all of the component definitions for the left side of the split view
 * @property {$ui.CoreComponent[]} right - This array holds all of the component definitions for the right side of the split view
 */
function $ui_SplitView(object, screen) {
	$ui_CoreComponent.call(this, object, screen);
	$ui.addClass(object.dom,'ui-split-view');
	
	var i,
		control,
		controlDom;
	
	// Create our left column
	object.dom.leftCol = document.createElement('div');
	$ui.addClass(object.dom.leftCol, 'col');
	$ui.addClass(object.dom.leftCol, 'left');
	object.dom.leftCol.style.borderRightColor = $ui.theme.color;
	object.dom.appendChild(object.dom.leftCol);
	
	// Load our left column
	if (object.left) {
		for (i = 0; i < object.left.length; i++) {
			control = object.left[i];
			controlDom = $ui.createControl(control, screen);
			if (controlDom) {
				object.dom.leftCol.appendChild(controlDom);
			}
		}
	}
	
	// Create our right column
	object.dom.rightCol = document.createElement('div');
	$ui.addClass(object.dom.rightCol, 'col');
	$ui.addClass(object.dom.rightCol, 'right');
	object.dom.appendChild(object.dom.rightCol);
	
	// Load our right column
	if (object.right) {
		for (i = 0; i < object.right.length; i++) {
			control = object.right[i];
			controlDom = $ui.createControl(control, screen);
			if (controlDom) {
				object.dom.rightCol.appendChild(controlDom);
			}
		}
	}
	
	return object.dom;
}

$ui_SplitView.prototype = new $ui_CoreComponent();
/**
 * The Tab object represents a tab within a {@link $ui.TabbedPane}.  A tab represents a container of multiple other controls
 * <br><br><b>Sample Declaration</b>
 * <pre>
 * {
 *    component: $ui.Tab,
 *    content: [
 *        {
 *            component: $ui.Spinner
 *        }
 *    ]
 * }
 * </pre>
 * @namespace Tab
 * @memberof $ui
 * @extends $ui.CoreComponent
 * @property {$ui.CoreComponent[]} content - This array holds all of the component definitions to be displayed in the tab
 * @property {boolean} [selected=false] - This property, when set to <i>true</i> will specify that the tab should be the default selected tab in the [Tabbed Pane]{@link $ui.TabbedPane}.  The Tabbed Pane will select only the first tab it encounters with selected set to <i>true</i> as the selected tab.
 */
function $ui_Tab(object, screen) {
	// All tabs are invisible by default
	object.visible = false;
	$ui_CoreComponent.call(this, object, screen);
	$ui.addClass(object.dom,'ui-tab');
	// Set our default
	if (object.selected != true) {
		object.selected = false;
	}
	
	var i,
		control,
		controlDom;
	// Load our contents
	if (object.content) {
		for (i = 0; i < object.content.length; i++) {
			control = object.content[i];
			controlDom = $ui.createControl(control, screen);
			if (controlDom) {
				object.dom.appendChild(controlDom);
			}
		}
	}
	
	return object.dom;
}

$ui_Tab.prototype = new $ui_CoreComponent();
/**
 * The TabbedPane object represents a container that has one or more {@link $ui.Tab} objects.<br><br>
 * A Tabbed Pane will cover the entire area of the control it is contained by. The control will cycle through all of the defined Tabs and see which one has been specified as the first selected tab. If no tabs are found with the specified <b>selected:true</b> property, it will select the first tab in the list.
 * <br><br><b>Sample Declaration</b>
 * <pre>
 * {
 *    component: $ui.TabbedPane,
 *    tabs: [
 *        {
 *            component: $ui.Tab,
 *            selected: true
 *        }
 *    ]
 * }
 * </pre>
 * @namespace TabbedPane
 * @memberof $ui
 * @extends $ui.CoreComponent
 * @property {$ui.Tab[]} content - This array holds all of the {@link $ui.Tab} objects that are to be controlled by the tabbed pane
*/
function $ui_TabbedPane(object, screen) {
	$ui_CoreComponent.call(this, object, screen);
	$ui.addClass(object.dom,'ui-tabbed-pane');
	// Set our default selected tab
	object._selectedTab = undefined;
	
	var i,
		control,
		controlDom,
		selectedTab;
	// Load our tabs
	if (object.tabs) {
		for (i = 0; i < object.tabs.length; i++) {
			control = object.tabs[i];
			if (control.component != $ui.Tab) continue;
			control.parent = object;
			controlDom = $ui.createControl(control, screen);
			if (controlDom) {
				object.dom.appendChild(controlDom);
			}
			// See if it is the selected tab
			if ((control.selected === true) && (object._selectedTab == undefined)) {
				object._selectedTab = control;
			}
		}
	}
	
	/** 
	 * This function will set the selected tab to the value passed in as a parameter
	 * @function selectTab
	 * @memberof $ui.TabbedPane
	 * @param {$ui.Tab} tab - Tab to select
	 */
	object.selectTab = function(tab) {
		if (tab == undefined) return;
		if (tab.component != $ui.Tab) return;
		if (tab === this._selectedTab) return;
		// Unselect all tabs
		var i,
			item;
		for (i = 0; i < this.tabs.length; i++) {
			item = this.tabs[i];
			item.selected = false;
			item.visible = false;
		}
		// Now select the desired tab
		this._selectTab(tab);
	}
	object.selectTab = object.selectTab.bind(object);
	
	// Private function to select a tab
	object._selectTab = function(tab) {
		if (tab == undefined) return;
		if (tab.component != $ui.Tab) return;
		object._selectedTab = tab;
		tab.selected = true;
		tab.visible = true;
	}
	object._selectTab = object._selectTab.bind(object);
	
	// Set our selected tab
	if ((object._selectedTab == undefined) && (object.tabs.length > 0)){
		object._selectedTab = object.tabs[0];
	}
	if (object._selectedTab != undefined) {
		object._selectTab(object._selectedTab);
	}
	
	
	return object.dom;
}

$ui_TabbedPane.prototype = new $ui_CoreComponent();
/**
 * The Tile Group object represents a container that holds one or more tiles that inherit from {@link $ui.CoreTile}.
 * <br><br><b>Sample Declaration</b>
 * <pre>
 * {
 *    component: $ui.TileGroup,
 *    tiles: [
 *        {
 *            component: $ui.TileCool,
 *            value: 70
 *        {
 *    ]
 * }
 * </pre>
 * @namespace TileGroup
 * @memberof $ui
 * @extends $ui.CoreComponent
 * @property {$ui.CoreTile[]} tiles - This array holds all of the Tiles which are to be displayed
 */
function $ui_TileGroup(object, screen) {
	$ui_CoreComponent.call(this, object, screen);
	$ui.addClass(object.dom,'ui-tile-group');
	
	// Set our default tile size
	object._tileSize = 256;
	object._thresholdWidth = 1024;
	
	// Create the inner area for the tiles
	object.dom.inner = document.createElement('div');
	$ui.addClass(object.dom.inner, 'group-inner');
	object.dom.appendChild(object.dom.inner);
	
	// Create a matrix for keeping track of open slots
	object.matrix = [];

	// From the row and column number set the top left of the tile
	object._setTileTopLeft = function(tile, rowNum, colNum) {
		tile.dom.style.top = ((rowNum  * this._tileSize) + 'px');
		tile.dom.style.left = ((colNum * this._tileSize) + 'px');
	}
	object._setTileTopLeft = object._setTileTopLeft.bind(object);
	
	// Best position the tile in the group
	object._positionTile = function(tile) {
		var row,
			colNum,
			rowNum,
			found = false;
		
		if (tile._size == undefined) { 
			// Will fit in a 1x1 slot..find first slot and insert
			for (rowNum = 0; rowNum < this.matrix.length; rowNum++) {
				row = this.matrix[rowNum];
				for (colNum = 0; colNum < row.length; colNum++) {
					if (row[colNum] === 0) {
						// This space is empty. Now mark it as taken
						row[colNum] = 1;
						this._setTileTopLeft(tile,rowNum,colNum);
						found = true;
						break;
					}
				}
				if (found == true) break;
			}
		} else if (tile._size == $ui.TileSize.WIDE) { 
			// Will fit in a 1x2 slot..find first slot and insert
			for (rowNum = 0; rowNum < this.matrix.length; rowNum++) {
				row = this.matrix[rowNum];
				for (colNum = 0; colNum < row.length; colNum++) {
					if (row[colNum] === 0) {
						if ((colNum+1 <= row.length) && (row[colNum+1] === 0)){
							// This space is empty. Now mark it as taken
							row[colNum] = 1;
							row[colNum+1] = 1;
							this._setTileTopLeft(tile,rowNum,colNum);
							found = true;
							break;
						}
					}
				}
				if (found == true) break;
			}
		} else if (tile._size == $ui.TileSize.TALL) { 
			// Will fit in a 2x1 slot..find first slot and insert
			for (rowNum = 0; rowNum < this.matrix.length; rowNum++) {
				row = this.matrix[rowNum];
				for (colNum = 0; colNum < row.length; colNum++) {
					if (row[colNum] === 0) {
						if ((rowNum+1 < this.matrix.length) && (this.matrix[rowNum+1][colNum] === 0)){
							// This space is empty. Now mark it as taken
							row[colNum] = 1;
							this.matrix[rowNum+1][colNum] = 1;
							this._setTileTopLeft(tile,rowNum,colNum);
							found = true;
							break;
						}
					}
				}
				if (found == true) break;
			}
		}
		
		// See if no open slot was found
		if (found == false) {
			if (tile._size == undefined) {
				// Add one row and take the first slot
				if (object._is3Columns == true) {
					this.matrix.push([1,0,0]);
				} else {
					this.matrix.push([1,0,0,0]);
				}
				this._setTileTopLeft(tile,this.matrix.length-1,0);
			} else if (tile._size == $ui.TileSize.WIDE) {
				// Add one row and take the first two slots
				if (object._is3Columns == true) {
					this.matrix.push([1,1,0]);
				} else {
					this.matrix.push([1,1,0,0]);
				}
				this._setTileTopLeft(tile,this.matrix.length-1,0);
			} else {
				// Add one row and try again
				if (object._is3Columns == true) {
					this.matrix.push([0,0,0]);
				} else {
					this.matrix.push([0,0,0,0]);
				}
				this._positionTile(tile);
			}
		}
	}
	object._positionTile = object._positionTile.bind(object);
	
	// Figure out our height based on the matrix
	object._recalculateHeight = function() {
		this.dom.inner.style.height = ((this.matrix.length * this._tileSize) + 'px');
	}
	object._recalculateHeight = object._recalculateHeight.bind(object);
	
	// Cycle through content
	if (object.tiles) {
		var i,
			control,
			controlDom;
		for (i = 0; i < object.tiles.length; i++) {
			control = object.tiles[i];
			controlDom = $ui.createControl(control, screen);
			if (controlDom) {
				object.dom.inner.appendChild(controlDom);
			}
		}
		object._recalculateHeight();
	}
	
	// Layout all the tiles
	object._layoutTiles = function() {
		var i;
		if (this._is3Columns == false) {
			this.matrix = [];
			this.matrix.push([0,0,0,0]);
		} else {
			this.matrix = [];
			this.matrix.push([0,0,0]);
		}
		// Cycle through our tiles and position them
		for (i = 0; i < this.tiles.length; i++) {
			this._positionTile(this.tiles[i]);
		}
		this._recalculateHeight();
	}
	object._layoutTiles = object._layoutTiles.bind(object);
	
	// Handle resize of screen
	object._onresize = function() {
		if ((this._is3Columns == true) && (this.dom.offsetWidth >= this._thresholdWidth)) {
			this._layoutTiles();
		} else if ((this._is3Columns == false) && (this.dom.offsetWidth < this._thresholdWidth)){
			this._layoutTiles();
		}
	}
	object._onresize = object._onresize.bind(object);
	
	// Properly layout the control once animation ends
	object._onshow = function() {
		this._is3Columns = (this.dom.offsetWidth < this._thresholdWidth);
		this._layoutTiles();
		this.dom.style.visibility = 'visible';
	}
	object._onshow = object._onshow.bind(object);
	
	return object.dom;
}

$ui_TileGroup.prototype = new $ui_CoreComponent();
/**
 * This is the object that represents a window instance in a head unit. It derives from {@link $ui.CoreScreen}. A WindowPane is declared as a JavaScript function and has various different properties. 
 * When a WindowPane is pushed onto the stack a new instance of the screen will be created and rendered.
 * <br><br><b>Sample Declaration</b>
 * <pre>
 * function MyWindowPane() {
 *   this.component = $ui.WindowPane;
 *   this.content = [
 *       {
 *          component: $ui.SegmentedControl,
 *       }
 *   ];
 *
 *   this.onshow = function() {
 *      console.log('I was just shown');
 *   }
 * }
 * </pre>
 * @namespace WindowPane
 * @memberof $ui
 * @extends $ui.CoreScreen
 * @property {ScreenBackground} [background] - This object defines the type of background to be shown on the screen
 * @property {$ui.CoreComponent[]} content - This object array specifies the list of controls that will be rendered in this screen
 * @property {string} [backCaption] - This property defines the text you would like to appear on the title bar with a back button. If this is left <i>undefined</i> then no back button will appear
 */
function $ui_WindowPane(object, data) {
	$ui_CoreScreen.call(this, object, data);
	
	if (object) {
		$ui.addClass(object.dom,'ui-window-pane');
		
		// Set our width to that of our parent
		if (!object.width) {
			object.dom.style.width = window.innerWidth + 'px'; // default
		} else {
			object.dom.style.width = object.width + 'px';
		}
		
		// Create our background image div
		object.dom.backgroundDiv = document.createElement('div');
		$ui.addClass(object.dom.backgroundDiv,'background');
		object.dom.appendChild(object.dom.backgroundDiv);
		
		if (object.backCaption) {
			object.dom.backBar = document.createElement('div');
			$ui.addClass(object.dom.backBar,'back-bar');
			$ui.addClass(object.dom,'has-back');
			object.dom.backBar.style.borderBottomColor = $ui.theme.color;
			object.dom.appendChild(object.dom.backBar);
			object.dom.backCaption = document.createElement('span');
			object.dom.backCaption.textContent = object.backCaption;
			object.dom.backCaption.model = object;
			$ui.addClass(object.dom.backCaption,'caption');
			object.dom.backBar.appendChild(object.dom.backCaption);
			object.dom.backCaption.onclick = function() {
				$ui.playTouchSound();
				$ui.pop();
			}
		}

		/** 
		 * Set the background for the screen
		 * @function setBackground
		 * @memberof $ui.WindowPane
		 * @param {ScreenBackground} screenBackground - The background object to use for the screen.
		 */
		object.setBackground = function(screenBackground) {
			// Clear existing background
			if (this.background) {
				this.dom.backgroundDiv.style.opacity = '0';
			} 
			// Load new background
			if (screenBackground != undefined) {
				this.background = screenBackground;
				// Check for repeat
				if (this.background.repeat === true) {
					this.dom.backgroundDiv.style.backgroundRepeat = 'repeat';
				} else {
					this.dom.backgroundDiv.style.backgroundSize = 'cover';
				}
				// Load our image
				if (this.background.img) {
					this._loader = new Image();
					this._loader.model = this;
					this._loader.onload = function() {
						this.model.dom.backgroundDiv.style.backgroundImage = 'url("'+this.model.background.img+'")';
						this.model.dom.backgroundDiv.style.opacity = '1';
						this.model._loader = null;
					}
					this._loader.src = this.background.img;
				}
			}
		}
		object.setBackground = object.setBackground.bind(object);
				
		// Create our content div for the controls
		object.dom.contentDiv = document.createElement('div');
		$ui.addClass(object.dom.contentDiv, 'inner');
		object.dom.appendChild(object.dom.contentDiv);
		
		// Cycle through content
		if (object.content) {
			var i,
				control,
				controlDom;
			for (i = 0; i < object.content.length; i++) {
				control = object.content[i];
				controlDom = $ui.createControl(control, object);
				if (controlDom) {
					object.dom.contentDiv.appendChild(controlDom);
				}
			}
		}
		// Handle window pane resizes
		object._onwindowpaneresize = function(screen, data) {
			// Set our width to that of our parent
			this.dom.style.width = this.container.dom.offsetWidth + 'px';
		}
		object._onwindowpaneresize = object._onwindowpaneresize.bind(object);
		
		// Clean-up any listeners
		object._onbeforepop = function() {
			if (this.animated == true) {
				this.dom.style['-webkit-animation-delay'] = '';
				this.dom.style['-webkit-animation-name'] = 'ui-pane-slide-right';
			}
			// Remove any global event listeners
			$system.removeEventListenersForScreen(this);
		}
		object._onbeforepop = object._onbeforepop.bind(object);
		
		// Initialize the screen
		object._initialize = function() {
			// Load the background if needed
			if (this.background) {
				this.setBackground(this.background);
			}
		}
		object._initialize = object._initialize.bind(object);
		
		return object.dom;
	}
}

$ui_WindowPane.prototype = new $ui_CoreScreen();


// Initialize the toolkit extensions
function $ui_ExtendWS12() {
	// Add our control extensions
	$ui.addExtension(new UIExtension('Browser', $ui_Browser));	
	$ui.addExtension(new UIExtension('DialPad', $ui_DialPad));	
	$ui.addExtension(new UIExtension('Map', $ui_Map));	
	$ui.addExtension(new UIExtension('MediaPlayer', $ui_MediaPlayer));	
	// Screen Extensions
	$ui.addExtension(new UIExtension('OnlineScreen', $ui_OnlineScreen, $ui.UIExtensionType.SCREEN));	
	// Custom Tiles
	$ui.addExtension(new UIExtension('TileAcceleration', $ui_TileAcceleration));	
	$ui.addExtension(new UIExtension('TileBadge', $ui_TileBadge));	
	$ui.addExtension(new UIExtension('TileBraking', $ui_TileBraking));	
	$ui.addExtension(new UIExtension('TileDistance', $ui_TileDistance));
	$ui.addExtension(new UIExtension('TileFuel', $ui_TileFuel));
	$ui.addExtension(new UIExtension('TileIdle', $ui_TileIdle));
	$ui.addExtension(new UIExtension('TileIdleDetails', $ui_TileIdleDetails));
	$ui.addExtension(new UIExtension('TileMPG', $ui_TileMPG));
	$ui.addExtension(new UIExtension('TileProfile', $ui_TileProfile));
	$ui.addExtension(new UIExtension('TileRecord', $ui_TileRecord));
	$ui.addExtension(new UIExtension('TileTimer', $ui_TileTimer));
	$ui.addExtension(new UIExtension('TileTimeDonut', $ui_TileTimeDonut));
	$ui.addExtension(new UIExtension('TileTimeHistory', $ui_TileTimeHistory));
	// Add our list item extensions
	// Add our list item extensions
	def = { 
		/**
		 * Event type of an event raised from a {@link $ui.GenericListItem} 
		 * @namespace PhoneLogListEvent
		 * @readonly
		 * @memberof $ui.PhoneLogListItem
		 */
		PhoneLogListEvent: {
			/** Click of a generic list item 
			* @memberof $ui.PhoneLogListItem.PhoneLogListEvent
			*/
			ONCLICK:'onclick' 
		},
		/**
		 * Event type of an event raised from a {@link $ui.GenericListItem} 
		 * @namespace PhoneLogStyle
		 * @readonly
		 * @memberof $ui.PhoneLogListItem
		 */
		PhoneLogStyle: {
			/** Incoming Call
			* @memberof $ui.PhoneLogListItem.PhoneLogStyle
			*/
			INCOMING: 'incoming',
			/** Outgoing Call
			* @memberof $ui.PhoneLogListItem.PhoneLogStyle
			*/
			OUTGOING: 'outgoing',
			/** Missed Call
			* @memberof $ui.PhoneLogListItem.PhoneLogStyle
			*/
			MISSED: 'missed'
		}
	};
	$ui.addExtension(new UIExtension('PhoneLogListItem', $ui_PhoneLogListItem, $ui.UIExtensionType.LISTITEM, {ONCLICK: 'onclick',INCOMING: 'incoming',OUTGOING: 'outgoing',MISSED: 'missed'}));
}

$ui.extend($ui_ExtendWS12);
/**
 * @preserve FastClick: polyfill to remove click delays on browsers with touch UIs.
 *
 * @version 1.0.0
 * @codingstandard ftlabs-jsv2
 * @copyright The Financial Times Limited [All Rights Reserved]
 * @license MIT License (see LICENSE.txt)
 */

/*jslint browser:true, node:true*/
/*global define, Event, Node*/


/**
 * Instantiate fast-clicking listeners on the specificed layer.
 *
 * @constructor
 * @param {Element} layer The layer to listen on
 * @param {Object} options The options to override the defaults
 */
function FastClick(layer, options) {
	'use strict';
	var oldOnClick;

	options = options || {};

	/**
	 * Whether a click is currently being tracked.
	 *
	 * @type boolean
	 */
	this.trackingClick = false;


	/**
	 * Timestamp for when click tracking started.
	 *
	 * @type number
	 */
	this.trackingClickStart = 0;


	/**
	 * The element being tracked for a click.
	 *
	 * @type EventTarget
	 */
	this.targetElement = null;


	/**
	 * X-coordinate of touch start event.
	 *
	 * @type number
	 */
	this.touchStartX = 0;


	/**
	 * Y-coordinate of touch start event.
	 *
	 * @type number
	 */
	this.touchStartY = 0;


	/**
	 * ID of the last touch, retrieved from Touch.identifier.
	 *
	 * @type number
	 */
	this.lastTouchIdentifier = 0;


	/**
	 * Touchmove boundary, beyond which a click will be cancelled.
	 *
	 * @type number
	 */
	this.touchBoundary = options.touchBoundary || 10;


	/**
	 * The FastClick layer.
	 *
	 * @type Element
	 */
	this.layer = layer;
	
	/**
	 * The minimum time between tap(touchstart and touchend) events
	 * 
	 * @type number
	 */
	this.tapDelay = options.tapDelay || 200;

	if (FastClick.notNeeded(layer)) {
		return;
	}

	// Some old versions of Android don't have Function.prototype.bind
	function bind(method, context) {
		return function() { return method.apply(context, arguments); };
	}

	// Set up event handlers as required
	if (deviceIsAndroid) {
		layer.addEventListener('mouseover', bind(this.onMouse, this), true);
		layer.addEventListener('mousedown', bind(this.onMouse, this), true);
		layer.addEventListener('mouseup', bind(this.onMouse, this), true);
	}

	layer.addEventListener('click', bind(this.onClick, this), true);
	layer.addEventListener('touchstart', bind(this.onTouchStart, this), false);
	layer.addEventListener('touchmove', bind(this.onTouchMove, this), false);
	layer.addEventListener('touchend', bind(this.onTouchEnd, this), false);
	layer.addEventListener('touchcancel', bind(this.onTouchCancel, this), false);

	// Hack is required for browsers that don't support Event#stopImmediatePropagation (e.g. Android 2)
	// which is how FastClick normally stops click events bubbling to callbacks registered on the FastClick
	// layer when they are cancelled.
	if (!Event.prototype.stopImmediatePropagation) {
		layer.removeEventListener = function(type, callback, capture) {
			var rmv = Node.prototype.removeEventListener;
			if (type === 'click') {
				rmv.call(layer, type, callback.hijacked || callback, capture);
			} else {
				rmv.call(layer, type, callback, capture);
			}
		};

		layer.addEventListener = function(type, callback, capture) {
			var adv = Node.prototype.addEventListener;
			if (type === 'click') {
				adv.call(layer, type, callback.hijacked || (callback.hijacked = function(event) {
					if (!event.propagationStopped) {
						callback(event);
					}
				}), capture);
			} else {
				adv.call(layer, type, callback, capture);
			}
		};
	}

	// If a handler is already declared in the element's onclick attribute, it will be fired before
	// FastClick's onClick handler. Fix this by pulling out the user-defined handler function and
	// adding it as listener.
	if (typeof layer.onclick === 'function') {

		// Android browser on at least 3.2 requires a new reference to the function in layer.onclick
		// - the old one won't work if passed to addEventListener directly.
		oldOnClick = layer.onclick;
		layer.addEventListener('click', function(event) {
			oldOnClick(event);
		}, false);
		layer.onclick = null;
	}
}


/**
 * Android requires exceptions.
 *
 * @type boolean
 */
var deviceIsAndroid = navigator.userAgent.indexOf('Android') > 0;


/**
 * iOS requires exceptions.
 *
 * @type boolean
 */
var deviceIsIOS = /iP(ad|hone|od)/.test(navigator.userAgent);


/**
 * iOS 4 requires an exception for select elements.
 *
 * @type boolean
 */
var deviceIsIOS4 = deviceIsIOS && (/OS 4_\d(_\d)?/).test(navigator.userAgent);


/**
 * iOS 6.0(+?) requires the target element to be manually derived
 *
 * @type boolean
 */
var deviceIsIOSWithBadTarget = deviceIsIOS && (/OS ([6-9]|\d{2})_\d/).test(navigator.userAgent);


/**
 * Determine whether a given element requires a native click.
 *
 * @param {EventTarget|Element} target Target DOM element
 * @returns {boolean} Returns true if the element needs a native click
 */
FastClick.prototype.needsClick = function(target) {
	'use strict';
	switch (target.nodeName.toLowerCase()) {

	// Don't send a synthetic click to disabled inputs (issue #62)
	case 'button':
	case 'select':
	case 'textarea':
		if (target.disabled) {
			return true;
		}

		break;
	case 'input':

		// File inputs need real clicks on iOS 6 due to a browser bug (issue #68)
		if ((deviceIsIOS && target.type === 'file') || target.disabled) {
			return true;
		}

		break;
	case 'label':
	case 'video':
		return true;
	}

	return (/\bneedsclick\b/).test(target.className);
};


/**
 * Determine whether a given element requires a call to focus to simulate click into element.
 *
 * @param {EventTarget|Element} target Target DOM element
 * @returns {boolean} Returns true if the element requires a call to focus to simulate native click.
 */
FastClick.prototype.needsFocus = function(target) {
	'use strict';
	switch (target.nodeName.toLowerCase()) {
	case 'textarea':
		return true;
	case 'select':
		return !deviceIsAndroid;
	case 'input':
		switch (target.type) {
		case 'button':
		case 'checkbox':
		case 'file':
		case 'image':
		case 'radio':
		case 'submit':
			return false;
		}

		// No point in attempting to focus disabled inputs
		return !target.disabled && !target.readOnly;
	default:
		return (/\bneedsfocus\b/).test(target.className);
	}
};


/**
 * Send a click event to the specified element.
 *
 * @param {EventTarget|Element} targetElement
 * @param {Event} event
 */
FastClick.prototype.sendClick = function(targetElement, event) {
	'use strict';
	var clickEvent, touch;

	// On some Android devices activeElement needs to be blurred otherwise the synthetic click will have no effect (#24)
	if (document.activeElement && document.activeElement !== targetElement) {
		document.activeElement.blur();
	}

	touch = event.changedTouches[0];

	// Synthesise a click event, with an extra attribute so it can be tracked
	clickEvent = document.createEvent('MouseEvents');
	clickEvent.initMouseEvent(this.determineEventType(targetElement), true, true, window, 1, touch.screenX, touch.screenY, touch.clientX, touch.clientY, false, false, false, false, 0, null);
	clickEvent.forwardedTouchEvent = true;
	targetElement.dispatchEvent(clickEvent);
};

FastClick.prototype.determineEventType = function(targetElement) {
	'use strict';

	//Issue #159: Android Chrome Select Box does not open with a synthetic click event
	if (deviceIsAndroid && targetElement.tagName.toLowerCase() === 'select') {
		return 'mousedown';
	}

	return 'click';
};


/**
 * @param {EventTarget|Element} targetElement
 */
FastClick.prototype.focus = function(targetElement) {
	'use strict';
	var length;

	// Issue #160: on iOS 7, some input elements (e.g. date datetime) throw a vague TypeError on setSelectionRange. These elements don't have an integer value for the selectionStart and selectionEnd properties, but unfortunately that can't be used for detection because accessing the properties also throws a TypeError. Just check the type instead. Filed as Apple bug #15122724.
	if (deviceIsIOS && targetElement.setSelectionRange && targetElement.type.indexOf('date') !== 0 && targetElement.type !== 'time') {
		length = targetElement.value.length;
		targetElement.setSelectionRange(length, length);
	} else {
		targetElement.focus();
	}
};


/**
 * Check whether the given target element is a child of a scrollable layer and if so, set a flag on it.
 *
 * @param {EventTarget|Element} targetElement
 */
FastClick.prototype.updateScrollParent = function(targetElement) {
	'use strict';
	var scrollParent, parentElement;

	scrollParent = targetElement.fastClickScrollParent;

	// Attempt to discover whether the target element is contained within a scrollable layer. Re-check if the
	// target element was moved to another parent.
	if (!scrollParent || !scrollParent.contains(targetElement)) {
		parentElement = targetElement;
		do {
			if (parentElement.scrollHeight > parentElement.offsetHeight) {
				scrollParent = parentElement;
				targetElement.fastClickScrollParent = parentElement;
				break;
			}

			parentElement = parentElement.parentElement;
		} while (parentElement);
	}

	// Always update the scroll top tracker if possible.
	if (scrollParent) {
		scrollParent.fastClickLastScrollTop = scrollParent.scrollTop;
	}
};


/**
 * @param {EventTarget} targetElement
 * @returns {Element|EventTarget}
 */
FastClick.prototype.getTargetElementFromEventTarget = function(eventTarget) {
	'use strict';

	// On some older browsers (notably Safari on iOS 4.1 - see issue #56) the event target may be a text node.
	if (eventTarget.nodeType === Node.TEXT_NODE) {
		return eventTarget.parentNode;
	}

	return eventTarget;
};


/**
 * On touch start, record the position and scroll offset.
 *
 * @param {Event} event
 * @returns {boolean}
 */
FastClick.prototype.onTouchStart = function(event) {
	'use strict';
	var targetElement, touch, selection;
	
	// Ignore multiple touches, otherwise pinch-to-zoom is prevented if both fingers are on the FastClick element (issue #111).
	if (event.targetTouches.length > 1) {
		return true;
	}

	targetElement = this.getTargetElementFromEventTarget(event.target);
	touch = event.targetTouches[0];

	
	
	if (deviceIsIOS) {

		// Only trusted events will deselect text on iOS (issue #49)
		selection = window.getSelection();
		if (selection.rangeCount && !selection.isCollapsed) {
			return true;
		}

		if (!deviceIsIOS4 && soloUI.isPhoneGap === true) {

			// Weird things happen on iOS when an alert or confirm dialog is opened from a click event callback (issue #23):
			// when the user next taps anywhere else on the page, new touchstart and touchend events are dispatched
			// with the same identifier as the touch event that previously triggered the click that triggered the alert.
			// Sadly, there is an issue on iOS 4 that causes some normal touch events to have the same identifier as an
			// immediately preceeding touch event (issue #52), so this fix is unavailable on that platform.
			if (touch.identifier === this.lastTouchIdentifier) {
				event.preventDefault();
				return false;
			}

			this.lastTouchIdentifier = touch.identifier;

			// If the target element is a child of a scrollable layer (using -webkit-overflow-scrolling: touch) and:
			// 1) the user does a fling scroll on the scrollable layer
			// 2) the user stops the fling scroll with another tap
			// then the event.target of the last 'touchend' event will be the element that was under the user's finger
			// when the fling scroll was started, causing FastClick to send a click event to that layer - unless a check
			// is made to ensure that a parent layer was not scrolled before sending a synthetic click (issue #42).
			this.updateScrollParent(targetElement);
		}
	}

	this.trackingClick = true;
	this.trackingClickStart = event.timeStamp;
	this.targetElement = targetElement;

	this.touchStartX = touch.pageX;
	this.touchStartY = touch.pageY;

	// Prevent phantom clicks on fast double-tap (issue #36)
	if ((event.timeStamp - this.lastClickTime) < this.tapDelay) {
		event.preventDefault();
	}
	
	return true;
};


/**
 * Based on a touchmove event object, check whether the touch has moved past a boundary since it started.
 *
 * @param {Event} event
 * @returns {boolean}
 */
FastClick.prototype.touchHasMoved = function(event) {
	'use strict';
	var touch = event.changedTouches[0], boundary = this.touchBoundary;

	if (Math.abs(touch.pageX - this.touchStartX) > boundary || Math.abs(touch.pageY - this.touchStartY) > boundary) {
		return true;
	}

	return false;
};


/**
 * Update the last position.
 *
 * @param {Event} event
 * @returns {boolean}
 */
FastClick.prototype.onTouchMove = function(event) {
	'use strict';
	
	if (!this.trackingClick) {
		return true;
	}

	// If the touch has moved, cancel the click tracking
	if (this.targetElement !== this.getTargetElementFromEventTarget(event.target) || this.touchHasMoved(event)) {
		this.trackingClick = false;
		this.targetElement = null;
	}
	
	
	
	return true;
};


/**
 * Attempt to find the labelled control for the given label element.
 *
 * @param {EventTarget|HTMLLabelElement} labelElement
 * @returns {Element|null}
 */
FastClick.prototype.findControl = function(labelElement) {
	'use strict';

	// Fast path for newer browsers supporting the HTML5 control attribute
	if (labelElement.control !== undefined) {
		return labelElement.control;
	}

	// All browsers under test that support touch events also support the HTML5 htmlFor attribute
	if (labelElement.htmlFor) {
		return document.getElementById(labelElement.htmlFor);
	}

	// If no for attribute exists, attempt to retrieve the first labellable descendant element
	// the list of which is defined here: http://www.w3.org/TR/html5/forms.html#category-label
	return labelElement.querySelector('button, input:not([type=hidden]), keygen, meter, output, progress, select, textarea');
};


/**
 * On touch end, determine whether to send a click event at once.
 *
 * @param {Event} event
 * @returns {boolean}
 */
FastClick.prototype.onTouchEnd = function(event) {
	'use strict';
	var forElement, trackingClickStart, targetTagName, scrollParent, touch, targetElement = this.targetElement;

	if (!this.trackingClick) {
		return true;
	}

	// Prevent phantom clicks on fast double-tap (issue #36)
	if ((event.timeStamp - this.lastClickTime) < this.tapDelay) {
		this.cancelNextClick = true;
		return true;
	}

	// Reset to prevent wrong click cancel on input (issue #156).
	this.cancelNextClick = false;

	this.lastClickTime = event.timeStamp;

	trackingClickStart = this.trackingClickStart;
	this.trackingClick = false;
	this.trackingClickStart = 0;

	
	// On some iOS devices, the targetElement supplied with the event is invalid if the layer
	// is performing a transition or scroll, and has to be re-detected manually. Note that
	// for this to function correctly, it must be called *after* the event target is checked!
	// See issue #57; also filed as rdar://13048589 .
	if (deviceIsIOSWithBadTarget) {
		touch = event.changedTouches[0];
		// In certain cases arguments of elementFromPoint can be negative, so prevent setting targetElement to null
		targetElement = document.elementFromPoint(touch.pageX - window.pageXOffset, touch.pageY - window.pageYOffset) || targetElement;
		targetElement.fastClickScrollParent = this.targetElement.fastClickScrollParent;
	}

	targetTagName = targetElement.tagName.toLowerCase();
	if (targetTagName === 'label') {
		forElement = this.findControl(targetElement);
		if (forElement) {
			this.focus(targetElement);
			if (deviceIsAndroid) {
				return false;
			}

			targetElement = forElement;
		}
	} else if (this.needsFocus(targetElement)) {

		// Case 1: If the touch started a while ago (best guess is 100ms based on tests for issue #36) then focus will be triggered anyway. Return early and unset the target element reference so that the subsequent click will be allowed through.
		// Case 2: Without this exception for input elements tapped when the document is contained in an iframe, then any inputted text won't be visible even though the value attribute is updated as the user types (issue #37).
		if ((event.timeStamp - trackingClickStart) > 100 || (deviceIsIOS && window.top !== window && targetTagName === 'input')) {
			this.targetElement = null;
			return false;
		}

		this.focus(targetElement);
		this.sendClick(targetElement, event);

		// Select elements need the event to go through on iOS 4, otherwise the selector menu won't open.
		if (!deviceIsIOS4 || targetTagName !== 'select') {
			this.targetElement = null;
			event.preventDefault();
		}

		return false;
	}

	if (deviceIsIOS && !deviceIsIOS4) {

		// Don't send a synthetic click event if the target element is contained within a parent layer that was scrolled
		// and this tap is being used to stop the scrolling (usually initiated by a fling - issue #42).
		scrollParent = targetElement.fastClickScrollParent;
		if (scrollParent && scrollParent.fastClickLastScrollTop !== scrollParent.scrollTop) {
			return true;
		}
	}
	

	// Prevent the actual click from going though - unless the target node is marked as requiring
	// real clicks or if it is in the whitelist in which case only non-programmatic clicks are permitted.
	if (!this.needsClick(targetElement)) {
		event.preventDefault();
		this.sendClick(targetElement, event);
	}

	return false;
};


/**
 * On touch cancel, stop tracking the click.
 *
 * @returns {void}
 */
FastClick.prototype.onTouchCancel = function() {
	'use strict';
	
	this.trackingClick = false;
	this.targetElement = null;
};


/**
 * Determine mouse events which should be permitted.
 *
 * @param {Event} event
 * @returns {boolean}
 */
FastClick.prototype.onMouse = function(event) {
	'use strict';

	// If a target element was never set (because a touch event was never fired) allow the event
	if (!this.targetElement) {
		return true;
	}

	if (event.forwardedTouchEvent) {
		return true;
	}

	// Programmatically generated events targeting a specific element should be permitted
	if (!event.cancelable) {
		return true;
	}

	// Derive and check the target element to see whether the mouse event needs to be permitted;
	// unless explicitly enabled, prevent non-touch click events from triggering actions,
	// to prevent ghost/doubleclicks.
	if (!this.needsClick(this.targetElement) || this.cancelNextClick) {

		// Prevent any user-added listeners declared on FastClick element from being fired.
		if (event.stopImmediatePropagation) {
			event.stopImmediatePropagation();
		} else {

			// Part of the hack for browsers that don't support Event#stopImmediatePropagation (e.g. Android 2)
			event.propagationStopped = true;
		}

		// Cancel the event
		event.stopPropagation();
		event.preventDefault();

		return false;
	}

	// If the mouse event is permitted, return true for the action to go through.
	return true;
};


/**
 * On actual clicks, determine whether this is a touch-generated click, a click action occurring
 * naturally after a delay after a touch (which needs to be cancelled to avoid duplication), or
 * an actual click which should be permitted.
 *
 * @param {Event} event
 * @returns {boolean}
 */
FastClick.prototype.onClick = function(event) {
	'use strict';
	var permitted;

	// It's possible for another FastClick-like library delivered with third-party code to fire a click event before FastClick does (issue #44). In that case, set the click-tracking flag back to false and return early. This will cause onTouchEnd to return early.
	if (this.trackingClick) {
		this.targetElement = null;
		this.trackingClick = false;
		return true;
	}

	// Very odd behaviour on iOS (issue #18): if a submit element is present inside a form and the user hits enter in the iOS simulator or clicks the Go button on the pop-up OS keyboard the a kind of 'fake' click event will be triggered with the submit-type input element as the target.
	if (event.target.type === 'submit' && event.detail === 0) {
		return true;
	}

	permitted = this.onMouse(event);

	// Only unset targetElement if the click is not permitted. This will ensure that the check for !targetElement in onMouse fails and the browser's click doesn't go through.
	if (!permitted) {
		this.targetElement = null;
	}

	// If clicks are permitted, return true for the action to go through.
	return permitted;
};


/**
 * Remove all FastClick's event listeners.
 *
 * @returns {void}
 */
FastClick.prototype.destroy = function() {
	'use strict';
	var layer = this.layer;

	if (deviceIsAndroid) {
		layer.removeEventListener('mouseover', this.onMouse, true);
		layer.removeEventListener('mousedown', this.onMouse, true);
		layer.removeEventListener('mouseup', this.onMouse, true);
	}

	layer.removeEventListener('click', this.onClick, true);
	layer.removeEventListener('touchstart', this.onTouchStart, false);
	layer.removeEventListener('touchmove', this.onTouchMove, false);
	layer.removeEventListener('touchend', this.onTouchEnd, false);
	layer.removeEventListener('touchcancel', this.onTouchCancel, false);
};


/**
 * Check whether FastClick is needed.
 *
 * @param {Element} layer The layer to listen on
 */
FastClick.notNeeded = function(layer) {
	'use strict';
	var metaViewport;
	var chromeVersion;

	// Devices that don't support touch don't need FastClick
	if (typeof window.ontouchstart === 'undefined') {
		return true;
	}

	// Chrome version - zero for other browsers
	chromeVersion = +(/Chrome\/([0-9]+)/.exec(navigator.userAgent) || [,0])[1];

	if (chromeVersion) {

		if (deviceIsAndroid) {
			metaViewport = document.querySelector('meta[name=viewport]');

			if (metaViewport) {
				// Chrome on Android with user-scalable="no" doesn't need FastClick (issue #89)
				if (metaViewport.content.indexOf('user-scalable=no') !== -1) {
					return true;
				}
				// Chrome 32 and above with width=device-width or less don't need FastClick
				if (chromeVersion > 31 && window.innerWidth <= window.screen.width) {
					return true;
				}
			}

		// Chrome desktop doesn't need FastClick (issue #15)
		} else {
			return true;
		}
	}

	// IE10 with -ms-touch-action: none, which disables double-tap-to-zoom (issue #97)
	if (layer.style.msTouchAction === 'none') {
		return true;
	}

	return false;
};


/**
 * Factory method for creating a FastClick object
 *
 * @param {Element} layer The layer to listen on
 * @param {Object} options The options to override the defaults
 */
FastClick.attach = function(layer, options) {
	'use strict';
	return new FastClick(layer, options);
};


if (typeof define !== 'undefined' && define.amd) {

	// AMD. Register as an anonymous module.
	define(function() {
		'use strict';
		return FastClick;
	});
} else if (typeof module !== 'undefined' && module.exports) {
	module.exports = FastClick.attach;
	module.exports.FastClick = FastClick;
} else {
	window.FastClick = FastClick;
}
/**
 * Every component in the UI follows the same general patterns. This is to keep consistency and make coding easier.
 * <br><br><b>NOTE: The core component is an abstract base class and cannot be created as an instance on its own</b>
 * @namespace
 * @name CoreComponent
 * @memberof $ui
 * @property {namespace} component - The <b>mandatory</b> component property defines what type of component is being defined. This property always starts with a <b>$ui.</b> defining the component to be used for generating the UI.
 * @property {string} [id] - The id property is used to uniquely define the control in the screen for which it belongs. <br><br>Providing an id for your control is very convenient because you can easily access your control through your javascript coding. Each id is added as a direct handle on the screen object for access.
 * @property {boolean} [animated=false] - Set this value to <b>true</b> for the control to have animation.  NOTE: Each derivative control is responsible for their animation styling. Setting this property to true will add the ".animated" CSS class to the root element of the control.  Feel free to define your own CSS for the ".animated" property
 * @property {boolean} [visible=true] - The visible property specifies the visibility of the control. 
 * @property {boolean} [enabled=true] - The enabled property specifies the initial enabled state of the control.  <i>NOTE: Not all controls will render a disabled state. If you wish to render a disabled state simply override the ".disabled" CSS for the root of your control</i>
 * @property {$ui.CoreScreen} screen - This <b>readonly</b> property allows for you to reference the screen from the control. This will be the screen in which the control is embedded
 * @property {$ui.DataProviderLink} [provider] - This property allows you to bind the control to a [data provider]{@link $ui.DataProvider} in the application. 
 * @property {object[]} attachedObjects - This property specifies an array of objects that can be attached to the control. These could be objects such as data providers and usually entail a component that does not provide a user interface.
 * @property {boolean} [marginTop=false] - A boolean property which when set to true will place a standard margin on the top of the control. 
 * @property {boolean} [marginBottom=false] - A boolean property which when set to true will place a standard margin on the bottom of the control.
 * @property {boolean} [marginLeft=false] - A boolean property which when set to true will place a standard margin on the left of the control
 * @property {boolean} [marginRight=false] - A boolean property which when set to true will place a standard margin on the right of the control.
 */
function $ui_CoreComponent(object, screen) {
	if (object) {
		this.object = object;
		// The protected object is where we store our dynamic object variables
		object._protected = {
			model: object
		};
		
		// Create our base container for the control 
		object.dom = document.createElement('div');
		object.dom.model = object;
		$ui.addClass(object.dom, 'ui-core-component');
		
		// Assign our control name for automation & analytics
		if (object.id) {
			object.dom.setAttribute('data-id',object.id);
		}
		
		// Component Property
		object._protected.component = object.component;
		Object.defineProperty(object, 'component', {
			get: function() {return this._protected.component;},
			set: function() {
				console.log($ui._protected.PROPERTY_WARNING.replace('[prop]','component'));
			},
			configurable: false}
		);
		
		// Screen Property
		if (screen != undefined) {
			object.screen = screen;
			screen.children.push(object);
			if (object.id) {
				screen[object.id] = object;
			}
		}
		object._protected.screen = object.screen;
		Object.defineProperty(object, 'screen', {
			get: function() {return this._protected.screen;},
			set: function() {
				console.log($ui._protected.PROPERTY_WARNING.replace('[prop]','screen'));
			},
			configurable: false}
		);
		
		// Apply our current theme style
		if ($ui.theme.rootClass) {
			$ui.addClass(object.dom,$ui.theme.rootClass);
		}
		
		// id property
		object._protected.id = object.id;
		Object.defineProperty(object, 'id', {
			get: function() {return this._protected.id;},
			set: function() {
				console.log($ui._protected.PROPERTY_WARNING.replace('[prop]','id'));
			},
			configurable: false}
		);
		
		// Enabled Property
		if (object.enabled != false) {
			object.enabled = true;
		} else {
			$ui.addClass(object.dom, 'disabled');
		}
		object._protected.enabled = object.enabled;
		Object.defineProperty(object, 'enabled', {
			get: function() {return this._protected.enabled;},
			set: function(value) {
				if (value == this._protected.enabled) return;
				if (this._protected.enabled && (value == false)) {
					this._protected.enabled = false;
					$ui.addClass(this.dom, 'disabled');
				} else if ((this._protected.enabled == false) && (value == true)) {
					this._protected.enabled = true;
					$ui.removeClass(this.dom, 'disabled');
				}
				// Call a child class' protected function if they need
				// to do special handling for enabling
				if (this._setEnabled) {
					this._setEnabled(value);
				}
			},
			configurable: false}
		);		

		
		// Animated property
		if (object.animated == true) {
			$ui.addClass(object.dom, 'animated');
		} else {
			object.animated = false;
		}
		object._protected.animated = object.animated;
		Object.defineProperty(object, 'animated', {
			get: function() {return this._protected.animated;},
			set: function() {
				console.log($ui._protected.PROPERTY_WARNING.replace('[prop]','animated'));
			},
			configurable: false}
		);
		
		// Set our initial visibility
		if ((object.visible != undefined) && (object.visible == false)) {
			object.dom.style.display = 'none';
		} else {
			object.visible = true;
		}
		object._protected.visible = object.visible;
		// Set our modification rules for 'visible'
		Object.defineProperty(object, 'visible', {
			get: function() {return this._protected.visible;},
			set: function(value) {
				if (value != this._protected.visible) {
					if (value == true) {
						this._protected.visible = true;
						if (this.dom != undefined) {
							this.dom.style.display = '';
						}
					} else {
						this._protected.visible = false;
						if (this.dom != undefined) {
							this.dom.style.display = 'none';
						}
					}
					// Allow of the top level control to also react to the visibility change
					if (this._setVisible) {
						this._setVisible(value);
					}
				} 
			},
			configurable: false}
		);
		
		// Margin Top Property
		if (object.marginTop === true) {
			$ui.addClass(object.dom,'marginTop');
		} else {
			object.marginTop = false;
		}
		object._protected.marginTop = object.marginTop;
		Object.defineProperty(object, 'marginTop', {
			get: function() {return this._protected.marginTop;},
			set: function(value) {
				if (value == this._protected.marginTop) return;
				this._protected.marginTop = value;
				if (value == false) {
					$ui.removeClass(object.dom,'marginTop');
				} else {
					$ui.addClass(object.dom,'marginTop');
				}
			},
			configurable: false}
		);
		
		// Margin Bottom Property
		if (object.marginBottom === true) {
			$ui.addClass(object.dom,'marginBottom');
		} else {
			object.marginBottom = false;
		}
		object._protected.marginBottom = object.marginBottom;
		Object.defineProperty(object, 'marginBottom', {
			get: function() {return this._protected.marginBottom;},
			set: function(value) {
				if (value == this._protected.marginBottom) return;
				this._protected.marginBottom = value;
				if (value == false) {
					$ui.removeClass(object.dom,'marginBottom');
				} else {
					$ui.addClass(object.dom,'marginBottom');
				}
			},
			configurable: false}
		);
		
		// Margin Left Property
		if (object.marginLeft === true) {
			$ui.addClass(object.dom,'marginLeft');
		} else {
			object.marginLeft = false;
		}
		object._protected.marginLeft = object.marginLeft;
		Object.defineProperty(object, 'marginLeft', {
			get: function() {return this._protected.marginLeft;},
			set: function(value) {
				if (value == this._protected.marginLeft) return;
				this._protected.marginLeft = value;
				if (value == false) {
					$ui.removeClass(object.dom,'marginLeft');
				} else {
					$ui.addClass(object.dom,'marginLeft');
				}
			},
			configurable: false}
		);
		
		// Margin Right Property
		if (object.marginRight === true) {
			$ui.addClass(object.dom,'marginRight');
		} else {
			object.marginRight = false;
		}
		object._protected.marginRight = object.marginRight;
		Object.defineProperty(object, 'marginRight', {
			get: function() {return this._protected.marginRight;},
			set: function(value) {
				if (value == this._protected.marginRight) return;
				this._protected.marginRight = value;
				if (value == false) {
					$ui.removeClass(object.dom,'marginRight');
				} else {
					$ui.addClass(object.dom,'marginRight');
				}
			},
			configurable: false}
		);
		
		// Attached Objects Property
		if (object.attachedObjects) {
			var i,
				control,
				controlDom,
				targetScreen = (object.screen != undefined) ? object.screen : object; // The only control without a screen is a screen
			for (i = 0; i < object.attachedObjects.length; i++) {
				control = object.attachedObjects[i];
				controlDom = $ui.createControl(control, targetScreen);
				// If this control needs to be in the DOM add it
				if (controlDom instanceof HTMLElement) {
					object.dom.appendChild(controlDom);
				}
			}
		} else {
			object.attachedObjects = [];
		}
		object._protected.attachedObjects = object.attachedObjects;
		Object.defineProperty(object, 'attachedObjects', {
			get: function() {return this._protected.attachedObjects;},
			set: function(value) {
				console.log($ui._protected.PROPERTY_WARNING.replace('[prop]','attachedObjects'));
			},
			configurable: false}
		);
		
		/** 
		 * This protected function will raise an interaction event for the <b>oninteraction</b> callback assigned to the {@link $ui} object.
		 * @memberof $ui.CoreComponent
		 * @protected 
		 * @function _raiseInteractionEvent
		 * @param {string} interaction - Desired interaction to raise
		 */
		object._raiseInteractionEvent = function(interaction) {
			var event = new InteractionEvent(this.screen.id, this.id, interaction, this.component);
			$ui._raiseInteractionEvent(event);
		}
		object._raiseInteractionEvent = object._raiseInteractionEvent.bind(object);
		
		
		// Private function to animate scrolling the control into view 
		object._scrollIntoView = function() {
			var step = 20,
				rect = this.dom.getBoundingClientRect(),
				scrollArea = (this.tab != undefined) ? this.tab.dom.content : this.screen.dom.content;
				
			this._scrollIterationCounter = this._scrollIterationCounter + 1;
			// See if it has reached the top of the screen
			if (rect.top == scrollArea.offsetTop) { 
				return;
			}
			
			// If the bottom and top of the control is visible
			if ((rect.bottom < (scrollArea.offsetTop + scrollArea.offsetHeight)) && (rect.top > scrollArea.offsetTop)) {
				return;
			}
				
			if (rect.top > scrollArea.offsetTop) { // Need to scroll down
				if (rect.top - scrollArea.offsetTop < step) {
					step = 1;
				}
				scrollArea.scrollTop = scrollArea.scrollTop + step;
			} else { // Need to scroll up
				if (scrollArea.offsetTop - rect.top < step) {
					step = 1;
				}
				scrollArea.scrollTop = scrollArea.scrollTop - step;
			}
			
			if (this._scrollIterationCounter > 100) { // Equivalent to moving something 2000 pixels
				console.log('fail safe scroll counter exceeded');
				return;
			}
			requestAnimationFrame(this._scrollIntoView);
		}
		object._scrollIntoView = object._scrollIntoView.bind(object);
		
		/** 
		 * This function will scroll the control into view for the user.
		 * @memberof $ui.CoreComponent
		 * @function scrollIntoView
		 */
		object.scrollIntoView = function() {
			if (this.dom) {
				this._scrollIterationCounter = 0;
				requestAnimationFrame(this._scrollIntoView);
			}
		}
		object.scrollIntoView = object.scrollIntoView.bind(object);
		
		// Public base destructor for the component
		object.destroy = function() {	
			// Call private destructor of control if it is there
			if (object._destroy) {
				object._destroy();
			}
			// Remove the provider listener
			if (this.provider != undefined) {
				if (this.provider.id != undefined) {
					window.removeEventListener(this.screen.guid+'-'+this.provider.id+'-updated', this._providerRefresh, false);
				}
			}	
			// Clean-up any attached objects
			var i,
				attachedObject;
			if (this.attachedObjects && this.attachedObjects.length > 0) {
				for (i = 0; i < this.attachedObjects.length; i++) {
					attachedObject = this.attachedObjects[i];
					if (attachedObject._destroy) {
						attachedObject._destroy();
					}
				}
			}
			this.dom = undefined;
		}
		object.destroy = object.destroy.bind(object);
		
		// Handle a provider update
		object._providerRefresh = function() {
			// Find the data provider
			var dataProvider = this.screen[this.provider.id];
			if (dataProvider != undefined) {
				// Make sure it has some data assigned to it
				if (dataProvider.data != undefined) {
					var properties = this.provider.property.split('.'),
						i,
						data = dataProvider.data,
						found = true;
					// traverse it's hierarchy for our data value	
					for (i = 0; i < properties.length; i++) {
						data = data[properties[i]];
						if (data == undefined) {
							found = false;
							break;
						}
					}
					if (found) {
						if (this._providerUpdate) {
							this._providerUpdate(data);
						}
						return;
					}
				} else {
					// If there was data we would not reach this point other wise it is undefined
					// so we have to check to see if it is an initial load so that we don't trigger 
					// the control's update unnecessarily 
					if (!dataProvider._untouched && this._providerUpdate) {
						this._providerUpdate(undefined);
					}
				}
			} 
		}
		object._providerRefresh = object._providerRefresh.bind(object);
		
		
		// This function will update the provider data source with new data from the control
		object._updateData = function(value) {
			// Find the data provider
			var dataProvider = (this.provider == undefined) ? undefined : this.screen[this.provider.id];
			if (dataProvider != undefined) {
				// Make sure it has some data assigned to it
				if (dataProvider.data != undefined) {
					var properties = this.provider.property.split('.'),
						i,
						data = dataProvider.data,
						currentValue;
					// traverse it's hierarchy for our data value	
					for (i = 0; i < properties.length; i++) {
						currentValue = data[properties[i]];
						if ((currentValue == undefined) && (i < (properties.length -1))) {
							break;
						} else if (i == (properties.length -1)) {
							data[properties[i]] = value;
							break;
						}
						data = currentValue;
					}
				}
			}
		}
		object._updateData = object._updateData.bind(object);
		
		// Data Provider Property
		if (object.provider != undefined) {
			if (object.provider.id != undefined) {
				// unique event listener for this provider on this screen
				window.addEventListener(object.screen.guid+'-'+object.provider.id+'-updated', object._providerRefresh, false);
				// Evaluate our bindings 
				object._providerRefresh();
			}
		}
		object._protected.provider = object.provider;
		Object.defineProperty(object, 'provider', {
			get: function() {return this._protected.provider;},
			set: function(value) {
				console.log($ui._protected.PROPERTY_WARNING.replace('[prop]','provider'));
			},
			configurable: false}
		);
	}
}

/** 
 * The function assigned to this member will fire when the screen the component belongs to receives an onshow event. This is an <b>internal protected</b> member to be used by derivative controls and should not be bound to by application code
 * @name _onshow
 * @memberof $ui.CoreComponent
 * @protected
 * @type {function} 
 */
 
 /** 
 * The function assigned to this member will fire when the theme for the $ui tookit changes. This is an <b>internal protected</b> member to be used by derivative controls and should not be bound to by application code
 * @name _onthemechange
 * @memberof $ui.CoreComponent
 * @protected
 * @type {function} 
 */
 
/** 
 * The function assigned to this member will fire when the screen that the component belongs to has it's viewport size changed. This is an <b>internal protected</b> member to be used by derivative controls and should not be bound to by application code
 * @name _onresize
 * @memberof $ui.CoreComponent
 * @protected
 * @type {function} 
 */

/** 
 * The function assigned to this member will fire when the screen that the component belongs to is just about to be popped. This will only fire if the screen is the top most screen in the stack. It allows for any clean-up that might need to be done before animating. This is an <b>internal protected</b> member to be used by derivative controls and should not be bound to by application code
 * @name _onbeforepop
 * @memberof $ui.CoreComponent
 * @protected
 * @type {function} 
 */

/**
 * This is the abstract base class that represents a screen instance. It derives from {@link $ui.CoreComponent}. 
 * A screen is declared as a JavaScript function and has various different properties. When a screen is pushed onto the stack a new instance of the screen will be created and rendered.<br><br>
 * If a derivative screen is using the <b>animated</b> property to animate a screen transition to show the screen, it must also provide a reverse animation effect within its <b>_onbeforepop</b> event.
 * <br><br><b>NOTE: This is an abstract class </b>
 * @namespace
 * @name CoreScreen
 * @memberof $ui
 * @extends $ui.CoreComponent 
 * @property {GenericEvent} [onresize] - This event will fire when the viewport of the screen changes size
 * @property {GenericEvent} [onshow] - This event will fire when the screen has been displayed
 * @property {GenericEvent} [ondestroy] - This event will fire when the screen is about to be destroyed. Allowing for any memory clean-up routines
 */
function $ui_CoreScreen(object, data) {
	$ui_CoreComponent.call(this, object);
	if (object) {
		object.data = data;
		object.guid = $ui.guid();
		object.children = []; // Contains all child controls in the screen
		$ui.addClass(object.dom,'ui-core-screen');
		
		/**
		* Protected internal function for derivative screens to implement if they have specific functionality they wish to
		* do when the screen initializes.  This function will fire just before the <b>onshow</b> event is triggered for the screen.
		* @function _intitialize
		* @memberof $ui.CoreScreen
		* @protected
		*/
		
		// Initialize the screen
		object.initialize = function() {
			$ui._protected.inScreenTransition = false;
			$ui._blockAllTapEvent(false);
			// See if there is an internal implementation of _initialize
			if (this._initialize) {
				this._initialize();
			}
			// Raise our onshow event
			if (this.onshow) {
				this.onshow(this.data);
			}
			// Fire the _onshow for all the controls
			var i,
				control;
			for (i = 0; i < this.children.length;i++) {
				control = this.children[i];
				if (control._onshow) {
					control._onshow();
				}
			}
		}
		object.initialize = object.initialize.bind(object);
		
		// Internal Resize event
		object._onresize = function() {
			// Fire the _onresize for all the controls
			var i,
				control;
			for (i = 0; i < this.children.length;i++) {
				control = this.children[i];
				if (control._onresize) {
					control._onresize();
				}
			}
		}
		object._onresize = object._onresize.bind(object);
		
		// Internal before pop event
		object.onbeforepop = function() {
			if (this._onbeforepop) {
				this._onbeforepop();
			}
			// Fire the _onbeforepop for all the controls
			var i,
				control;
			for (i = 0; i < this.children.length;i++) {
				control = this.children[i];
				if (control._onbeforepop) {
					control._onbeforepop();
				}
			}
		}
		object.onbeforepop = object.onbeforepop.bind(object);
		
		// Internal function to trigger all theme change internal assignments
		object._fireThemeChange = function() {
			if (this._onthemechange) {
				this._onthemechange();
			}
			// Fire the _onthemechange for all the controls
			var i,
				control;
			for (i = 0; i < this.children.length;i++) {
				control = this.children[i];
				if (control._onthemechange) {
					control._onthemechange();
				}
			}
		}
		object._fireThemeChange = object._fireThemeChange.bind(object);
		
		// Destroy screen
		object._destroy = function() {
			if (this.ondestroy) {
				this.ondestroy();
			}
			// Loop through all the children and call their destroy
			var i;
			for (i = 0; i < this.children.length; i++) {
				this.children[i].destroy();
			}
		}
		object._destroy = object._destroy.bind(object);
		
		return object.dom;
	}
}

$ui_CoreScreen.prototype = new $ui_CoreComponent();

/**
 * The DataProvider component provides a data source that can be bound to controls on a screen. This provides the ability to both populate controls with data, as well as automatically save the data based on user interaction with the controls.<br><br>
 * <b>NOTE: The DataProvider should be attached to a screen or control using its [attachedObjects]{@link $ui.CoreComponent} property.</b><br><br>
 * <b>Sample Declaration</b>
 * <pre>
 * {
 *   component: $ui.DataProvider,
 *   id: 'myProvider',
 *   data: {
 *      account: {
 *         username: '@brcewane' 
 *      }
 *   }
 *}
 * </pre>
 * @namespace
 * @name DataProvider
 * @memberof $ui
 * @property {string} component - The <b>required</b> component property defines what type of component is being defined. This property must be $ui.DataProvider
 * @property {string} id - The <b>required</b> id property is used to uniquely define the data provider in the scope of the screen in which it belongs. Providing an id for your data provider is required because you can easily access your provider through your javascript coding and also reference it as the provider for a control.
 * @property {object} [data] - The data property by default is undefined. You can populate the data property by calling the load or set functions listed in the functions area, or you can define it as any kind of object. The data property holds the object that represents the data for the provider
 * @property {GenericEvent} [onload] - This event will fire when the data has been successfully loaded into the provider and controls have been updated
 * @property {GenericEvent} [onbeforeupdate] - This event will fire when the data property has been successfully set, but has not yet been used to update any controls connected to the provider. This gives you an opportunity to manipulate the data property of the data provider <b>before</b> controls are updated
 */
function $ui_DataProvider(object, screen){
	object.screen = screen;
	object._url = undefined;
	object._parameters = undefined;
	object._untouched = true;
	
	// Attach the ID to the main screen object
	if (object.id && screen) {
		screen[object.id] = object;
	}
	
	/** 
	 * You can set the data property for any data provider directly by passing it an object that you want to use as the data source. Setting this property will trigger the <i>onbeforeupdate</i>, <i>onloaded</i> event and update the controls which are using this provider
	 * @function setData
	 * @memberof $ui.DataProvider
	 * @param {object} value - Object to set as data for the data provider
	 */
	object.setData = function(value) {
 		this._untouched = false;
		this.data = value;
		if (this.onbeforeupdate) {
			this.onbeforeupdate();
		}
		this._raiseEvent();
		if (value == undefined) return;
		if (this.onload) {
			this.onload();
		}
	}
	object.setData = object.setData.bind(object);
	
	/** 
	 * The refresh function will send a signal out to all connected components to refresh their data from the current content in memory from the provider. <b>NOTE: No <i>onbeforeupdate</i> or <i>onload</i> event will fire on the provider</b>
	 * @function refresh
	 * @memberof $ui.DataProvider
	 */
	object.refresh = function() {
		this._raiseEvent();
	}
	object.refresh = object.refresh.bind(object);
	
	// Raise our event to let the rest of the app know to refresh
	object._raiseEvent = function() {
		var evt = document.createEvent('Events');
		evt.initEvent(this.screen.guid+'-'+this.id+'-updated', true, true);
		window.dispatchEvent(evt);
	}
	object._raiseEvent = object._raiseEvent.bind(object);
	
	// Private function to handle clean-up
	object._destroy = function() {
		this.data = undefined;
	}
	object._destroy = object._destroy.bind(object);
	
	// See if the data was pre-defined
	if (object.data != undefined) {
		if (object.onbeforeupdate) {
			object.onbeforeupdate();
		}
		if (object.onload) {
			object.onload();
		}
	}
	
	return undefined;
}

/**
 * A data provider link provides a binding between a [control]{@link $ui.CoreComponent} and a data provider. The path for the <b>property</b> attribute starts at the root of the object that is provided as the data source for the data provider.<br><br>
 * The type of object that the property path should point to is dependent on the control and the data it uses to display and/or edit. If the control also allows the user to edit data or change settings, these changes will be applied to the property value in the data provider.<br><br>
 * <b>Sample Code:</b><br>
 * <pre>provider: {
 *    id: 'myProvider',
 *    property: 'posts'
 * }
 * </pre>
 * <br>
 * To access sub objects in the object chain from the data provider you can use normal <b>dot</b> notation:<br><br>
 * <b>Sample Code:</b><br>
 * <pre>provider: {
 *    id: 'myProvider',
 *    property: 'posts.item.thingy'
 * }
 * </pre>
 * <br>
 * @namespace
 * @name DataProviderLink
 * @memberof $ui
 * @property {string} id - This is the <b>mandatory</b> id of the data provider belonging to the screen which will be linked to this control.  
 * @property {string} property - This is the property path/name of the object to be used as the bound data for this control. A nested property can be defined simply by providing a path using <b>.</b> dot separators just like you were referring to the object via JavaScript
 */
 
 

/**
 * Represents an interaction event from the user interface.  This event is raised when a user interacts with a part of the interface. All interation events are sent to the $ui.oninteraction 
 * assigned function.  If valid values are not passed in for all of the parameters no event will be raised.
 * @class InteractionEvent
 * @param {string} screenId - The <b>id</b> property of the screen which contains the control providing the interaction
 * @param {string} controlID - The <b>id</b> property of the control in which the user interacted
 * @param {string} interaction - The interaction which took place
 * @param {object} component - The component type definition for which this interaction took place.   An example could be the value $ui.List.  This is <b>not</b> a pointer to the control.
 */
function InteractionEvent(screenId, controlId, interaction, component) {
	/**
	 * The <b>id</b> property of the screen which contains the control providing the interaction
	 * @member {string} screenId
	 * @memberOf InteractionEvent
	 */
	this.screenId = screenId;
	
	 /**
	 * The <b>id</b> property of the control in which the user interacted
	 * @member {string} controlId
	 * @memberOf InteractionEvent
	 */
	this.controlId = controlId;
	
	 
	 /**
	 * The interaction which took place
	 * @member {string} interaction
	 * @memberOf InteractionEvent
	 */
	this.interaction = interaction;
	
	/**
	 * The component type definition for which this interaction took place.  An example could be the value $ui.List.  This is <b>not</b> a pointer to the control
	 * @member {object} component
	 * @memberOf InteractionEvent
	 */
	this.component = component;
}


 


/**
 * A List object will display multiple list items based on the data provided to the control.  The type of item objects that are used should match the declaration of the <b>style</b> of the list control<br><br>
 * <b>Sample Declaration</b><br>
 * <pre>
 * {
 *   component: $ui.List,
 *   style: $ui.GenericListItem,
 *   items: [
 *      {
 *         img: 'thumbnails/foo.png',
 *         title: 'This is my title',
 *         accent: '6 hours ago',
 *         caption: 'My summary description'
 *      }
 *   ]
 *}
 * @namespace
 * @name List
 * @memberof $ui
 * @extends $ui.CoreComponent
 * @property {object[]} [items] - The items property is an array of objects who's definition matches that of the requirements of the <b>style</b> property of the list
 * @property {object} style - This is a list item decalaration so that the list knows how to render. For example this could be set to {@link $ui.GenericListItem}
 * @property {$ui.DataProviderLink} [provider] - The type of data provider value for a list control should point to a property in the data provider that would follow the same rules as hard coding an array of items.
 * @property {ListActionEvent} [onaction] - The onaction event will fire when an action from a list item is triggered. Some list items may have multiple actions that can be taken. When one of these actions is selected by the user the onaction event will fire.
 */
function $ui_List(object, screen) {
	$ui_CoreComponent.call(this, object, screen);
	$ui.addClass(object.dom,'ui-list');
	
	// Set our initial properties that can be modified
	if (object.items) {
		object._original.items = [];
		for (var i = 0; i < object.items.length; i++) {
			object._original.items.push(object.items[i]);
		}
	}

	// Broker the onaction from a list item
	object._onaction = function(item, event) {
		if (this.onaction) {
			this.onaction(event);
		}
	}
	object._onaction = object._onaction.bind(object);
	
	// Create the DOM for a list item depending on the list type
	object._createItemDom = function(item) {
		var dom;
		// See if the item is a header
		if (item.component && (item.component == $ui.Header)) {
			dom = $ui.createControl(item,this.screen);
		} else if (this._itemConstructor != undefined) {
			dom = new this._itemConstructor(item,this.screen);
		}
		return dom;
	}
	object._createItemDom = object._createItemDom.bind(object);
	
	// Private function to add a new item to the list
	object._addItem = function(item) {
		item.parent = this;
		itemDom = this._createItemDom(item);
		if (itemDom) {
			this.dom.appendChild(itemDom);
			if (item._onafterinsert) {
				item._onafterinsert();
			}
			return true;
		} else {
			return false;
		}
	}
	object._addItem = object._addItem.bind(object);
	
	/** 
	 * You can add an item to the end of the list by calling the addItem function and passing in an object that matches the a list item
	 * @function addItem
	 * @memberof $ui.List
	 * @param {object} item - Item to be added to the list
	 */
	object.addItem = function(item) {
		if (this._addItem(item)) {
			this.items.push(item);
			// if there is data provider, add the item to provider
			if (this._providerItems != undefined) {
				this._providerItems.push(item);
			}
			return true;
		} else {
			return false;
		}
	}
	object.addItem = object.addItem.bind(object);
	
	/** 
	 * The remove item function will remove an existing item from a list. If an invalid item is specified the removal will fail
	 * @function removeItem
	 * @memberof $ui.List
	 * @param {object} item - Item to be removed from the list
	 */
	object.removeItem = function(item) {
		if (item == undefined) return false;
		var index = this.items.indexOf(item);
		if (index < 0) return false;
		try {
			this.dom.removeChild(item.dom);
		} catch (ex) {
			console.log('$ui.List: ' + ex);
		}
		this.items.splice(index, 1);
		// See if we have items on a provider that we should remove
		if (this._providerItems != undefined) {
			this._providerItems.splice(index, 1);
		}
		if (item._destroy) {
			item._destroy();
		}
	}
	object.removeItem = object.removeItem.bind(object);
	
	/** 
	 * Insert item works similar to addItem but instead will insert the item into the list at the index specified. If an invalid index is specified it will result in failure to insert the item. To insert an item at the top of a list call insert with the index of 0.
	 * @function insertItem
	 * @memberOf $ui.List
	 * @param {object} item - Item to be inserted into the list
	 * @param {number} index - Index to insert the item
	 */
	object.insertItem = function(item, index) {
		item.parent = this;
		if (index < 0) {
			return false;
		} else if (this.items.length == 0) {
			this.addItem(item);
			return true;
		} else if (index > this.items.length - 1) {
			this.addItem(item);
			return true;
		} else { // Insert it at the index
			var existingItem = this.items[index],
				itemDom = this._createItemDom(item);
			this.items.splice(index, 0, item);
			this.dom.insertBefore(itemDom, existingItem.dom);
			// if there is data provider, insert the item to provider
			if (this._providerItems != undefined) {
				this._providerItems.splice(index, 0, item);
			}
			return true;
		} 
		return false;
	}
	object.insertItem = object.insertItem.bind(object);
	
	/** 
	 * You can refresh all the items in a list by calling the refreshItems function with an array of new items
	 * @function refreshItems
	 * @memberof $ui.List
	 * @param {object[]} items - Array of items to refresh the list
	 */
	object.refreshItems = function(itemArray) {
		if (itemArray == undefined) return; // No data provided
		var i,
			item;
		if (this.items) {
			// Remove all existing items first
			for (i = this.items.length - 1; i >= 0; i--) {
				item = this.items[i];
				try {
					this.dom.removeChild(item.dom);
				} catch (ex) {
					console.log('$ui.List: ' + ex);
				}
				this.items.pop();
				if (item._destroy) {
					item._destroy();
				}
			}
			// See if there is data from provider, and make it blank.
			if (this._providerItems != undefined) {
				this._providerItems = [];
			}
		}
		this.addItemBatch(itemArray);
	}
	object.refreshItems = object.refreshItems.bind(object);
	
	/** 
	 * This function is much like the refreshItems function but instead it loads a list of circle list items to the end of the current list and does not replace the existing list items.
	 * @function addItemBatch
	 * @memberof $ui.List
	 * @param {object[]} items - Array of items to be added to the list
	 */
	object.addItemBatch = function(itemArray) {
		var i,
			item;
		if (!this.items) {
			this.items = [];
		}
		// Add all new items into the list
		for (i = 0; i < itemArray.length; i++) {
			item = itemArray[i];
			this.addItem(item);
		}
	}
	object.addItemBatch = object.addItemBatch.bind(object);
	
	// Private function to handle provider updates
	object._providerUpdate = function(value) {
		this.refreshItems(value);
		this._providerItems = value;
	}
	object._providerUpdate = object._providerUpdate.bind(object);
	
	
	var i,
		extension;
	// Determine our item constructor
	for (i = 0; i < $ui._protected.definitions.length; i++) {
		extension = $ui._protected.definitions[i];
		if (extension.type != $ui.UIExtensionType.LISTITEM) continue;
		if (extension.component == object.style) {
			object._itemConstructor = extension.constructor;
			break;
		}
	}

	// Cycle through list items
	var	item,
		index;
	if (object.items) {
		for (i = 0; i < object.items.length; i++) {
			item = object.items[i];
			object._addItem(item);
		}
	} else {
		object.items = [];
	}
	
	return object.dom;
}

$ui_List.prototype = new $ui_CoreComponent();

/**
 * The {@link $ui.List} <b>onaction</b> event will fire when the user interacts with a list item
 * @callback ListActionEvent
 * @param {ListEvent} event - The list event which was raised
 */
/**
 * The list event is what is triggered when a user interacts with the List control. It contains the target list item that the user was interacting with, the type of event which was triggered 
 * and an optional data property that contains extra data about the event.
 * @class ListEvent
 * @param {object} target - Target list item where the event originated
 * @param {string} eventType - The type of event that was triggered. Each list item has its own set of possible events that can be raised
 * @param {object} [data] - Optional data that can be passed with a list event
 */
function ListEvent(target, eventType, data) {
	/** 
	 * Target list item where the event originated
	 * @member {object} target
	 * @memberOf ListEvent
	 */
	this.target = target;
	
	/** 
	 * The type of event that was triggered. Each list item has its own set of possible events that can be raised
	 * @member {string} eventType
	 * @memberOf ListEvent
	 */
	this.eventType = eventType;
	
	/** 
	 * Optional data that can be passed with a list event
	 * @member {object} [data]
	 * @memberOf ListEvent
	 */
	this.data = data;
}


/**
 * The spinner control provides you the ability to give a visual indicator when your content is loading. The spinner has one main property <b>size</b>. <br><br>
 * <b>Sample Declaration</b><br>
 * <pre>
 * {
 *   component: $ui.Spinner,
 *   size: $ui.Spinner.SpinnerSize.LARGE
 *}
 * @namespace Spinner
 * @memberof $ui
 * @extends $ui.CoreComponent
 * @property {$ui.Size} [size=$ui.Size.NORMAL] - Represents the size of the spinner component.
 * @property {$ui.Spinner.SpinnerColor} [forceColor] - This property specifies if the color should be forced to be dark or light. By default the system figures this out and does not need to be set. However, if you want to force a color in a certain scenario you can use this property.
 */
function $ui_Spinner(object, screen){
	$ui_CoreComponent.call(this, object, screen);
	object.size = (object.size) ? object.size : $ui.Size.NORMAL;
	$ui.addClass(object.dom, 'ui-spinner')
	$ui.addClass(object.dom, object.size);
	$ui.addClass(object.dom, 'center');
	
	// Create the inner div
	object.dom.innerDiv = document.createElement('div');
	$ui.addClass(object.dom.innerDiv, 'inner');
	object.dom.appendChild(object.dom.innerDiv);
	
	// Check our coloring
	if (object.forceColor) {
		$ui.addClass(object.dom.innerDiv, object.forceColor);
	} else {
		if ($ui.theme.rootClass && $ui.theme.rootClass.indexOf('ui-theme-dark') > -1)  {
			$ui.addClass(object.dom.innerDiv, 'light');
		} else {
			$ui.addClass(object.dom.innerDiv, 'dark');
		}
	}

	return object.dom
}

$ui_Spinner.prototype = new $ui_CoreComponent();
/**
 * The definition of an extension to be used in extending the <b>$ui</b> framework.
 * @class
 * @param {string} name - This would be the value you set as the <b>component</b> property for your control
 * @param {function} constructor - The function to be used as your control constructor
 * @param {$ui.UIExtensionType} [type=$ui.UIExtensionType.CONTROL] - The type of extension you are registering
 * @param {object} [definition] - Class definition for your extension, you can include properties such as constants here
 */
function UIExtension(name, constructor, type, definition) {
	/** 
	 * This would be the value you set as the <b>component</b> property for your control
	 * @member {string} name
	 * @memberOf UIExtension
	 */
	if (name == null) throw new Error('UIExtension: name cannot be null');
	if (name == undefined) throw new Error('UIExtension: name cannot be undefined');
	this.name = name;
	/** 
	 * The function to be used as your control constructor
	 * @member {function} constructor
	 * @memberOf UIExtension
	 */
	if (constructor == null) throw new Error('UIExtension: constructor cannot be null');
	if (constructor == undefined) throw new Error('UIExtension: constructor cannot be undefined');
	this.constructor = constructor;
	/** 
	 * The type of extension you are registering
	 * @member {$ui.UIExtensionType} [type=$ui.UIExtensionType.CONTROL]
	 * @memberOf UIExtension
	 */
	if (type == null || type == undefined) {
		this.type = $ui.UIExtensionType.CONTROL;
	} else if ((type != $ui.UIExtensionType.CONTROL) && (type != $ui.UIExtensionType.SCREEN) && (type != $ui.UIExtensionType.LISTITEM)) {
		throw new Error('UIExtension: type is an invalid value');
	} else {
		this.type = type;
	}
	/** 
	 * Class definition for your extension, you can include properties such as constants here
	 * @member {object} [definition]
	 * @memberOf UIExtension
	 */
	if (definition == null || definition == undefined) {
		this.definition = {};
	} else {
		this.definition = definition;
	}
}
/*!
 * Chart.js
 * http://chartjs.org/
 * Version: 1.0.1
 *
 * Copyright 2015 Nick Downie
 * Released under the MIT license
 * https://github.com/nnnick/Chart.js/blob/master/LICENSE.md
 */
(function(){"use strict";var t=this,i=t.Chart,e=function(t){this.canvas=t.canvas,this.ctx=t;this.width=t.canvas.width,this.height=t.canvas.height;return this.aspectRatio=this.width/this.height,s.retinaScale(this),this};e.defaults={global:{animation:!0,animationSteps:60,animationEasing:"easeOutQuart",showScale:!0,scaleOverride:!1,scaleSteps:null,scaleStepWidth:null,scaleStartValue:null,scaleLineColor:"rgba(0,0,0,.1)",scaleLineWidth:1,scaleShowLabels:!0,scaleLabel:"<%=value%>",scaleIntegersOnly:!0,scaleBeginAtZero:!1,scaleFontFamily:"'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",scaleFontSize:12,scaleFontStyle:"normal",scaleFontColor:"#666",responsive:!1,maintainAspectRatio:!0,showTooltips:!0,customTooltips:!1,tooltipEvents:["mousemove","touchstart","touchmove","mouseout"],tooltipFillColor:"rgba(0,0,0,0.8)",tooltipFontFamily:"'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",tooltipFontSize:14,tooltipFontStyle:"normal",tooltipFontColor:"#fff",tooltipTitleFontFamily:"'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",tooltipTitleFontSize:14,tooltipTitleFontStyle:"bold",tooltipTitleFontColor:"#fff",tooltipYPadding:6,tooltipXPadding:6,tooltipCaretSize:8,tooltipCornerRadius:6,tooltipXOffset:10,tooltipTemplate:"<%if (label){%><%=label%>: <%}%><%= value %>",multiTooltipTemplate:"<%= value %>",multiTooltipKeyBackground:"#fff",onAnimationProgress:function(){},onAnimationComplete:function(){}}},e.types={};var s=e.helpers={},n=s.each=function(t,i,e){var s=Array.prototype.slice.call(arguments,3);if(t)if(t.length===+t.length){var n;for(n=0;n<t.length;n++)i.apply(e,[t[n],n].concat(s))}else for(var o in t)i.apply(e,[t[o],o].concat(s))},o=s.clone=function(t){var i={};return n(t,function(e,s){t.hasOwnProperty(s)&&(i[s]=e)}),i},a=s.extend=function(t){return n(Array.prototype.slice.call(arguments,1),function(i){n(i,function(e,s){i.hasOwnProperty(s)&&(t[s]=e)})}),t},h=s.merge=function(){var t=Array.prototype.slice.call(arguments,0);return t.unshift({}),a.apply(null,t)},l=s.indexOf=function(t,i){if(Array.prototype.indexOf)return t.indexOf(i);for(var e=0;e<t.length;e++)if(t[e]===i)return e;return-1},r=(s.where=function(t,i){var e=[];return s.each(t,function(t){i(t)&&e.push(t)}),e},s.findNextWhere=function(t,i,e){e||(e=-1);for(var s=e+1;s<t.length;s++){var n=t[s];if(i(n))return n}},s.findPreviousWhere=function(t,i,e){e||(e=t.length);for(var s=e-1;s>=0;s--){var n=t[s];if(i(n))return n}},s.inherits=function(t){var i=this,e=t&&t.hasOwnProperty("constructor")?t.constructor:function(){return i.apply(this,arguments)},s=function(){this.constructor=e};return s.prototype=i.prototype,e.prototype=new s,e.extend=r,t&&a(e.prototype,t),e.__super__=i.prototype,e}),c=s.noop=function(){},u=s.uid=function(){var t=0;return function(){return"chart-"+t++}}(),d=s.warn=function(t){window.console&&"function"==typeof window.console.warn&&console.warn(t)},p=s.amd="function"==typeof define&&define.amd,f=s.isNumber=function(t){return!isNaN(parseFloat(t))&&isFinite(t)},g=s.max=function(t){return Math.max.apply(Math,t)},m=s.min=function(t){return Math.min.apply(Math,t)},v=(s.cap=function(t,i,e){if(f(i)){if(t>i)return i}else if(f(e)&&e>t)return e;return t},s.getDecimalPlaces=function(t){return t%1!==0&&f(t)?t.toString().split(".")[1].length:0}),S=s.radians=function(t){return t*(Math.PI/180)},x=(s.getAngleFromPoint=function(t,i){var e=i.x-t.x,s=i.y-t.y,n=Math.sqrt(e*e+s*s),o=2*Math.PI+Math.atan2(s,e);return 0>e&&0>s&&(o+=2*Math.PI),{angle:o,distance:n}},s.aliasPixel=function(t){return t%2===0?0:.5}),y=(s.splineCurve=function(t,i,e,s){var n=Math.sqrt(Math.pow(i.x-t.x,2)+Math.pow(i.y-t.y,2)),o=Math.sqrt(Math.pow(e.x-i.x,2)+Math.pow(e.y-i.y,2)),a=s*n/(n+o),h=s*o/(n+o);return{inner:{x:i.x-a*(e.x-t.x),y:i.y-a*(e.y-t.y)},outer:{x:i.x+h*(e.x-t.x),y:i.y+h*(e.y-t.y)}}},s.calculateOrderOfMagnitude=function(t){return Math.floor(Math.log(t)/Math.LN10)}),C=(s.calculateScaleRange=function(t,i,e,s,n){var o=2,a=Math.floor(i/(1.5*e)),h=o>=a,l=g(t),r=m(t);l===r&&(l+=.5,r>=.5&&!s?r-=.5:l+=.5);for(var c=Math.abs(l-r),u=y(c),d=Math.ceil(l/(1*Math.pow(10,u)))*Math.pow(10,u),p=s?0:Math.floor(r/(1*Math.pow(10,u)))*Math.pow(10,u),f=d-p,v=Math.pow(10,u),S=Math.round(f/v);(S>a||a>2*S)&&!h;)if(S>a)v*=2,S=Math.round(f/v),S%1!==0&&(h=!0);else if(n&&u>=0){if(v/2%1!==0)break;v/=2,S=Math.round(f/v)}else v/=2,S=Math.round(f/v);return h&&(S=o,v=f/S),{steps:S,stepValue:v,min:p,max:p+S*v}},s.template=function(t,i){function e(t,i){var e=/\W/.test(t)?new Function("obj","var p=[],print=function(){p.push.apply(p,arguments);};with(obj){p.push('"+t.replace(/[\r\t\n]/g," ").split("<%").join("	").replace(/((^|%>)[^\t]*)'/g,"$1\r").replace(/\t=(.*?)%>/g,"',$1,'").split("	").join("');").split("%>").join("p.push('").split("\r").join("\\'")+"');}return p.join('');"):s[t]=s[t];return i?e(i):e}if(t instanceof Function)return t(i);var s={};return e(t,i)}),w=(s.generateLabels=function(t,i,e,s){var o=new Array(i);return labelTemplateString&&n(o,function(i,n){o[n]=C(t,{value:e+s*(n+1)})}),o},s.easingEffects={linear:function(t){return t},easeInQuad:function(t){return t*t},easeOutQuad:function(t){return-1*t*(t-2)},easeInOutQuad:function(t){return(t/=.5)<1?.5*t*t:-0.5*(--t*(t-2)-1)},easeInCubic:function(t){return t*t*t},easeOutCubic:function(t){return 1*((t=t/1-1)*t*t+1)},easeInOutCubic:function(t){return(t/=.5)<1?.5*t*t*t:.5*((t-=2)*t*t+2)},easeInQuart:function(t){return t*t*t*t},easeOutQuart:function(t){return-1*((t=t/1-1)*t*t*t-1)},easeInOutQuart:function(t){return(t/=.5)<1?.5*t*t*t*t:-0.5*((t-=2)*t*t*t-2)},easeInQuint:function(t){return 1*(t/=1)*t*t*t*t},easeOutQuint:function(t){return 1*((t=t/1-1)*t*t*t*t+1)},easeInOutQuint:function(t){return(t/=.5)<1?.5*t*t*t*t*t:.5*((t-=2)*t*t*t*t+2)},easeInSine:function(t){return-1*Math.cos(t/1*(Math.PI/2))+1},easeOutSine:function(t){return 1*Math.sin(t/1*(Math.PI/2))},easeInOutSine:function(t){return-0.5*(Math.cos(Math.PI*t/1)-1)},easeInExpo:function(t){return 0===t?1:1*Math.pow(2,10*(t/1-1))},easeOutExpo:function(t){return 1===t?1:1*(-Math.pow(2,-10*t/1)+1)},easeInOutExpo:function(t){return 0===t?0:1===t?1:(t/=.5)<1?.5*Math.pow(2,10*(t-1)):.5*(-Math.pow(2,-10*--t)+2)},easeInCirc:function(t){return t>=1?t:-1*(Math.sqrt(1-(t/=1)*t)-1)},easeOutCirc:function(t){return 1*Math.sqrt(1-(t=t/1-1)*t)},easeInOutCirc:function(t){return(t/=.5)<1?-0.5*(Math.sqrt(1-t*t)-1):.5*(Math.sqrt(1-(t-=2)*t)+1)},easeInElastic:function(t){var i=1.70158,e=0,s=1;return 0===t?0:1==(t/=1)?1:(e||(e=.3),s<Math.abs(1)?(s=1,i=e/4):i=e/(2*Math.PI)*Math.asin(1/s),-(s*Math.pow(2,10*(t-=1))*Math.sin(2*(1*t-i)*Math.PI/e)))},easeOutElastic:function(t){var i=1.70158,e=0,s=1;return 0===t?0:1==(t/=1)?1:(e||(e=.3),s<Math.abs(1)?(s=1,i=e/4):i=e/(2*Math.PI)*Math.asin(1/s),s*Math.pow(2,-10*t)*Math.sin(2*(1*t-i)*Math.PI/e)+1)},easeInOutElastic:function(t){var i=1.70158,e=0,s=1;return 0===t?0:2==(t/=.5)?1:(e||(e=.3*1.5),s<Math.abs(1)?(s=1,i=e/4):i=e/(2*Math.PI)*Math.asin(1/s),1>t?-.5*s*Math.pow(2,10*(t-=1))*Math.sin(2*(1*t-i)*Math.PI/e):s*Math.pow(2,-10*(t-=1))*Math.sin(2*(1*t-i)*Math.PI/e)*.5+1)},easeInBack:function(t){var i=1.70158;return 1*(t/=1)*t*((i+1)*t-i)},easeOutBack:function(t){var i=1.70158;return 1*((t=t/1-1)*t*((i+1)*t+i)+1)},easeInOutBack:function(t){var i=1.70158;return(t/=.5)<1?.5*t*t*(((i*=1.525)+1)*t-i):.5*((t-=2)*t*(((i*=1.525)+1)*t+i)+2)},easeInBounce:function(t){return 1-w.easeOutBounce(1-t)},easeOutBounce:function(t){return(t/=1)<1/2.75?7.5625*t*t:2/2.75>t?1*(7.5625*(t-=1.5/2.75)*t+.75):2.5/2.75>t?1*(7.5625*(t-=2.25/2.75)*t+.9375):1*(7.5625*(t-=2.625/2.75)*t+.984375)},easeInOutBounce:function(t){return.5>t?.5*w.easeInBounce(2*t):.5*w.easeOutBounce(2*t-1)+.5}}),b=s.requestAnimFrame=function(){return window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||window.oRequestAnimationFrame||window.msRequestAnimationFrame||function(t){return window.setTimeout(t,1e3/60)}}(),P=(s.cancelAnimFrame=function(){return window.cancelAnimationFrame||window.webkitCancelAnimationFrame||window.mozCancelAnimationFrame||window.oCancelAnimationFrame||window.msCancelAnimationFrame||function(t){return window.clearTimeout(t,1e3/60)}}(),s.animationLoop=function(t,i,e,s,n,o){var a=0,h=w[e]||w.linear,l=function(){a++;var e=a/i,r=h(e);t.call(o,r,e,a),s.call(o,r,e),i>a?o.animationFrame=b(l):n.apply(o)};b(l)},s.getRelativePosition=function(t){var i,e,s=t.originalEvent||t,n=t.currentTarget||t.srcElement,o=n.getBoundingClientRect();return s.touches?(i=s.touches[0].clientX-o.left,e=s.touches[0].clientY-o.top):(i=s.clientX-o.left,e=s.clientY-o.top),{x:i,y:e}},s.addEvent=function(t,i,e){t.addEventListener?t.addEventListener(i,e):t.attachEvent?t.attachEvent("on"+i,e):t["on"+i]=e}),L=s.removeEvent=function(t,i,e){t.removeEventListener?t.removeEventListener(i,e,!1):t.detachEvent?t.detachEvent("on"+i,e):t["on"+i]=c},k=(s.bindEvents=function(t,i,e){t.events||(t.events={}),n(i,function(i){t.events[i]=function(){e.apply(t,arguments)},P(t.chart.canvas,i,t.events[i])})},s.unbindEvents=function(t,i){n(i,function(i,e){L(t.chart.canvas,e,i)})}),F=s.getMaximumWidth=function(t){var i=t.parentNode;return i.clientWidth},R=s.getMaximumHeight=function(t){var i=t.parentNode;return i.clientHeight},T=(s.getMaximumSize=s.getMaximumWidth,s.retinaScale=function(t){var i=t.ctx,e=t.canvas.width,s=t.canvas.height;window.devicePixelRatio&&(i.canvas.style.width=e+"px",i.canvas.style.height=s+"px",i.canvas.height=s*window.devicePixelRatio,i.canvas.width=e*window.devicePixelRatio,i.scale(window.devicePixelRatio,window.devicePixelRatio))}),A=s.clear=function(t){t.ctx.clearRect(0,0,t.width,t.height)},M=s.fontString=function(t,i,e){return i+" "+t+"px "+e},W=s.longestText=function(t,i,e){t.font=i;var s=0;return n(e,function(i){var e=t.measureText(i).width;s=e>s?e:s}),s},z=s.drawRoundedRectangle=function(t,i,e,s,n,o){t.beginPath(),t.moveTo(i+o,e),t.lineTo(i+s-o,e),t.quadraticCurveTo(i+s,e,i+s,e+o),t.lineTo(i+s,e+n-o),t.quadraticCurveTo(i+s,e+n,i+s-o,e+n),t.lineTo(i+o,e+n),t.quadraticCurveTo(i,e+n,i,e+n-o),t.lineTo(i,e+o),t.quadraticCurveTo(i,e,i+o,e),t.closePath()};e.instances={},e.Type=function(t,i,s){this.options=i,this.chart=s,this.id=u(),e.instances[this.id]=this,i.responsive&&this.resize(),this.initialize.call(this,t)},a(e.Type.prototype,{initialize:function(){return this},clear:function(){return A(this.chart),this},stop:function(){return s.cancelAnimFrame.call(t,this.animationFrame),this},resize:function(t){this.stop();var i=this.chart.canvas,e=F(this.chart.canvas),s=this.options.maintainAspectRatio?e/this.chart.aspectRatio:R(this.chart.canvas);return i.width=this.chart.width=e,i.height=this.chart.height=s,T(this.chart),"function"==typeof t&&t.apply(this,Array.prototype.slice.call(arguments,1)),this},reflow:c,render:function(t){return t&&this.reflow(),this.options.animation&&!t?s.animationLoop(this.draw,this.options.animationSteps,this.options.animationEasing,this.options.onAnimationProgress,this.options.onAnimationComplete,this):(this.draw(),this.options.onAnimationComplete.call(this)),this},generateLegend:function(){return C(this.options.legendTemplate,this)},destroy:function(){this.clear(),k(this,this.events);var t=this.chart.canvas;t.width=this.chart.width,t.height=this.chart.height,t.style.removeProperty?(t.style.removeProperty("width"),t.style.removeProperty("height")):(t.style.removeAttribute("width"),t.style.removeAttribute("height")),delete e.instances[this.id]},showTooltip:function(t,i){"undefined"==typeof this.activeElements&&(this.activeElements=[]);var o=function(t){var i=!1;return t.length!==this.activeElements.length?i=!0:(n(t,function(t,e){t!==this.activeElements[e]&&(i=!0)},this),i)}.call(this,t);if(o||i){if(this.activeElements=t,this.draw(),this.options.customTooltips&&this.options.customTooltips(!1),t.length>0)if(this.datasets&&this.datasets.length>1){for(var a,h,r=this.datasets.length-1;r>=0&&(a=this.datasets[r].points||this.datasets[r].bars||this.datasets[r].segments,h=l(a,t[0]),-1===h);r--);var c=[],u=[],d=function(){var t,i,e,n,o,a=[],l=[],r=[];return s.each(this.datasets,function(i){t=i.points||i.bars||i.segments,t[h]&&t[h].hasValue()&&a.push(t[h])}),s.each(a,function(t){l.push(t.x),r.push(t.y),c.push(s.template(this.options.multiTooltipTemplate,t)),u.push({fill:t._saved.fillColor||t.fillColor,stroke:t._saved.strokeColor||t.strokeColor})},this),o=m(r),e=g(r),n=m(l),i=g(l),{x:n>this.chart.width/2?n:i,y:(o+e)/2}}.call(this,h);new e.MultiTooltip({x:d.x,y:d.y,xPadding:this.options.tooltipXPadding,yPadding:this.options.tooltipYPadding,xOffset:this.options.tooltipXOffset,fillColor:this.options.tooltipFillColor,textColor:this.options.tooltipFontColor,fontFamily:this.options.tooltipFontFamily,fontStyle:this.options.tooltipFontStyle,fontSize:this.options.tooltipFontSize,titleTextColor:this.options.tooltipTitleFontColor,titleFontFamily:this.options.tooltipTitleFontFamily,titleFontStyle:this.options.tooltipTitleFontStyle,titleFontSize:this.options.tooltipTitleFontSize,cornerRadius:this.options.tooltipCornerRadius,labels:c,legendColors:u,legendColorBackground:this.options.multiTooltipKeyBackground,title:t[0].label,chart:this.chart,ctx:this.chart.ctx,custom:this.options.customTooltips}).draw()}else n(t,function(t){var i=t.tooltipPosition();new e.Tooltip({x:Math.round(i.x),y:Math.round(i.y),xPadding:this.options.tooltipXPadding,yPadding:this.options.tooltipYPadding,fillColor:this.options.tooltipFillColor,textColor:this.options.tooltipFontColor,fontFamily:this.options.tooltipFontFamily,fontStyle:this.options.tooltipFontStyle,fontSize:this.options.tooltipFontSize,caretHeight:this.options.tooltipCaretSize,cornerRadius:this.options.tooltipCornerRadius,text:C(this.options.tooltipTemplate,t),chart:this.chart,custom:this.options.customTooltips}).draw()},this);return this}},toBase64Image:function(){return this.chart.canvas.toDataURL.apply(this.chart.canvas,arguments)}}),e.Type.extend=function(t){var i=this,s=function(){return i.apply(this,arguments)};if(s.prototype=o(i.prototype),a(s.prototype,t),s.extend=e.Type.extend,t.name||i.prototype.name){var n=t.name||i.prototype.name,l=e.defaults[i.prototype.name]?o(e.defaults[i.prototype.name]):{};e.defaults[n]=a(l,t.defaults),e.types[n]=s,e.prototype[n]=function(t,i){var o=h(e.defaults.global,e.defaults[n],i||{});return new s(t,o,this)}}else d("Name not provided for this chart, so it hasn't been registered");return i},e.Element=function(t){a(this,t),this.initialize.apply(this,arguments),this.save()},a(e.Element.prototype,{initialize:function(){},restore:function(t){return t?n(t,function(t){this[t]=this._saved[t]},this):a(this,this._saved),this},save:function(){return this._saved=o(this),delete this._saved._saved,this},update:function(t){return n(t,function(t,i){this._saved[i]=this[i],this[i]=t},this),this},transition:function(t,i){return n(t,function(t,e){this[e]=(t-this._saved[e])*i+this._saved[e]},this),this},tooltipPosition:function(){return{x:this.x,y:this.y}},hasValue:function(){return f(this.value)}}),e.Element.extend=r,e.Point=e.Element.extend({display:!0,inRange:function(t,i){var e=this.hitDetectionRadius+this.radius;return Math.pow(t-this.x,2)+Math.pow(i-this.y,2)<Math.pow(e,2)},draw:function(){if(this.display){var t=this.ctx;t.beginPath(),t.arc(this.x,this.y,this.radius,0,2*Math.PI),t.closePath(),t.strokeStyle=this.strokeColor,t.lineWidth=this.strokeWidth,t.fillStyle=this.fillColor,t.fill(),t.stroke()}}}),e.Arc=e.Element.extend({inRange:function(t,i){var e=s.getAngleFromPoint(this,{x:t,y:i}),n=e.angle>=this.startAngle&&e.angle<=this.endAngle,o=e.distance>=this.innerRadius&&e.distance<=this.outerRadius;return n&&o},tooltipPosition:function(){var t=this.startAngle+(this.endAngle-this.startAngle)/2,i=(this.outerRadius-this.innerRadius)/2+this.innerRadius;return{x:this.x+Math.cos(t)*i,y:this.y+Math.sin(t)*i}},draw:function(t){var i=this.ctx;i.beginPath(),i.arc(this.x,this.y,this.outerRadius,this.startAngle,this.endAngle),i.arc(this.x,this.y,this.innerRadius,this.endAngle,this.startAngle,!0),i.closePath(),i.strokeStyle=this.strokeColor,i.lineWidth=this.strokeWidth,i.fillStyle=this.fillColor,i.fill(),i.lineJoin="bevel",this.showStroke&&i.stroke()}}),e.Rectangle=e.Element.extend({draw:function(){var t=this.ctx,i=this.width/2,e=this.x-i,s=this.x+i,n=this.base-(this.base-this.y),o=this.strokeWidth/2;this.showStroke&&(e+=o,s-=o,n+=o),t.beginPath(),t.fillStyle=this.fillColor,t.strokeStyle=this.strokeColor,t.lineWidth=this.strokeWidth,t.moveTo(e,this.base),t.lineTo(e,n),t.lineTo(s,n),t.lineTo(s,this.base),t.fill(),this.showStroke&&t.stroke()},height:function(){return this.base-this.y},inRange:function(t,i){return t>=this.x-this.width/2&&t<=this.x+this.width/2&&i>=this.y&&i<=this.base}}),e.Tooltip=e.Element.extend({draw:function(){var t=this.chart.ctx;t.font=M(this.fontSize,this.fontStyle,this.fontFamily),this.xAlign="center",this.yAlign="above";var i=this.caretPadding=2,e=t.measureText(this.text).width+2*this.xPadding,s=this.fontSize+2*this.yPadding,n=s+this.caretHeight+i;this.x+e/2>this.chart.width?this.xAlign="left":this.x-e/2<0&&(this.xAlign="right"),this.y-n<0&&(this.yAlign="below");var o=this.x-e/2,a=this.y-n;if(t.fillStyle=this.fillColor,this.custom)this.custom(this);else{switch(this.yAlign){case"above":t.beginPath(),t.moveTo(this.x,this.y-i),t.lineTo(this.x+this.caretHeight,this.y-(i+this.caretHeight)),t.lineTo(this.x-this.caretHeight,this.y-(i+this.caretHeight)),t.closePath(),t.fill();break;case"below":a=this.y+i+this.caretHeight,t.beginPath(),t.moveTo(this.x,this.y+i),t.lineTo(this.x+this.caretHeight,this.y+i+this.caretHeight),t.lineTo(this.x-this.caretHeight,this.y+i+this.caretHeight),t.closePath(),t.fill()}switch(this.xAlign){case"left":o=this.x-e+(this.cornerRadius+this.caretHeight);break;case"right":o=this.x-(this.cornerRadius+this.caretHeight)}z(t,o,a,e,s,this.cornerRadius),t.fill(),t.fillStyle=this.textColor,t.textAlign="center",t.textBaseline="middle",t.fillText(this.text,o+e/2,a+s/2)}}}),e.MultiTooltip=e.Element.extend({initialize:function(){this.font=M(this.fontSize,this.fontStyle,this.fontFamily),this.titleFont=M(this.titleFontSize,this.titleFontStyle,this.titleFontFamily),this.height=this.labels.length*this.fontSize+(this.labels.length-1)*(this.fontSize/2)+2*this.yPadding+1.5*this.titleFontSize,this.ctx.font=this.titleFont;var t=this.ctx.measureText(this.title).width,i=W(this.ctx,this.font,this.labels)+this.fontSize+3,e=g([i,t]);this.width=e+2*this.xPadding;var s=this.height/2;this.y-s<0?this.y=s:this.y+s>this.chart.height&&(this.y=this.chart.height-s),this.x>this.chart.width/2?this.x-=this.xOffset+this.width:this.x+=this.xOffset},getLineHeight:function(t){var i=this.y-this.height/2+this.yPadding,e=t-1;return 0===t?i+this.titleFontSize/2:i+(1.5*this.fontSize*e+this.fontSize/2)+1.5*this.titleFontSize},draw:function(){if(this.custom)this.custom(this);else{z(this.ctx,this.x,this.y-this.height/2,this.width,this.height,this.cornerRadius);var t=this.ctx;t.fillStyle=this.fillColor,t.fill(),t.closePath(),t.textAlign="left",t.textBaseline="middle",t.fillStyle=this.titleTextColor,t.font=this.titleFont,t.fillText(this.title,this.x+this.xPadding,this.getLineHeight(0)),t.font=this.font,s.each(this.labels,function(i,e){t.fillStyle=this.textColor,t.fillText(i,this.x+this.xPadding+this.fontSize+3,this.getLineHeight(e+1)),t.fillStyle=this.legendColorBackground,t.fillRect(this.x+this.xPadding,this.getLineHeight(e+1)-this.fontSize/2,this.fontSize,this.fontSize),t.fillStyle=this.legendColors[e].fill,t.fillRect(this.x+this.xPadding,this.getLineHeight(e+1)-this.fontSize/2,this.fontSize,this.fontSize)},this)}}}),e.Scale=e.Element.extend({initialize:function(){this.fit()},buildYLabels:function(){this.yLabels=[];for(var t=v(this.stepValue),i=0;i<=this.steps;i++)this.yLabels.push(C(this.templateString,{value:(this.min+i*this.stepValue).toFixed(t)}));this.yLabelWidth=this.display&&this.showLabels?W(this.ctx,this.font,this.yLabels):0},addXLabel:function(t){this.xLabels.push(t),this.valuesCount++,this.fit()},removeXLabel:function(){this.xLabels.shift(),this.valuesCount--,this.fit()},fit:function(){this.startPoint=this.display?this.fontSize:0,this.endPoint=this.display?this.height-1.5*this.fontSize-5:this.height,this.startPoint+=this.padding,this.endPoint-=this.padding;var t,i=this.endPoint-this.startPoint;for(this.calculateYRange(i),this.buildYLabels(),this.calculateXLabelRotation();i>this.endPoint-this.startPoint;)i=this.endPoint-this.startPoint,t=this.yLabelWidth,this.calculateYRange(i),this.buildYLabels(),t<this.yLabelWidth&&this.calculateXLabelRotation()},calculateXLabelRotation:function(){this.ctx.font=this.font;var t,i,e=this.ctx.measureText(this.xLabels[0]).width,s=this.ctx.measureText(this.xLabels[this.xLabels.length-1]).width;if(this.xScalePaddingRight=s/2+3,this.xScalePaddingLeft=e/2>this.yLabelWidth+10?e/2:this.yLabelWidth+10,this.xLabelRotation=0,this.display){var n,o=W(this.ctx,this.font,this.xLabels);this.xLabelWidth=o;for(var a=Math.floor(this.calculateX(1)-this.calculateX(0))-6;this.xLabelWidth>a&&0===this.xLabelRotation||this.xLabelWidth>a&&this.xLabelRotation<=90&&this.xLabelRotation>0;)n=Math.cos(S(this.xLabelRotation)),t=n*e,i=n*s,t+this.fontSize/2>this.yLabelWidth+8&&(this.xScalePaddingLeft=t+this.fontSize/2),this.xScalePaddingRight=this.fontSize/2,this.xLabelRotation++,this.xLabelWidth=n*o;this.xLabelRotation>0&&(this.endPoint-=Math.sin(S(this.xLabelRotation))*o+3)}else this.xLabelWidth=0,this.xScalePaddingRight=this.padding,this.xScalePaddingLeft=this.padding},calculateYRange:c,drawingArea:function(){return this.startPoint-this.endPoint},calculateY:function(t){var i=this.drawingArea()/(this.min-this.max);return this.endPoint-i*(t-this.min)},calculateX:function(t){var i=(this.xLabelRotation>0,this.width-(this.xScalePaddingLeft+this.xScalePaddingRight)),e=i/(this.valuesCount-(this.offsetGridLines?0:1)),s=e*t+this.xScalePaddingLeft;return this.offsetGridLines&&(s+=e/2),Math.round(s)},update:function(t){s.extend(this,t),this.fit()},draw:function(){var t=this.ctx,i=(this.endPoint-this.startPoint)/this.steps,e=Math.round(this.xScalePaddingLeft);this.display&&(t.fillStyle=this.textColor,t.font=this.font,n(this.yLabels,function(n,o){var a=this.endPoint-i*o,h=Math.round(a),l=this.showHorizontalLines;t.textAlign="right",t.textBaseline="middle",this.showLabels&&t.fillText(n,e-10,a),0!==o||l||(l=!0),l&&t.beginPath(),o>0?(t.lineWidth=this.gridLineWidth,t.strokeStyle=this.gridLineColor):(t.lineWidth=this.lineWidth,t.strokeStyle=this.lineColor),h+=s.aliasPixel(t.lineWidth),l&&(t.moveTo(e,h),t.lineTo(this.width,h),t.stroke(),t.closePath()),t.lineWidth=this.lineWidth,t.strokeStyle=this.lineColor,t.beginPath(),t.moveTo(e-5,h),t.lineTo(e,h),t.stroke(),t.closePath()},this),n(this.xLabels,function(i,e){var s=this.calculateX(e)+x(this.lineWidth),n=this.calculateX(e-(this.offsetGridLines?.5:0))+x(this.lineWidth),o=this.xLabelRotation>0,a=this.showVerticalLines;0!==e||a||(a=!0),a&&t.beginPath(),e>0?(t.lineWidth=this.gridLineWidth,t.strokeStyle=this.gridLineColor):(t.lineWidth=this.lineWidth,t.strokeStyle=this.lineColor),a&&(t.moveTo(n,this.endPoint),t.lineTo(n,this.startPoint-3),t.stroke(),t.closePath()),t.lineWidth=this.lineWidth,t.strokeStyle=this.lineColor,t.beginPath(),t.moveTo(n,this.endPoint),t.lineTo(n,this.endPoint+5),t.stroke(),t.closePath(),t.save(),t.translate(s,o?this.endPoint+12:this.endPoint+8),t.rotate(-1*S(this.xLabelRotation)),t.font=this.font,t.textAlign=o?"right":"center",t.textBaseline=o?"middle":"top",t.fillText(i,0,0),t.restore()},this))}}),e.RadialScale=e.Element.extend({initialize:function(){this.size=m([this.height,this.width]),this.drawingArea=this.display?this.size/2-(this.fontSize/2+this.backdropPaddingY):this.size/2},calculateCenterOffset:function(t){var i=this.drawingArea/(this.max-this.min);return(t-this.min)*i},update:function(){this.lineArc?this.drawingArea=this.display?this.size/2-(this.fontSize/2+this.backdropPaddingY):this.size/2:this.setScaleSize(),this.buildYLabels()},buildYLabels:function(){this.yLabels=[];for(var t=v(this.stepValue),i=0;i<=this.steps;i++)this.yLabels.push(C(this.templateString,{value:(this.min+i*this.stepValue).toFixed(t)}))},getCircumference:function(){return 2*Math.PI/this.valuesCount},setScaleSize:function(){var t,i,e,s,n,o,a,h,l,r,c,u,d=m([this.height/2-this.pointLabelFontSize-5,this.width/2]),p=this.width,g=0;for(this.ctx.font=M(this.pointLabelFontSize,this.pointLabelFontStyle,this.pointLabelFontFamily),i=0;i<this.valuesCount;i++)t=this.getPointPosition(i,d),e=this.ctx.measureText(C(this.templateString,{value:this.labels[i]})).width+5,0===i||i===this.valuesCount/2?(s=e/2,t.x+s>p&&(p=t.x+s,n=i),t.x-s<g&&(g=t.x-s,a=i)):i<this.valuesCount/2?t.x+e>p&&(p=t.x+e,n=i):i>this.valuesCount/2&&t.x-e<g&&(g=t.x-e,a=i);l=g,r=Math.ceil(p-this.width),o=this.getIndexAngle(n),h=this.getIndexAngle(a),c=r/Math.sin(o+Math.PI/2),u=l/Math.sin(h+Math.PI/2),c=f(c)?c:0,u=f(u)?u:0,this.drawingArea=d-(u+c)/2,this.setCenterPoint(u,c)},setCenterPoint:function(t,i){var e=this.width-i-this.drawingArea,s=t+this.drawingArea;this.xCenter=(s+e)/2,this.yCenter=this.height/2},getIndexAngle:function(t){var i=2*Math.PI/this.valuesCount;return t*i-Math.PI/2},getPointPosition:function(t,i){var e=this.getIndexAngle(t);return{x:Math.cos(e)*i+this.xCenter,y:Math.sin(e)*i+this.yCenter}},draw:function(){if(this.display){var t=this.ctx;if(n(this.yLabels,function(i,e){if(e>0){var s,n=e*(this.drawingArea/this.steps),o=this.yCenter-n;if(this.lineWidth>0)if(t.strokeStyle=this.lineColor,t.lineWidth=this.lineWidth,this.lineArc)t.beginPath(),t.arc(this.xCenter,this.yCenter,n,0,2*Math.PI),t.closePath(),t.stroke();else{t.beginPath();for(var a=0;a<this.valuesCount;a++)s=this.getPointPosition(a,this.calculateCenterOffset(this.min+e*this.stepValue)),0===a?t.moveTo(s.x,s.y):t.lineTo(s.x,s.y);t.closePath(),t.stroke()}if(this.showLabels){if(t.font=M(this.fontSize,this.fontStyle,this.fontFamily),this.showLabelBackdrop){var h=t.measureText(i).width;t.fillStyle=this.backdropColor,t.fillRect(this.xCenter-h/2-this.backdropPaddingX,o-this.fontSize/2-this.backdropPaddingY,h+2*this.backdropPaddingX,this.fontSize+2*this.backdropPaddingY)}t.textAlign="center",t.textBaseline="middle",t.fillStyle=this.fontColor,t.fillText(i,this.xCenter,o)}}},this),!this.lineArc){t.lineWidth=this.angleLineWidth,t.strokeStyle=this.angleLineColor;for(var i=this.valuesCount-1;i>=0;i--){if(this.angleLineWidth>0){var e=this.getPointPosition(i,this.calculateCenterOffset(this.max));t.beginPath(),t.moveTo(this.xCenter,this.yCenter),t.lineTo(e.x,e.y),t.stroke(),t.closePath()}var s=this.getPointPosition(i,this.calculateCenterOffset(this.max)+5);t.font=M(this.pointLabelFontSize,this.pointLabelFontStyle,this.pointLabelFontFamily),t.fillStyle=this.pointLabelFontColor;var o=this.labels.length,a=this.labels.length/2,h=a/2,l=h>i||i>o-h,r=i===h||i===o-h;t.textAlign=0===i?"center":i===a?"center":a>i?"left":"right",t.textBaseline=r?"middle":l?"bottom":"top",t.fillText(this.labels[i],s.x,s.y)}}}}}),s.addEvent(window,"resize",function(){var t;return function(){clearTimeout(t),t=setTimeout(function(){n(e.instances,function(t){t.options.responsive&&t.resize(t.render,!0)})},50)}}()),p?define(function(){return e}):"object"==typeof module&&module.exports&&(module.exports=e),t.Chart=e,e.noConflict=function(){return t.Chart=i,e}}).call(this),function(){"use strict";var t=this,i=t.Chart,e=i.helpers,s={scaleBeginAtZero:!0,scaleShowGridLines:!0,scaleGridLineColor:"rgba(0,0,0,.05)",scaleGridLineWidth:1,scaleShowHorizontalLines:!0,scaleShowVerticalLines:!0,barShowStroke:!0,barStrokeWidth:2,barValueSpacing:5,barDatasetSpacing:1,legendTemplate:'<ul class="<%=name.toLowerCase()%>-legend"><% for (var i=0; i<datasets.length; i++){%><li><span style="background-color:<%=datasets[i].fillColor%>"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>'};i.Type.extend({name:"Bar",defaults:s,initialize:function(t){var s=this.options;this.ScaleClass=i.Scale.extend({offsetGridLines:!0,calculateBarX:function(t,i,e){var n=this.calculateBaseWidth(),o=this.calculateX(e)-n/2,a=this.calculateBarWidth(t);return o+a*i+i*s.barDatasetSpacing+a/2},calculateBaseWidth:function(){return this.calculateX(1)-this.calculateX(0)-2*s.barValueSpacing},calculateBarWidth:function(t){var i=this.calculateBaseWidth()-(t-1)*s.barDatasetSpacing;return i/t}}),this.datasets=[],this.options.showTooltips&&e.bindEvents(this,this.options.tooltipEvents,function(t){var i="mouseout"!==t.type?this.getBarsAtEvent(t):[];this.eachBars(function(t){t.restore(["fillColor","strokeColor"])}),e.each(i,function(t){t.fillColor=t.highlightFill,t.strokeColor=t.highlightStroke}),this.showTooltip(i)}),this.BarClass=i.Rectangle.extend({strokeWidth:this.options.barStrokeWidth,showStroke:this.options.barShowStroke,ctx:this.chart.ctx}),e.each(t.datasets,function(i){var s={label:i.label||null,fillColor:i.fillColor,strokeColor:i.strokeColor,bars:[]};this.datasets.push(s),e.each(i.data,function(e,n){s.bars.push(new this.BarClass({value:e,label:t.labels[n],datasetLabel:i.label,strokeColor:i.strokeColor,fillColor:i.fillColor,highlightFill:i.highlightFill||i.fillColor,highlightStroke:i.highlightStroke||i.strokeColor}))},this)},this),this.buildScale(t.labels),this.BarClass.prototype.base=this.scale.endPoint,this.eachBars(function(t,i,s){e.extend(t,{width:this.scale.calculateBarWidth(this.datasets.length),x:this.scale.calculateBarX(this.datasets.length,s,i),y:this.scale.endPoint}),t.save()},this),this.render()},update:function(){this.scale.update(),e.each(this.activeElements,function(t){t.restore(["fillColor","strokeColor"])}),this.eachBars(function(t){t.save()}),this.render()},eachBars:function(t){e.each(this.datasets,function(i,s){e.each(i.bars,t,this,s)},this)},getBarsAtEvent:function(t){for(var i,s=[],n=e.getRelativePosition(t),o=function(t){s.push(t.bars[i])},a=0;a<this.datasets.length;a++)for(i=0;i<this.datasets[a].bars.length;i++)if(this.datasets[a].bars[i].inRange(n.x,n.y))return e.each(this.datasets,o),s;return s},buildScale:function(t){var i=this,s=function(){var t=[];return i.eachBars(function(i){t.push(i.value)}),t},n={templateString:this.options.scaleLabel,height:this.chart.height,width:this.chart.width,ctx:this.chart.ctx,textColor:this.options.scaleFontColor,fontSize:this.options.scaleFontSize,fontStyle:this.options.scaleFontStyle,fontFamily:this.options.scaleFontFamily,valuesCount:t.length,beginAtZero:this.options.scaleBeginAtZero,integersOnly:this.options.scaleIntegersOnly,calculateYRange:function(t){var i=e.calculateScaleRange(s(),t,this.fontSize,this.beginAtZero,this.integersOnly);e.extend(this,i)},xLabels:t,font:e.fontString(this.options.scaleFontSize,this.options.scaleFontStyle,this.options.scaleFontFamily),lineWidth:this.options.scaleLineWidth,lineColor:this.options.scaleLineColor,showHorizontalLines:this.options.scaleShowHorizontalLines,showVerticalLines:this.options.scaleShowVerticalLines,gridLineWidth:this.options.scaleShowGridLines?this.options.scaleGridLineWidth:0,gridLineColor:this.options.scaleShowGridLines?this.options.scaleGridLineColor:"rgba(0,0,0,0)",padding:this.options.showScale?0:this.options.barShowStroke?this.options.barStrokeWidth:0,showLabels:this.options.scaleShowLabels,display:this.options.showScale};this.options.scaleOverride&&e.extend(n,{calculateYRange:e.noop,steps:this.options.scaleSteps,stepValue:this.options.scaleStepWidth,min:this.options.scaleStartValue,max:this.options.scaleStartValue+this.options.scaleSteps*this.options.scaleStepWidth}),this.scale=new this.ScaleClass(n)},addData:function(t,i){e.each(t,function(t,e){this.datasets[e].bars.push(new this.BarClass({value:t,label:i,x:this.scale.calculateBarX(this.datasets.length,e,this.scale.valuesCount+1),y:this.scale.endPoint,width:this.scale.calculateBarWidth(this.datasets.length),base:this.scale.endPoint,strokeColor:this.datasets[e].strokeColor,fillColor:this.datasets[e].fillColor}))},this),this.scale.addXLabel(i),this.update()},removeData:function(){this.scale.removeXLabel(),e.each(this.datasets,function(t){t.bars.shift()},this),this.update()},reflow:function(){e.extend(this.BarClass.prototype,{y:this.scale.endPoint,base:this.scale.endPoint});
var t=e.extend({height:this.chart.height,width:this.chart.width});this.scale.update(t)},draw:function(t){var i=t||1;this.clear();this.chart.ctx;this.scale.draw(i),e.each(this.datasets,function(t,s){e.each(t.bars,function(t,e){t.hasValue()&&(t.base=this.scale.endPoint,t.transition({x:this.scale.calculateBarX(this.datasets.length,s,e),y:this.scale.calculateY(t.value),width:this.scale.calculateBarWidth(this.datasets.length)},i).draw())},this)},this)}})}.call(this),function(){"use strict";var t=this,i=t.Chart,e=i.helpers,s={segmentShowStroke:!0,segmentStrokeColor:"#fff",segmentStrokeWidth:2,percentageInnerCutout:50,animationSteps:100,animationEasing:"easeOutBounce",animateRotate:!0,animateScale:!1,legendTemplate:'<ul class="<%=name.toLowerCase()%>-legend"><% for (var i=0; i<segments.length; i++){%><li><span style="background-color:<%=segments[i].fillColor%>"></span><%if(segments[i].label){%><%=segments[i].label%><%}%></li><%}%></ul>'};i.Type.extend({name:"Doughnut",defaults:s,initialize:function(t){this.segments=[],this.outerRadius=(e.min([this.chart.width,this.chart.height])-this.options.segmentStrokeWidth/2)/2,this.SegmentArc=i.Arc.extend({ctx:this.chart.ctx,x:this.chart.width/2,y:this.chart.height/2}),this.options.showTooltips&&e.bindEvents(this,this.options.tooltipEvents,function(t){var i="mouseout"!==t.type?this.getSegmentsAtEvent(t):[];e.each(this.segments,function(t){t.restore(["fillColor"])}),e.each(i,function(t){t.fillColor=t.highlightColor}),this.showTooltip(i)}),this.calculateTotal(t),e.each(t,function(t,i){this.addData(t,i,!0)},this),this.render()},getSegmentsAtEvent:function(t){var i=[],s=e.getRelativePosition(t);return e.each(this.segments,function(t){t.inRange(s.x,s.y)&&i.push(t)},this),i},addData:function(t,i,e){var s=i||this.segments.length;this.segments.splice(s,0,new this.SegmentArc({value:t.value,outerRadius:this.options.animateScale?0:this.outerRadius,innerRadius:this.options.animateScale?0:this.outerRadius/100*this.options.percentageInnerCutout,fillColor:t.color,highlightColor:t.highlight||t.color,showStroke:this.options.segmentShowStroke,strokeWidth:this.options.segmentStrokeWidth,strokeColor:this.options.segmentStrokeColor,startAngle:1.5*Math.PI,circumference:this.options.animateRotate?0:this.calculateCircumference(t.value),label:t.label})),e||(this.reflow(),this.update())},calculateCircumference:function(t){return 2*Math.PI*(t/this.total)},calculateTotal:function(t){this.total=0,e.each(t,function(t){this.total+=t.value},this)},update:function(){this.calculateTotal(this.segments),e.each(this.activeElements,function(t){t.restore(["fillColor"])}),e.each(this.segments,function(t){t.save()}),this.render()},removeData:function(t){var i=e.isNumber(t)?t:this.segments.length-1;this.segments.splice(i,1),this.reflow(),this.update()},reflow:function(){e.extend(this.SegmentArc.prototype,{x:this.chart.width/2,y:this.chart.height/2}),this.outerRadius=(e.min([this.chart.width,this.chart.height])-this.options.segmentStrokeWidth/2)/2,e.each(this.segments,function(t){t.update({outerRadius:this.outerRadius,innerRadius:this.outerRadius/100*this.options.percentageInnerCutout})},this)},draw:function(t){var i=t?t:1;this.clear(),e.each(this.segments,function(t,e){t.transition({circumference:this.calculateCircumference(t.value),outerRadius:this.outerRadius,innerRadius:this.outerRadius/100*this.options.percentageInnerCutout},i),t.endAngle=t.startAngle+t.circumference,t.draw(),0===e&&(t.startAngle=1.5*Math.PI),e<this.segments.length-1&&(this.segments[e+1].startAngle=t.endAngle)},this)}}),i.types.Doughnut.extend({name:"Pie",defaults:e.merge(s,{percentageInnerCutout:0})})}.call(this),function(){"use strict";var t=this,i=t.Chart,e=i.helpers,s={scaleShowGridLines:!0,scaleGridLineColor:"rgba(0,0,0,.05)",scaleGridLineWidth:1,scaleShowHorizontalLines:!0,scaleShowVerticalLines:!0,bezierCurve:!0,bezierCurveTension:.4,pointDot:!0,pointDotRadius:4,pointDotStrokeWidth:1,pointHitDetectionRadius:20,datasetStroke:!0,datasetStrokeWidth:2,datasetFill:!0,legendTemplate:'<ul class="<%=name.toLowerCase()%>-legend"><% for (var i=0; i<datasets.length; i++){%><li><span style="background-color:<%=datasets[i].strokeColor%>"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>'};i.Type.extend({name:"Line",defaults:s,initialize:function(t){this.PointClass=i.Point.extend({strokeWidth:this.options.pointDotStrokeWidth,radius:this.options.pointDotRadius,display:this.options.pointDot,hitDetectionRadius:this.options.pointHitDetectionRadius,ctx:this.chart.ctx,inRange:function(t){return Math.pow(t-this.x,2)<Math.pow(this.radius+this.hitDetectionRadius,2)}}),this.datasets=[],this.options.showTooltips&&e.bindEvents(this,this.options.tooltipEvents,function(t){var i="mouseout"!==t.type?this.getPointsAtEvent(t):[];this.eachPoints(function(t){t.restore(["fillColor","strokeColor"])}),e.each(i,function(t){t.fillColor=t.highlightFill,t.strokeColor=t.highlightStroke}),this.showTooltip(i)}),e.each(t.datasets,function(i){var s={label:i.label||null,fillColor:i.fillColor,strokeColor:i.strokeColor,pointColor:i.pointColor,pointStrokeColor:i.pointStrokeColor,points:[]};this.datasets.push(s),e.each(i.data,function(e,n){s.points.push(new this.PointClass({value:e,label:t.labels[n],datasetLabel:i.label,strokeColor:i.pointStrokeColor,fillColor:i.pointColor,highlightFill:i.pointHighlightFill||i.pointColor,highlightStroke:i.pointHighlightStroke||i.pointStrokeColor}))},this),this.buildScale(t.labels),this.eachPoints(function(t,i){e.extend(t,{x:this.scale.calculateX(i),y:this.scale.endPoint}),t.save()},this)},this),this.render()},update:function(){this.scale.update(),e.each(this.activeElements,function(t){t.restore(["fillColor","strokeColor"])}),this.eachPoints(function(t){t.save()}),this.render()},eachPoints:function(t){e.each(this.datasets,function(i){e.each(i.points,t,this)},this)},getPointsAtEvent:function(t){var i=[],s=e.getRelativePosition(t);return e.each(this.datasets,function(t){e.each(t.points,function(t){t.inRange(s.x,s.y)&&i.push(t)})},this),i},buildScale:function(t){var s=this,n=function(){var t=[];return s.eachPoints(function(i){t.push(i.value)}),t},o={templateString:this.options.scaleLabel,height:this.chart.height,width:this.chart.width,ctx:this.chart.ctx,textColor:this.options.scaleFontColor,fontSize:this.options.scaleFontSize,fontStyle:this.options.scaleFontStyle,fontFamily:this.options.scaleFontFamily,valuesCount:t.length,beginAtZero:this.options.scaleBeginAtZero,integersOnly:this.options.scaleIntegersOnly,calculateYRange:function(t){var i=e.calculateScaleRange(n(),t,this.fontSize,this.beginAtZero,this.integersOnly);e.extend(this,i)},xLabels:t,font:e.fontString(this.options.scaleFontSize,this.options.scaleFontStyle,this.options.scaleFontFamily),lineWidth:this.options.scaleLineWidth,lineColor:this.options.scaleLineColor,showHorizontalLines:this.options.scaleShowHorizontalLines,showVerticalLines:this.options.scaleShowVerticalLines,gridLineWidth:this.options.scaleShowGridLines?this.options.scaleGridLineWidth:0,gridLineColor:this.options.scaleShowGridLines?this.options.scaleGridLineColor:"rgba(0,0,0,0)",padding:this.options.showScale?0:this.options.pointDotRadius+this.options.pointDotStrokeWidth,showLabels:this.options.scaleShowLabels,display:this.options.showScale};this.options.scaleOverride&&e.extend(o,{calculateYRange:e.noop,steps:this.options.scaleSteps,stepValue:this.options.scaleStepWidth,min:this.options.scaleStartValue,max:this.options.scaleStartValue+this.options.scaleSteps*this.options.scaleStepWidth}),this.scale=new i.Scale(o)},addData:function(t,i){e.each(t,function(t,e){this.datasets[e].points.push(new this.PointClass({value:t,label:i,x:this.scale.calculateX(this.scale.valuesCount+1),y:this.scale.endPoint,strokeColor:this.datasets[e].pointStrokeColor,fillColor:this.datasets[e].pointColor}))},this),this.scale.addXLabel(i),this.update()},removeData:function(){this.scale.removeXLabel(),e.each(this.datasets,function(t){t.points.shift()},this),this.update()},reflow:function(){var t=e.extend({height:this.chart.height,width:this.chart.width});this.scale.update(t)},draw:function(t){var i=t||1;this.clear();var s=this.chart.ctx,n=function(t){return null!==t.value},o=function(t,i,s){return e.findNextWhere(i,n,s)||t},a=function(t,i,s){return e.findPreviousWhere(i,n,s)||t};this.scale.draw(i),e.each(this.datasets,function(t){var h=e.where(t.points,n);e.each(t.points,function(t,e){t.hasValue()&&t.transition({y:this.scale.calculateY(t.value),x:this.scale.calculateX(e)},i)},this),this.options.bezierCurve&&e.each(h,function(t,i){var s=i>0&&i<h.length-1?this.options.bezierCurveTension:0;t.controlPoints=e.splineCurve(a(t,h,i),t,o(t,h,i),s),t.controlPoints.outer.y>this.scale.endPoint?t.controlPoints.outer.y=this.scale.endPoint:t.controlPoints.outer.y<this.scale.startPoint&&(t.controlPoints.outer.y=this.scale.startPoint),t.controlPoints.inner.y>this.scale.endPoint?t.controlPoints.inner.y=this.scale.endPoint:t.controlPoints.inner.y<this.scale.startPoint&&(t.controlPoints.inner.y=this.scale.startPoint)},this),s.lineWidth=this.options.datasetStrokeWidth,s.strokeStyle=t.strokeColor,s.beginPath(),e.each(h,function(t,i){if(0===i)s.moveTo(t.x,t.y);else if(this.options.bezierCurve){var e=a(t,h,i);s.bezierCurveTo(e.controlPoints.outer.x,e.controlPoints.outer.y,t.controlPoints.inner.x,t.controlPoints.inner.y,t.x,t.y)}else s.lineTo(t.x,t.y)},this),s.stroke(),this.options.datasetFill&&h.length>0&&(s.lineTo(h[h.length-1].x,this.scale.endPoint),s.lineTo(h[0].x,this.scale.endPoint),s.fillStyle=t.fillColor,s.closePath(),s.fill()),e.each(h,function(t){t.draw()})},this)}})}.call(this),function(){"use strict";var t=this,i=t.Chart,e=i.helpers,s={scaleShowLabelBackdrop:!0,scaleBackdropColor:"rgba(255,255,255,0.75)",scaleBeginAtZero:!0,scaleBackdropPaddingY:2,scaleBackdropPaddingX:2,scaleShowLine:!0,segmentShowStroke:!0,segmentStrokeColor:"#fff",segmentStrokeWidth:2,animationSteps:100,animationEasing:"easeOutBounce",animateRotate:!0,animateScale:!1,legendTemplate:'<ul class="<%=name.toLowerCase()%>-legend"><% for (var i=0; i<segments.length; i++){%><li><span style="background-color:<%=segments[i].fillColor%>"></span><%if(segments[i].label){%><%=segments[i].label%><%}%></li><%}%></ul>'};i.Type.extend({name:"PolarArea",defaults:s,initialize:function(t){this.segments=[],this.SegmentArc=i.Arc.extend({showStroke:this.options.segmentShowStroke,strokeWidth:this.options.segmentStrokeWidth,strokeColor:this.options.segmentStrokeColor,ctx:this.chart.ctx,innerRadius:0,x:this.chart.width/2,y:this.chart.height/2}),this.scale=new i.RadialScale({display:this.options.showScale,fontStyle:this.options.scaleFontStyle,fontSize:this.options.scaleFontSize,fontFamily:this.options.scaleFontFamily,fontColor:this.options.scaleFontColor,showLabels:this.options.scaleShowLabels,showLabelBackdrop:this.options.scaleShowLabelBackdrop,backdropColor:this.options.scaleBackdropColor,backdropPaddingY:this.options.scaleBackdropPaddingY,backdropPaddingX:this.options.scaleBackdropPaddingX,lineWidth:this.options.scaleShowLine?this.options.scaleLineWidth:0,lineColor:this.options.scaleLineColor,lineArc:!0,width:this.chart.width,height:this.chart.height,xCenter:this.chart.width/2,yCenter:this.chart.height/2,ctx:this.chart.ctx,templateString:this.options.scaleLabel,valuesCount:t.length}),this.updateScaleRange(t),this.scale.update(),e.each(t,function(t,i){this.addData(t,i,!0)},this),this.options.showTooltips&&e.bindEvents(this,this.options.tooltipEvents,function(t){var i="mouseout"!==t.type?this.getSegmentsAtEvent(t):[];e.each(this.segments,function(t){t.restore(["fillColor"])}),e.each(i,function(t){t.fillColor=t.highlightColor}),this.showTooltip(i)}),this.render()},getSegmentsAtEvent:function(t){var i=[],s=e.getRelativePosition(t);return e.each(this.segments,function(t){t.inRange(s.x,s.y)&&i.push(t)},this),i},addData:function(t,i,e){var s=i||this.segments.length;this.segments.splice(s,0,new this.SegmentArc({fillColor:t.color,highlightColor:t.highlight||t.color,label:t.label,value:t.value,outerRadius:this.options.animateScale?0:this.scale.calculateCenterOffset(t.value),circumference:this.options.animateRotate?0:this.scale.getCircumference(),startAngle:1.5*Math.PI})),e||(this.reflow(),this.update())},removeData:function(t){var i=e.isNumber(t)?t:this.segments.length-1;this.segments.splice(i,1),this.reflow(),this.update()},calculateTotal:function(t){this.total=0,e.each(t,function(t){this.total+=t.value},this),this.scale.valuesCount=this.segments.length},updateScaleRange:function(t){var i=[];e.each(t,function(t){i.push(t.value)});var s=this.options.scaleOverride?{steps:this.options.scaleSteps,stepValue:this.options.scaleStepWidth,min:this.options.scaleStartValue,max:this.options.scaleStartValue+this.options.scaleSteps*this.options.scaleStepWidth}:e.calculateScaleRange(i,e.min([this.chart.width,this.chart.height])/2,this.options.scaleFontSize,this.options.scaleBeginAtZero,this.options.scaleIntegersOnly);e.extend(this.scale,s,{size:e.min([this.chart.width,this.chart.height]),xCenter:this.chart.width/2,yCenter:this.chart.height/2})},update:function(){this.calculateTotal(this.segments),e.each(this.segments,function(t){t.save()}),this.render()},reflow:function(){e.extend(this.SegmentArc.prototype,{x:this.chart.width/2,y:this.chart.height/2}),this.updateScaleRange(this.segments),this.scale.update(),e.extend(this.scale,{xCenter:this.chart.width/2,yCenter:this.chart.height/2}),e.each(this.segments,function(t){t.update({outerRadius:this.scale.calculateCenterOffset(t.value)})},this)},draw:function(t){var i=t||1;this.clear(),e.each(this.segments,function(t,e){t.transition({circumference:this.scale.getCircumference(),outerRadius:this.scale.calculateCenterOffset(t.value)},i),t.endAngle=t.startAngle+t.circumference,0===e&&(t.startAngle=1.5*Math.PI),e<this.segments.length-1&&(this.segments[e+1].startAngle=t.endAngle),t.draw()},this),this.scale.draw()}})}.call(this),function(){"use strict";var t=this,i=t.Chart,e=i.helpers;i.Type.extend({name:"Radar",defaults:{scaleShowLine:!0,angleShowLineOut:!0,scaleShowLabels:!1,scaleBeginAtZero:!0,angleLineColor:"rgba(0,0,0,.1)",angleLineWidth:1,pointLabelFontFamily:"'Arial'",pointLabelFontStyle:"normal",pointLabelFontSize:10,pointLabelFontColor:"#666",pointDot:!0,pointDotRadius:3,pointDotStrokeWidth:1,pointHitDetectionRadius:20,datasetStroke:!0,datasetStrokeWidth:2,datasetFill:!0,legendTemplate:'<ul class="<%=name.toLowerCase()%>-legend"><% for (var i=0; i<datasets.length; i++){%><li><span style="background-color:<%=datasets[i].strokeColor%>"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>'},initialize:function(t){this.PointClass=i.Point.extend({strokeWidth:this.options.pointDotStrokeWidth,radius:this.options.pointDotRadius,display:this.options.pointDot,hitDetectionRadius:this.options.pointHitDetectionRadius,ctx:this.chart.ctx}),this.datasets=[],this.buildScale(t),this.options.showTooltips&&e.bindEvents(this,this.options.tooltipEvents,function(t){var i="mouseout"!==t.type?this.getPointsAtEvent(t):[];this.eachPoints(function(t){t.restore(["fillColor","strokeColor"])}),e.each(i,function(t){t.fillColor=t.highlightFill,t.strokeColor=t.highlightStroke}),this.showTooltip(i)}),e.each(t.datasets,function(i){var s={label:i.label||null,fillColor:i.fillColor,strokeColor:i.strokeColor,pointColor:i.pointColor,pointStrokeColor:i.pointStrokeColor,points:[]};this.datasets.push(s),e.each(i.data,function(e,n){var o;this.scale.animation||(o=this.scale.getPointPosition(n,this.scale.calculateCenterOffset(e))),s.points.push(new this.PointClass({value:e,label:t.labels[n],datasetLabel:i.label,x:this.options.animation?this.scale.xCenter:o.x,y:this.options.animation?this.scale.yCenter:o.y,strokeColor:i.pointStrokeColor,fillColor:i.pointColor,highlightFill:i.pointHighlightFill||i.pointColor,highlightStroke:i.pointHighlightStroke||i.pointStrokeColor}))},this)},this),this.render()},eachPoints:function(t){e.each(this.datasets,function(i){e.each(i.points,t,this)},this)},getPointsAtEvent:function(t){var i=e.getRelativePosition(t),s=e.getAngleFromPoint({x:this.scale.xCenter,y:this.scale.yCenter},i),n=2*Math.PI/this.scale.valuesCount,o=Math.round((s.angle-1.5*Math.PI)/n),a=[];return(o>=this.scale.valuesCount||0>o)&&(o=0),s.distance<=this.scale.drawingArea&&e.each(this.datasets,function(t){a.push(t.points[o])}),a},buildScale:function(t){this.scale=new i.RadialScale({display:this.options.showScale,fontStyle:this.options.scaleFontStyle,fontSize:this.options.scaleFontSize,fontFamily:this.options.scaleFontFamily,fontColor:this.options.scaleFontColor,showLabels:this.options.scaleShowLabels,showLabelBackdrop:this.options.scaleShowLabelBackdrop,backdropColor:this.options.scaleBackdropColor,backdropPaddingY:this.options.scaleBackdropPaddingY,backdropPaddingX:this.options.scaleBackdropPaddingX,lineWidth:this.options.scaleShowLine?this.options.scaleLineWidth:0,lineColor:this.options.scaleLineColor,angleLineColor:this.options.angleLineColor,angleLineWidth:this.options.angleShowLineOut?this.options.angleLineWidth:0,pointLabelFontColor:this.options.pointLabelFontColor,pointLabelFontSize:this.options.pointLabelFontSize,pointLabelFontFamily:this.options.pointLabelFontFamily,pointLabelFontStyle:this.options.pointLabelFontStyle,height:this.chart.height,width:this.chart.width,xCenter:this.chart.width/2,yCenter:this.chart.height/2,ctx:this.chart.ctx,templateString:this.options.scaleLabel,labels:t.labels,valuesCount:t.datasets[0].data.length}),this.scale.setScaleSize(),this.updateScaleRange(t.datasets),this.scale.buildYLabels()},updateScaleRange:function(t){var i=function(){var i=[];return e.each(t,function(t){t.data?i=i.concat(t.data):e.each(t.points,function(t){i.push(t.value)})}),i}(),s=this.options.scaleOverride?{steps:this.options.scaleSteps,stepValue:this.options.scaleStepWidth,min:this.options.scaleStartValue,max:this.options.scaleStartValue+this.options.scaleSteps*this.options.scaleStepWidth}:e.calculateScaleRange(i,e.min([this.chart.width,this.chart.height])/2,this.options.scaleFontSize,this.options.scaleBeginAtZero,this.options.scaleIntegersOnly);e.extend(this.scale,s)},addData:function(t,i){this.scale.valuesCount++,e.each(t,function(t,e){var s=this.scale.getPointPosition(this.scale.valuesCount,this.scale.calculateCenterOffset(t));this.datasets[e].points.push(new this.PointClass({value:t,label:i,x:s.x,y:s.y,strokeColor:this.datasets[e].pointStrokeColor,fillColor:this.datasets[e].pointColor}))},this),this.scale.labels.push(i),this.reflow(),this.update()},removeData:function(){this.scale.valuesCount--,this.scale.labels.shift(),e.each(this.datasets,function(t){t.points.shift()},this),this.reflow(),this.update()},update:function(){this.eachPoints(function(t){t.save()}),this.reflow(),this.render()},reflow:function(){e.extend(this.scale,{width:this.chart.width,height:this.chart.height,size:e.min([this.chart.width,this.chart.height]),xCenter:this.chart.width/2,yCenter:this.chart.height/2}),this.updateScaleRange(this.datasets),this.scale.setScaleSize(),this.scale.buildYLabels()},draw:function(t){var i=t||1,s=this.chart.ctx;this.clear(),this.scale.draw(),e.each(this.datasets,function(t){e.each(t.points,function(t,e){t.hasValue()&&t.transition(this.scale.getPointPosition(e,this.scale.calculateCenterOffset(t.value)),i)},this),s.lineWidth=this.options.datasetStrokeWidth,s.strokeStyle=t.strokeColor,s.beginPath(),e.each(t.points,function(t,i){0===i?s.moveTo(t.x,t.y):s.lineTo(t.x,t.y)},this),s.closePath(),s.stroke(),s.fillStyle=t.fillColor,s.fill(),e.each(t.points,function(t){t.hasValue()&&t.draw()})},this)}})}.call(this);
/**
 * The Circle Menu object represents a choice menu of multiple menu items.<br><br>
 * <b>Sample Declaration</b><br>
 * <pre>
 * {
 *   component: $ui.CircleMenu,
 *    items: [
 *    {
 *        caption: 'music',
 *        visible: false,
 *        img: 'img/music.png'
 *    },
 *    {
 *        caption: 'maps',
 *        img: 'img/maps.png'
 *    }],
 *    onclick: function(item) {
 *        console.log(item.caption + ' clicked');
 *    }
 *}
 * @namespace CircleMenu
 * @memberof $ui
 * @extends $ui.CoreComponent
 * @property {$ui.CircleMenuItem[]} [items] - The items property is an array of menu items to be displayed in the control
 * @property {$ui.DataProviderLink} [provider] - The type of data provider value for a circle menu control should point to a property in the data provider that would follow the same rules as hard coding an array of items.
 * @property {CircleMenuClickEvent} [onclick] - This event fires when an item in the menu is clicked. The parameter passed to the event is [the item]{@link $ui.CircleMenuItem} which was clicked.
 */
function $ui_CircleMenu(object, screen) {
	$ui_CoreComponent.call(this, object, screen);
	$ui.addClass(object.dom,'ui-circle-menu');
	
	// Re layout the menu items
	object._recalculateLayout = function() {
		if (this.items.length === 0) return;
		var i,
			x,
			y,
			item,
			coord,
			visibleItems = [],
			offsetHeight = this.dom.offsetHeight,
			offsetWidth = this.dom.offsetWidth,
			coordinates = [];
		// Gather only our visible items
		for (i = 0; i < this.items.length; i++) {
			item = this.items[i];
			if (item.visible == true) {
				visibleItems.push(item);
			}
		}
		var numItems = visibleItems.length,
			size = visibleItems[0].getSize();
		// Determine our layout
		if ($system && $system.isClientDevice) {
			var coord,
				row = 0,
				col = 0,
				maxItems = (numItems > 6) ? 6 : numItems,
				slot = Math.floor(offsetWidth/2),
				xOffset = Math.floor(slot/2 - size/2),
				rowHeight = Math.floor(offsetHeight/3),
				yOffset = Math.floor(rowHeight/2 - size/2);
			// Loop through and set our coordinates
			for (i = 0; i < maxItems; i++) {
				coord = {
					X: (col * slot) + xOffset,
					Y: (row * rowHeight) + yOffset
				};
				coordinates.push(coord);
				col++
				if (col > 1) {
					row++;
					col = 0;
				}
			}
		} else {
			switch (true) {
				case (numItems <= 3):
					var buffer = (numItems === 2) ? Math.floor(size/2) : 0, // This provides some spacing on the left/right
						slot = Math.floor((offsetWidth-(buffer*2))/numItems),
						xOffset = Math.floor(slot/2 - size/2);
					y = Math.floor(offsetHeight/2 - size/2);
					for (i = 0; i < numItems; i++) {
						coord = {
							X: (i * slot) + buffer + xOffset,
							Y: y
						};
						coordinates.push(coord);
					}
					break;
				case (numItems <= 6):
					var slot = Math.floor(offsetWidth/3),
						xOffset = Math.floor(slot/2 - size/2),
						row = Math.floor(offsetHeight/2),
						yOffset = Math.floor(row/2 - size/2);
					// Top row
					for (i = 0; i < 3; i++) {
						coord = {
							X: (i * slot) + xOffset,
							Y: yOffset
						};
						coordinates.push(coord);
					}
					// Now bottom row
					var buffer = ((numItems-3) === 2) ? Math.floor(size/2) : 0;
					slot = Math.floor((offsetWidth-(buffer*2))/(numItems-3));
					xOffset = Math.floor(slot/2 - size/2);
					for (i = 3; i < numItems; i++) {
						coord = {
							X: ((i-3) * slot) + buffer + xOffset,
							Y: row + yOffset
						};
						coordinates.push(coord);
					}
					break;
			}
		}
		// Set our coordinates
		for (i = 0; i < visibleItems.length; i++) {
			item = visibleItems[i];
			coord = coordinates[i];
			item.dom.style['-webkit-transform'] = 'translate('+coord.X+'px,'+coord.Y+'px)';
		}
	}
	object._recalculateLayout = object._recalculateLayout.bind(object);
	
	// Private function to add a new item to the list
	object._addItem = function(item) {
		item.parent = this;
		itemDom = new $ui_CircleMenuItem(item, this.screen);
		if (itemDom) {
			object.dom.appendChild(itemDom);
			return true;
		} else {
			return false;
		}
	}
	object._addItem = object._addItem.bind(object);
	
	/** 
	 * You can add an item to the end of the menu by calling the addItem function and passing in an object that matches the a menu item
	 * @function addItem
	 * @memberof $ui.CircleMenu
	 * @param {$ui.CircleMenuItem} item - Item to be added to the menu
	 */
	object.addItem = function(item) {
		if (this._addItem(item)) {
			this.items.push(item);
			return true;
		} else {
			return false;
		}
		this._recalculateLayout();
	}
	object.addItem = object.addItem.bind(object);
	
	/** 
	 * You can refresh all the items in a menu by calling the refreshItems function with an array of new items
	 * @function refreshItems
	 * @memberof $ui.CircleMenu
	 * @param {$ui.CircleMenuItem[]} items - Array of items to refresh the menu
	 */
	object.refreshItems = function(itemArray) {
		if (itemArray == undefined) return; // No data provided
		var i,
			item;
		if (this.items) {
			// Remove all existing items first
			for (i = this.items.length - 1; i >= 0; i--) {
				item = this.items[i];
				try {
					if (item.dom) {
						this.dom.removeChild(item.dom);
					}
				} catch (ex) {
					console.log('$ui.List: ' + ex);
				}
				this.items.pop();
				if (item._destroy) {
					item._destroy();
				}
			}
		}
		this.addItemBatch(itemArray);
	}
	object.refreshItems = object.refreshItems.bind(object);
	
	/** 
	 * This function is much like the refreshItems function but instead it loads a list of circle menu items to the end of the current menu and does not replace the existing menu items.
	 * @function addItemBatch
	 * @memberof $ui.CircleMenu
	 * @param {$ui.CircleMenuItem[]} items - Array of items to be added to the menu
	 */
	object.addItemBatch = function(itemArray) {
		var i,
			item;
		if (!this.items) {
			this.items = [];
		}
		// Add all new items into the list
		for (i = 0; i < itemArray.length; i++) {
			item = itemArray[i];
			if (this._addItem(item)) {
				this.items.push(item);
			}
		}
		this._recalculateLayout();
	}
	object.addItemBatch = object.addItemBatch.bind(object);
	
	/** 
	 * Insert item works similar to addItem but instead will insert the item into the menu at the index specified. If an invalid index is specified it will result in failure to insert the item. To insert an item at the top of a menu call insert with the index of 0.
	 * @function insertItem
	 * @memberof $ui.CircleMenu
	 * @param {$ui.CircleMenuItem} item - Item to be inserted into the menu
	 * @param {number} index - Index to insert the item
	 */
	object.insertItem = function(item, index) {
		item.parent = this;
		if (index < 0) {
			return false;
		} else if (this.items.length == 0) {
			this.addItem(item);
			return true;
		} else if (index > this.items.length - 1) {
			this.addItem(item);
			return true;
		} else { // Insert it at the index
			var existingItem = this.items[index],
				itemDom = new $ui_CircleMenuItem(item, this.screen);
			this.items.splice(index, 0, item);
			this.dom.insertBefore(itemDom, existingItem.dom);
			return true;
		} 
		return false;
	}
	object.insertItem = object.insertItem.bind(object);
	
	// Private function to handle provider updates
	object._providerUpdate = function(value) {
		this.refreshItems(value);
	}
	object._providerUpdate = object._providerUpdate.bind(object);
	
	// Handle resize of screen
	object._onresize = function() {
		this._recalculateLayout();
	}
	object._onresize = object._onresize.bind(object);
	
	// If there is no data provider then just create the items
	if (!object.provider) {
		var i,
			item,
			itemDom;
		for (i = 0; i < object.items.length; i++) {
			item = object.items[i];
			object._addItem(item);
		}
		// Re-calculate once the screen dimensions have been calculated
		setTimeout(object._onresize,0); 
	}	
	
	return object.dom;
}
$ui_CircleMenu.prototype = new $ui_CoreComponent();

/**
 * The {@link $ui.CircleMenu} <b>onclick</b> event will fire when the user clicks a menu item
 * @callback CircleMenuClickEvent
 * @param {$ui.CircleMenuItem} item - The menu item that the user clicked
 */
/**
 * A circle menu item is used within a [Circle Menu]{@link $ui.CircleMenu}.  <b>NOTE: It cannot be defined on its own outside of a circle menu</b> 
 * @namespace CircleMenuItem
 * @memberof $ui
 * @extends $ui.CoreComponent
 * @property {string} caption - Text to appear on the menu item
 * @property {boolean} [visible=true] - Visibility state of the menu item
 * @property {string} img - Path to the image to be displayed in the menu item
 */
function $ui_CircleMenuItem(object, screen) {
	$ui_CoreComponent.call(this, object, screen);
	$ui.addClass(object.dom,'menu-item');
	
	// Create inner circle
	object.dom.inner = document.createElement('div');
	object.dom.inner.model = object;
	$ui.addClass(object.dom.inner,'circle');
	object.dom.appendChild(object.dom.inner);
	object.dom.inner.onclick = function() {
		this.model._raiseInteractionEvent('data-interaction-click');
		$ui.playTouchSound();
		if (this.model.parent.onclick) {
			this.model.parent.onclick(this.model);
		}
	}
	object.dom.inner.ontouchstart = function() {
		this.style.backgroundColor = $ui.theme.color;
	}
	object.dom.inner.ontouchend = function() {
		this.style.backgroundColor = '';
	}
	object.dom.inner.ontouchcancel = object.dom.inner.ontouchend;
	if (!$ui.isMobileDevice()) {
		object.dom.inner.onmousedown = object.dom.inner.ontouchstart;
		object.dom.inner.onmouseup = object.dom.inner.ontouchend;
		object.dom.inner.onmouseleave = object.dom.inner.ontouchend;
	}
	// Add our mark for automation
	if (object.id) {
		object.dom.inner.setAttribute('data-interaction-click', object.id);
	}
	
	// Create the icon area 
	object.dom.icon = document.createElement('div');
	$ui.addClass(object.dom.icon,'icon');
	object.dom.inner.appendChild(object.dom.icon);
	
	// Set the image
	if (object.img) {
		object.dom.icon.style.backgroundImage = 'url("'+ object.img + '")';
	}
	
	// Add our caption
	object.dom.captionDiv = document.createElement('div');
	$ui.addClass(object.dom.captionDiv,'caption');
	object.dom.appendChild(object.dom.captionDiv);
	if (object.caption) {
		object.dom.captionDiv.textContent = object.caption;
	}
	
	// Returns the size of the menu item
	object.getSize = function() {
		return this.dom.offsetWidth;
	}
	object.getSize = object.getSize.bind(object);
	
	// Handle Visibility change
	object._setVisible = function(value) {
		if (this.parent) {
			this.parent._recalculateLayout();
		}
	}
	object._setVisible = object._setVisible.bind(object);
	
	return object.dom;
}

$ui_CircleMenuItem.prototype = new $ui_CoreComponent();
/**
 * The Control Group object represents a grouping of multiple different controls.  This component can be useful when you want to group different controls together for toggling visibility.<br><br>
 * <b>Sample Declaration</b><br>
 * <pre>
 * {
 *   component: $ui.ControlGroup,
 *    id: 'myGrouping',
 *    content: [
 *       {
 *           component: $ui.Header,
 *           caption: 'My Header',
 *       },
 *       {
 *           component: $ui.List,
 *           style: $ui.GenericListItem
 *       }
 *    ]
 *}
 * @namespace ControlGroup
 * @memberof $ui
 * @extends $ui.CoreComponent
 * @property {$ui.CoreComponent[]} [content] - The content property is an array of control definitions to be displayed in the control
*/
function $ui_ControlGroup(object, screen) {
	$ui_CoreComponent.call(this, object, screen);
	$ui.addClass(object.dom,'ui-control-group');
	
	// If there is no data provider then just create the items
	if (object.content) {
		var i,
			item,
			itemDom;
		for (i = 0; i < object.content.length; i++) {
			item = object.content[i];
			itemDom = $ui.createControl(item, object.screen);
			if (itemDom) {
				object.dom.appendChild(itemDom);
			}
		}
	}	
	
	return object.dom;
}

$ui_ControlGroup.prototype = new $ui_CoreComponent();
/**
 * The CoreTile object represents the abstract base class for all tile controls. <br><br>
 * <b>NOTE: This base class should never be declared in a screen's declaration. It will not actually render and return a tile. It is simply an abstract base class.</b>
 * @namespace CoreTile
 * @memberof $ui
 * @extends $ui.CoreComponent
 */
function $ui_CoreTile(object, screen) {
	$ui_CoreComponent.call(this, object, screen);
	if (object) {
		$ui.addClass(object.dom,'ui-tile');
		object._contentShowing = false;
		if ($ui.theme.rootClass && $ui.theme.rootClass.indexOf('ui-theme-dark') > -1) {
			object.dom.style.borderColor = $ui.theme.color;
		}
		
		/** 
		 * The size of a tile. This property should be set by the internal code of a derivative Tile class.
		 * @name _size
		 * @memberof $ui.CoreTile
		 * @protected
		 * @type {$ui.TileSize}
		 */
		if (object._size && (object._size != $ui.TileSize.STANDARD)) {
			$ui.addClass(object.dom, object._size);
		}
		
		// Create our loading area
		object.dom.loadingDiv = document.createElement('div');
		$ui.addClass(object.dom.loadingDiv, 'loading');
		object.dom.appendChild(object.dom.loadingDiv);
		object.dom.spinner = new $ui_Spinner({component: $ui.Spinner, size: $ui.Spinner.SMALL},screen);
		object.dom.loadingDiv.appendChild(object.dom.spinner);
		
		// Create our content area
		object.dom.contentDiv = document.createElement('div');
		$ui.addClass(object.dom.contentDiv, 'content');
		object.dom.appendChild(object.dom.contentDiv);	
		
		/** 
		 * This function is to be called when a tile needs to be toggled between the loading state and content state. 
		 * @function showContent
		 * @memberof $ui.CoreTile
		 * @param {boolean} value - The value parameter represents the boolean state of visibility of the tile content.
		 */
		object.showContent = function(value) {
			if (value == this._contentShowing) return;
			if (value) {
				this.dom.loadingDiv.style.display = 'none';
				this.dom.contentDiv.style.display = 'inherit';
			} else {
				this.dom.loadingDiv.style.display = 'inline';
				this.dom.contentDiv.style.display = 'none';
			}
			this._contentShowing = value;
		}
		object.showContent = object.showContent.bind(object);
	}
}
$ui_CoreTile.prototype = new $ui_CoreComponent();


/**
 * The CoreTileDonutChart is the abstract base class of any donut chart tiles. This base class should never be declared in a screen's declaration.
 * <b>NOTE: It will not actually render and return a tile. It is simply an abstract base class.</b>
 * @namespace CoreTileDonutChart
 * @memberof $ui
 * @extends $ui.CoreTile
 */
function $ui_CoreTileDonutChart(object, screen) {
	$ui_CoreTile.call(this, object, screen);
	if (object) {
		$ui.addClass(object.dom,'ui-tile-donut-chart');
		
		// Create our chart area
		object.dom.chartDiv = document.createElement('div');
		$ui.addClass(object.dom.chartDiv, 'chart'); // Base class styling
		object.dom.contentDiv.appendChild(object.dom.chartDiv);
		
		// Create our canvas area
		object.dom.canvas = document.createElement('canvas');
		object.dom.chartDiv.appendChild(object.dom.canvas);

		// Create our chart
		object.chart = new Chart(object.dom.canvas.getContext('2d'));
		
		/** 
		 * This function takes a value parameter which is an array of data point objects. These data point objects defined a section of the chart and consist of two properties representing value and color
		 * @function _setData
		 * @memberof $ui.CoreTileDonutChart
		 * @param {object[]} value - Array of data points. <br/><b>Example:</b>
		 * <pre>
		 * [
		 *   {
		 *      value: 10,
		 *      color: '#000000',
		 *   },
		 *   {
		 *      value: 90,
		 *      color: '#FEFEFE',
		 *   }
		 * ]
		 * </pre>
		 * @protected
		 */
		object._setData = function(data) {
			this.chart.Doughnut(data,{showTooltips: false, segmentStrokeColor : "transparent",});
		}
		object._setData = object._setData.bind(object);
		
		// Create the caption area
		object.dom.caption = document.createElement('div');
		$ui.addClass(object.dom.caption,'caption');
		object.dom.contentDiv.appendChild(object.dom.caption);
		
		/** 
		 * This function will set the caption of the Donut chart.
		 * @function _setCaption
		 * @memberof $ui.CoreTileDonutChart
		 * @param {string} value - Text for the caption
		 * @protected
		 */
		object._setCaption = function(value) {
			this.dom.caption.innerHTML = value;
		}
		object._setCaption = object._setCaption.bind(object);
		
		// Create the accent area
		object.dom.accent = document.createElement('div');
		$ui.addClass(object.dom.accent,'accent');
		object.dom.contentDiv.appendChild(object.dom.accent);
		var color = ($ui.theme.rootClass && $ui.theme.rootClass.indexOf('ui-theme-dark') > -1)  ? $ui.color_DARK : $ui.color_LIGHT
		object.dom.accent.style.color = color;
		
		/** 
		 * This function will set the accent text of the Donut chart
		 * @function _setAccent
		 * @memberof $ui.CoreTileDonutChart
		 * @param {string} value - Text for the accent
		 * @protected
		 */
		object._setAccent = function(value) {
			if (value == undefined) {
				$ui.removeClass(this.dom.contentDiv, 'has-accent');
				this.dom.accent.textContent = '';
				this.accent = value;
				return;
			}
			this.accent = value;
			$ui.addClass(this.dom.contentDiv, 'has-accent');
			this.dom.accent.textContent = value;
		}
		object._setAccent = object._setAccent.bind(object);
	}
}

$ui_CoreTileDonutChart.prototype = new $ui_CoreTile();
/**
 * The CoreTileGauge is the abstract base class of any gauge chart tiles.
 * <b>NOTE: It will not actually render and return a tile. It is simply an abstract base class.</b><br><br>
 * <b>Sample Declaration:</b>
 * <pre>
 * {
 *    min: 0,
 *    max: 1.5,
 *    value: 1
 *}
 * </pre>
 * @namespace CoreTileGauge
 * @memberof $ui
 * @extends $ui.CoreTile
 * @property {number} min - This is the minimum numeric value that you want to display at the left hand side of the gauge
 * @property {number} max - This is the maximum numeric value that you want to display at the right hand side of the gauge
 * @property {number} value - The numeric value you want to display. This should be between min and max.
 */
function $ui_CoreTileGauge(object, screen) {
	if (object) object._size = undefined; // Always square
	$ui_CoreTile.call(this, object, screen);
	if (object) {
		$ui.addClass(object.dom,'ui-tile-gauge');

		// Create our title area
		object.dom.titleDiv = document.createElement('div');
		$ui.addClass(object.dom.titleDiv,'title');
		object.dom.contentDiv.appendChild(object.dom.titleDiv);
		
		/** 
		 * This function will set the title of the gauge chart.
		 * @function _setTitle
		 * @memberof $ui.CoreTileGauge
		 * @param {string} value - Value to be used as the title
		 * @protected
		 */
		object._setTitle = function(value) {
			if (value == undefined || value == null) value = '';
			object.dom.titleDiv.textContent = value;
		}
		object._setTitle = object._setTitle.bind(object);
		
		// Create our chart area
		object.dom.chartDiv = document.createElement('div');
		$ui.addClass(object.dom.chartDiv, 'chart'); // Base class styling
		object.dom.contentDiv.appendChild(object.dom.chartDiv);
		
		// Create our canvas area
		object.dom.canvas = document.createElement('canvas');
		object.dom.canvas.width = 200;
		object.dom.canvas.height = 200;
		$ui.addClass(object.dom.canvas,'graph-canvas');
		object.dom.chartDiv.appendChild(object.dom.canvas);

		// Add our bottom labels
		object.dom.labels = document.createElement('div');
		$ui.addClass(object.dom.labels, 'labels-area');
		object.dom.chartDiv.appendChild(object.dom.labels);
		
		// Min Label
		object.dom.minLabel = document.createElement('div');
		$ui.addClass(object.dom.minLabel, 'label');
		$ui.addClass(object.dom.minLabel, 'left');
		object.dom.labels.appendChild(object.dom.minLabel);
		
		// Max Label
		object.dom.maxLabel = document.createElement('div');
		$ui.addClass(object.dom.maxLabel, 'label');
		$ui.addClass(object.dom.maxLabel, 'right');
		object.dom.labels.appendChild(object.dom.maxLabel);
		
		// Accent Label
		object.dom.accentLabel = document.createElement('div');
		$ui.addClass(object.dom.accentLabel, 'label');
		$ui.addClass(object.dom.accentLabel, 'center');
		object.dom.labels.appendChild(object.dom.accentLabel);
		/** 
		 * This function will set the title of the gauge chart.
		 * @function _setAccent
		 * @memberof $ui.CoreTileGauge
		 * @param {string} value - Value to use as the accent text
		 * @protected
		 */
		object._setAccent = function(value) {
			if (value == undefined || value == null) value = '';
			object.dom.accentLabel.textContent = value;
		}
		object._setAccent = object._setAccent.bind(object);
		
		// Value Label
		object.dom.valueDiv = document.createElement('div');
		$ui.addClass(object.dom.valueDiv, 'value');
		object.dom.chartDiv.appendChild(object.dom.valueDiv);
		
		// Create our chart Context 
		var ctx = object.dom.canvas.getContext('2d');
		object.dom.ctx = ctx;
		object._width = object.dom.canvas.width;
		object._height = object.dom.canvas.height;
		
		// This will render our filled in area
		object._renderLoop = function() {
			if (this._degrees > this._newDegrees) {
				return;
			}
			requestAnimationFrame(this._renderLoop)
			
			//Angle in radians = angle in degrees * PI / 180
			var ctx = this.dom.ctx,
				radians = this._degrees * Math.PI / 180;
			
			//Clear the canvas every time a chart is drawn
			ctx.clearRect(0, 0, this._width, this._height);
		
			//Background 180 degree arc
			ctx.beginPath();
			ctx.strokeStyle = ($ui.theme.rootClass && $ui.theme.rootClass.indexOf('ui-theme-dark') > -1) ? $ui.color_DARK : $ui.color_LIGHT;
			ctx.lineWidth = 40;
			ctx.arc(this._width/2, this._height/2, 80, 0 - 180*Math.PI/180, Math.PI/180, false); //you can see the arc now
			ctx.stroke();
			
			// Now render our value
			ctx.beginPath();
			ctx.strokeStyle = this._color;
			//The arc starts from the rightmost end. If we deduct 180 degrees from the angles
			//the arc will start from the leftmost end
			ctx.arc(this._width/2, this._height/2, 80, 0 - 180*Math.PI/180, radians - 180*Math.PI/180, false); 
			//you can see the arc now
			ctx.stroke();
			
			if (this._degrees <= this._newDegrees) {
				this._degrees = this._degrees + this._step;
			}
			
		}
		object._renderLoop = object._renderLoop.bind(object);
		
		// This function will populate the control with the current values and then render the control
		object._populateData = function() {
			// Correct any bad data
			if (this.min == undefined) this.min = 0;
			if (this.max == undefined) this.max = 100;
			if (this.value == undefined) this.value = this.min;
			if (this.value < this.min) this.value = this.min;
			
			// Set our labels
			this.dom.minLabel.textContent = this.min;
			this.dom.maxLabel.textContent = this.max;
			this.dom.valueDiv.textContent = this.value;
			
			var percent = ((this.value - this.min)/this.max);
			this._newDegrees = percent * 180;
			switch (true) {
				case (percent < 0.33):
					this._color = ($ui.theme.rootClass && $ui.theme.rootClass.indexOf('ui-theme-dark') > -1) ? $ui.theme.color : $ui.color_GREAT;
					this._step = 2;
					break;
				case (percent < 0.77):
					this._color = ($ui.theme.rootClass && $ui.theme.rootClass.indexOf('ui-theme-dark') > -1) ? $ui.theme.color : $ui.color_GOOD;
					this._step = 7;
					break;
				default:
					this._color = ($ui.theme.rootClass && $ui.theme.rootClass.indexOf('ui-theme-dark') > -1) ? $ui.theme.color : $ui.color_OK;
					this._step = 10;
					break;
			}
			//this._degrees = 0;
			this._degrees = this._newDegrees - this._step;// temporary to stop slow animation
			this._renderLoop();
		}
		object._populateData = object._populateData.bind(object);
	}
}

$ui_CoreTileGauge.prototype = new $ui_CoreTile();
/**
 * The DockLayout object represents a layout that allows for a static content and also scrolling content. The DockLayout will size itself to all the available space provided by its parent control.
 * <br><br><b>Sample Declaration</b>
 * <pre>
 * {
 *    component: $ui.DockLayout,
 *    dock: [
 *        {
 *            component: $ui.SegmentedControl,
 *            options: ['one','two']
 *        }
 *    ],
 *    content: [
 *        {
 *            component: $ui.List
 *        }
 *    ]
 *}
 * </pre>
 * @namespace DockLayout
 * @memberof $ui
 * @extends $ui.CoreComponent
 * @property {$ui.CoreComponent[]} dock - This array holds all of the component definitions for the docked content
 * @property {$ui.CoreComponent[]} content - This array holds all of the component definitions for the scrollable area of the dock layout
 * @property {$ui.DockLayout.DockLocation} [location=$ui.DockLayout.DockLocation.TOP] - This property allows you to set the location of the docked content.
 */
function $ui_DockLayout(object, screen) {
	$ui_CoreComponent.call(this, object, screen);
	$ui.addClass(object.dom,'ui-dock-layout');
	
	var i,
		control,
		controlDom;
	
	// Create our dock area
	object.dom.dock = document.createElement('div');
	$ui.addClass(object.dom.dock, 'dock');
	
	// Load our dock
	if (object.dock) {
		for (i = 0; i < object.dock.length; i++) {
			control = object.dock[i];
			controlDom = $ui.createControl(control, screen);
			if (controlDom) {
				object.dom.dock.appendChild(controlDom);
			}
		}
	}
	
	// Create our contents area
	object.dom.contentDiv = document.createElement('div');
	$ui.addClass(object.dom.contentDiv, 'contents');
	
	// Load our contents
	if (object.content) {
		for (i = 0; i < object.content.length; i++) {
			control = object.content[i];
			controlDom = $ui.createControl(control, screen);
			if (controlDom) {
				object.dom.contentDiv.appendChild(controlDom);
			}
		}
	}
	
	// Check our dock location
	if (object.location === $ui.DockLayout.DockLocation.BOTTOM) {
		object.dom.appendChild(object.dom.contentDiv);
		object.dom.appendChild(object.dom.dock)
	} else {
		object.dom.appendChild(object.dom.dock)
		object.dom.appendChild(object.dom.contentDiv);
	}
	
	return object.dom;
}

$ui_DockLayout.prototype = new $ui_CoreComponent();
/**
 * The generic list item type is used with the {@link $ui.List} component. A List component will define the type of list item it wishes to display by setting the <b>style</b> property of the control. 
 * <br><br><b>Sample Declaration</b>
 * <pre>
 * {
 *   img: 'thumbnails/foo.png',
 *   title: 'This is my title',
 *   accent: '6 hours ago',
 *   caption: 'My summary description'
 *}
 * </pre>
 * @namespace GenericListItem
 * @memberof $ui
 * @extends $ui.CoreComponent
 * @property {string} [img] - Represents the path to the image that will appear in the list item
 * @property {string} title - Represents the main title to display
 * @property {string} [accent] - Represents the accent text to go along with the title and caption
 * @property {string} [caption] - Represents the main text to show in the list item
 */
function $ui_GenericListItem(object, screen) {
	$ui_CoreComponent.call(this, object, screen);
	$ui.addClass(object.dom, 'ui-generic-list-item');
	
	// Create the image
	object.dom.img = document.createElement('div');
	$ui.addClass(object.dom.img,'img');
	object.dom.appendChild(object.dom.img);
	
	if(object.img != undefined && object.img != null && object.img != '') {
		// Image Loader
		object._loader = new Image();
		object._loader.model = object;
		object._loader.onload = function() {
			this.model.dom.img.style.backgroundImage = 'url("'+ this.model.img + '")';
			this.model.dom.img.style.opacity = '1.0';
			this.model._loader = undefined;
		}
		object._loader.onerror = function() {
			this.model.dom.img.style.backgroundImage = '';
			this.model.dom.img.style.opacity = '1.0';
			this.model._loader = undefined;
		}
		object._loader.src = object.img;
	} else {
		object.dom.img.style.opacity = '1.0';
		object.dom.loader = undefined;
	}
	
	// Details section
	object.dom.details = document.createElement('div');
	$ui.addClass(object.dom.details,'details');
	object.dom.appendChild(object.dom.details);
	
	// Title
	object.dom.titleArea = document.createElement('div');
	$ui.addClass(object.dom.titleArea,'title');
	object.dom.titleArea.textContent = object.title;
	object.dom.details.appendChild(object.dom.titleArea);

	// Caption
	object.dom.captionDiv = document.createElement('div');
	$ui.addClass(object.dom.captionDiv,'caption');
	object.dom.details.appendChild(object.dom.captionDiv);
	if (object.caption) {
		object.dom.captionDiv.textContent = object.caption;
	} else {
		$ui.addClass(object.dom, 'no-caption');
	}
	
	// Accent
	object.dom.accent = document.createElement('div');
	$ui.addClass(object.dom.accent,'accent');
	object.dom.details.appendChild(object.dom.accent);
	if ($ui.theme.rootClass && $ui.theme.rootClass.indexOf('ui-theme-dark') > -1) {
		object.dom.accent.style.color = $ui.theme.color;
	}
	if(object.accent != undefined) {
		object.dom.accent.textContent = object.accent;
		$ui.addClass(object.dom, 'has-accent');
	} 
	
	// Handle our touch events
	object.dom.ontouchstart = function() {
		this.style.backgroundColor = $ui.theme.color;
		if ($ui.theme.rootClass && $ui.theme.rootClass.indexOf('ui-theme-dark') > -1) {
			object.dom.accent.style.color = '';
		}
	}
	object.dom.ontouchend = function() {
		this.style.backgroundColor = '';
		if ($ui.theme.rootClass && $ui.theme.rootClass.indexOf('ui-theme-dark') > -1) {
			object.dom.accent.style.color = $ui.theme.color;
		}
	}
	object.dom.ontouchcancel = object.dom.ontouchend;
	if (!$ui.isMobileDevice()) {
		object.dom.onmousedown = object.dom.ontouchstart;
		object.dom.onmouseup = object.dom.ontouchend;
		object.dom.onmouseleave = object.dom.ontouchend;
	}

	// Pass the onclick back to the list
	object.dom.addEventListener('click', function() {
		if (this.model.parent.onaction == undefined) return;
		var event = new ListEvent(this.model, $ui.GenericListItem.GenericListEvent.ONCLICK);
		this.model.parent._onaction(this.model, event);
	},false);

	return object.dom;
}

$ui_GenericListItem.prototype = new $ui_CoreComponent();
/**
 * The Header object represents a screen separator with a caption.  This component can be useful when you wish to label different areas of the screen.  Headers can also be used as
 * an item in a {@link $ui.List} control<br><br>
 * <b>Sample Declaration</b><br>
 * <pre>
 * {
 *   component: $ui.Header,
 *   caption: 'My Lovely Header'
 * }
 * @namespace Header
 * @memberof $ui
 * @extends $ui.CoreComponent
 * @property {string} [caption] - The caption to be displayed in the control
*/
function $ui_Header(object, screen) {
	$ui_CoreComponent.call(this, object, screen);
	$ui.addClass(object.dom,'ui-header');
	object.dom.style['border-bottom-color'] = $ui.theme.color;
	
	if (object.caption) {
		object.dom.textContent = object.caption;
	}
	
	return object.dom;
}

$ui_Header.prototype = new $ui_CoreComponent();
/**
 * The image list item type is used with the {@link $ui.List} component. A List component will define the type of list item it wishes to display by setting the <b>style</b> property of the control. 
 * <br><br><b>Sample Declaration</b>
 * <pre>
 * {
 *   img: 'thumbnails/foo.png',
 *   caption: 'My summary description'
 *}
 * </pre>
 * @namespace ImageListItem
 * @memberof $ui
 * @extends $ui.CoreComponent
 * @property {string} img - Represents the path to the image that will appear in the list item
 * @property {string} [caption] - Represents the main text to show in the list item
 */
function $ui_ImageListItem(object, screen) {
	$ui_CoreComponent.call(this, object, screen);
	$ui.addClass(object.dom, 'ui-image-list-item');
	
	// Create the image
	object.dom.img = document.createElement('div');
	$ui.addClass(object.dom.img,'img');
	object.dom.appendChild(object.dom.img);
	
	if(object.img != undefined && object.img != null && object.img != '') {
		// Image Loader
		object._loader = new Image();
		object._loader.model = object;
		object._loader.onload = function() {
			this.model.dom.img.style.backgroundImage = 'url("'+ this.model.img + '")';
			this.model.dom.img.style.opacity = '1.0';
			this.model._loader = undefined;
		}
		object._loader.onerror = function() {
			this.model.dom.img.style.backgroundImage = '';
			this.model.dom.img.style.opacity = '1.0';
			this.model._loader = undefined;
		}
		object._loader.src = object.img;
	} else {
		object.dom.img.style.opacity = '1.0';
		object.dom.loader = undefined;
	}
	

	// Caption
	object.dom.captionDiv = document.createElement('div');
	$ui.addClass(object.dom.captionDiv,'caption');
	object.dom.appendChild(object.dom.captionDiv);
	if (object.caption) {
		object.dom.captionDiv.textContent = object.caption;
	} else {
		$ui.addClass(object.dom.captionDiv, 'no-caption');
	}

	// Pass the onclick back to the list
	object.dom.addEventListener('click', function() {
		if (this.model.parent.onaction == undefined) return;
		var event = new ListEvent(this.model, $ui.ImageListItem.ImageListEvent.ONCLICK);
		this.model.parent._onaction(this.model, event);
	},false);

	return object.dom;
}

$ui_ImageListItem.prototype = new $ui_CoreComponent();
/**
 * This object defines the type of background to be shown on the screen.<br><br>
 * <b>Sample Code:</b><br>
 * <pre>
 * {
 *   img: 'img/background.png', 
 *   repeat: true, 
 *}
 * </pre>
 * @class ScreenBackground
 * @param {string} img - Path to the background image
 * @param {boolean} [repeat=false] - Whether or not you want the background repeated/tiled
 */
function ScreenBackground(img, repeat) {
	/** 
	 * Path to the background image
	 * @member {string} img
	 * @memberOf ScreenBackground
	 */
	if (img == null) throw new Error('ScreenBackground: img cannot be null');
	if (img == undefined) throw new Error('ScreenBackground: img cannot be undefined');
	this.img = img;
	/** 
	 * Whether or not you want the background repeated/tiled
	 * @member {boolean} [repeat=false]
	 * @memberOf ScreenBackground
	 */
	if (repeat == undefined || repeat == null) {
		this.repeat = false;
	}
}
/**
 * The segmented control provides an actionable item for the user to choose between multiple options.
 * A segmented control's width will fill the width of the container in which it is a member.<br><br>
 * <b>Sample Declaration</b><br>
 * <pre>
 * {
 *   component: $ui.SegmentedControl,
 *   selectedIndex: 0,
 *   options: ['One', 'Two', 'Three'],
 *   onclick: function() {
 *      alert('You clicked: ' + this.options[this.selectedIndex]);
 *   }
 *}
 * @namespace SegmentedControl
 * @memberof $ui
 * @extends $ui.CoreComponent
 * @property {number} [selectedIndex=0] - Represents the index of the option you want to be selected. This property will also be updated whenever a user selects an option from the control. 
 * @property {string[]} options - This property represents the options provided by the control. It is an array of string values that will be displayed
 * @property {GenericEvent} [onclick] - The onclick event will fire when the user selects/clicks an option in the control. You can retrieve which option was selected by inspecting the <b>selectedIndex</b> property.
 */
function $ui_SegmentedControl(object, screen) {
	$ui_CoreComponent.call(this, object, screen);
	$ui.addClass(object.dom,'ui-segmented-control');	
	object.domOptions = [];
	
	/** 
	 * You can set the selected index for the control by using this function. This function will also raise the <i>onclick</i> event as though a user just clicked the control.
	 * @function setSelectedIndex
	 * @memberof $ui.SegmentedControl
	 * @param {number} index - Item to be added to the menu
	 */
	object.setSelectedIndex = function(index) {
		if (this.selectedIndex != index) {
			this.selectedIndex = index;
			// Trigger the onclick
			if (this.onclick) {
				this.onclick(); 
			}
		} 
		this._setSelectedIndex(index);
	}
	object.setSelectedIndex = object.setSelectedIndex.bind(object);
	
	// Private function to set the selected index for the control
	object._setSelectedIndex = function(index) {
		if (this.options) {
			var i,
				option;
			for (i = 0; i < this.domOptions.length; i++) {
				option = this.domOptions[i];
				if (i == index) {
					option._setSelected(true);
				} else {
					option._setSelected(false);
				}
			}
		}
	}
	object._setSelectedIndex = object._setSelectedIndex.bind(object);
	
	// Go through our options
	if (object.options) {
		var i,
			option, 
			percentage = 100/object.options.length;
		
		for (i = 0; i < object.options.length; i++) {
			option = document.createElement('div');
			$ui.addClass(option,'button');
			if (i == 0) {
				$ui.addClass(option,'left');
			} else if (i == object.options.length -1) {
				$ui.addClass(option,'right');
			}
			option.model = object;
			option.index = i;
			option.selected = false;
			option.style.width = percentage + '%';
			option.style.left = (i * percentage) + '%';
			option.textContent = object.options[i];
			object.domOptions.push(option);
			object.dom.appendChild(option);
			
			// Pass the onclick back to the list
			option.addEventListener('click', function() {
				if (this.model.enabled == false) return;
				if (this.selected) return;
				this.model.setSelectedIndex(this.index);
			},false);
			
			// Change the selected state for the button
			option._setSelected = function(value) {
				this.selected = value;
				if (value == true) {
					$ui.addClass(this,'selected');
					this.style.backgroundColor = $ui.theme.color;
				} else {
					$ui.removeClass(this,'selected');
					this.style.backgroundColor = '';
				}
			}
			option._setSelected = option._setSelected.bind(option);
		}
	}
	// Set our selected index
	if (object.selectedIndex) {
		object._setSelectedIndex(object.selectedIndex);
	} else {
		object.selectedIndex = 0;
		object._setSelectedIndex(0);
	}
	
	return object.dom;
}
$ui_SegmentedControl.prototype = new $ui_CoreComponent();

/**
 * The SplitView object represents two vertical columns for layout components. The SplitView will size itself to all the available space provided by its parent control.
 * <br><br><b>Sample Declaration</b>
 * <pre>
 * {
 *    component: $ui.SplitView,
 *    left: [
 *        {
 *            component: $ui.SegmentedControl
 *        }
 *    ],
 *    right: [
 *        {
 *            component: $ui.Spinner
 *        }
 *    ]
 * }
 * </pre>
 * @namespace SplitView
 * @memberof $ui
 * @extends $ui.CoreComponent
 * @property {$ui.CoreComponent[]} left - This array holds all of the component definitions for the left side of the split view
 * @property {$ui.CoreComponent[]} right - This array holds all of the component definitions for the right side of the split view
 */
function $ui_SplitView(object, screen) {
	$ui_CoreComponent.call(this, object, screen);
	$ui.addClass(object.dom,'ui-split-view');
	
	var i,
		control,
		controlDom;
	
	// Create our left column
	object.dom.leftCol = document.createElement('div');
	$ui.addClass(object.dom.leftCol, 'col');
	$ui.addClass(object.dom.leftCol, 'left');
	object.dom.leftCol.style.borderRightColor = $ui.theme.color;
	object.dom.appendChild(object.dom.leftCol);
	
	// Load our left column
	if (object.left) {
		for (i = 0; i < object.left.length; i++) {
			control = object.left[i];
			controlDom = $ui.createControl(control, screen);
			if (controlDom) {
				object.dom.leftCol.appendChild(controlDom);
			}
		}
	}
	
	// Create our right column
	object.dom.rightCol = document.createElement('div');
	$ui.addClass(object.dom.rightCol, 'col');
	$ui.addClass(object.dom.rightCol, 'right');
	object.dom.appendChild(object.dom.rightCol);
	
	// Load our right column
	if (object.right) {
		for (i = 0; i < object.right.length; i++) {
			control = object.right[i];
			controlDom = $ui.createControl(control, screen);
			if (controlDom) {
				object.dom.rightCol.appendChild(controlDom);
			}
		}
	}
	
	return object.dom;
}

$ui_SplitView.prototype = new $ui_CoreComponent();
/**
 * The Tab object represents a tab within a {@link $ui.TabbedPane}.  A tab represents a container of multiple other controls
 * <br><br><b>Sample Declaration</b>
 * <pre>
 * {
 *    component: $ui.Tab,
 *    content: [
 *        {
 *            component: $ui.Spinner
 *        }
 *    ]
 * }
 * </pre>
 * @namespace Tab
 * @memberof $ui
 * @extends $ui.CoreComponent
 * @property {$ui.CoreComponent[]} content - This array holds all of the component definitions to be displayed in the tab
 * @property {boolean} [selected=false] - This property, when set to <i>true</i> will specify that the tab should be the default selected tab in the [Tabbed Pane]{@link $ui.TabbedPane}.  The Tabbed Pane will select only the first tab it encounters with selected set to <i>true</i> as the selected tab.
 */
function $ui_Tab(object, screen) {
	// All tabs are invisible by default
	object.visible = false;
	$ui_CoreComponent.call(this, object, screen);
	$ui.addClass(object.dom,'ui-tab');
	// Set our default
	if (object.selected != true) {
		object.selected = false;
	}
	
	var i,
		control,
		controlDom;
	// Load our contents
	if (object.content) {
		for (i = 0; i < object.content.length; i++) {
			control = object.content[i];
			controlDom = $ui.createControl(control, screen);
			if (controlDom) {
				object.dom.appendChild(controlDom);
			}
		}
	}
	
	return object.dom;
}

$ui_Tab.prototype = new $ui_CoreComponent();
/**
 * The TabbedPane object represents a container that has one or more {@link $ui.Tab} objects.<br><br>
 * A Tabbed Pane will cover the entire area of the control it is contained by. The control will cycle through all of the defined Tabs and see which one has been specified as the first selected tab. If no tabs are found with the specified <b>selected:true</b> property, it will select the first tab in the list.
 * <br><br><b>Sample Declaration</b>
 * <pre>
 * {
 *    component: $ui.TabbedPane,
 *    tabs: [
 *        {
 *            component: $ui.Tab,
 *            selected: true
 *        }
 *    ]
 * }
 * </pre>
 * @namespace TabbedPane
 * @memberof $ui
 * @extends $ui.CoreComponent
 * @property {$ui.Tab[]} content - This array holds all of the {@link $ui.Tab} objects that are to be controlled by the tabbed pane
*/
function $ui_TabbedPane(object, screen) {
	$ui_CoreComponent.call(this, object, screen);
	$ui.addClass(object.dom,'ui-tabbed-pane');
	// Set our default selected tab
	object._selectedTab = undefined;
	
	var i,
		control,
		controlDom,
		selectedTab;
	// Load our tabs
	if (object.tabs) {
		for (i = 0; i < object.tabs.length; i++) {
			control = object.tabs[i];
			if (control.component != $ui.Tab) continue;
			control.parent = object;
			controlDom = $ui.createControl(control, screen);
			if (controlDom) {
				object.dom.appendChild(controlDom);
			}
			// See if it is the selected tab
			if ((control.selected === true) && (object._selectedTab == undefined)) {
				object._selectedTab = control;
			}
		}
	}
	
	/** 
	 * This function will set the selected tab to the value passed in as a parameter
	 * @function selectTab
	 * @memberof $ui.TabbedPane
	 * @param {$ui.Tab} tab - Tab to select
	 */
	object.selectTab = function(tab) {
		if (tab == undefined) return;
		if (tab.component != $ui.Tab) return;
		if (tab === this._selectedTab) return;
		// Unselect all tabs
		var i,
			item;
		for (i = 0; i < this.tabs.length; i++) {
			item = this.tabs[i];
			item.selected = false;
			item.visible = false;
		}
		// Now select the desired tab
		this._selectTab(tab);
	}
	object.selectTab = object.selectTab.bind(object);
	
	// Private function to select a tab
	object._selectTab = function(tab) {
		if (tab == undefined) return;
		if (tab.component != $ui.Tab) return;
		object._selectedTab = tab;
		tab.selected = true;
		tab.visible = true;
	}
	object._selectTab = object._selectTab.bind(object);
	
	// Set our selected tab
	if ((object._selectedTab == undefined) && (object.tabs.length > 0)){
		object._selectedTab = object.tabs[0];
	}
	if (object._selectedTab != undefined) {
		object._selectTab(object._selectedTab);
	}
	
	
	return object.dom;
}

$ui_TabbedPane.prototype = new $ui_CoreComponent();
/**
 * The Tile Group object represents a container that holds one or more tiles that inherit from {@link $ui.CoreTile}.
 * <br><br><b>Sample Declaration</b>
 * <pre>
 * {
 *    component: $ui.TileGroup,
 *    tiles: [
 *        {
 *            component: $ui.TileCool,
 *            value: 70
 *        {
 *    ]
 * }
 * </pre>
 * @namespace TileGroup
 * @memberof $ui
 * @extends $ui.CoreComponent
 * @property {$ui.CoreTile[]} tiles - This array holds all of the Tiles which are to be displayed
 */
function $ui_TileGroup(object, screen) {
	$ui_CoreComponent.call(this, object, screen);
	$ui.addClass(object.dom,'ui-tile-group');
	
	// Set our default tile size
	object._tileSize = 256;
	object._thresholdWidth = 1024;
	
	// Create the inner area for the tiles
	object.dom.inner = document.createElement('div');
	$ui.addClass(object.dom.inner, 'group-inner');
	object.dom.appendChild(object.dom.inner);
	
	// Create a matrix for keeping track of open slots
	object.matrix = [];

	// From the row and column number set the top left of the tile
	object._setTileTopLeft = function(tile, rowNum, colNum) {
		tile.dom.style.top = ((rowNum  * this._tileSize) + 'px');
		tile.dom.style.left = ((colNum * this._tileSize) + 'px');
	}
	object._setTileTopLeft = object._setTileTopLeft.bind(object);
	
	// Best position the tile in the group
	object._positionTile = function(tile) {
		var row,
			colNum,
			rowNum,
			found = false;
		
		if (tile._size == undefined) { 
			// Will fit in a 1x1 slot..find first slot and insert
			for (rowNum = 0; rowNum < this.matrix.length; rowNum++) {
				row = this.matrix[rowNum];
				for (colNum = 0; colNum < row.length; colNum++) {
					if (row[colNum] === 0) {
						// This space is empty. Now mark it as taken
						row[colNum] = 1;
						this._setTileTopLeft(tile,rowNum,colNum);
						found = true;
						break;
					}
				}
				if (found == true) break;
			}
		} else if (tile._size == $ui.TileSize.WIDE) { 
			// Will fit in a 1x2 slot..find first slot and insert
			for (rowNum = 0; rowNum < this.matrix.length; rowNum++) {
				row = this.matrix[rowNum];
				for (colNum = 0; colNum < row.length; colNum++) {
					if (row[colNum] === 0) {
						if ((colNum+1 <= row.length) && (row[colNum+1] === 0)){
							// This space is empty. Now mark it as taken
							row[colNum] = 1;
							row[colNum+1] = 1;
							this._setTileTopLeft(tile,rowNum,colNum);
							found = true;
							break;
						}
					}
				}
				if (found == true) break;
			}
		} else if (tile._size == $ui.TileSize.TALL) { 
			// Will fit in a 2x1 slot..find first slot and insert
			for (rowNum = 0; rowNum < this.matrix.length; rowNum++) {
				row = this.matrix[rowNum];
				for (colNum = 0; colNum < row.length; colNum++) {
					if (row[colNum] === 0) {
						if ((rowNum+1 < this.matrix.length) && (this.matrix[rowNum+1][colNum] === 0)){
							// This space is empty. Now mark it as taken
							row[colNum] = 1;
							this.matrix[rowNum+1][colNum] = 1;
							this._setTileTopLeft(tile,rowNum,colNum);
							found = true;
							break;
						}
					}
				}
				if (found == true) break;
			}
		}
		
		// See if no open slot was found
		if (found == false) {
			if (tile._size == undefined) {
				// Add one row and take the first slot
				if (object._is3Columns == true) {
					this.matrix.push([1,0,0]);
				} else {
					this.matrix.push([1,0,0,0]);
				}
				this._setTileTopLeft(tile,this.matrix.length-1,0);
			} else if (tile._size == $ui.TileSize.WIDE) {
				// Add one row and take the first two slots
				if (object._is3Columns == true) {
					this.matrix.push([1,1,0]);
				} else {
					this.matrix.push([1,1,0,0]);
				}
				this._setTileTopLeft(tile,this.matrix.length-1,0);
			} else {
				// Add one row and try again
				if (object._is3Columns == true) {
					this.matrix.push([0,0,0]);
				} else {
					this.matrix.push([0,0,0,0]);
				}
				this._positionTile(tile);
			}
		}
	}
	object._positionTile = object._positionTile.bind(object);
	
	// Figure out our height based on the matrix
	object._recalculateHeight = function() {
		this.dom.inner.style.height = ((this.matrix.length * this._tileSize) + 'px');
	}
	object._recalculateHeight = object._recalculateHeight.bind(object);
	
	// Cycle through content
	if (object.tiles) {
		var i,
			control,
			controlDom;
		for (i = 0; i < object.tiles.length; i++) {
			control = object.tiles[i];
			controlDom = $ui.createControl(control, screen);
			if (controlDom) {
				object.dom.inner.appendChild(controlDom);
			}
		}
		object._recalculateHeight();
	}
	
	// Layout all the tiles
	object._layoutTiles = function() {
		var i;
		if (this._is3Columns == false) {
			this.matrix = [];
			this.matrix.push([0,0,0,0]);
		} else {
			this.matrix = [];
			this.matrix.push([0,0,0]);
		}
		// Cycle through our tiles and position them
		for (i = 0; i < this.tiles.length; i++) {
			this._positionTile(this.tiles[i]);
		}
		this._recalculateHeight();
	}
	object._layoutTiles = object._layoutTiles.bind(object);
	
	// Handle resize of screen
	object._onresize = function() {
		if ((this._is3Columns == true) && (this.dom.offsetWidth >= this._thresholdWidth)) {
			this._layoutTiles();
		} else if ((this._is3Columns == false) && (this.dom.offsetWidth < this._thresholdWidth)){
			this._layoutTiles();
		}
	}
	object._onresize = object._onresize.bind(object);
	
	// Properly layout the control once animation ends
	object._onshow = function() {
		this._is3Columns = (this.dom.offsetWidth < this._thresholdWidth);
		this._layoutTiles();
		this.dom.style.visibility = 'visible';
	}
	object._onshow = object._onshow.bind(object);
	
	return object.dom;
}

$ui_TileGroup.prototype = new $ui_CoreComponent();
/**
 * This is the object that represents a window instance in a head unit. It derives from {@link $ui.CoreScreen}. A WindowPane is declared as a JavaScript function and has various different properties. 
 * When a WindowPane is pushed onto the stack a new instance of the screen will be created and rendered.
 * <br><br><b>Sample Declaration</b>
 * <pre>
 * function MyWindowPane() {
 *   this.component = $ui.WindowPane;
 *   this.content = [
 *       {
 *          component: $ui.SegmentedControl,
 *       }
 *   ];
 *
 *   this.onshow = function() {
 *      console.log('I was just shown');
 *   }
 * }
 * </pre>
 * @namespace WindowPane
 * @memberof $ui
 * @extends $ui.CoreScreen
 * @property {ScreenBackground} [background] - This object defines the type of background to be shown on the screen
 * @property {$ui.CoreComponent[]} content - This object array specifies the list of controls that will be rendered in this screen
 * @property {string} [backCaption] - This property defines the text you would like to appear on the title bar with a back button. If this is left <i>undefined</i> then no back button will appear
 */
function $ui_WindowPane(object, data) {
	$ui_CoreScreen.call(this, object, data);
	
	if (object) {
		$ui.addClass(object.dom,'ui-window-pane');
		
		// Set our width to that of our parent
		if (!object.width) {
			object.dom.style.width = window.innerWidth + 'px'; // default
		} else {
			object.dom.style.width = object.width + 'px';
		}
		
		// Create our background image div
		object.dom.backgroundDiv = document.createElement('div');
		$ui.addClass(object.dom.backgroundDiv,'background');
		object.dom.appendChild(object.dom.backgroundDiv);
		
		if (object.backCaption) {
			object.dom.backBar = document.createElement('div');
			$ui.addClass(object.dom.backBar,'back-bar');
			$ui.addClass(object.dom,'has-back');
			object.dom.backBar.style.borderBottomColor = $ui.theme.color;
			object.dom.appendChild(object.dom.backBar);
			object.dom.backCaption = document.createElement('span');
			object.dom.backCaption.textContent = object.backCaption;
			object.dom.backCaption.model = object;
			$ui.addClass(object.dom.backCaption,'caption');
			object.dom.backBar.appendChild(object.dom.backCaption);
			object.dom.backCaption.onclick = function() {
				$ui.playTouchSound();
				$ui.pop();
			}
		}

		/** 
		 * Set the background for the screen
		 * @function setBackground
		 * @memberof $ui.WindowPane
		 * @param {ScreenBackground} screenBackground - The background object to use for the screen.
		 */
		object.setBackground = function(screenBackground) {
			// Clear existing background
			if (this.background) {
				this.dom.backgroundDiv.style.opacity = '0';
			} 
			// Load new background
			if (screenBackground != undefined) {
				this.background = screenBackground;
				// Check for repeat
				if (this.background.repeat === true) {
					this.dom.backgroundDiv.style.backgroundRepeat = 'repeat';
				} else {
					this.dom.backgroundDiv.style.backgroundSize = 'cover';
				}
				// Load our image
				if (this.background.img) {
					this._loader = new Image();
					this._loader.model = this;
					this._loader.onload = function() {
						this.model.dom.backgroundDiv.style.backgroundImage = 'url("'+this.model.background.img+'")';
						this.model.dom.backgroundDiv.style.opacity = '1';
						this.model._loader = null;
					}
					this._loader.src = this.background.img;
				}
			}
		}
		object.setBackground = object.setBackground.bind(object);
				
		// Create our content div for the controls
		object.dom.contentDiv = document.createElement('div');
		$ui.addClass(object.dom.contentDiv, 'inner');
		object.dom.appendChild(object.dom.contentDiv);
		
		// Cycle through content
		if (object.content) {
			var i,
				control,
				controlDom;
			for (i = 0; i < object.content.length; i++) {
				control = object.content[i];
				controlDom = $ui.createControl(control, object);
				if (controlDom) {
					object.dom.contentDiv.appendChild(controlDom);
				}
			}
		}
		// Handle window pane resizes
		object._onwindowpaneresize = function(screen, data) {
			// Set our width to that of our parent
			this.dom.style.width = this.container.dom.offsetWidth + 'px';
		}
		object._onwindowpaneresize = object._onwindowpaneresize.bind(object);
		
		// Clean-up any listeners
		object._onbeforepop = function() {
			if (this.animated == true) {
				this.dom.style['-webkit-animation-delay'] = '';
				this.dom.style['-webkit-animation-name'] = 'ui-pane-slide-right';
			}
			// Remove any global event listeners
			$system.removeEventListenersForScreen(this);
		}
		object._onbeforepop = object._onbeforepop.bind(object);
		
		// Initialize the screen
		object._initialize = function() {
			// Load the background if needed
			if (this.background) {
				this.setBackground(this.background);
			}
		}
		object._initialize = object._initialize.bind(object);
		
		return object.dom;
	}
}

$ui_WindowPane.prototype = new $ui_CoreScreen();


/**
 * The Browser control represents the browser window including both the chrome and the viewer.<br><br>
 * This object will create an iframe area while in demo mode. But when in PhoneGap it will create a child browser window that it will overlay on the screen.<br><br>
 * <b>Sample Declaration</b><br>
 * <pre>
 * {
 *    component: $ui.Browser,
 *    src: 'http://workshoptwelve.com'
 * }
 * @namespace Browser
 * @memberof $ui
 * @extends $ui.CoreComponent
 * @property {string} [src] - The url path to initialize the browser
*/
function $ui_Browser(object, screen) {
	$ui_CoreComponent.call(this, object, screen);
	$ui.addClass(object.dom,'ui-browser');
	object._isIFrame = true;
	
	// Create our chrome
	object.dom.chrome = document.createElement('div');
	$ui.addClass(object.dom.chrome,'chrome');
	object.dom.appendChild(object.dom.chrome);
	object.dom.chrome.style.borderBottomColor = $ui.theme.color;
	
	// URL input
	object.dom.inputDiv = document.createElement('div');
	$ui.addClass(object.dom.inputDiv,'inputDiv');
	object.dom.chrome.appendChild(object.dom.inputDiv);
	object.dom.inputDiv.style.borderColor = $ui.theme.color;
	object.dom.input = document.createElement('input');
	object.dom.input.model = object;
	object.dom.input.setAttribute('spellcheck','false');
	object.dom.inputDiv.appendChild(object.dom.input);
	// Handle focus and clearing
	object.dom.input.onclick = function(e) {
		if ((this.offsetWidth - e.offsetX) <= 30) {
			this.value = '';
		}
	}

	// Create our icon/spinner area
	object.dom.icon = document.createElement('div');
	$ui.addClass(object.dom.icon,'icon');
	object.dom.inputDiv.appendChild(object.dom.icon);
	object.dom.spinner = new $ui_Spinner({component: $ui.Spinner, size: $ui.Spinner.SpinnerSize.TINY, forceColor:'dark'},screen);
	object.dom.spinner.style.display = 'none';
	object.dom.icon.appendChild(object.dom.spinner);
	
	// Back button
	object._backBtn = {style: 'back'};
	new $ui_BrowserButton(object._backBtn,screen);
	object.dom.chrome.appendChild(object._backBtn.dom);
	
	// Next button
	object._nextBtn = {style: 'next'};
	new $ui_BrowserButton(object._nextBtn,screen);
	object.dom.chrome.appendChild(object._nextBtn.dom);
	
	// Stop/Refresh button
	object._refreshBtn = {style: 'stop'};
	new $ui_BrowserButton(object._refreshBtn,screen);
	object.dom.chrome.appendChild(object._refreshBtn.dom);
	
	// New Tab button
	object._newTabBtn = {style: 'new-tab'};
	new $ui_BrowserButton(object._newTabBtn,screen);
	object.dom.chrome.appendChild(object._newTabBtn.dom);
	
	// Favorite Button
	object._favoriteBtn = {style: 'favorite'};
	new $ui_BrowserButton(object._favoriteBtn,screen);
	object.dom.chrome.appendChild(object._favoriteBtn.dom);
	
	// Bookmarks Button
	object._bookmarksBtn = {style: 'bookmarks'};
	new $ui_BrowserButton(object._bookmarksBtn,screen);
	object.dom.chrome.appendChild(object._bookmarksBtn.dom);
	
	// Create our Browser display area
	object.dom.browserDiv = document.createElement('div');
	$ui.addClass(object.dom.browserDiv,'browserDiv');
	object.dom.appendChild(object.dom.browserDiv);
	
	// If we are displaying in an iframe for demo purposes
	if (object._isIFrame === true) {
		object.dom.iframe = document.createElement('iframe');
		object.dom.iframe.model = object;
		object.dom.iframe.setAttribute('seamless','true');
		object.dom.browserDiv.appendChild(object.dom.iframe);
	}
	
	/**
	* Sets the <b>src</b> property for the control
	* @function setSrc
	* @memberof $ui.Browser
	* @param {string} value - Path to set for the <b>src</b> property
	*/
	object.setSrc = function(value) {
		if (value == this.src) return;
		this._setSrc(value);
	}
	object.setSrc = object.setSrc.bind(object);
	
	// Internal function to set the url
	object._setSrc = function(value) {
		this.src = value;
		this.dom.input.value = value;
		this.dom.spinner.style.display = '';
		this._refreshBtn.setStyle('stop');
		$ui.removeClass(this.dom.icon,'page');
		if (this._isIFrame === true) {
			this.dom.iframe.src = value;
		}
	}
	object._setSrc = object._setSrc.bind(object);
	
	// Triggered when content is fully loaded
	object._onload = function() {
		this.dom.spinner.style.display = 'none';
		$ui.addClass(this.dom.icon,'page');
		this._refreshBtn.setStyle('refresh');
	}
	object._onload = object._onload.bind(object);
	
	// Handle clearing the UI before the pop animation
	object._onbeforepop = function() {
		if (this._isIFrame === true) {
			this.dom.iframe.style.display = 'none';
		}
	}
	object._onbeforepop = object._onbeforepop.bind(object);
	
	// Handle loading on show
	object._onshow = function() {
		// Wait for show to load the URL
		if (this.src) {
			this._setSrc(this.src)
		}
		// Need to add detection here. If added to the iframe before inserted into
		// the DOM, it will fire twice
		if (this._isIFrame === true) {
			this.dom.iframe.style.display = 'inline';
			this.dom.iframe.onload = object._onload;
		}
	}
	object._onshow = object._onshow.bind(object);

	
	
	return object.dom;
}

$ui_Browser.prototype = new $ui_CoreComponent();
function $ui_BrowserButton(object, screen) {
	$ui_CoreComponent.call(this, object, screen);
	$ui.addClass(object.dom,'button');
	
	// Set our style
	if (object.style) {
		$ui.addClass(object.dom, object.style);
	}
	
	// Handle the click
	object.dom.onclick = function() {
		if (this.model.enabled === false) return;
		$ui.playTouchSound();
		if (this.model.onclick) {
			this.model.onclick();
		}
	}
	object.dom.ontouchstart = function() {
		if (this.model.enabled === false) return;
		this.style.backgroundColor = $ui.theme.color;
	}
	object.dom.ontouchend = function() {
		if (this.model.enabled === false) return;
		this.style.backgroundColor = '';
	}
	object.dom.ontouchcancel = object.dom.ontouchend;
	if (!$ui.isMobileDevice()) {
		object.dom.onmousedown = object.dom.ontouchstart;
		object.dom.onmouseup = object.dom.ontouchend;
	}

	// Public function to set the style of the button
	object.setStyle = function(value) {
		if (value == this.style) return;
		if (this.style != undefined) {
			$ui.removeClass(this.dom,this.style);
		}
		$ui.addClass(this.dom, value);
		this.style = value;
	}
	object.setStyle = object.setStyle.bind(object);
	
	return object.dom;
}

$ui_BrowserButton.prototype = new $ui_CoreComponent();
/**
 * The DialPad object a phone dialer keypad component<br><br>
 * <b>Sample Declaration</b><br>
 * <pre>
 * {
 *    component: $ui.DialPad,
 *    onkeypadpress: function(key) {
 *       console.log(key);
 *    }
 * }
 * @namespace DialPad
 * @memberof $ui
 * @extends $ui.CoreComponent
 * @property {KeyPadPressEvent} [onkeypadpress] - The event which will fire when a button on the keypad is pressed
*/
function $ui_DialPad(object, screen) {
	$ui_CoreComponent.call(this, object, screen);
	$ui.addClass(object.dom,'ui-dial-pad');
	
	object._buttons = [
		{	
			caption: '1',
		},
		{
			caption: '2',
			letters: 'ABC'
		},
		{
			caption: '3',
			letters: 'DEF'
		},
		{
			caption: '4',
			letters: 'GHI'
		},
		{
			caption: '5',
			letters: 'JKL'
		},
		{
			caption: '6',
			letters: 'MNO'
		},
		{
			caption: '7',
			letters: 'PQRS'
		},
		{
			caption: '8',
			letters: 'TUV'
		},
		{
			caption: '9',
			letters: 'WXYZ'
		},
		{
			caption: '*',
			center: true
		},
		{
			caption: '0',
			letters: '+'
		},
		{
			caption: '#',
			center: true
		}
	];
	
	var i,
		button,
		dom,
		top,
		left,
		rowNum = 0,
		colNum = 0,
		dialPadWidth = 350,
		dialPadHeight = 500,
		buttonWidth = 104,
		rowHeight = Math.floor(dialPadHeight/4),
		colWidth = Math.floor(dialPadWidth/3),
		offsetLeft = Math.floor((colWidth/2) - (buttonWidth/2)),
		offsetTop = Math.floor((rowHeight/2) - (buttonWidth/2));
	for (i = 0; i < object._buttons.length; i++) {
		button = object._buttons[i];
		button.parent = object;
		dom = new $ui_DialPadButton(button,screen);
		object.dom.appendChild(dom);
		// Determine button position
		top = (rowNum * rowHeight) + offsetTop;
		left = (colNum * colWidth) + offsetLeft;
		// Set the position
		dom.style.top = top + 'px';
		dom.style.left = left + 'px';
		// Calculate the next Row & Col number
		if (((i+1)%3) === 0) {
			rowNum++;
			colNum = 0;
		} else {
			colNum++;
		}
	}
	
	return object.dom;
}
$ui_DialPad.prototype = new $ui_CoreComponent();

/**
 * @namespace DialPadKey
 * @memberof $ui
 * @property {string} caption - The number or letter on the button
 * @property {string} [letters] - Optional secondary letters for the button such as "ABC"
*/

/**
 * The {@link $ui.DialPad} <b>onkeypadpress</b> event will fire when the user clicks a keypad button
 * @callback KeyPadPressEvent
 * @param {$ui.DialPadKey} key - The key which was pressed
 */
function $ui_DialPadButton(object, screen) {
	$ui_CoreComponent.call(this, object, screen);
	$ui.addClass(object.dom,'circle-button');
	
	// Set our brand color
	object.dom.style.borderColor = $ui.theme.color;
	
	// Create the number
	object.dom.captionDiv = document.createElement('div');
	$ui.addClass(object.dom.captionDiv,'caption');
	object.dom.captionDiv.textContent = object.caption;
	object.dom.appendChild(object.dom.captionDiv);
	
	// See if we need to center the number
	if (object.center === true) {
		$ui.addClass(object.dom.captionDiv, 'centered');
	}
	
	// Create extra letters
	object.dom.letters = document.createElement('div');
	$ui.addClass(object.dom.letters,'letters');
	object.dom.appendChild(object.dom.letters);
	if (object.letters) {
		object.dom.letters.textContent = object.letters;
	}
	// Set our touch interaction
	object.dom.ontouchstart = function() {
		this.style.backgroundColor = $ui.theme.color;
	}
	object.dom.ontouchend = function() {
		this.style.backgroundColor = '';
	}
	object.dom.ontouchcancel = object.dom.ontouchend;
	if (!$ui.isMobileDevice()) {
		object.dom.onmousedown = object.dom.ontouchstart;
		object.dom.onmouseup = object.dom.ontouchend;
		object.dom.onmouseleave = object.dom.ontouchend;
	}
	
	// Handle the click event
	object.dom.onclick = function() {
		var key = {
			caption: this.model.caption,
			letters: this.model.letters
		}
		if ((this.model.parent != undefined) && (this.model.parent.onkeypadpress)) {
			this.model.parent.onkeypadpress(key);
		}
	}
	
	return object.dom;
}

$ui_DialPadButton.prototype = new $ui_CoreComponent();
/**
 * The Map control represents the map window including both the chrome and the viewer.<br><br>
 * This object will create an iframe area while in demo mode. But when in PhoneGap it will create a child map view window that it will overlay on the screen<br><br>
 * <b>Sample Declaration</b><br>
 * <pre>
 * {
 *    component: $ui.Map,
 *    src: 'https://www.google.com/maps/embed?pb=!1m14!1m1'
 * }
 * @namespace Map
 * @memberof $ui
 * @extends $ui.CoreComponent
 * @property {string} src - Populates the Google Maps URL for the control
 */
function $ui_Map(object, screen) {
	$ui_CoreComponent.call(this, object, screen);
	$ui.addClass(object.dom,'ui-map');
	
	// Create our map display area
	object.dom.mapDiv = document.createElement('div');
	$ui.addClass(object.dom.mapDiv,'mapDiv');
	object.dom.appendChild(object.dom.mapDiv);
	
	// Create the iframe
	object.dom.iframe = document.createElement('iframe');
	object.dom.mapDiv.appendChild(object.dom.iframe);

	// Handle clearing the UI before the pop animation
	object._onbeforepop = function() {
		//this.dom.iframe.style.display = 'none';
	}
	object._onbeforepop = object._onbeforepop.bind(object);
	
	// Handle loading on show
	object._onshow = function() {
		// Wait for show to load the URL
		if (this.src) {
			this.dom.iframe.src = this.src;
		}
		// Need to add detection here. If added to the iframe before inserted into
		// the DOM, it will fire twice
		this.dom.iframe.style.display = 'inline';		
	}
	object._onshow = object._onshow.bind(object);


	return object.dom;
}
$ui_Map.prototype = new $ui_CoreComponent();
/**
 * The Media Player control provides the user interface to the audio services of Brainiac. This control will fill the entire available space provided by its parent containing control.<br><br>
 * <b>Sample Declaration</b><br>
 * <pre>
 * {
 *    component: $ui.MediaPlayer,
 *    album: 'License To Ill',
 *    song: 'So What Cha Want',
 *    artist: 'Beastie Boys',
 *    coverArt: 'img/foo.png',
 *    duration: 217,
 *    onplay: function() {
 *       // Do something
 *    }
 * }
 * @namespace MediaPlayer
 * @memberof $ui
 * @extends $ui.CoreComponent
 * @property {string} [album] - The name of the album of the current playing/paused song
 * @property {string} [song] - The name of the current playing/paused song
 * @property {string} [artist] - The name of the artist for the current playing/paused song
 * @property {string} [coverArt] - Path to the cover/album art for the current playing/paused song
 * @property {number} [duration] - The duration of the current playing/paused song in <b>seconds</b>
 * @property {boolean} [paused=false] - Optional property specifying if the player is paused or not
 * @property {GenericEvent} [onplay] - This event will fire when the user presses play
 * @property {GenericEvent} [onpause] - This event will fire when the user presses pause
 * @property {GenericEvent} [onmenuclick] - This event will fire when the user presses the menu
 */
function $ui_MediaPlayer(object, screen) {
	$ui_CoreComponent.call(this, object, screen);
	$ui.addClass(object.dom,'ui-media-player');
	
	// Set our initial play state
	if (object.paused == undefined) {
		object.paused = false;
	}
	
	// Create our cover art display area
	object.dom.coverArt = document.createElement('div');
	$ui.addClass(object.dom.coverArt,'cover-art');
	object.dom.appendChild(object.dom.coverArt);
	object.dom.coverArt.loader = new Image();
	object.dom.coverArt.loader.model = object;
	object.dom.coverArt.loader.onload = function() {
		this.model.dom.coverArt.style.backgroundImage = 'url("'+this.model.coverArt+'")';
		this.model.dom.coverArt.style.opacity = '0.3';
	}
	
	// Create our menu
	object.dom.menu = document.createElement('div');
	object.dom.menu.model = object;
	$ui.addClass(object.dom.menu,'menu');
	object.dom.appendChild(object.dom.menu);
	object.dom.menu.onclick = function() {
		$ui.playTouchSound();
		if (this.model.onmenuclick) {
			this.model.onmenuclick();
		}
	}
	object.dom.menu.ontouchstart = function() {
		this.style.backgroundColor = $ui.theme.color;
	}
	object.dom.menu.ontouchend = function() {
		this.style.backgroundColor = '';
	}
	object.dom.menu.ontouchcancel = object.dom.ontouchend;
	if (!$ui.isMobileDevice()) {
		object.dom.menu.onmousedown = object.dom.menu.ontouchstart;
		object.dom.menu.onmouseup = object.dom.menu.ontouchend;
		object.dom.menu.onmouseleave = object.dom.menu.ontouchend;
	}
	
	// Create our controls area
	object.dom.controls = document.createElement('div');
	$ui.addClass(object.dom.controls, 'controls');
	object.dom.appendChild(object.dom.controls);
	object.dom.artist = document.createElement('div');
	$ui.addClass(object.dom.artist,'artist');
	object.dom.controls.appendChild(object.dom.artist);
	object.dom.song = document.createElement('div');
	$ui.addClass(object.dom.song,'song');
	object.dom.controls.appendChild(object.dom.song);
	object.dom.album = document.createElement('div');
	$ui.addClass(object.dom.album,'album');
	object.dom.controls.appendChild(object.dom.album);
	
	// Create our player buttons
	object.dom.playbox = document.createElement('div');
	$ui.addClass(object.dom.playbox, 'playbox');
	object.dom.controls.appendChild(object.dom.playbox);
	object.dom.skipBack = document.createElement('div');
	$ui.addClass(object.dom.skipBack,'button');
	$ui.addClass(object.dom.skipBack,'skip-back');
	object.dom.playbox.appendChild(object.dom.skipBack);
	object.dom.skipForward = document.createElement('div');
	$ui.addClass(object.dom.skipForward,'button');
	$ui.addClass(object.dom.skipForward,'skip-forward');
	object.dom.playbox.appendChild(object.dom.skipForward);
	object.dom.play = document.createElement('div');
	object.dom.play.model = object;
	$ui.addClass(object.dom.play,'button');
	$ui.addClass(object.dom.play,'play');
	object.dom.playbox.appendChild(object.dom.play);
	object.dom.play.onclick = function() {
		$ui.playTouchSound();
		if (this.model.paused == true) {
			this.model.play();
		} else {
			this.model.pause();
		}
	}
	object.dom.play.ontouchstart = function() {
		this.style.opacity = '0.7';
	}
	object.dom.play.ontouchend = function() {
		this.style.opacity = '1.0';
	}
	object.dom.play.ontouchcancel = object.dom.ontouchend;
	if (!$ui.isMobileDevice()) {
		object.dom.play.onmousedown = object.dom.play.ontouchstart;
		object.dom.play.onmouseup = object.dom.play.ontouchend;
		object.dom.play.onmouseleave = object.dom.play.ontouchend;
	}
	
	// Create our text buttons
	object.dom.textButtonBox = document.createElement('div');
	$ui.addClass(object.dom.textButtonBox, 'textButtonBox');
	object.dom.appendChild(object.dom.textButtonBox);
	object.dom.buttonRepeat = document.createElement('div');
	$ui.addClass(object.dom.buttonRepeat, 'text-button');
	$ui.addClass(object.dom.buttonRepeat, 'left');
	object.dom.buttonRepeat.textContent = 'Repeat Off';
	object.dom.textButtonBox.appendChild(object.dom.buttonRepeat);
	object.dom.buttonSource = document.createElement('div');
	$ui.addClass(object.dom.buttonSource, 'text-button');
	$ui.addClass(object.dom.buttonSource, 'center');
	object.dom.buttonSource.textContent = 'Source';
	object.dom.textButtonBox.appendChild(object.dom.buttonSource);
	object.dom.buttonShuffle = document.createElement('div');
	$ui.addClass(object.dom.buttonShuffle, 'text-button');
	$ui.addClass(object.dom.buttonShuffle, 'right');
	object.dom.buttonShuffle.textContent = 'Shuffle Off';
	object.dom.textButtonBox.appendChild(object.dom.buttonShuffle);
	
	/**
	* Sets the <b>album</b> property of the control
	* @function setAlbum
	* @memberof $ui.MediaPlayer
	* @param {string} value - The new property value
	*/
	object.setAlbum = function(value) {
		this.album = value;
		// Now load the new image
		if (value != undefined) {
			this.dom.album.textContent = value;
		} else {
			this.dom.album.textContent = '';
		}
	}
	object.setAlbum = object.setAlbum.bind(object);
	
	/**
	* Sets the <b>song</b> property of the control
	* @function setSong
	* @memberof $ui.MediaPlayer
	* @param {string} value - The new property value
	*/
	object.setSong = function(value) {
		this.song = value;
		// Now load the new image
		if (value != undefined) {
			this.dom.song.textContent = value;
		} else {
			this.dom.song.textContent = '';
		}
	}
	object.setSong = object.setSong.bind(object);
	
	/**
	* Sets the <b>artist</b> property of the control
	* @function setArtist
	* @memberof $ui.MediaPlayer
	* @param {string} value - The new property value
	*/
	object.setArtist = function(value) {
		this.artist = value;
		// Now load the new image
		if (value != undefined) {
			this.dom.artist.textContent = value;
		} else {
			this.dom.artist.textContent = '';
		}
	}
	object.setArtist = object.setArtist.bind(object);
	
	/**
	* Sets the <b>coverArt</b> property of the control
	* @function setCoverArt
	* @memberof $ui.MediaPlayer
	* @param {string} value - The new property value
	*/
	object.setCoverArt = function(value) {
		this.coverArt = value;
		this.dom.coverArt.style.opacity = '0';
		// Now load the new image
		if (value != undefined) {
			this.dom.coverArt.loader.src = value;
		}
	}
	object.setCoverArt = object.setCoverArt.bind(object);
	
	/**
	* Sets the <b>duration</b> property of the control
	* @function setDuration
	* @memberof $ui.MediaPlayer
	* @param {number} value - The new property value
	*/
	object.setDuration = function(value) {
		this.duration = value;
		// Now load the new image
		if (value != undefined) {
			// Do something
		}
	}
	object.setDuration = object.setDuration.bind(object);
	
	// Private function to render the play state of the control
	object._renderPlayState = function(value) {
		if (this.paused == true) {
			$ui.removeClass(this.dom.play,'pause');
		} else {
			$ui.addClass(this.dom.play,'pause');
		}
	}
	object._renderPlayState = object._renderPlayState.bind(object);
	
	/**
	* Play the current song
	* @function play
	* @memberof $ui.MediaPlayer
	*/
	object.play = function(value) {
		if (this.paused == false) return;
		this.paused = false;
		this._renderPlayState();
		if (this.onplay) {
			this.onplay();
		}
	}
	object.play = object.play.bind(object);
	
	/**
	* Pause the current song
	* @function pause
	* @memberof $ui.MediaPlayer
	*/
	object.pause = function(value) {
		if (this.paused == true) return;
		this.paused = true;
		this._renderPlayState();
		if (this.onpause) {
			this.onpause();
		}
	}
	object.pause = object.pause.bind(object);
	
	// Private function to handle provider updates
	object._providerUpdate = function(value) {
		if (value == undefined) {
			value = {}
		} 
		this.setCoverArt(value.coverArt);
		this.setArtist(value.artist);
		this.setSong(value.song);
		this.setAlbum(value.album);
		this.paused = value.paused;
		this._renderPlayState();
	}
	object._providerUpdate = object._providerUpdate.bind(object);
	
	// Load our control if no provider is connected
	if (object.provider == undefined) {
		object._providerUpdate(object)
	}
	
	return object.dom;
}

$ui_MediaPlayer.prototype = new $ui_CoreComponent();

function $ui_OnlineScreen(object, data) {
	$ui_CoreScreen.call(this, object, data);
	
	if (object) {
		$ui.addClass(object.dom,'ui-online-screen');

		// Create our content div for the controls
		object.dom.contentDiv = document.createElement('div');
		$ui.addClass(object.dom.contentDiv, 'inner');
		object.dom.appendChild(object.dom.contentDiv);
		
		// Cycle through content
		if (object.content) {
			var i,
				control,
				controlDom;
			for (i = 0; i < object.content.length; i++) {
				control = object.content[i];
				controlDom = $ui.createControl(control, object);
				if (controlDom) {
					object.dom.contentDiv.appendChild(controlDom);
				}
			}
		}
		
		
		return object.dom;
	}
}

$ui_OnlineScreen.prototype = new $ui_CoreScreen();


/**
 * The phone log list item type is used with the {@link $ui.List} component and represents a call log entry. 
 * <br><br><b>Sample Declaration</b>
 * <pre>
 * {
 *   title: 'Susan',
 *   caption: '(555) 897-9876',
 *   style: $ui.PhoneLogListItem.PhoneLogStyle.MISSED
 * }
 * </pre>
 * @namespace PhoneLogListItem
 * @memberof $ui
 * @extends $ui.CoreComponent
 * @property {string} title - Represents the main title to display
 * @property {$ui.PhoneLogListItem.PhoneLogStyle} [style] - The type of call that is in the list
 * @property {string} [caption] - Represents the main text to show in the list item
 */
function $ui_PhoneLogListItem(object, screen) {
	$ui_CoreComponent.call(this, object, screen);
	$ui.addClass(object.dom, 'ui-phone-log-list-item');
	
	// See if the style is defined
	if (object.style == undefined) {
		object.style = $ui.PhoneLogListItem.INCOMING;
	}
	$ui.addClass(object.dom, object.style);
	
	// Details section
	object.dom.details = document.createElement('div');
	$ui.addClass(object.dom.details,'details');
	object.dom.appendChild(object.dom.details);
	
	// Title
	object.dom.titleArea = document.createElement('div');
	$ui.addClass(object.dom.titleArea,'title');
	object.dom.titleArea.textContent = object.title;
	object.dom.details.appendChild(object.dom.titleArea);
	if (object.style === $ui.PhoneLogListItem.MISSED) {
		object.dom.titleArea.style.color = $ui.theme.color;
	}

	// Caption
	object.dom.captionDiv = document.createElement('div');
	$ui.addClass(object.dom.captionDiv,'caption');
	object.dom.captionDiv.style.color = $ui.theme.color;
	object.dom.details.appendChild(object.dom.captionDiv);
	if (object.caption) {
		object.dom.captionDiv.textContent = object.caption;
	} else {
		$ui.addClass(object.dom, 'no-caption');
	}
	
	// Handle our touch events
	object.dom.ontouchstart = function() {
		this.style.backgroundColor = $ui.theme.color;
	}
	object.dom.ontouchend = function() {
		this.style.backgroundColor = '';
	}
	object.dom.ontouchcancel = object.dom.ontouchend;
	if (!$ui.isMobileDevice()) {
		object.dom.onmousedown = object.dom.ontouchstart;
		object.dom.onmouseup = object.dom.ontouchend;
		object.dom.onmouseleave = object.dom.ontouchend;
	}

	// Pass the onclick back to the list
	object.dom.addEventListener('click', function() {
		if (this.model.parent.onaction == undefined) return;
		var event = new $ui_ListEvent(this.model, $ui.PhoneLogListItem.ONCLICK);
		this.model.parent._onaction(this.model, event);
	},false);

	return object.dom;
}

$ui_PhoneLogListItem.prototype = new $ui_CoreComponent();
/**
 * The TileAcceleration represents the tile that shows Acceleration in G-forces..
 * <br><br><b>Sample Declaration</b>
 * <pre>
 * {
 *    component: $ui.TileAcceleration,
 *    min: 0,
 *    max: 1.5,
 *    value: 1
 * }
 * </pre>
 * @namespace TileAcceleration
 * @memberof $ui
 * @extends $ui.CoreTileGauge
 */
function $ui_TileAcceleration(object, screen) {
	$ui_CoreTileGauge.call(this, object, screen);
	$ui.addClass(object.dom,'ui-tile-acceleration');
	
	object._setTitle('Acceleration');
	object._setAccent('Average G-Forces');
	
	// Private function to handle provider updates
	object._providerUpdate = function(value) {
		if (value != undefined) {
			this.min = value.min;
			this.max = value.max;
			this.value = value.value;
			this._populateData();
		} else {
			this.min =0;
			this.max = 1;
			this.value = 0;
		}
		this.showContent(true);
	}
	object._providerUpdate = object._providerUpdate.bind(object);	
	
	// Load our control if no provider is connected
	if (object.provider == undefined) {
		object._providerUpdate({min: object.min, max: object.max, value: object.value })
	}
	
	return object.dom;
}

$ui_TileAcceleration.prototype = new $ui_CoreTileGauge();
/**
 * The Badge tile displays the different badges that the user has been awarded. 
 * <br><br><b>Sample Declaration</b>
 * <pre>
 * {
 *    component: $ui.TileBadge
 *    img: 'img/badge.png',
 *    caption: 'This is <large>my</large> caption',
 *    accent:  'Smaller text'
 * }
 * </pre>
 * @namespace TileBadge
 * @memberof $ui
 * @extends $ui.CoreTile
 * @property {string} [img] - Represents the path to the image representing the badge
 * @property {string} [accent] - Represents the accent text to go along with the caption
 * @property {string} [caption] - This is the text to appear on the badge. The caption value can also have opening and closing <b>&lt;large&gt;</b> elements to signify which parts of the text should be large-sized.
 */
function $ui_TileBadge(object, screen) {
	// This tile is 1 x 1
	object._size = undefined;
	$ui_CoreTile.call(this, object, screen);
	$ui.addClass(object.dom,'ui-tile-badge');
	
	// Create the caption area
	object.dom.caption = document.createElement('div');
	$ui.addClass(object.dom.caption,'caption');
	object.dom.contentDiv.appendChild(object.dom.caption);
	
	// Create our Next Button
	object.dom.next = document.createElement('div');
	$ui.addClass(object.dom.next, 'button');
	$ui.addClass(object.dom.next, 'next');
	object.dom.contentDiv.appendChild(object.dom.next);
	
	// Create our Previous Button
	object.dom.prev = document.createElement('div');
	$ui.addClass(object.dom.prev, 'button');
	$ui.addClass(object.dom.prev, 'prev');
	object.dom.contentDiv.appendChild(object.dom.prev);

	// Create our accent area
	object.dom.accent = document.createElement('div');
	$ui.addClass(object.dom.accent, 'accent');
	object.dom.contentDiv.appendChild(object.dom.accent);
	
	
	// Private function to handle provider updates
	object._providerUpdate = function(value) {
		if (value != undefined) {
			this.img = value.img;
			this.caption = value.caption;
			this.accent = value.accent;
		} else {
			this.img = undefined;
			this.caption = undefined;
			this.accent = undefined;
		}
		// Set our image
		this.dom.contentDiv.style.backgroundImage = 'url("'+ this.img + '")';
		// Set our caption
		if (this.caption) {
			var str = this.caption.replace(new RegExp('<large>', 'g'), '<span class="tall">');
			str = str.replace(new RegExp('</large>', 'g'),'</span>');
			this.dom.caption.innerHTML = str;
		}
		// Set our accent
		if (this.accent) {
			this.dom.accent.textContent = this.accent;
		}
		this.showContent(true);
	}
	object._providerUpdate = object._providerUpdate.bind(object);	
	
	// Load our control if no provider is connected
	if (object.provider == undefined) {
		object._providerUpdate({img: object.img, caption: object.caption, accent: object.accent })
	}
	
	return object.dom;
}

$ui_TileBadge.prototype = new $ui_CoreTile();
/**
 * The Braking Tile represents the tile which shows Braking in G-forces.
 * <br><br><b>Sample Declaration</b>
 * <pre>
 * {
 *    component: $ui.TileBraking,
 *    min: 0,
 *    max: 1.5,
 *    value: 1
 * }
 * </pre>
 * @namespace TileBraking
 * @memberof $ui
 * @extends $ui.CoreTileGauge
 */
function $ui_TileBraking(object, screen) {
	$ui_CoreTileGauge.call(this, object, screen);
	$ui.addClass(object.dom,'ui-tile-braking');
	
	object._setTitle('Braking');
	object._setAccent('Average G-Forces');
	
	// Private function to handle provider updates
	object._providerUpdate = function(value) {
		if (value != undefined) {
			this.min = value.min;
			this.max = value.max;
			this.value = value.value;
			this._populateData();
		} else {
			this.min =0;
			this.max = 1;
			this.value = 0;
		}
		this.showContent(true);
	}
	object._providerUpdate = object._providerUpdate.bind(object);	
	
	// Load our control if no provider is connected
	if (object.provider == undefined) {
		object._providerUpdate({min: object.min, max: object.max, value: object.value })
	}
	
	
	return object.dom;
}

$ui_TileBraking.prototype = new $ui_CoreTileGauge();
/**
 * The Distance tile displays the distance travelled over the last few recorded periods. 
 * <br><br><b>Sample Declaration</b>
 * <pre>
 * {
 *    component: $ui.TileDistance
 *    data: [5,25,8.2],
 *    units:  'miles'
 * }
 * </pre>
 * @namespace TileDistance
 * @memberof $ui
 * @extends $ui.CoreTile
 * @property {number[]} [data] - This array of numbers represents the last few points of distance units recorded. The values in the array are ordered from oldest to newest.
 * @property {string} units - This string value represents the units of measure. Typically miles or km.
 */
function $ui_TileDistance(object, screen) {
	// This tile is 1 x 1
	object._size = undefined;
	$ui_CoreTile.call(this, object, screen);
	$ui.addClass(object.dom,'ui-tile-distance');
	
	// Create our chart area
	object.dom.canvas = document.createElement('canvas');
	$ui.addClass(object.dom.canvas, 'chart');
	object.dom.canvas.height = 180;
	object.dom.canvas.width = 220;
	object.dom.contentDiv.appendChild(object.dom.canvas);
	object.dom.ctx = object.dom.canvas.getContext('2d');
	object.dom.chart = new Chart(object.dom.ctx);
	
	// Create the caption area
	object.dom.caption = document.createElement('div');
	$ui.addClass(object.dom.caption,'caption');
	object.dom.contentDiv.appendChild(object.dom.caption);
	
	// Private function to handle provider updates
	object._providerUpdate = function(value) {
		var i,
			_labels = [],
			_transparentData = [],
			_noData = false;
		// Assign our values
		if (value != undefined) {
			this.data = value.data;
			this.units = value.units;
		} else {
			this.data = undefined;
			this.units = 'miles';
		}
		// Make any corrections
		if ((this.data == undefined) || (this.data && this.data.length == 0)) {
			this.data = [0];
			_noData = true;
		} else if (this.data.length == 1) {
			this.data = [0,this.data[0]];
		}
		// Set our latest value
		this._value = this.data[this.data.length -1];
		// Populate our extra chart data
		for (i = 0; i < this.data.length; i++) {
			if (i == this.data.length - 1) {
				// Last item so set our values
				_labels.push('Today');
			} else {
				_labels.push('');
			}
			_transparentData.push(0);
		}
		// Set our caption
		this.dom.caption.innerHTML = '<span class="tall distance">&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="tall">'+this._value+'</span> '+this.units;
		// Get our root color
		var RGB = $ui.hexToRgb($ui.theme.color);
		// Load our data
		var data = {
			labels: _labels,
			datasets: [
				{
					fillColor: 'rgba('+RGB.R+','+RGB.G+','+RGB.B+',0.2)',
					strokeColor: 'rgba('+RGB.R+','+RGB.G+','+RGB.B+',1)',
					pointColor: 'rgba('+RGB.R+','+RGB.G+','+RGB.B+',1)',
					pointStrokeColor: '#fff',
					pointHighlightFill: '#fff',
					pointHighlightStroke: 'rgba('+RGB.R+','+RGB.G+','+RGB.B+',1)',
					data: this.data
				},
				{
					fillColor: 'transparent',
					strokeColor: 'transparent',
					pointColor: 'transparent',
					pointStrokeColor: 'transparent',
					pointHighlightFill: 'transparent',
					pointHighlightStroke: 'transparent',
					data: _transparentData
				}
			]
		}
		this.dom.chart.Line(data,{scaleShowGridLines: false,showTooltips: false,scaleFontColor: window.getComputedStyle(this.dom).color});
		this.showContent(true);
	}
	object._providerUpdate = object._providerUpdate.bind(object);	
	
	// Load our control if no provider is connected
	if (object.provider == undefined) {
		object._providerUpdate({data: object.data, units: object.units})
	}
	
	
	return object.dom;
}

$ui_TileDistance.prototype = new $ui_CoreTile();
/**
 * The Fuel tile displays the fuel used over the last few recorded periods. 
 * <br><br><b>Sample Declaration</b>
 * <pre>
 * {
 *    component: $ui.TileFuel
 *    data: [5,25,8.2],
 *    value: 8.25
 * }
 * </pre>
 * @namespace TileFuel
 * @memberof $ui
 * @extends $ui.CoreTile
 * @property {number[]} [data] - This array of numbers represents the last few points of fuel level values recorded. The values in the array are ordered from oldest to newest.
 * @property {number} value - This number value represents the dollar amount of fuel used for the day
 */
function $ui_TileFuel(object, screen) {
	// This tile is 1 x 1
	object._size = undefined;
	$ui_CoreTile.call(this, object, screen);
	$ui.addClass(object.dom,'ui-tile-fuel');

	// Create our chart area
	object.dom.canvas = document.createElement('canvas');
	$ui.addClass(object.dom.canvas, 'chart');
	object.dom.canvas.height = 180;
	object.dom.canvas.width = 230;
	object.dom.contentDiv.appendChild(object.dom.canvas);
	object.dom.ctx = object.dom.canvas.getContext('2d');
	object.dom.chart = new Chart(object.dom.ctx);
	
	// Create our left hand labels
	object.dom.leftLabels = document.createElement('div');
	$ui.addClass(object.dom.leftLabels, 'left-labels');
	object.dom.contentDiv.appendChild(object.dom.leftLabels);
	// Top Label
	object.dom.topLabel = document.createElement('div');
	$ui.addClass(object.dom.topLabel, 'label');
	$ui.addClass(object.dom.topLabel, 'top');
	object.dom.topLabel.textContent = 'F';
	object.dom.leftLabels.appendChild(object.dom.topLabel);
	// Middle Label
	object.dom.middleLabel = document.createElement('div');
	$ui.addClass(object.dom.middleLabel, 'label');
	$ui.addClass(object.dom.middleLabel, 'middle');
	object.dom.middleLabel.innerHTML = '&#189;';
	object.dom.leftLabels.appendChild(object.dom.middleLabel);
	// Bottom Label
	object.dom.bottomLabel = document.createElement('div');
	$ui.addClass(object.dom.bottomLabel, 'label');
	$ui.addClass(object.dom.bottomLabel, 'bottom');
	object.dom.bottomLabel.textContent = 'E';
	object.dom.leftLabels.appendChild(object.dom.bottomLabel);
	
	// Create the caption area
	object.dom.caption = document.createElement('div');
	$ui.addClass(object.dom.caption,'caption');
	object.dom.contentDiv.appendChild(object.dom.caption);

	// Private function to handle provider updates
	object._providerUpdate = function(value) {
		var i,
			_labels = [],
			_transparentData = [],
			_noData = false;
		// Assign our values
		if (value != undefined) {
			this.data = value.data;
			this.value = value.value;
		} else {
			this.data = undefined;
			this.value = 0;
		}
		// Make any corrections
		if (this.value == undefined) this.value = 0;
		if ((this.data == undefined) || (this.data && this.data.length == 0)) {
			this.data = [0];
			_noData = true;
		} else if (this.data.length == 1) {
			this.data = [0,this.data[0]];
		}
		// Populate our extra chart data
		for (i = 0; i < this.data.length; i++) {
			if (i == this.data.length - 1) {
				// Last item so set our values
				_labels.push('Now');
				_transparentData.push(0);
			} else {
				_labels.push('');
				_transparentData.push(100);
			}
		}
		// Set our caption
		this.dom.caption.innerHTML = '<span class="tall">$'+this.value+'</span> of <span class="tall fuel">&nbsp;&nbsp;&nbsp;&nbsp;</span>Today';
		// Get our root color
		var RGB,
			fontColor;
		if ($ui.theme.rootClass && $ui.theme.rootClass.indexOf('ui-theme-dark') > -1) {
			RGB = $ui.hexToRgb($ui.theme.color);
		} else {
			RGB = {R: 151, G: 187, B: 205};
		}
		// Load our data
		var data = {
			labels: _labels,
			datasets: [
				{
					fillColor: 'rgba('+RGB.R+','+RGB.G+','+RGB.B+',0.2)',
					strokeColor: 'rgba('+RGB.R+','+RGB.G+','+RGB.B+',1)',
					pointColor: 'rgba('+RGB.R+','+RGB.G+','+RGB.B+',1)',
					pointStrokeColor: '#fff',
					pointHighlightFill: '#fff',
					pointHighlightStroke: 'rgba('+RGB.R+','+RGB.G+','+RGB.B+',1)',
					data: this.data
				},
				{
					fillColor: 'transparent',
					strokeColor: 'transparent',
					pointColor: 'transparent',
					pointStrokeColor: 'transparent',
					pointHighlightFill: 'transparent',
					pointHighlightStroke: 'transparent',
					data: _transparentData
				}
			]
		}
		this.dom.chart.Line(data,{scaleShowGridLines: false,showTooltips: false, scaleFontColor: window.getComputedStyle(this.dom).color});	
		this.showContent(true);
	}
	object._providerUpdate = object._providerUpdate.bind(object);	
	
	// Load our control if no provider is connected
	if (object.provider == undefined) {
		object._providerUpdate({data: object.data, value: object.value})
	}
	
	return object.dom;
}

$ui_TileFuel.prototype = new $ui_CoreTile();
/**
 * The Idle tile represents the amount of time the driver spends moving and not sitting in one place.
 * <br><br><b>Sample Declaration</b>
 * <pre>
 * {
 *    component: $ui.TileIdle
 *    value: 70
 * }
 * </pre>
 * @namespace TileIdle
 * @memberof $ui
 * @extends $ui.CoreTile
 * @property {number} value - This number value represents the percentage of time the driver spent moving.
 */
function $ui_TileIdle(object, screen) {
	object._size = undefined;
	$ui_CoreTileDonutChart.call(this, object, screen);
	$ui.addClass(object.dom,'ui-tile-idle-chart');
	
	// Figure out the data array for this chart
	object._calculateData = function() {
		var data;
		if (this.value != undefined) {
			var colorValue,
				percent;
			// Correct any errors in data
			if (this.value < 0) this.value = 0;
			if (this.value > 100) this.value = 100;
			// Determine color
			switch (true) {
				case (this.value >= 70):
					colorValue = ($ui.theme.rootClass && $ui.theme.rootClass.indexOf('ui-theme-dark') > -1) ? $ui.theme.color : $ui.color_GREAT;
					break;
				case (this.value >= 50):
					colorValue = ($ui.theme.rootClass && $ui.theme.rootClass.indexOf('ui-theme-dark') > -1) ? $ui.theme.color : $ui.color_GOOD;
					break;
				default:
					colorValue = ($ui.theme.rootClass && $ui.theme.rootClass.indexOf('ui-theme-dark') > -1) ? $ui.theme.color : $ui.color_OK;
					break;
			}		
			// Create our chart data object
			data = [
				{
					value: this.value,
					color: colorValue,
				},
				{
					value: (100 - this.value),
					color: ($ui.theme.rootClass && $ui.theme.rootClass.indexOf('ui-theme-dark') > -1) ? $ui.color_DARK : $ui.color_LIGHT
				}				
			];	
		} 
		return data;
	}
	object._calculateData = object._calculateData.bind(object);
	
	// Private function to handle provider updates
	object._providerUpdate = function(value) {
		if (value != undefined) {
			this.value = value.value;
		} else {
			this.value = 0;
		}
		// Populate our chart with data
		var data = this._calculateData();
		if (data != undefined) {
			this._setData(data);
			this._setCaption('<span class="tall">'+this.value + '%</span> spent moving');
		}
		this.showContent(true);
	}
	object._providerUpdate = object._providerUpdate.bind(object);	
	
	// Load our control if no provider is connected
	if (object.provider == undefined) {
		object._providerUpdate({value: object.value })
	}
	
	return object.dom;
}

$ui_TileIdle.prototype = new $ui_CoreTileDonutChart();
/**
 * The Idle Details tile represents how much time was spent being stuck in traffic over the last 7 days.
 * <br><br><b>Sample Declaration</b>
 * <pre>
 * {
 *    component: $ui.TileIdleDetails,
 *    labels: ['Sun','Mon','Tue','Wed','Thur','Fri','Today'],
 *    data: [0,35,17,65,0,10,15]
 * }
 * </pre>
 * @namespace TileIdleDetails
 * @memberof $ui
 * @extends $ui.CoreTile
 * @property {number[]} [data] - This array of numbers represents the amount of minutes spent idle over the last 7 days
 * @property {string[]} [labels] - This array of strings represents the labels for the last 7 days
 */
function $ui_TileIdleDetails(object, screen) {
	// This tile is 1 x 1
	object._size = $ui.TileSize.WIDE;
	$ui_CoreTile.call(this, object, screen);
	$ui.addClass(object.dom,'ui-tile-idle-details');
	
	// Create the caption area
	object.dom.caption = document.createElement('div');
	$ui.addClass(object.dom.caption,'caption');
	object.dom.contentDiv.appendChild(object.dom.caption);
	object.dom.caption.textContent = 'Time Stuck In Traffic (mins)';
	
	// Create our chart area
	object.dom.canvas = document.createElement('canvas');
	$ui.addClass(object.dom.canvas, 'chart');
	object.dom.canvas.height = 190;
	object.dom.canvas.width = 490;
	object.dom.contentDiv.appendChild(object.dom.canvas);
	object.dom.ctx = object.dom.canvas.getContext('2d');
	object.dom.chart = new Chart(object.dom.ctx);
	
	// Private function to handle provider updates
	object._providerUpdate = function(value) {
		if (value != undefined) {
			this.data = value.data;
			this.labels = value.labels;
		} else {
			this.data = undefined;
			this.labels = undefined;
		}
		// Get our root color
		var graphColor = ($ui.theme.rootClass && $ui.theme.rootClass.indexOf('ui-theme-dark') > -1) ? $ui.theme.color : $ui.color_OK,
			RGB = $ui.hexToRgb(graphColor);
		// Load our data
		var data = {
			labels: this.labels,
			datasets: [
				{
					fillColor: 'rgba('+RGB.R+','+RGB.G+','+RGB.B+',0.5)',
					strokeColor: 'rgba('+RGB.R+','+RGB.G+','+RGB.B+',1)',
					data: this.data
				}
			]
		}
		this.dom.chart.Bar(data,{scaleShowGridLines: true,showTooltips: false,scaleFontColor: window.getComputedStyle(this.dom).color});
		this.showContent(true);
	}
	object._providerUpdate = object._providerUpdate.bind(object);	
	
	// Load our control if no provider is connected
	if (object.provider == undefined) {
		object._providerUpdate({data: object.data, labels: object.labels})
	}
	
	
	return object.dom;
}

$ui_TileIdleDetails.prototype = new $ui_CoreTile();
/**
 * The MPG tile represents how close to the target miles per gallon target they achieved
 * <br><br><b>Sample Declaration</b>
 * <pre>
 * {
 *    component: $ui.TileMPG,
 *    value: 25,
 *    max: 34,
 *    abbreviation: 'MPG'
 * }
 * </pre>
 * @namespace TileMPG
 * @memberof $ui
 * @extends $ui.CoreTileDonutChart
 * @property {number} [value] - This number value represents the actual MPG value achived
 * @property {number} [max] - This number value represents the target value the driver is hoping to achieve
 * @property {string} [abbreviation] - This string value represents the Miles per gallon or KM per liter abbreviation
 */
function $ui_TileMPG(object, screen) {
	object._size = undefined;
	$ui_CoreTileDonutChart.call(this, object, screen);
	$ui.addClass(object.dom,'ui-tile-mpg-chart');
	
	// Figure out the data array for this chart
	object._calculateData = function() {
		var data;
		if (this.max != undefined && this.value != undefined) {
			var colorValue,
				percent;
			// Check for errors in data
			if (this.value < 0) this.value = 0;
			if (this.value > this.max) {
				percent = 100;	
			} else {
				percent = Math.ceil((this.value / this.max)*100);
			}
			// Determine Color
			switch (true) {
				case (percent > 90):
					colorValue = ($ui.theme.rootClass && $ui.theme.rootClass.indexOf('ui-theme-dark') > -1) ? $ui.theme.color : $ui.color_GREAT;
					break;
				case (percent > 50):
					colorValue = ($ui.theme.rootClass && $ui.theme.rootClass.indexOf('ui-theme-dark') > -1) ? $ui.theme.color : $ui.color_GOOD;
					break;
				default:
					colorValue = ($ui.theme.rootClass && $ui.theme.rootClass.indexOf('ui-theme-dark') > -1) ? $ui.theme.color : $ui.color_OK;
					break;
			}
			// Create our chart data object
			data = [
				{
					value: percent,
					color: colorValue,
				},
				{
					value: (100-percent),
					color: ($ui.theme.rootClass && $ui.theme.rootClass.indexOf('ui-theme-dark') > -1) ? $ui.color_DARK : $ui.color_LIGHT
				}
			];	
		} 
		return data;
	}
	object._calculateData = object._calculateData.bind(object);
	

	// Private function to handle provider updates
	object._providerUpdate = function(value) {
		if (value != undefined) {
			this.value = value.value;
			this.max = value.max;
			this.abbreviation = value.abbreviation;
		} else {
			this.value = 0;
			this.max = 0;
			this.abbreviation = 'MPG';
		}
		// Populate our chart with data
		var data = this._calculateData();
		if (data != undefined) {
			this._setData(data);
			this._setCaption('<span class="tall">'+this.value + '</span> ' + this.abbreviation);
		}
		this.showContent(true);
	}
	object._providerUpdate = object._providerUpdate.bind(object);	
	
	// Load our control if no provider is connected
	if (object.provider == undefined) {
		object._providerUpdate({value: object.value, max: object.max, abbreviation: object.abbreviation })
	}
	
	
	return object.dom;
}

$ui_TileMPG.prototype = new $ui_CoreTileDonutChart();
/**
 * The Profile tile displays the user's profile and participation statistics.
 * <br><br><b>Sample Declaration</b>
 * <pre>
 * {
 *    component: $ui.TileProfile
 *    backgroundImg: 'img/car.png',
 *    avatar: 'img/useravatar.png',
 *    userName:  'brcewane',
 *    stats: {
 *        friends: 12,
 *        groups: 6,
 *        score: 4056,
 *        rank: 2,
 *    }
 * }
 * </pre>
 * @namespace TileProfile
 * @memberof $ui
 * @extends $ui.CoreTile
 * @property {string} [backgroundImg] - This is the path to the background image the user has chosen for their profile.
 * @property {string} [userName] - This is the path to the avatar image the user has chosen for their profile.
 * @property {string} [avatar] - This string value represents the Miles per gallon or KM per liter abbreviation
 * @property {$ui.TileProfile.ProfileStats} [stats] - This object represents the participation statistics for the user
 */
function $ui_TileProfile(object, screen) {
	// This is a tall tile
	object._size = $ui.TileSize.TALL;
	$ui_CoreTile.call(this, object, screen);
	$ui.addClass(object.dom,'ui-tile-profile');
	
	var profileTileColor = '#FDBF2F';
	
	// Create our Color wedge
	object.dom.wedge = document.createElement('div');
	$ui.addClass(object.dom.wedge, 'wedge');
	object.dom.contentDiv.appendChild(object.dom.wedge);
	// Set our coloring
	if ($ui.getThemeStyle() == $ui.ThemeStyle.DARK) {
		object.dom.wedge.style.backgroundColor = $ui.theme.color;
	} else {
		object.dom.wedge.style.backgroundColor = profileTileColor;
	}
	
	// Create the space for our vehicle
	object.dom.vehicle = document.createElement('div');
	$ui.addClass(object.dom.vehicle, 'vehicle');
	object.dom.contentDiv.appendChild(object.dom.vehicle);
	object.dom.vehicle.image = document.createElement('div');
	$ui.addClass(object.dom.vehicle.image, 'vehicle-image');
	object.dom.vehicle.appendChild(object.dom.vehicle.image);
	object.dom.vehicle.overlay = document.createElement('div');
	$ui.addClass(object.dom.vehicle.overlay, 'vehicle-overlay');
	object.dom.vehicle.image.appendChild(object.dom.vehicle.overlay);
	
	// Create our user name
	object.dom.userName = document.createElement('div');
	$ui.addClass(object.dom.userName,'name');
	object.dom.vehicle.appendChild(object.dom.userName);
	
	// format a number for the stats box
	object._formatNumber = function(value) {
		if (value == undefined) return 0;
		var formattedValue,
			dividedValue;
		switch (true) {
			case (value >= 1000000):
				dividedValue = (value/1000000).toFixed(1);
				if ((dividedValue % 1) == 0) {
					dividedValue = Math.floor(dividedValue);	
				}
				formattedValue = dividedValue + 'M';
				break;
			case (value >= 10000):
				dividedValue = (value/1000).toFixed(1);
				if ((dividedValue % 1) == 0) {
					dividedValue = Math.floor(dividedValue);	
				}
				formattedValue = dividedValue + 'K';
				break;
			case (value >= 1000):
				formattedValue = value.toString();
				formattedValue = formattedValue.slice(0,1) + ',' + formattedValue.slice(1,formattedValue.length);
				break;
			case (value < 1000):
				formattedValue = value;
				break;
			default:
				formattedValue = value;
				break;
		}
			
		return formattedValue;
	}
	object._formatNumber = object._formatNumber.bind(object);
	
	// Add our stats box
	object.dom.stats = document.createElement('div');
	$ui.addClass(object.dom.stats, 'stats');
	object.dom.contentDiv.appendChild(object.dom.stats);
	if ($ui.getThemeStyle() == $ui.ThemeStyle.DARK) {
		object.dom.stats.style.borderColor = $ui.theme.color;
	}
	
	// Add score box
	object.dom.score = document.createElement('div');
	$ui.addClass(object.dom.score, 'box');
	object.dom.stats.appendChild(object.dom.score);
	object.dom.score.label = document.createElement('div');
	$ui.addClass(object.dom.score.label, 'label');
	object.dom.score.appendChild(object.dom.score.label);
	object.dom.score.label.textContent = 'SCORE';
	object.dom.score.number = document.createElement('div');
	$ui.addClass(object.dom.score.number, 'number');
	object.dom.score.appendChild(object.dom.score.number);
	// Set our coloring
	if ($ui.getThemeStyle() == $ui.ThemeStyle.DARK) {
		object.dom.score.style.borderColor = $ui.theme.color;
		object.dom.score.number.style.color = $ui.theme.color;
	} else {
		object.dom.score.number.style.color = profileTileColor;
	}
	
	// Add friends box
	object.dom.friends = document.createElement('div');
	$ui.addClass(object.dom.friends, 'box');
	$ui.addClass(object.dom.friends, 'right');
	object.dom.stats.appendChild(object.dom.friends);
	object.dom.friends.label = document.createElement('div');
	$ui.addClass(object.dom.friends.label, 'label');
	object.dom.friends.appendChild(object.dom.friends.label);
	object.dom.friends.label.textContent = 'FRIENDS';
	object.dom.friends.number = document.createElement('div');
	$ui.addClass(object.dom.friends.number, 'number');
	object.dom.friends.appendChild(object.dom.friends.number);
	// Set our coloring
	if ($ui.getThemeStyle() == $ui.ThemeStyle.DARK) {
		object.dom.friends.style.borderColor = $ui.theme.color;
		object.dom.friends.number.style.color = $ui.theme.color;
	} else {
		object.dom.friends.number.style.color = profileTileColor;
	}
	
	// Add groups box
	object.dom.groups = document.createElement('div');
	$ui.addClass(object.dom.groups, 'box');
	$ui.addClass(object.dom.groups, 'right');
	object.dom.stats.appendChild(object.dom.groups);
	object.dom.groups.label = document.createElement('div');
	$ui.addClass(object.dom.groups.label, 'label');
	object.dom.groups.appendChild(object.dom.groups.label);
	object.dom.groups.label.textContent = 'GROUPS';
	object.dom.groups.number = document.createElement('div');
	$ui.addClass(object.dom.groups.number, 'number');
	object.dom.groups.appendChild(object.dom.groups.number);
	// Set our coloring
	if ($ui.getThemeStyle() == $ui.ThemeStyle.DARK) {
		object.dom.groups.style.borderColor = $ui.theme.color;
		object.dom.groups.number.style.color = $ui.theme.color;
	} else {
		object.dom.groups.number.style.color = profileTileColor;
	}
	
	// Create our avatar space
	object.dom.avatar = document.createElement('div');
	$ui.addClass(object.dom.avatar, 'avatar');
	object.dom.contentDiv.appendChild(object.dom.avatar);
	// Set our coloring
	if ($ui.getThemeStyle() == $ui.ThemeStyle.DARK) {
		object.dom.avatar.style.borderColor = $ui.theme.color;
	}
	
	// Add our rank text
	object.dom.rankText = document.createElement('div');
	$ui.addClass(object.dom.rankText, 'rank-text');
	object.dom.contentDiv.appendChild(object.dom.rankText);
	object.dom.rankText.textContent = 'Ranked'
	
	// Add our rank notification
	object.dom.rank = document.createElement('div');
	$ui.addClass(object.dom.rank, 'rank');
	object.dom.contentDiv.appendChild(object.dom.rank);
	// Set our coloring
	if ($ui.getThemeStyle() == $ui.ThemeStyle.DARK) {
		object.dom.rank.style.backgroundColor = $ui.theme.color;
	} else {
		object.dom.rank.style.backgroundColor = profileTileColor;
	}
	
	// Add our find Friends button
	object.dom.findFriend = document.createElement('div');
	$ui.addClass(object.dom.findFriend, 'button');
	$ui.addClass(object.dom.findFriend, 'search');
	object.dom.findFriend.textContent = 'Find a Friend';
	object.dom.contentDiv.appendChild(object.dom.findFriend);
	// Set our coloring
	if ($ui.getThemeStyle() == $ui.ThemeStyle.DARK) {
		object.dom.findFriend.style.backgroundColor = $ui.theme.color;
	} else {
		object.dom.findFriend.style.backgroundColor = profileTileColor;
	}
	
	// Add our find Groups button
	object.dom.findGroup = document.createElement('div');
	$ui.addClass(object.dom.findGroup, 'button');
	$ui.addClass(object.dom.findGroup, 'plus');
	object.dom.findGroup.textContent = 'Join a Group';
	object.dom.contentDiv.appendChild(object.dom.findGroup);
	// Set our coloring
	if ($ui.getThemeStyle() == $ui.ThemeStyle.DARK) {
		object.dom.findGroup.style.backgroundColor = $ui.theme.color;
	} else {
		object.dom.findGroup.style.backgroundColor = profileTileColor;
	}
	
	// Private function to handle provider updates
	object._providerUpdate = function(value) {
		// Assign our values
		if (value != undefined) {
			this.backgroundImg = value.backgroundImg;
			this.avatar = value.avatar;
			this.userName = value.userName;
			this.stats = value.stats;
		} else {
			this.backgroundImg = undefined;
			this.avatar = undefined;
			this.userName = undefined;
			this.stats = undefined;
		}
		// Load the vehicle
		if (this.backgroundImg) {
			this.loader = new Image();
			this.loader.model = this;
			// Change the opacity on load
			this.loader.onload = function() {
				this.model.dom.vehicle.image.style.opacity = '1.0';
				this.model.dom.vehicle.image.style.backgroundImage = 'url("'+ this.model.backgroundImg + '")';
				this.model.loader = null;
			}
			this.loader.src = this.backgroundImg;
		} else {
			this.dom.vehicle.image.style.backgroundImage = '';
		}
		// Set Username
		if (this.userName) {
			this.dom.userName.textContent = this.userName;
		} else {
			this.dom.userName.textContent = '';
		}
		// Set Stats
		if (this.stats) {
			this.dom.score.number.textContent = this._formatNumber(this.stats.score);
			this.dom.friends.number.textContent = this._formatNumber(this.stats.friends);
			this.dom.groups.number.textContent = this._formatNumber(this.stats.groups);
			this.dom.rank.textContent = this.stats.rank;
			this.dom.rank.style.opacity = '1.0';
		} else {
			this.dom.score.number.textContent = '0';
			this.dom.friends.number.textContent = '0';
			this.dom.groups.number.textContent = '0';
			this.dom.rank.textContent = '1';
			this.dom.rank.style.opacity = '1.0';
		}
		// Set our avatar
		if (this.avatar) {
			this.dom.avatar.style.backgroundImage = 'url("'+ this.avatar + '")';
		}
		this.showContent(true);
	}
	object._providerUpdate = object._providerUpdate.bind(object);	
	
	// Load our control if no provider is connected
	if (object.provider == undefined) {
		object._providerUpdate({backgroundImg: object.backgroundImg, avatar: object.avatar, userName: object.userName, stats: object.stats})
	}
	
	return object.dom;
}

$ui_TileProfile.prototype = new $ui_CoreTile();
/**
 * Statistics for the user profile tile {@link $ui.TileProfile}
 * @namespace ProfileStats
 * @memberof $ui.TileProfile
 * @property {number} [friends] - The number of friends
 * @property {number} [groups] - The number of groups
 * @property {number} [score] - The overall point total for the user
 * @property {number} [rank] - The overall rank of the user among their friends and groups
 */
/**
 * The Record tile provides a button to start recording with optional countdown capability.
 * <br><br><b>Sample Declaration</b>
 * <pre>
 * {
 *    component: $ui.TileRecord,
 *    caption: 'Record 0-60 Time',
 *    countdown: true
 * }
 * </pre>
 * @namespace TileRecord
 * @memberof $ui
 * @extends $ui.CoreTile
 * @property {string} [caption] - This is the caption to show at the bottom of the tile
 * @property {boolean} [countdown=false] - This optional boolean property specifies if you wish to have a count down come after the user presses the start button. If set to true it will do a countdown from 3 before the <b>onrecord</b> event is triggered.
 * @property {GenericEvent} [onstartclick] - Fires when the user presses Start
 * @property {GenericEvent} [onrecord] - Fires when the recording begins
 */
function $ui_TileRecord(object, screen) {
	// This tile is 1 x 1
	object._size = undefined;
	$ui_CoreTile.call(this, object, screen);
	$ui.addClass(object.dom,'ui-tile-record');
	
	// Create our stage 1 area
	object.dom.stage1 = document.createElement('div');
	$ui.addClass(object.dom.stage1,'stage-1');
	object.dom.contentDiv.appendChild(object.dom.stage1);
	
	// Create our record button
	object.dom.recordButton = document.createElement('div');
	object.dom.recordButton.model = object;
	$ui.addClass(object.dom.recordButton,'record-button');
	object.dom.recordButton.style.backgroundColor = $ui.theme.color;
	object.dom.stage1.appendChild(object.dom.recordButton);
	object.dom.recordButton.textContent = 'Start';
	object.dom.recordButton.onclick = function() {
		var model = this.model;
		$ui.playTouchSound();
		// Fire the start click
		if (model.onstartclick) {
			model.onstartclick();
		}
		// See if there is a countdown
		if (model.countdown === true) {
			model.dom.stage1.style.display = 'none';
			model.dom.stage2.style.display = 'inline';
			model._countDownNum = 3;
			model._interval = window.setInterval(model._countDownInterval, 1000);
			if (model.oncountdown) {
				model.oncountdown();
			}
			return;
		}
		// Fire the recording if no countdown
		if (model.onrecord) {
			model.onrecord();
		}
	}
	object.dom.recordButton.ontouchstart = function() {
		this.style.opacity = '0.7';
	}
	object.dom.recordButton.ontouchend = function() {
		this.style.opacity = '1.0';
	}
	object.dom.recordButton.ontouchcancel = object.dom.recordButton.ontouchend;
	if (!$ui.isMobileDevice()) {
		object.dom.recordButton.onmousedown = object.dom.recordButton.ontouchstart;
		object.dom.recordButton.onmouseup = object.dom.recordButton.ontouchend;
		object.dom.recordButton.onmouseleave = object.dom.recordButton.ontouchend;
	}
	
	// Create our caption
	object.dom.captionDiv = document.createElement('div');
	$ui.addClass(object.dom.captionDiv,'caption');
	object.dom.stage1.appendChild(object.dom.captionDiv);
	if (object.caption) {
		object.dom.captionDiv.textContent = object.caption;
	}
	
	// Create our Stage 2 area
	object.dom.stage2 = document.createElement('div');
	$ui.addClass(object.dom.stage2,'stage-2');
	object.dom.contentDiv.appendChild(object.dom.stage2);
	
	// Add our stage 2 number
	object.dom.number = document.createElement('div');
	$ui.addClass(object.dom.number,'number');
	object.dom.stage2.appendChild(object.dom.number);
	object.dom.number.textContent = '3';
	
	// Private function to handle count down
	object._countDownInterval = function(value) {
		this._countDownNum--;
		if (this._countDownNum === 0) {
			window.clearInterval(this._interval);
			this._interval = undefined;
			this.dom.number.textContent = 'GO!';
			this.dom.number.style.backgroundColor = $ui.theme.color;
			$ui.addClass(this.dom.number,'animation');
			// Fire the onrecord event
			if (this.onrecord) {
				this.onrecord();
			}
			return;
		}
		this.dom.number.textContent = this._countDownNum;
		if (this.oncountdown) {
			this.oncountdown();
		}
	}
	object._countDownInterval = object._countDownInterval.bind(object);
	
	// Private function to handle clean-up
	object._providerUpdate = function(value) {
		if (this._interval != undefined) {
			window.clearInterval(this._interval);
			this._interval = undefined;
		}
	}
	object._providerUpdate = object._providerUpdate.bind(object);
	
	/**
	* Reset the tile to its original state
	* @function reset
	* @memberof $ui.TileRecord
	*/
	object.reset = function() {
		if (this._interval != undefined) {
			window.clearInterval(this._interval);
			this._interval = undefined;
		}
		this.dom.number.style.backgroundColor = '';
		this.dom.number.textContent = '3';
		$ui.removeClass(this.dom.number,'animation');
		this.dom.stage2.style.display = 'none';
		this.dom.stage1.style.display = '';
	}
	object.reset = object.reset.bind(object);
	
	return object.dom;
}

$ui_TileRecord.prototype = new $ui_CoreTile();

/**
 * The Time donut tile represents how close you reach a target number goal
 * <br><br><b>Sample Declaration</b>
 * <pre>
 * {
 *    component: $ui.TileTimeDonut,
 *    value: 3.8,
 *    target: 4.2,
 *    accent: 'Your Best Time'
 * }
 * </pre>
 * @namespace TileTimeDonut
 * @memberof $ui
 * @extends $ui.CoreTileDonutChart
 * @property {number} [value] - This number value represents the actual time achieved
 * @property {number} [target] - This number value represents the target time the driver is hoping to achieve.
 * @property {string} [caption] - This optional string value represents the text to appear to the left of the displayed value
 * @property {string} [accent] - This optional string value represents any extra accent text to display on the tile
 */
function $ui_TileTimeDonut(object, screen) {
	object._size = undefined;
	$ui_CoreTileDonutChart.call(this, object, screen);
	$ui.addClass(object.dom,'ui-tile-time-donut');
	
	// Figure out the data array for this chart
	object._calculateData = function() {
		var data;
		if (this.target != undefined && this.value != undefined) {
			var colorValue,
				percent;
			// Check for errors in data
			if (this.value < 0) this.value = 0;
			if (this.value < this.target) {
				percent = 100;	
			} else {
				percent = Math.ceil((this.target / this.value)*100);
			}
			// Determine Color
			switch (true) {
				case (percent > 90):
					colorValue = ($ui.theme.rootClass && $ui.theme.rootClass.indexOf('ui-theme-dark') > -1) ? $ui.theme.color : $ui.color_GREAT;
					break;
				case (percent > 50):
					colorValue = ($ui.theme.rootClass && $ui.theme.rootClass.indexOf('ui-theme-dark') > -1) ? $ui.theme.color : $ui.color_GOOD;
					break;
				default:
					colorValue = ($ui.theme.rootClass && $ui.theme.rootClass.indexOf('ui-theme-dark') > -1) ? $ui.theme.color : $ui.color_OK;
					break;
			}
			// Create our chart data object
			data = [
				{
					value: percent,
					color: colorValue,
				},
				{
					value: (100-percent),
					color: ($ui.theme.rootClass && $ui.theme.rootClass.indexOf('ui-theme-dark') > -1) ? $ui.color_DARK : $ui.color_LIGHT
				}
			];	
		} 
		return data;
	}
	object._calculateData = object._calculateData.bind(object);
	

	// Private function to handle provider updates
	object._providerUpdate = function(value) {
		if (value != undefined) {
			this.value = value.value;
			this.target = value.target;
			this.accent = value.accent;
			this.caption = (value.caption == undefined) ? '' : value.caption;
		} else {
			this.value = 0;
			this.target = 0;
			this.accent = undefined;
			this.caption = '';
		}
		// Populate our chart with data
		var data = this._calculateData();
		if (data != undefined) {
			this._setData(data);
			this._setCaption('<span class="tall">'+this.value + '</span>&nbsp;'+ this.caption);
			this._setAccent(this.accent);
		}
		this.showContent(true);
	}
	object._providerUpdate = object._providerUpdate.bind(object);	
	
	// Load our control if no provider is connected
	if (object.provider == undefined) {
		object._providerUpdate(object)
	}
	
	return object.dom;
}

$ui_TileTimeDonut.prototype = new $ui_CoreTileDonutChart();
/**
 * The Time History tile represents past recorded times.
 * <br><br><b>Sample Declaration</b>
 * <pre>
 * {
 *    component: $ui.TileTimeHistory,
 *    labels: ['Apr 10/14','May 12/14','Jul 18/14','Aug 22/14'],
 *    data: [5.2,6.3,4.2,4.5],
 *    caption: 'Recorded 0-60 times (sec)'
 * }
 * </pre>
 * @namespace TileTimeHistory
 * @memberof $ui
 * @extends $ui.CoreTile
 * @property {number[]} [data] - This array of numbers represents the time values
 * @property {string[]} [labels] - This array of strings represents the labels for the times. These labels are typically logging dates.
 * @property {string} [caption] - This optional string value represents the text caption you wish to include
 */
function $ui_TileTimeHistory(object, screen) {
	// This tile is 1 x 1
	object._size = $ui.TileSize.WIDE;
	$ui_CoreTile.call(this, object, screen);
	$ui.addClass(object.dom,'ui-tile-time-history');
	
	// Create the caption area
	object.dom.caption = document.createElement('div');
	$ui.addClass(object.dom.caption,'caption');
	object.dom.contentDiv.appendChild(object.dom.caption);
	
	// Create our chart area
	object.dom.canvas = document.createElement('canvas');
	$ui.addClass(object.dom.canvas, 'chart');
	object.dom.canvas.height = 190;
	object.dom.canvas.width = 490;
	object.dom.contentDiv.appendChild(object.dom.canvas);
	object.dom.ctx = object.dom.canvas.getContext('2d');
	object.dom.chart = new Chart(object.dom.ctx);
	
	// Private function to handle provider updates
	object._providerUpdate = function(value) {
		var i,
			_labels = [];
		// Assign our values
		if (value != undefined) {
			this.data = value.data;
			this.labels = value.labels
			this.caption = (value.caption == undefined) ? '' : value.caption;
		} else {
			this.data = undefined;
			this.labels = undefined;
		}
		this.dom.caption.textContent = this.caption;
		// Get our root color
		var graphColor = ($ui.theme.rootClass && $ui.theme.rootClass.indexOf('ui-theme-dark') > -1) ? $ui.theme.color : $ui.color_OK,
			RGB = $ui.hexToRgb(graphColor);
		// Load our data
		var data = {
			labels: this.labels,
			datasets: [
				{
					fillColor: 'rgba('+RGB.R+','+RGB.G+','+RGB.B+',0.5)',
					strokeColor: 'rgba('+RGB.R+','+RGB.G+','+RGB.B+',1)',
					data: this.data
				}
			]
		}
		this.dom.chart.Line(data,{scaleShowGridLines: true,showTooltips: false,scaleFontColor: window.getComputedStyle(this.dom).color});
		this.showContent(true);
	}
	object._providerUpdate = object._providerUpdate.bind(object);	
	
	// Load our control if no provider is connected
	if (object.provider == undefined) {
		object._providerUpdate(object)
	}
	
	
	return object.dom;
}

$ui_TileTimeHistory.prototype = new $ui_CoreTile();
/**
 * The Timer tile provides a stop watch timer. <b>NOTE: Currently there is a 60 minute limit for the timer</b>
 * <br><br><b>Sample Declaration</b>
 * <pre>
 * {
 *    component: $ui.TileTimer
 * }
 * </pre>
 * @namespace TileTimer
 * @memberof $ui
 * @extends $ui.CoreTile
 * @property {GenericEvent} [onstart] - This event fires when the timer starts
 * @property {GenericEvent} [onstop] - This event fires when the timer stops
 * @property {GenericEvent} [onreset] - This event fires when the timer has been reset
 */
function $ui_TileTimer(object, screen) {
	// This tile is 1 x 2
	object._size = $ui.TileSize.WIDE;
	$ui_CoreTile.call(this, object, screen);
	$ui.addClass(object.dom,'ui-tile-timer');
	
	// Add our numbers area
	object.dom.numbers = document.createElement('div');
	$ui.addClass(object.dom.numbers,'numbers');
	object.dom.contentDiv.appendChild(object.dom.numbers);
	object.dom.numbers.textContent = '00:00:00';
	
	// Private function to handle the interval
	object._doInterval = function() {
		var now = new Date();
		this._milliseconds = now - this._startTime;
		var minutes = Math.floor(this._milliseconds/60000),
			seconds = Math.floor(this._milliseconds/1000) % 60,
			tenths;
		// Calculate our tenths
		tenths = (this._milliseconds/1000).toFixed(2) - Math.floor(this._milliseconds/1000);
		tenths = Math.floor(tenths * 100);	
		tenths = (tenths >= 100) ? 0 : tenths;
		// Format leading zeros
		minutes = (minutes >= 10) ? minutes : '0'+ minutes;
		seconds = (seconds >= 10) ? seconds : '0'+ seconds;
		tenths = (tenths >= 10) ? tenths : '0'+ tenths;
		// Set our text
		object.dom.numbers.textContent = minutes + ':'+seconds+':'+tenths;	
	}
	object._doInterval = object._doInterval.bind(object);
	
	/**
	* This function will reset the timer and trigger the <b>onreset</b> event
	* @function reset
	* @memberof $ui.TileTimer
	*/
	object.reset = function() {
		if (this._interval != undefined) {
			window.clearInterval(this._interval);
			this._milliseconds = 0;
			this._interval = undefined;
		}
		this.dom.numbers.textContent = '00:00:00';
		if (this.onreset) {
			this.onreset();
		}
	}
	object.reset = object.reset.bind(object);
	
	/**
	* This function will start the timer and trigger the <b>onstart</b> event
	* @function start
	* @memberof $ui.TileTimer
	*/
	object.start = function() {
		if (this._interval != undefined) return; // Already running
		this._startTime = new Date();
		this._milliseconds = 0;
		this._interval = window.setInterval(this._doInterval,10);
		if (this.onstart) {
			this.onstart();
		}
	}
	object.start = object.start.bind(object);
	
	/**
	* This function will stop the timer and trigger the <b>onstop</b> event
	* @function stop
	* @memberof $ui.TileTimer
	*/
	object.stop = function() {
		if (this._interval != undefined) {
			window.clearInterval(this._interval);
			this._interval = undefined;
			if (this.onstop) {
				this.onstop();
			}
		}
	}
	object.stop = object.stop.bind(object);
	
	/**
	* Retrieve the timer's value in Milliseconds
	* @function getMilliseconds
	* @memberof $ui.TileTimer
	*/
	object.getMilliseconds = function() {
		return this._milliseconds;
	}
	object.getMilliseconds = object.getMilliseconds.bind(object);
	
	/**
	* Retrieve the timer's value in Seconds
	* @function getSeconds
	* @memberof $ui.TileTimer
	*/
	object.getSeconds = function() {
		return (this._milliseconds/1000).toFixed(1);
	}
	object.getSeconds = object.getSeconds.bind(object);
	
	/**
	* Retrieve the timer's value in Minutes
	* @function getMinutes
	* @memberof $ui.TileTimer
	*/
	object.getMinutes = function() {
		return (this._milliseconds/60000).toFixed(2);
	}
	object.getMinutes = object.getMinutes.bind(object);
	
	// Private function to clean up
	object._destroy = function() {
		if (this._interval != undefined) {
			window.clearInterval(this._interval);
			this._interval = undefined;
		}
	}
	object._destroy = object._destroy.bind(object);
	
	// Stop the timer if the screen is about to pop
	object._onbeforepop = function() {
		this.stop();
	}
	object._onbeforepop = object._onbeforepop.bind(object);
	
	return object.dom;
}

$ui_TileTimer.prototype = new $ui_CoreTile();

