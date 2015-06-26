/* Copyright (c) 2015 Workshop 12 Inc. */
function switchScreen() {
	this.component = $ui.WindowPane;
	this.animated = true;
	this.backCaption = 'Back';
	this.content = [
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
			caption: 'Enabled',
			provider: {
				id: 'screenData',
				property: 'enabled'
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
			isMomentary: (data.isMomentary == true),
			enabled: (data.enabled == false) ? false : true
		}
		this.screenData.data = providerData;
	}
}