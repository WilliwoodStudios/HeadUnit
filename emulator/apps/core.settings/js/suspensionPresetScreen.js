/* Copyright (c) 2015 Workshop 12 Inc. */
function suspensionPresetScreen() {
	this.component = $ui.WindowPane;
	
	this.animated = true;
	
	this.backCaption = 'Back',
	
	this.content = [
		{
			component: $ui.List,
			id: 'presetList',
			style: $ui.GenericListItem,
			provider: {
				id: 'presetProvider',
				property: 'presets'
			},
			onaction: function(event) {
				if (event && event.target && event.target.index) {
					console.log('clicked: ' +event.target.title)
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
	this.onshow = function() {
		// Load up our presets
		$system.suspension.getPresetList(this.onpresetlistload);
	}
	
	// Handle the loading of the presets list
	this.onpresetlistload = function(presets) {
		if (presets == undefined) return;
		var i,
			data = {
				presets: []
			},
			preset;
		for (i = 0; i < presets.length; i++) {
			preset = presets[i];
			data.presets.push({img: 'img/suspension.png',title: preset.name,caption: 'Preset ' + preset.index, index: preset.index, hasArrow: true})
		}
		this.presetProvider.data = data;
	}.$bind(this);
}