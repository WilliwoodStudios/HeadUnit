/* $ui VERSION: 1.0.0.35*/

var $ui = {
	screens : [],  // Holds all of the current screens on the stack;
	definitions: [],
	config: {
		inHeadUnit: false,
		brandColor: '#D94646',
		tileFontColor: '#747474',
		celsius: false,
		audioManager: undefined
	},
	eventBroker: new SystemEventBroker(),
	inScreenTransition: false,
	// Global events
	ONSHOW: 'onshow',
	// System events
	EventType: {
		ONSUBSCRIBE: 'onsubscribe',
		ONUNSUBSCRIBE: 'onunsubscribe',
		ONSPEEDCHANGE: 'onspeedchange',
		ONFUELCHANGE: 'onfuelchange',
		ONRPMCHANGE: 'onrpmchange',
		ONDRIVERTEMPCHANGE: 'ondrivertempchange',
		ONPASSENGERTEMPCHANGE: 'onpassengertempchange'
	},
	// Graph Colors
	color_LIGHT: '#F0F0F0',
	color_DARK: '#747474',
	color_OK: '#FAD60A',
	color_GOOD: '#FDBF2F',
	color_GREAT: '#A3D525',
	// Component Definitions
	ExtensionType: {
		CONTROL: 'control',
		SCREEN: 'screen',
		LISTITEM: 'listitem'
	},
	Tile: {
		WIDE: 'wide',
		TALL: 'tall'
	},
	
	init: function(object, config) {	
		// Inherit any config overrides
		if (window.location !== window.parent.location) {
			if (window.parent.$emulator) {
				var config = window.parent.$emulator.config;
				this.config.inHeadUnit = config.inHeadUnit;
				this.config.brandColor = config.brandColor;
				this.config.tileFontColor = config.tileFontColor;
				this.config.audioManager = config.audioManager;
			}
		} else {
			this.config.inHeadUnit = (config.inHeadUnit) ? config.inHeadUnit : this.config.inHeadUnit;
			this.config.brandColor = (config.brandColor) ? config.brandColor : this.config.brandColor;
			this.config.tileFontColor = (config.tileFontColor) ? config.tileFontColor : this.config.tileFontColor;
			this.config.audioManager = (config.audioManager) ? config.audioManager : this.config.audioManger;
		}
		// before push the initial page, add blockAllTapEvent function to body
		document.body.blockAllTapEvent = function(e) {
			e.preventDefault();
			e.stopPropagation();
		}
		document.body.blockAllTapEvent = document.body.blockAllTapEvent.bind(document.body);
		// Add our control extensions
		this.addExtension({name:'DockLayout',definition:{TOP: 'top',BOTTOM: 'bottom'},constructor:$ui_DockLayout});
		this.addExtension({name:'SegmentedControl',definition:{},constructor:$ui_SegmentedControl});
		this.addExtension({name:'Tab',definition:{},constructor:$ui_Tab});
		this.addExtension({name:'TabbedPane',definition:{},constructor:$ui_TabbedPane});
		this.addExtension({name:'List',definition:{},constructor:$ui_List});
		this.addExtension({name:'SplitView',definition:{},constructor:$ui_SplitView});
		this.addExtension({name:'Spinner',definition:{LARGE: 'large', MEDIUM: 'medium', SMALL: 'small', TINY: 'tiny'},constructor:$ui_Spinner});
		this.addExtension({name:'TileGroup',definition:{},constructor:$ui_TileGroup});
		this.addExtension({name:'DataProvider',definition:{ERR_OFFLINE: -5000,ERR_INVALID_JSON: -5001},constructor:$ui_DataProvider});
		this.addExtension({name:'CircleMenu',definition:{},constructor:$ui_CircleMenu});
		// Add our screen extensions
		this.addExtension({name:'WindowPane',definition:{},type:$ui.ExtensionType.SCREEN, constructor:$ui_WindowPane});
		// Add our list item extensions
		this.addExtension({name:'GenericListItem',definition:{ONCLICK:'onclick'},type:$ui.ExtensionType.LISTITEM, constructor:$ui_GenericListItem});
		// Push the first screen
		this.push(object);
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
	
	// Adds a new control to the framework
	addExtension: function(extension) {
		if (extension.type == undefined) extension.type = $ui.ExtensionType.CONTROL;
		if (extension.definition == undefined) extension.definition = {};
		$ui[extension.name] = extension.definition;
		extension.component = $ui[extension.name];
		if (extension.type == undefined) extension.type = $ui.ExtensionType.CONTROL;
		this.definitions.push(extension);
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
		for (i = 0; i < this.definitions.length; i++) {
			extension = this.definitions[i];
			if (extension.type != $ui.ExtensionType.CONTROL) continue;
			if (extension.component == control.component) {
				controlDom = new extension.constructor(control,screen);
				break;
			}
		}
		return controlDom;
	},
	
	// Play the touch sound
	playTouchSound: function() {
		if (this.config.audioManager) {
			//this.config.audioManager.playSoundEffect(SoundEffect.TOUCH);
		}
	},
	
	// Check to see if this is a mobile device
	isMobileDevice: function() {
		var check = false;
		(function(a,b){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|android|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true})(navigator.userAgent||navigator.vendor||window.opera);
		return check;
	},

	blockAllTapEvent: function(value) {
		if(value == undefined) return;
		if(value === true) {
			document.body.addEventListener('click', document.body.blockAllTapEvent, true);
			document.body.addEventListener('touchstart', document.body.blockAllTapEvent, true);
		} else if (value === false) {
			document.body.removeEventListener('click', document.body.blockAllTapEvent, true);
			document.body.removeEventListener('touchstart', document.body.blockAllTapEvent, true);
		}
	},
	
	// Push a new screen onto the stack
	push: function(screen, data) {
		if ($ui.inScreenTransition === true) {
			setTimeout(function() {
				$ui.push(screen, data);
			}, 100);
		} else {
			screen = new screen();
			// Find and create the screen
			var dom,
				i,
				extension;
			for (i = 0; i < this.definitions.length; i++) {
				extension = this.definitions[i];
				if (extension.type != $ui.ExtensionType.SCREEN) continue;
				if (extension.component == screen.component) {
					dom = new extension.constructor(screen,data);
					break;
				}
			}
			if (dom == undefined) return;
			$ui.blockAllTapEvent(true);
			$ui.inScreenTransition = true;
			$ui.screens.push(screen);
			dom.style['z-index'] = $ui.screens.length+1;
			document.body.appendChild(dom);
			if (screen.disableAnimation == true) {
				screen.initialize();
			}
		}
	},
	
	// Pop a screen off the stack
	pop: function() {
		// Return if the screen is in transition.
		if ($ui.inScreenTransition === true) {
			setTimeout(function() {
				$ui.pop();
			}, 100);
		} else {
			$ui.blockAllTapEvent(true);
			$ui.inScreenTransition = true;
			// Remove the top most screen
			var screen = $ui.screens[$ui.screens.length-1];
			if (screen.disableAnimation == true) {
				$ui._removeScreen(screen);
				
			} else {
				screen.dom.addEventListener('webkitAnimationEnd', function(e) {
					$ui._removeScreen(this.model);
				}, false);
			}
		}
	},

	// Remove a screen from the stack
	_removeScreen: function(screen) {
		if (screen._onbeforepop) {
			screen._onbeforepop();
		}
		screen.dom.style.display = 'none';
		document.body.removeChild(screen.dom);
		// Remove any global event listeners
		this.eventBroker.removeEventListenersForScreen(screen);
		screen.destroy();
		// Handle finalization
		$ui.inScreenTransition = false;
		$ui.blockAllTapEvent(false);
		$ui.screens.pop();
	},

	// Determines if a string is infact valid JSON
	isValidJsonString: function(str) {
		try {
			JSON.parse(str);
		} catch (e) {
			return false;
		}
		return true;
	},

	// Determines if an element has the class specified in it's class name
	hasClass: function(element, name){
		var re = new RegExp('(^| )' + name + '( |$)');
		return re.test(element.className);
	},
	
	// Adds a class name to an element
	addClass: function(element, name){
		if (!$ui.hasClass(element, name)){
			element.className += ' ' + name;
		}
	},
	
	// Removes a class from an element
	removeClass: function(element, name){
		var re = new RegExp('(^| )' + name + '( |$)');
		element.className = element.className.replace(re, ' ').replace(/^\s+|\s+$/g, "");
	},
	
	_cutHex : function(h) {
		return (h.charAt(0)=="#") ? h.substring(1,7):h
	},
	
	// guid(uuid) Generator
	guid: function() {
	   return ($ui._guidS4() + $ui._guidS4() + "-" + $ui._guidS4() + "-" + $ui._guidS4() + "-" + $ui._guidS4() + "-" + $ui._guidS4() + $ui._guidS4() + $ui._guidS4());
	},
	_guidS4: function() {
	   return (((1 + Math.random()) * 0x10000)|0).toString(16).substring(1);
	}
}

Function.prototype.bind = function(object){ 
  var fn = this; 
  return function(){ 
    return fn.apply(object, arguments); 
  }; 
}; 
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
				// Now botttom row
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
		// Set our coordinates
		for (i = 0; i < visibleItems.length; i++) {
			item = visibleItems[i];
			coord = coordinates[i];
			item.dom.style['-webkit-transform'] = 'translate('+coord.X+'px,'+coord.Y+'px)';
		}
	}
	object._recalculateLayout = object._recalculateLayout.bind(object);
	
	// Cycle through content
	if (object.items) {
		var i,
			control,
			controlDom;
		for (i = 0; i < object.items.length; i++) {
			control = object.items[i];
			control.parent = object;
			controlDom = new $ui_CircleMenuItem(control, screen);
			if (controlDom) {
				object.dom.appendChild(controlDom);
			}
		}
	}
	
	// Handle resize of screen
	object._onresize = function() {
		this._recalculateLayout();
	}
	object._onresize = object._onresize.bind(object);
	
	setTimeout(object._onresize,0);
	
	return object.dom;
}

$ui_CircleMenu.prototype = new $ui_CoreComponent();
function $ui_CircleMenuItem(object, screen) {
	$ui_CoreComponent.call(this, object, screen);
	$ui.addClass(object.dom,'menu-item');
	
	// Create inner circle
	object.dom.inner = document.createElement('div');
	object.dom.inner.model = object;
	$ui.addClass(object.dom.inner,'circle');
	object.dom.appendChild(object.dom.inner);
	object.dom.inner.onclick = function() {
		$ui.playTouchSound();
		if (this.model.onclick) {
			this.model.onclick();
		}
	}
	object.dom.inner.ontouchstart = function() {
		this.style.backgroundColor = $ui.config.brandColor;
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
	
	// Set the image
	if (object.imgClass) {
		$ui.addClass(object.dom.inner,object.imgClass);
	}
	if (object.icon) {
		object.dom.inner.style.backgroundImage = 'url("'+ object.icon + '")';
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
function $ui_CoreComponent(object, screen) {
	if (object) {
		this.object = object;
		// Create a placeholder for the initial values of the control that can be modified by setters
		object._original = {};
		object._original.visible = object.visible;
		object._original.enabled = object.enabled;
		
		// Assign this control as a child of the screen
		if (screen != undefined) {
			object.screen = screen;
			screen.children.push(object);
			if (object.id) {
				screen[object.id] = object;
			}
		}
		
		// Create our base container for the control 
		object.dom = document.createElement('div');
		object.dom.model = object;
		$ui.addClass(object.dom, 'ui-core-component');
		
		// See if it is running in the head unit
		if ($ui.config.inHeadUnit === true) {
			$ui.addClass(object.dom,'in-head-unit');
		}
		
		// Check for our margins
		if (object.marginTop === true) {
			$ui.addClass(object.dom,'marginTop');
		}
		if (object.marginBottom === true) {
			$ui.addClass(object.dom,'marginBottom');
		}
		if (object.marginLeft === true) {
			$ui.addClass(object.dom,'marginLeft');
		}
		if (object.marginRight === true) {
			$ui.addClass(object.dom,'marginRight');
		}
		
		// Set default enabled state
		if (object.enabled != false) {
			object.enabled = true;
		} else {
			$ui.addClass(object.dom, 'disabled');
		}
		
		// Create any attached objects
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
		
		// Public function to set the enabled state
		object.setEnabled = function(value) {
			if (value == this.enabled) return false;
			if (this.enabled && (value == false)) {
				this.enabled = false;
				$ui.addClass(this.dom, 'disabled');
			} else if ((this.enabled == false) && (value == true)) {
				this.enabled = true;
				$ui.removeClass(this.dom, 'disabled');
			}
			// Call a child class' protected function if they need
			// to do special handling for enabling
			if (this._setEnabled) {
				this._setEnabled(value);
			}
			return true;
		}
		object.setEnabled = object.setEnabled.bind(object);
		
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
		
		// Public function to scroll the control into view
		object.scrollIntoView = function() {
			if (this.dom) {
				this._scrollIterationCounter = 0;
				requestAnimationFrame(this._scrollIntoView);
			}
		}
		object.scrollIntoView = object.scrollIntoView.bind(object);
		
		// Public base destructor for the component
		object.destroy = function() {	
			this.visible = this._original.visible;
			this.enabled = this._original.enabled;
			
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
		
		// Grab our data provider
		if (object.provider != undefined) {
			if (object.provider.id != undefined) {
				// unique event listener for this provider on this screen
				window.addEventListener(object.screen.guid+'-'+object.provider.id+'-updated', object._providerRefresh, false);
				// Evaluate our bindings 
				object._providerRefresh();
			}
		}
		
		// Set our initial visibility
		if ((object.visible != undefined) && (object.visible == false)) {
			object.dom.style.display = 'none';
		} else {
			object.visible = true;
		}
		
		// Add our setVisible function 
		object.setVisible = function(value) {
			if (value != this.visible) {
				if (value == true) {
					this.visible = true;
					if (this.dom != undefined) {
						this.dom.style.display = '';
					}
				} else {
					this.visible = false;
					if (this.dom != undefined) {
						this.dom.style.display = 'none';
					}
				}

				// Allow of the top level control to also react to the visibility change
				if (this._setVisible) {
					if (!this._setVisible(value)) {
						return false;
					}
				}
				return true;
			} else {
				return false;
			}
		}
		object.setVisible = object.setVisible.bind(object);
	}
}


function $ui_CoreScreen(object, data) {
	$ui_CoreComponent.call(this, object);
	if (object) {
		object.data = data;
		object.guid = $ui.guid();
		object.children = []; // Contains all child controls in the screen
		$ui.addClass(object.dom,'ui-core-screen');
		
		// Add our animation unless it is disabled
		if (object.disableAnimation != true) {
			$ui.addClass(object.dom, 'animation');
		}
		
		// Create our background image div
		object.dom.backgroundDiv = document.createElement('div');
		$ui.addClass(object.dom.backgroundDiv,'background');
		object.dom.appendChild(object.dom.backgroundDiv);
		
		// See if there is a background image
		if (object.background) {
			if (object.background.repeat === true) {
				object.dom.backgroundDiv.style.backgroundRepeat = 'repeat';
			} else {
				object.dom.backgroundDiv.style.backgroundSize = 'cover';
			}
		}

		// Raise our onshow event when the animation ends
		object.dom.pushAnimationEnd = function(e) {
			this.removeEventListener('webkitAnimationEnd', this.pushAnimationEnd); // Webkit
			this.model.initialize();
		}
		object.dom.pushAnimationEnd = object.dom.pushAnimationEnd.bind(object.dom);
		object.dom.addEventListener('webkitAnimationEnd', object.dom.pushAnimationEnd, false); // Webkit
		
		// Initialize the screen
		object.initialize = function() {
			$ui.inScreenTransition = false;
			$ui.blockAllTapEvent(false);
			// See if there is an internal implementation of _initialize
			if (this._initialize) {
				this._initialize();
			}
			// Raise our onshow event
			var evt = document.createEvent('Events');
			evt.initEvent($ui.ONSHOW, true, true);
			this.dom.dispatchEvent(evt);
			// Load the background if needed
			if (this.background) {
				var background = this.background;
				if (background.img) {
					this._loader = new Image();
					this._loader.model = this;
					this._loader.onload = function() {
						this.model.dom.backgroundDiv.style.backgroundImage = 'url("'+this.model.background.img+'")';
						if (this.model.background.colorized === true) {
							this.model.dom.backgroundDiv.style.backgroundBlendMode = 'hard-light';//'multiply';//'luminosity';
							this.model.dom.backgroundDiv.style.backgroundColor = $ui.config.brandColor;
						}
						this.model.dom.backgroundDiv.style.opacity = '1';
						this.model._loader = null;
					}
					this._loader.src = background.img;
				}
			}
		}
		object.initialize = object.initialize.bind(object);
		
		// Handle the asynchronous onshow
		object.dom.addEventListener($ui.ONSHOW, function(e) {
			e.stopImmediatePropagation();
			e.preventDefault();
			
			if (this.model.onshow) {
				this.model.onshow(this.model.data);
			}
			
			// Fire the _onshow for all the controls
			var i,
				control;
			for (i = 0; i < this.model.children.length;i++) {
				control = this.model.children[i];
				if (control._onshow) {
					control._onshow();
				}
			}
		},false);
		
		
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
		object._onbeforepop = function() {
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
		object._onbeforepop = object._onbeforepop.bind(object);
		
		// Destroy screen
		object._destroy = function() {
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


function $ui_CoreTile(object, screen) {
	$ui_CoreComponent.call(this, object, screen);
	
	if (object) {
		$ui.addClass(object.dom,'ui-tile');
		object._contentShowing = false;
		object.dom.style.color = $ui.config.tileFontColor;
		if ($ui.config.inHeadUnit == true) {
			object.dom.style.borderColor = $ui.config.brandColor;
		}
		
		// See if a style was defined
		if (object.style) {
			$ui.addClass(object.dom, object.style);
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
		
		// Public function to toggle the display of content
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
		
		// Set the data for the chart
		object._setData = function(data) {
			this.chart.Doughnut(data,{showTooltips: false, segmentStrokeColor : "transparent",});
		}
		object._setData = object._setData.bind(object);
		
		// Create the caption area
		object.dom.caption = document.createElement('div');
		$ui.addClass(object.dom.caption,'caption');
		object.dom.contentDiv.appendChild(object.dom.caption);
		
		// Set the caption for the chart
		object._setCaption = function(value) {
			this.dom.caption.innerHTML = value;
		}
		object._setCaption = object._setCaption.bind(object);
		
		// Create the accent area
		object.dom.accent = document.createElement('div');
		$ui.addClass(object.dom.accent,'accent');
		object.dom.contentDiv.appendChild(object.dom.accent);
		var color = ($ui.config.inHeadUnit == true) ? $ui.color_DARK : $ui.color_LIGHT
		object.dom.accent.style.color = color;
		
		// Set the accent text for the chart
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
function $ui_CoreTileGauge(object, screen) {
	if (object) object.style = undefined; // Always square
	$ui_CoreTile.call(this, object, screen);
	if (object) {
		$ui.addClass(object.dom,'ui-tile-gauge');

		// Create our title area
		object.dom.titleDiv = document.createElement('div');
		$ui.addClass(object.dom.titleDiv,'title');
		object.dom.contentDiv.appendChild(object.dom.titleDiv);
		
		// Internal function to set the title
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
		// Internal function to set the accent text
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
			ctx.strokeStyle = ($ui.config.inHeadUnit == true) ? $ui.color_DARK : $ui.color_LIGHT;
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
					this._color = ($ui.config.inHeadUnit == true) ? $ui.config.brandColor : $ui.color_GREAT;
					this._step = 2;
					break;
				case (percent < 0.77):
					this._color = ($ui.config.inHeadUnit == true) ? $ui.config.brandColor : $ui.color_GOOD;
					this._step = 7;
					break;
				default:
					this._color = ($ui.config.inHeadUnit == true) ? $ui.config.brandColor : $ui.color_OK;
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
function $ui_DataProvider(object, screen){
	object.screen = screen;
	object._url = undefined;
	object._parameters = undefined;
	object._untouched = true;
	
	// Attach the ID to the main screen object
	if (object.id && screen) {
		screen[object.id] = object;
	}
	
	// Public function to set the data with an object
	object.setData = function(value) {
 		this._untouched = false;
		this.data = value;
		this._raiseEvent();
		if (value == undefined) return;
		if (this.onload) {
			this.onload();
		}
	}
	object.setData = object.setData.bind(object);
	
	// Public function to refresh Data from the server
	object.refreshFromServer = function() {
		if ((this._url == undefined) || (this._url == '')) return;
		this._url = url;
		this._parameters = parameters;
 		this.loadFromUrl(this._url,this._parameters);
	}
	object.refreshFromServer = object.refreshFromServer.bind(object);
	
	// Public function to tell connected controls to reload their data from memory
	object.refresh = function() {
		this._raiseEvent();
	}
	object.refresh = object.refresh.bind(object);
	
	// Public function to load the data from a JSON URL
	object.loadFromUrl = function(url,parameters) {
		this._untouched = false;
		this._url = url;
		this._parameters = parameters;
		// Make sure we are online
		if(navigator.onLine != true) {
			if (this.onerror) {
				this.onerror($ui.DataProvider.ERR_OFFLINE);
			}
			return;
		}
		this._xhr = new XMLHttpRequest();
		this._xhr.model = this;
		// Handle our state changes
		this._xhr.onreadystatechange = function () {
			/* On readyState is 4, Determine if the request was successful or not. */
			if(this.readyState == 4) {
				if (this.status == 200) {
					try {
						var result = JSON.parse(this.responseText);
					} catch (ex) {
						console.log(ex + ' : ' + ex.message);
						if (this.onerror) {
							this.onerror($ui.DataProvider.ERR_INVALID_JSON);
						}
					}
					// Load our data
					this.model._loadFromUrl(result);
				} else if(this.status != 0) {
					if (this.onerror) {
						this.onerror(this.status);
					}
				}
			}
		}
		var data;
		if(parameters) {
			//data = $ui.urlEncode(parameters);
			data = paremeters;
		}
		this._xhr.open('GET', data != undefined ? url + '?' + data : url, true);
		this._xhr.setRequestHeader( "Content-Type", "application/x-www-form-urlencoded; charset=UTF-8" );
		//this._xhr.timeout = 0;
		this._xhr.send();
	}
	object.loadFromUrl = object.loadFromUrl.bind(object);
	
	// Private function to asynchronously load the data items from a URL source
	object._loadFromUrl = function(result) {
		this.data = result;
		this._raiseEvent();
		if (this.onload) {
			this.onload();
		}
	}
	object._loadFromUrl = object._loadFromUrl.bind(object);
	
	// Raise our event to let the rest of the app know to refresh
	object._raiseEvent = function() {
		var evt = document.createEvent('Events');
		evt.initEvent(this.screen.guid+'-'+this.id+'-updated', true, true);
		window.dispatchEvent(evt);
	}
	object._loadFromUrl = object._loadFromUrl.bind(object);
	
	// Private function to handle clean-up
	object._destroy = function() {
		this.data = undefined;
	}
	object._destroy = object._destroy.bind(object);
	
	// See if the data was pre-defined
	if (object.data != undefined) {
		if (object.onload) {
			object.onload();
		}
	}
	
	return undefined;
}


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
	if (object.location === $ui.DockLayout.BOTTOM) {
		object.dom.appendChild(object.dom.contentDiv);
		object.dom.appendChild(object.dom.dock)
	} else {
		object.dom.appendChild(object.dom.dock)
		object.dom.appendChild(object.dom.contentDiv);
	}
	
	return object.dom;
}

$ui_DockLayout.prototype = new $ui_CoreComponent();
// Create a system event object
function SystemEvent(eventType, data) {
	var object = {
		eventType: eventType,
		data: data
	}
	return object;
}

// The event broker manages event subscription and distribution
function SystemEventBroker() {
	var object = {
		list: []
	};
	
	// Add an event listener
	object.addEventListener = function(eventType, callback, screen) {
		var item = {
			eventType: eventType,
			callback: callback,
			screen: screen
		}
		this.list.push(item);
		// Raise the onsubscribe event
		var systemEvent = new SystemEvent($ui.EventType.ONSUBSCRIBE, {eventType: eventType});
		this.raiseEvent(systemEvent);
	}
	object.addEventListener = object.addEventListener.bind(object);
	
	// Remove an event listener
	object.removeEventListener = function(eventType, callback) {
		var i,
			item,
			systemEvent;
		for (i = 0; i < this.list.length; i++) {
			item = this.list[i];
			if (item.eventType == eventType && item.callback == callback) {
				this.list.splice(i, 1);
				// Raise the onunsubscribe event
				systemEvent = new SystemEvent($ui.EventType.ONUNSUBSCRIBE, {eventType: eventType});
				this.raiseEvent(systemEvent);
				return;
			}
		}
	}
	object.removeEventListener = object.removeEventListener.bind(object);
	
	// Remove all event listeners for a screen
	object.removeEventListenersForScreen = function(screen) {
		var i,
			item,
			systemEvent;
		for (i = this.list.length - 1; i >= 0; i--) {
			if (this.list.length === 0) return;
			item = this.list[i];
			if (item && (item.screen == screen)) {
				this.list.splice(i, 1);
				// Raise the onunsubscribe event
				systemEvent = new SystemEvent($ui.EventType.ONUNSUBSCRIBE, {eventType: item.eventType});
				this.raiseEvent(systemEvent);
			}
		}
	}
	object.removeEventListenersForScreen = object.removeEventListenersForScreen.bind(object);
	
	// Raise an event
	object.raiseEvent = function(systemEvent) {
		var i,
			item;
		for (i = 0; i < this.list.length; i++) {
			item = this.list[i];
			if (item.eventType == systemEvent.eventType) {
				try {
					item.callback(systemEvent.data)
				} catch (e) {
					console.log('ERROR: raiseEvent - ' + e.message);
				}
			}
		}
	}
	object.raiseEvent = object.raiseEvent.bind(object);
	
	return object;
}

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
	if ($ui.config.inHeadUnit === true) {
		object.dom.accent.style.color = $ui.config.brandColor;
	}
	if(object.accent != undefined) {
		object.dom.accent.textContent = object.accent;
		$ui.addClass(object.dom, 'has-accent');
	} 
	
	// Handle our touch events
	object.dom.ontouchstart = function() {
		this.style.backgroundColor = $ui.config.brandColor;
		if ($ui.config.inHeadUnit === true) {
			object.dom.accent.style.color = '';
		}
	}
	object.dom.ontouchend = function() {
		this.style.backgroundColor = '';
		if ($ui.config.inHeadUnit === true) {
			object.dom.accent.style.color = $ui.config.brandColor;
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
		var event = new $ui_ListEvent(this.model, $ui.GenericListItem.ONCLICK);
		this.model.parent._onaction(this.model, event);
	},false);

	return object.dom;
}

$ui_GenericListItem.prototype = new $ui_CoreComponent();
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

	// Private function to handle clean-up
	object._destroy = function(value) {
		// See if there was an overflow added to the dom
		if (this.dom.menuOverflow != undefined) {
			this.dom.menuOverflow.postListItem = undefined;
			this.dom.menuOverflow._destroy();
			if (this.dom.menuOverflow.parentNode == this.screen.dom) {
				this.screen.dom.removeChild(this.dom.menuOverflow);
			}
		}
		if (this._original.items) {
			this.items = [];
			for (var i = 0; i < this._original.items.length; i++) {
				this.items.push(this._original.items[i]);
			}
		}
	}
	object._destroy = object._destroy.bind(object);
	
	// Broker the onaction from a list item
	object._onaction = function(item, event) {
		if (this.onaction) {
			this.selected = item;
			this.onaction(event);
		}
	}
	object._onaction = object._onaction.bind(object);
	
	// Create the DOM for a list item depending on the list type
	object._createItemDom = function(item) {
		// Find and create the list item
		var i,
			extension,
			dom;
		for (i = 0; i < $ui.definitions.length; i++) {
			extension = $ui.definitions[i];
			if (extension.type != $ui.ExtensionType.LISTITEM) continue;
			if (extension.component == this.style) {
				dom = new extension.constructor(item,this.screen);
				break;
			}
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
	
	// Public function to add a new item to the list
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
	
	// Public function to remove an existing item from the list
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
	
	// Public function to insert a new item into the list
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
	
	// Refresh all the items in the list
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
	
	// Add a batch of items to the end of a list
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
	
	// Cycle through list items
	var i,
		item,
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
function $ui_ListEvent(target, eventType, data) {
	this.target = target;
	this.eventType = eventType;
	this.data = data;
}
function $ui_SegmentedControl(object, screen) {
	$ui_CoreComponent.call(this, object, screen);
	$ui.addClass(object.dom,'ui-segmented-control');	
	object.domOptions = [];
	
	// Public function to set the selected index for the control
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
					this.style.backgroundColor = $ui.config.brandColor;
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
function $ui_Spinner(object, screen){
	$ui_CoreComponent.call(this, object, screen);
	object.size = (object.size) ? object.size : $ui.Spinner.MEDIUM;
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
		if ($ui.config.inHeadUnit == true) {
			$ui.addClass(object.dom.innerDiv, 'light');
		} else {
			$ui.addClass(object.dom.innerDiv, 'dark');
		}
	}

	return object.dom
}

$ui_Spinner.prototype = new $ui_CoreComponent();
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
	object.dom.leftCol.style.borderRightColor = $ui.config.brandColor;
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
	
	// Public function to select a tab
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
			item.setVisible(false);
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
		tab.setVisible(true);
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
		
		if (tile.style == undefined) { 
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
		} else if (tile.style == $ui.Tile.WIDE) { 
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
		} else if (tile.style == $ui.Tile.TALL) { 
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
			if (tile.style == undefined) {
				// Add one row and take the first slot
				if (object._is3Columns == true) {
					this.matrix.push([1,0,0]);
				} else {
					this.matrix.push([1,0,0,0]);
				}
				this._setTileTopLeft(tile,this.matrix.length-1,0);
			} else if (tile.style == $ui.Tile.WIDE) {
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
		
		if (object.backCaption) {
			object.dom.backBar = document.createElement('div');
			$ui.addClass(object.dom.backBar,'back-bar');
			$ui.addClass(object.dom,'has-back');
			object.dom.backBar.style.borderBottomColor = $ui.config.brandColor;
			object.dom.appendChild(object.dom.backBar);
			object.dom.backCaption = document.createElement('span');
			object.dom.backCaption.textContent = object.backCaption;
			object.dom.backCaption.model = object;
			$ui.addClass(object.dom.backCaption,'caption');
			object.dom.backBar.appendChild(object.dom.backCaption);
			object.dom.backCaption.onclick = function() {
				$ui.playTouchSound();
				this.model.container.pop();
			}
		}
		
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
		
		return object.dom;
	}
}

$ui_WindowPane.prototype = new $ui_CoreScreen();


