/* Copyright (c) 2015 Workshop 12 Inc. */
function main() {
	this.component = $ui.WindowPane;
	
	this.presetSelected = true;

	this.content = [
		/***************** Smartphone START ***********************/
		{
			component: $ui.DockLayout,
			id: 'dockLayout',
			visible: false,
			dock: [{
				component: $ui.SegmentedControl,
				selectedIndex: 0,
				options: ['Pressure', 'Presets'],
				onclick: function() {
					if (this.selectedIndex === 0) {
						this.screen.tabbedPane.selectTab(this.screen.pressureTab);
					} else {
						this.screen.tabbedPane.selectTab(this.screen.presetTab);
					}
				}
			}],
			content: [
				{
					component: $ui.TabbedPane,
					id: 'tabbedPane',
					tabs: [
						{
							component: $ui.Tab,
							id: 'pressureTab',
							content:[]
						},
						{
							component: $ui.Tab,
							id: 'presetTab',
							content:[]
						}
					]
				}
			]
		},	
		/***************** Smartphone END ***********************/	
		{
			component: $ui.ColumnLayout,
			id: 'mainColumnLayout',
			fillToParent: true,
			columns: [
				{
					component: $ui.Column,
					borderRight: true,
					content: [
						{
							component: $ui.DockLayout,
							id: 'presetDock',
							location: $ui.DockLayout.DockLocation.BOTTOM,
							dock: [
								{
						            component: $ui.Button,
									id: 'conditionButton',
						            caption: 'Add Condition',
									onclick: function() {
										if (this.screen.presetSelected == true) {
											
										} else {
											var i,
												item,
												data = {
													items: []
												};
											for (i = 0; i < this.screen.presetList.items.length; i++) {
												item = this.screen.presetList.items[i];
												if (item.component != $ui.Header) {
													data.items.push({caption: item.caption, index: item.index});
												}
											}
											$ui.push(savePreset, data);
										}
									}
						        }
							],
							content: [
								{
									component: $ui.List,
									id: 'presetList',
									style: $ui.SuspensionListItem,
									provider: {
										id: 'presetListProvider',
										property: 'presets'
									},
									onaction: function(event) {
										if (event && event.target && event.target.index != undefined) {
											$system.suspension.choosePreset(event.target.index);
										}
									}
								}
							]
						}
					]
				},
				{
					component: $ui.Column,
					span: 2,
					content: [
						{
							component: $ui.Suspension,
							id: 'suspensionDisplay',
							img: 'img/cartop.png',
							onrightfrontclick: function() {
								if (window.$core) {
									var systemEvent = new $ui.DataEvent($system.EventType.ONREQUESTSUSPENSIONUI, {corner: 'rf'});
									$core.raiseEvent(systemEvent);
								}
							},
							onleftfrontclick: function() {
								if (window.$core) {
									var systemEvent = new $ui.DataEvent($system.EventType.ONREQUESTSUSPENSIONUI, {corner: 'lf'});
									$core.raiseEvent(systemEvent);
								}
							},
							onleftrearclick: function() {
								if (window.$core) {
									var systemEvent = new $ui.DataEvent($system.EventType.ONREQUESTSUSPENSIONUI, {corner: 'lr'});
									$core.raiseEvent(systemEvent);
								}
							},
							onrightrearclick: function() {
								if (window.$core) {
									var systemEvent = new $ui.DataEvent($system.EventType.ONREQUESTSUSPENSIONUI, {corner: 'rr'});
									$core.raiseEvent(systemEvent);
								}
							}
						}
					]
				}
			]
		}
		
	];

	this.attachedObjects = [
		{
			component: $ui.DataProvider,
			id: 'presetListProvider',
			onbeforeload: function(data) {
				if (data == undefined || data.presets == undefined) return;
				var header = {
						component: $ui.Header,
						caption: 'Height Presets'
					};
				if (data.presets.length == 0) {
					data.presets.push(header);
				} else {
					data.presets.splice(0,0,header);
				}
			}
		}	
	];

	// If this is a mobile device then we need to re-arrange the screen
	this.oncreate = function() {
		if ($system.isClientDevice == true) {
			var mainColumnLayout = this.content[1],
				dockLayout = this.content[0],
				pressureTab = dockLayout.content[0].tabs[0],
				presetTab = dockLayout.content[0].tabs[1],
				presetDock = mainColumnLayout.columns[0].content[0],
				suspension = mainColumnLayout.columns[1].content[0];
			// Set our visibility state
			mainColumnLayout.visible = false;
			dockLayout.visible = true;
			// Move our controls
			pressureTab.content.push(suspension);
			presetTab.content.push(presetDock);
			// Remove the column layout
			this.content.splice(1,1);
		}
	};
	
	// Listen for our system events
	this.onshow = function() {
		$ui.addEventListener($system.EventType.ONSUSPENSIONDATA, this.onsuspensiondata, this);
		$ui.addEventListener($system.EventType.ONSUSPENSIONADJUSTED, this.onsuspensionadjusted, this);
		$ui.addEventListener($system.EventType.ONSUSPENSIONPRESET, this.onsuspensionpreset, this);
		$ui.addEventListener($system.EventType.ONSUSPENSIONSETTINGSCHANGE, this.onsuspensionsettingschange, this);
		// Load up our presets
		$system.suspension.getPresetList(this.onpresetlistload);
	};
	
	// Update the suspension levels
	this.onsuspensiondata = function(event) {
		if (event && event.data) {
			this.suspensionDisplay.leftFront = event.data.lf;
			this.suspensionDisplay.leftRear = event.data.lr;
			this.suspensionDisplay.rightFront = event.data.rf;
			this.suspensionDisplay.rightRear = event.data.rr;
			this.suspensionDisplay.tank = event.data.tank;
		}
	}.$bind(this);
	
	// Reset preset state because user manually adjusted a corner
	this.onsuspensionadjusted = function(event) {
		this.conditionButton.caption = 'Save Preset';
		this.presetSelected = false;
		for (var i = 0; i < this.presetList.items.length; i++) {
			this.presetList.items[i].selected = false;
		}
	}.$bind(this);
	
	// A preset has been selected or saved
	this.onsuspensionpreset = function(event) {
		if (event && event.data) {
			this.screen.presetSelected = true;
			this.screen.conditionButton.caption = 'Add Condition';
			var i, 
				item;
			for (i = 0; i < this.presetList.items.length; i++) {
				item = this.presetList.items[i];
				if (item.index == event.data) {
					item.selected = true;
				}
			}
		}
	}.$bind(this);
	
	// Someone saved an update to the settings for a preset
	this.onsuspensionsettingschange = function(event) {
		if (event == undefined || event.data == undefined) return;
		var i,
			preset;
		for (i = 0; i < this.presetList.items.length; i++) {
			preset = this.presetList.items[i];
			if (preset.index == event.data.index)
			this.presetList.items[i].selected = false;
		}
	}.$bind(this);
	
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
			data.presets.push({caption: preset.name, index: preset.index, selected: (i == 0)})
		}
		this.presetListProvider.data = data;
		$system.suspension.requestCurrentData();
	}.$bind(this);
}