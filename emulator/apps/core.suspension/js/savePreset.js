/* Copyright (c) 2015 Workshop 12 Inc. */
function savePreset() {
	this.component = $ui.WindowPane;
	
	this.animated = true;
	
	this.backCaption = 'Save Height As:',
	
	this.content = [
		{
			component: $ui.List,
			id: 'presetList',
			style: $ui.SuspensionListItem,
			provider: {
				id: 'presetProvider',
				property: 'items'
			},
			onaction: function(event) {
				if (event && event.target && event.target.preset) {
					$system.suspension.savePreset(event.target.preset);
					$ui.pop();
				}
			}
		}
	];
	
	this.attachedObjects = [
		{
			component: $ui.DataProvider,
			id: 'presetProvider'
		}
	]
	
	// Load the screen
	this.onshow = function(data) {
		this.presetProvider.data = data;
	}
	
}