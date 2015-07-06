/* Copyright (c) 2015 Workshop 12 Inc. */
function switchScreen() {
	this.component = $ui.WindowPane;
	this.animated = true;
	this.backCaption = 'Back';
	this.content = [
		{
			component: $ui.Input,
			hint: 'Switch Name',
			provider: {
				id: 'screenData',
				property: 'name'
			},
			onchange: function() {
				this.screen.fireChangeEvent();
			}
		},
		{
			component: $ui.Toggle,
			id: 'momentarySwitch',
			caption: 'Is this a momentary switch?',
			visible: false,
			provider: {
				id: 'screenData',
				property: 'isMomentary'
			},
			onclick: function() {
				this.screen.fireChangeEvent();
			}
		},
		{
			component: $ui.Toggle,
			caption: 'Show in app',
			provider: {
				id: 'screenData',
				property: 'shown'
			},
			onclick: function() {
				this.screen.fireChangeEvent();
			}
		},
		{
			component: $ui.Input,
			inputType: $ui.Input.InputType.FLOAT,
			id: 'timer',
			hint: 'Timer in seconds (empty for no timer)',
			onchange: function() {
				this.screen.fireChangeEvent();
			}
		},
		{
			component: $ui.Input,
			id: 'positiveLabel',
			visible: false,
			hint: 'Positive Label',
			provider: {
				id: 'screenData',
				property: 'positiveLabel'
			},
			onchange: function() {
				this.screen.fireChangeEvent();
			}
		},
		{
			component: $ui.Input,
			id: 'negativeLabel',
			visible: false,
			hint: 'Negative Label',
			provider: {
				id: 'screenData',
				property: 'negativeLabel'
			},
			onchange: function() {
				this.screen.fireChangeEvent();
			}
		},
	];
	
	this.attachedObjects = [
		{
			component: $ui.DataProvider,
			id: 'screenData'
		}	
	];
	
	// Load our data
	this.onshow = function(data) {
		if (data == undefined) return;
		if (data.isPolaritySwitch != true) {
			this.momentarySwitch.visible = true;
		} else {
			this.positiveLabel.visible = true;
			this.negativeLabel.visible = true;
		}
		var providerData = {
			name: data.title,
			isMomentary: (data.isMomentary == true),
			shown: (data.shown == false) ? false : true,
			board: data.board,
			bank: data.bank,
			positiveLabel: data.positiveLabel,
			negativeLabel: data.negativeLabel,
			isPolaritySwitch: data.isPolaritySwitch
		}
		if (data.duration != undefined && typeof(data.duration)=="number" && !isNaN(data.duration)) {
			this.timer.text = data.duration/1000;
		} else {
			this.timer.text = "";
		}
		this.screenData.data = providerData;
	}
	
	// Notify others of changes
	this.fireChangeEvent = function() {
		var duration = undefined;
		if (this.timer && this.timer.text) {
			duration = parseFloat(this.timer.text);
			if (isNaN(duration)) {
				duration = undefined;
			} else {
				duration *= 1000;
				duration = Math.floor(duration);
				if (duration < 0) {
					duration = undefined;
				}
			}
		}

		var data = this.screenData.data,
			payload = {
				name: (data.name && data.name.length > 0) ? data.name : 'Unused',
				isMomentary: data.isMomentary == true,
				shown: data.shown,
				board: data.board,
				bank: data.bank,
				positiveLabel: (data.isPolaritySwitch == true && this.positiveLabel.text != undefined && this.positiveLabel.text.length > 0) ? this.positiveLabel.text : undefined,
				negativeLabel: (data.isPolaritySwitch == true && this.negativeLabel.text != undefined && this.negativeLabel.text.length > 0) ? this.negativeLabel.text : undefined,
				duration: duration,
				isPolaritySwitch: data.isPolaritySwitch
			},
			event = new $ui.DataEvent('relay_switch_config_change',payload);
		$core.raiseEvent(event);
	}
}