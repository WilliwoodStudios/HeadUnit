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
			}
		},
		{
			component: $ui.Toggle,
			caption: 'Show in switch app',
			provider: {
				id: 'screenData',
				property: 'shown'
			}
		}
	];
	
	this.attachedObjects = [
		{
			component: $ui.DataProvider,
			id: 'screenData'
		}	
	];
	
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
	
	// Handle the verifying and saving of the content
	this.onbackclick = function() {
		// Notify others if something has changed
		if (this.screenData.getUpdatedFields().length > 0) {
			var data = this.screenData.data,
				payload = {
					name: (data.name && data.name.length > 0) ? data.name : 'Unused',
					isMomentary: data.isMomentary,
					shown: (data.name == undefined || data.name.length == 0) ? false : data.shown,
					board: data.board,
					bank: data.bank
				},
				event = new $ui.DataEvent('relay_switch_config_change',payload);
			$core.raiseEvent(event);
		}
	}
}