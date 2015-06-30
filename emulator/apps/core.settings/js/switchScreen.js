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
			component: $ui.Toggle,
			//style: $ui.Toggle.Style.Momentary,
			caption: 'Test',
			duration: 5000,
			onclick: function() {
				
			}
		}
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
		}
		var providerData = {
			name: data.title,
			isMomentary: (data.isMomentary == true),
			shown: (data.shown == false) ? false : true,
			board: data.board,
			bank: data.bank
		}
		this.screenData.data = providerData;
	}
	
	// Notify others of changes
	this.fireChangeEvent = function() {
		var data = this.screenData.data,
			payload = {
				name: (data.name && data.name.length > 0) ? data.name : 'Unused',
				isMomentary: data.isMomentary == true,
				shown: data.shown,
				board: data.board,
				bank: data.bank,
				isPolaritySwitch: data.isPolaritySwitch
			},
			event = new $ui.DataEvent('relay_switch_config_change',payload);
		$core.raiseEvent(event);
	}
}