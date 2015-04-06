/* $ws12 VERSION: 1.0.0.57*/

var $ws12 = {
	// Initialize the toolkit extensions
	init: function() {
		// Add our control extensions
		$ui.addExtension(new UIExtension('Browser', ws12_Browser));	
		$ui.addExtension(new UIExtension('DialPad', ws12_DialPad));	
		$ui.addExtension(new UIExtension('Map', ws12_Map));	
		$ui.addExtension(new UIExtension('MediaPlayer', ws12_MediaPlayer));	
		// Custom Tiles
		$ui.addExtension(new UIExtension('TileAcceleration', ws12_TileAcceleration));	
		$ui.addExtension(new UIExtension('TileBadge', ws12_TileBadge));	
		$ui.addExtension(new UIExtension('TileBraking', ws12_TileBraking));	
		$ui.addExtension(new UIExtension('TileDistance', ws12_TileDistance));
		$ui.addExtension(new UIExtension('TileFuel', ws12_TileFuel));
		$ui.addExtension(new UIExtension('TileIdle', ws12_TileIdle));
		$ui.addExtension(new UIExtension('TileIdleDetails', ws12_TileIdleDetails));
		$ui.addExtension(new UIExtension('TileMPG', ws12_TileMPG));
		$ui.addExtension(new UIExtension('TileProfile', ws12_TileProfile));
		$ui.addExtension(new UIExtension('TileRecord', ws12_TileRecord));
		$ui.addExtension(new UIExtension('TileTimer', ws12_TileTimer));
		$ui.addExtension(new UIExtension('TileWeeksActivity', ws12_TileWeeksActivity));
		$ui.addExtension(new UIExtension('TileTimeDonut', ws12_TileTimeDonut));
		$ui.addExtension(new UIExtension('TileTimeHistory', ws12_TileTimeHistory));
		// Add our list item extensions
		$ui.addExtension(new UIExtension('PhoneLogListItem', ws12_PhoneLogListItem, $ui.UIExtensionType.LISTITEM, {ONCLICK: 'onclick',INCOMING: 'incoming',OUTGOING: 'outgoing',MISSED: 'missed'}));
	}
}
function ws12_BrowserButton(object, screen) {
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
		this.style.backgroundColor = $ui.getThemeColor();
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

ws12_BrowserButton.prototype = new $ui_CoreComponent();
function ws12_Browser(object, screen) {
	$ui_CoreComponent.call(this, object, screen);
	$ui.addClass(object.dom,'ws12-browser');
	object._isIFrame = true;
	
	// Create our chrome
	object.dom.chrome = document.createElement('div');
	$ui.addClass(object.dom.chrome,'chrome');
	object.dom.appendChild(object.dom.chrome);
	object.dom.chrome.style.borderBottomColor = $ui.getThemeColor();
	
	// URL input
	object.dom.inputDiv = document.createElement('div');
	$ui.addClass(object.dom.inputDiv,'inputDiv');
	object.dom.chrome.appendChild(object.dom.inputDiv);
	object.dom.inputDiv.style.borderColor = $ui.getThemeColor();
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
	new ws12_BrowserButton(object._backBtn,screen);
	object.dom.chrome.appendChild(object._backBtn.dom);
	
	// Next button
	object._nextBtn = {style: 'next'};
	new ws12_BrowserButton(object._nextBtn,screen);
	object.dom.chrome.appendChild(object._nextBtn.dom);
	
	// Stop/Refresh button
	object._refreshBtn = {style: 'stop'};
	new ws12_BrowserButton(object._refreshBtn,screen);
	object.dom.chrome.appendChild(object._refreshBtn.dom);
	
	// New Tab button
	object._newTabBtn = {style: 'new-tab'};
	new ws12_BrowserButton(object._newTabBtn,screen);
	object.dom.chrome.appendChild(object._newTabBtn.dom);
	
	// Favorite Button
	object._favoriteBtn = {style: 'favorite'};
	new ws12_BrowserButton(object._favoriteBtn,screen);
	object.dom.chrome.appendChild(object._favoriteBtn.dom);
	
	// Bookmarks Button
	object._bookmarksBtn = {style: 'bookmarks'};
	new ws12_BrowserButton(object._bookmarksBtn,screen);
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
	
	// Public function to set the url
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

ws12_Browser.prototype = new $ui_CoreComponent();
function ws12_DialPadButton(object, screen) {
	$ui_CoreComponent.call(this, object, screen);
	$ui.addClass(object.dom,'circle-button');
	
	// Set our brand color
	object.dom.style.borderColor = $ui.getThemeColor();
	
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
		this.style.backgroundColor = $ui.getThemeColor();
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

ws12_DialPadButton.prototype = new $ui_CoreComponent();
function ws12_DialPad(object, screen) {
	$ui_CoreComponent.call(this, object, screen);
	$ui.addClass(object.dom,'ws12-dial-pad');
	
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
		dom = new ws12_DialPadButton(button,screen);
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

ws12_DialPad.prototype = new $ui_CoreComponent();
function ws12_Map(object, screen) {
	$ui_CoreComponent.call(this, object, screen);
	$ui.addClass(object.dom,'ws12-map');
	
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

ws12_Browser.prototype = new $ui_CoreComponent();
function ws12_MediaPlayer(object, screen) {
	$ui_CoreComponent.call(this, object, screen);
	$ui.addClass(object.dom,'ws12-media-player');
	
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
		this.style.backgroundColor = $ui.getThemeColor();
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
	
	// Public function to set the album
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
	
	// Public function to set the song
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
	
	// Public function to set the artist
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
	
	// Public function to set cover art
	object.setCoverArt = function(value) {
		this.coverArt = value;
		this.dom.coverArt.style.opacity = '0';
		// Now load the new image
		if (value != undefined) {
			this.dom.coverArt.loader.src = value;
		}
	}
	object.setCoverArt = object.setCoverArt.bind(object);
	
	// Public function to set duration
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
	
	// Public function to play the current song
	object.play = function(value) {
		if (this.paused == false) return;
		this.paused = false;
		this._renderPlayState();
		if (this.onplay) {
			this.onplay();
		}
	}
	object.play = object.play.bind(object);
	
	// Public function to pause the current song
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

ws12_Browser.prototype = new $ui_CoreComponent();
function ws12_PhoneLogListItem(object, screen) {
	$ui_CoreComponent.call(this, object, screen);
	$ui.addClass(object.dom, 'ws12-phone-log-list-item');
	
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
		object.dom.titleArea.style.color = $ui.getThemeColor();
	}

	// Caption
	object.dom.captionDiv = document.createElement('div');
	$ui.addClass(object.dom.captionDiv,'caption');
	object.dom.captionDiv.style.color = $ui.getThemeColor();
	object.dom.details.appendChild(object.dom.captionDiv);
	if (object.caption) {
		object.dom.captionDiv.textContent = object.caption;
	} else {
		$ui.addClass(object.dom, 'no-caption');
	}
	
	// Handle our touch events
	object.dom.ontouchstart = function() {
		this.style.backgroundColor = $ui.getThemeColor();
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

ws12_PhoneLogListItem.prototype = new $ui_CoreComponent();
function ws12_TileAcceleration(object, screen) {
	$ui_CoreTileGauge.call(this, object, screen);
	$ui.addClass(object.dom,'ws12-tile-acceleration');
	
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

ws12_TileAcceleration.prototype = new $ui_CoreTileGauge();
function ws12_TileBadge(object, screen) {
	// This tile is 1 x 1
	object._size = undefined;
	$ui_CoreTile.call(this, object, screen);
	$ui.addClass(object.dom,'ws12-tile-badge');
	
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

ws12_TileBadge.prototype = new $ui_CoreTile();
function ws12_TileBraking(object, screen) {
	$ui_CoreTileGauge.call(this, object, screen);
	$ui.addClass(object.dom,'ws12-tile-braking');
	
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

ws12_TileBraking.prototype = new $ui_CoreTileGauge();
function ws12_TileDistance(object, screen) {
	// This tile is 1 x 1
	object._size = undefined;
	$ui_CoreTile.call(this, object, screen);
	$ui.addClass(object.dom,'ws12-tile-distance');
	
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
		var R = parseInt(($ui._cutHex($ui.getThemeColor())).substring(0,2),16),
			G = parseInt(($ui._cutHex($ui.getThemeColor())).substring(2,4),16),
			B = parseInt(($ui._cutHex($ui.getThemeColor())).substring(4,6),16);	
		// Load our data
		var data = {
			labels: _labels,
			datasets: [
				{
					fillColor: 'rgba('+R+','+G+','+B+',0.2)',
					strokeColor: 'rgba('+R+','+G+','+B+',1)',
					pointColor: 'rgba('+R+','+G+','+B+',1)',
					pointStrokeColor: '#fff',
					pointHighlightFill: '#fff',
					pointHighlightStroke: 'rgba('+R+','+G+','+B+',1)',
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

ws12_TileDistance.prototype = new $ui_CoreTile();
function ws12_TileFuel(object, screen) {
	// This tile is 1 x 1
	object._size = undefined;
	$ui_CoreTile.call(this, object, screen);
	$ui.addClass(object.dom,'ws12-tile-fuel');

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
		var R = 151, 
			G = 187, 
			B = 205,
			fontColor;
		if ($ui.getThemeStyle() == $ui.ThemeStyle.DARK) {
			R = parseInt(($ui._cutHex($ui.getThemeColor())).substring(0,2),16),
			G = parseInt(($ui._cutHex($ui.getThemeColor())).substring(2,4),16),
			B = parseInt(($ui._cutHex($ui.getThemeColor())).substring(4,6),16);
		} 
		// Load our data
		var data = {
			labels: _labels,
			datasets: [
				{
					fillColor: 'rgba('+R+','+G+','+B+',0.2)',
					strokeColor: 'rgba('+R+','+G+','+B+',1)',
					pointColor: 'rgba('+R+','+G+','+B+',1)',
					pointStrokeColor: '#fff',
					pointHighlightFill: '#fff',
					pointHighlightStroke: 'rgba('+R+','+G+','+B+',1)',
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

ws12_TileFuel.prototype = new $ui_CoreTile();
function ws12_TileIdle(object, screen) {
	object._size = undefined;
	$ui_CoreTileDonutChart.call(this, object, screen);
	$ui.addClass(object.dom,'ws12-tile-idle-chart');
	
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
					colorValue = ($ui.getThemeStyle() == $ui.ThemeStyle.DARK) ? $ui.getThemeColor() : $ui.color_GREAT;
					break;
				case (this.value >= 50):
					colorValue = ($ui.getThemeStyle() == $ui.ThemeStyle.DARK) ? $ui.getThemeColor() : $ui.color_GOOD;
					break;
				default:
					colorValue = ($ui.getThemeStyle() == $ui.ThemeStyle.DARK) ? $ui.getThemeColor() : $ui.color_OK;
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
					color: ($ui.getThemeStyle() == $ui.ThemeStyle.DARK) ? $ui.color_DARK : $ui.color_LIGHT
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

ws12_TileIdle.prototype = new $ui_CoreTileDonutChart();
function ws12_TileIdleDetails(object, screen) {
	// This tile is 1 x 1
	object._size = $ui.TileSize.WIDE;
	$ui_CoreTile.call(this, object, screen);
	$ui.addClass(object.dom,'ws12-tile-idle-details');
	
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
		var graphColor = ($ui.getThemeStyle() == $ui.ThemeStyle.DARK) ? $ui.getThemeColor() : $ui.color_OK,
			R = parseInt(($ui._cutHex(graphColor)).substring(0,2),16),
			G = parseInt(($ui._cutHex(graphColor)).substring(2,4),16),
			B = parseInt(($ui._cutHex(graphColor)).substring(4,6),16);	
		// Load our data
		var data = {
			labels: this.labels,
			datasets: [
				{
					fillColor: 'rgba('+R+','+G+','+B+',0.5)',
					strokeColor: 'rgba('+R+','+G+','+B+',1)',
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

ws12_TileIdleDetails.prototype = new $ui_CoreTile();
function ws12_TileMPG(object, screen) {
	object._size = undefined;
	$ui_CoreTileDonutChart.call(this, object, screen);
	$ui.addClass(object.dom,'ws12-tile-mpg-chart');
	
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
					colorValue = ($ui.getThemeStyle() == $ui.ThemeStyle.DARK) ? $ui.getThemeColor() : $ui.color_GREAT;
					break;
				case (percent > 50):
					colorValue = ($ui.getThemeStyle() == $ui.ThemeStyle.DARK) ? $ui.getThemeColor() : $ui.color_GOOD;
					break;
				default:
					colorValue = ($ui.getThemeStyle() == $ui.ThemeStyle.DARK) ? $ui.getThemeColor() : $ui.color_OK;
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
					color: ($ui.getThemeStyle() == $ui.ThemeStyle.DARK) ? $ui.color_DARK : $ui.color_LIGHT
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

ws12_TileMPG.prototype = new $ui_CoreTileDonutChart();
function ws12_TileProfile(object, screen) {
	// This is a tall tile
	object._size = $ui.TileSize.TALL;
	$ui_CoreTile.call(this, object, screen);
	$ui.addClass(object.dom,'ws12-tile-profile');
	
	var profileTileColor = '#FDBF2F';
	
	// Create our Color wedge
	object.dom.wedge = document.createElement('div');
	$ui.addClass(object.dom.wedge, 'wedge');
	object.dom.contentDiv.appendChild(object.dom.wedge);
	// Set our coloring
	if ($ui.getThemeStyle() == $ui.ThemeStyle.DARK) {
		object.dom.wedge.style.backgroundColor = $ui.getThemeColor();
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
		object.dom.stats.style.borderColor = $ui.getThemeColor();
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
		object.dom.score.style.borderColor = $ui.getThemeColor();
		object.dom.score.number.style.color = $ui.getThemeColor();
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
		object.dom.friends.style.borderColor = $ui.getThemeColor();
		object.dom.friends.number.style.color = $ui.getThemeColor();
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
		object.dom.groups.style.borderColor = $ui.getThemeColor();
		object.dom.groups.number.style.color = $ui.getThemeColor();
	} else {
		object.dom.groups.number.style.color = profileTileColor;
	}
	
	// Create our avatar space
	object.dom.avatar = document.createElement('div');
	$ui.addClass(object.dom.avatar, 'avatar');
	object.dom.contentDiv.appendChild(object.dom.avatar);
	// Set our coloring
	if ($ui.getThemeStyle() == $ui.ThemeStyle.DARK) {
		object.dom.avatar.style.borderColor = $ui.getThemeColor();
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
		object.dom.rank.style.backgroundColor = $ui.getThemeColor();
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
		object.dom.findFriend.style.backgroundColor = $ui.getThemeColor();
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
		object.dom.findGroup.style.backgroundColor = $ui.getThemeColor();
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

ws12_TileProfile.prototype = new $ui_CoreTile();
function ws12_TileRecord(object, screen) {
	// This tile is 1 x 1
	object._size = undefined;
	$ui_CoreTile.call(this, object, screen);
	$ui.addClass(object.dom,'ws12-tile-record');
	
	// Create our stage 1 area
	object.dom.stage1 = document.createElement('div');
	$ui.addClass(object.dom.stage1,'stage-1');
	object.dom.contentDiv.appendChild(object.dom.stage1);
	
	// Create our record button
	object.dom.recordButton = document.createElement('div');
	object.dom.recordButton.model = object;
	$ui.addClass(object.dom.recordButton,'record-button');
	object.dom.recordButton.style.backgroundColor = $ui.getThemeColor();
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
			this.dom.number.style.backgroundColor = $ui.getThemeColor();
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
	
	// Public function to reset the control
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

ws12_TileRecord.prototype = new $ui_CoreTile();
function ws12_TileTimeDonut(object, screen) {
	object._size = undefined;
	$ui_CoreTileDonutChart.call(this, object, screen);
	$ui.addClass(object.dom,'ws12-tile-time-donut');
	
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
					colorValue = ($ui.getThemeStyle() == $ui.ThemeStyle.DARK) ? $ui.getThemeColor() : $ui.color_GREAT;
					break;
				case (percent > 50):
					colorValue = ($ui.getThemeStyle() == $ui.ThemeStyle.DARK) ? $ui.getThemeColor() : $ui.color_GOOD;
					break;
				default:
					colorValue = ($ui.getThemeStyle() == $ui.ThemeStyle.DARK) ? $ui.getThemeColor() : $ui.color_OK;
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
					color: ($ui.getThemeStyle() == $ui.ThemeStyle.DARK) ? $ui.color_DARK : $ui.color_LIGHT
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

ws12_TileTimeDonut.prototype = new $ui_CoreTileDonutChart();
function ws12_TileTimeHistory(object, screen) {
	// This tile is 1 x 1
	object._size = $ui.TileSize.WIDE;
	$ui_CoreTile.call(this, object, screen);
	$ui.addClass(object.dom,'ws12-tile-time-history');
	
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
		this.dom.caption.textContent = this.caption;// 'Recorded 0-60 times (sec)';
		// Get our root color
		var graphColor = ($ui.getThemeStyle() == $ui.ThemeStyle.DARK) ? $ui.getThemeColor() : $ui.color_OK,
			R = parseInt(($ui._cutHex(graphColor)).substring(0,2),16),
			G = parseInt(($ui._cutHex(graphColor)).substring(2,4),16),
			B = parseInt(($ui._cutHex(graphColor)).substring(4,6),16);	
		// Load our data
		var data = {
			labels: this.labels,
			datasets: [
				{
					fillColor: 'rgba('+R+','+G+','+B+',0.5)',
					strokeColor: 'rgba('+R+','+G+','+B+',1)',
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

ws12_TileTimeHistory.prototype = new $ui_CoreTile();
function ws12_TileTimer(object, screen) {
	// This tile is 1 x 2
	object._size = $ui.TileSize.WIDE;
	$ui_CoreTile.call(this, object, screen);
	$ui.addClass(object.dom,'ws12-tile-timer');
	
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
	
	// Public function to reset the control
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
	
	// Public function to start the control
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
	
	// Public function to stop the control
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
	
	// Public function to get the time in milliseconds
	object.getMilliseconds = function() {
		return this._milliseconds;
	}
	object.getMilliseconds = object.getMilliseconds.bind(object);
	
	// Public function to get the time in seconds
	object.getSeconds = function() {
		return (this._milliseconds/1000).toFixed(1);
	}
	object.getSeconds = object.getSeconds.bind(object);
	
	// Public function to get the time in minutes
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

ws12_TileTimer.prototype = new $ui_CoreTile();
function ws12_TileWeeksActivity(object, screen) {
	// This tile is wide 1 x 2
	object._size = $ui.TileSize.WIDE;
	$ui_CoreTile.call(this, object, screen);
	$ui.addClass(object.dom,'ws12-tile-weeks-activity');
	
	return object.dom;
}

ws12_TileWeeksActivity.prototype = new $ui_CoreTile();
