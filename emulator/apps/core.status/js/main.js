/* Copyright (c) 2015 Workshop 12 Inc. */
function main() {
	this.component = $ui.WindowPane;
	
	this.content = [
		/***************** Smartphone START ***********************/
		{
			component: $ui.DockLayout,
			id: 'dockLayout',
			visible: false,
			dock: [{
				component: $ui.SegmentedControl,
				selectedIndex: 0,
				options: ['Status', 'Readiness'],
				onclick: function() {
					if (this.selectedIndex === 0) {
						this.screen.tabbedPane.selectTab(this.screen.statusTab);
					} else {
						this.screen.tabbedPane.selectTab(this.screen.readyTab);
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
							id: 'statusTab',
							content:[]
						},
						{
							component: $ui.Tab,
							id: 'readyTab',
							content:[]
						}
					]
				}
			]
		},	
		/***************** Smartphone END ***********************/	
		{
			component: $ui.TileGroup,
			tiles: [
				{
					component: $ui.TileBadge,
					provider: {
						id: 'badgeProvider',
						property: 'badge'
					},
					onclick: function() {
						$system.obd.confirmCodeClear();
					}
				},
				{
					component: $ui.TileDescription,
					provider: {
						id: 'badgeProvider',
						property: 'description'
					},
					onclick: function() {
						console.log('clicked description')
					}
				}
			]
		},
		{
			component: $ui.ControlGroup,
			content: [
				{
					component: $ui.List,
					id: 'readinessList',
					style: $ui.GenericListItem,
					items: [
						{
							component: $ui.Header,
							caption: 'System Readiness Check'	
						},
						{
							obdProperty: 'misFire',
							visible: false,
							title: 'Misfire'
						},
						{	
							obdProperty: 'fuelSystem',
							visible: false,
							title: 'Fuel System'
						},
						{
							obdProperty: 'components',
							visible: false,
							title: 'Components'
						},
						{
							obdProperty: 'catalyst',
							visible: false,
							title: 'Catalyst'
						},
						{
							obdProperty: 'heatedCatalyst',
							visible: false,
							title: 'Heated Catalyst'
						},
						{
							obdProperty: 'evaporativeSystem',
							visible: false,
							title: 'Evaporative System'
						},
						{
							obdProperty: 'secondaryAirSystem',
							visible: false,
							title: 'Secondary Air System'
						},
						{
							obdProperty: 'acRefrigerant',
							visible: false,
							title: 'Air Conditioning Refrigerant'
						},
						{
							obdProperty: 'oxygenSensor',
							visible: false,
							title: 'Oxygen (O2) Sensor'
						},
						{
							obdProperty: 'oxygenSensorHeater',
							visible: false,
							title: 'Oxygen (O2) Sensor Heater'
						},
						{
							obdProperty: 'egrSystem',
							visible: false,
							title: 'Exhaust Gas Recirculation/VVT'
						},
						{
							obdProperty: 'nmhcCatalystTest',
							visible: false,
							title: 'NMHC Catalyst'
						},
						{
							obdProperty: 'noxScrMonitorTest',
							visible: false,
							title: 'NOx/SCR Monitor'
						},
						{
							obdProperty: 'boostPressureTest',
							visible: false,
							title: 'Boost Pressure'
						},
						{
							obdProperty: 'exhaustGasSensorTest',
							visible: false,
							title: 'Exhaust Gas Sensor'
						},
						{
							obdProperty: 'pmFilterMonitoringTest',
							visible: false,
							title: 'PM Filter'
						},
						{
							obdProperty: 'egrVvtSystemTest',
							visible: false,
							title: 'EGR/Variable Valve Timing'
						}
					]
				},
				{
					component: $ui.Spinner,
					id: 'spinner',
					size: $ui.Size.LARGE
				}
			]	
		}
	];
	
	this.attachedObjects = [
		{
			component: $ui.DataProvider,
			id: 'badgeProvider'
		}	
	];
	
	// If this is a mobile device then we need to re-arrange the screen
	this.oncreate = function() {
		if ($system.isClientDevice == true) {
			var tileGroup = this.content[1],
				dockLayout = this.content[0],
				readinessList = this.content[2],
				statusTab = dockLayout.content[0].tabs[0],
				readyTab = dockLayout.content[0].tabs[1];
			// Set our visibility state
			//tileGroup.visible = false;
			dockLayout.visible = true;
			// Move our controls
			statusTab.content.push(tileGroup);
			readyTab.content.push(readinessList);
			// Remove the column layout
			this.content.splice(1,2);
		}
	};
	
	// Request data from the vehicle
	this.onshow = function() {
		$system.obd.getOBDStatus(this.onobdstatussuccess, this.onobdstatusfail);
	};
	
	// Vehicle is connected and ready so ask for test status data
	this.onobdstatussuccess = function(data) {
		if (data && (data.result == 1) && (data.obd.deviceConnected == true) && (data.obd.vehicleConnected == true)) {
			$system.obd.getTestStatus(this.onteststatusscuccess, this.onteststatusfail);
		}
	}.$bind(this);
	
	// Vehicle is not ready for testing the status
	this.onobdstatusfail = function(data) {
		console.log('OBDStatusError');
		console.log(data);
	}.$bind(this);
	
	// update the screen to show no trouble codes
	this.showNoDTC = function() {
		var data = {
				badge: {
					caption: '<large>GREAT!</large>',
					img: 'img/happy.png',
					accent: 'No codes detected'
				},
				description: {
					accent: '',
					caption: 'No System Issues Found'
				}
			}
		this.badgeProvider.data = data;
	}.$bind(this);
	
	// Test status has been returned
	this.onteststatusscuccess = function(data) {
		if (data && (data.result == 1)) {
			// Handle MIL on
			if (data.obd.milOn == true) {
				$system.obd.getDTC(this.ondtcsuccess, this.ondtcfail);
			} else {
				this.showNoDTC();
			}
			// Cycle through list items to display their status
			var i,
				item,
				test;
			for (i = 0; i < this.readinessList.items.length; i++) {
				item = this.readinessList.items[i];
				if (item.component == $ui.Header) continue; // Skip any headers
				test = data.obd.tests.sinceDtcCleared[item.obdProperty];
				item.visible = (test.available == true);
				if (item.visible == true) {
					if (test.incomplete == true) {
						item.img = 'img/warning.png';
						item.caption = 'Incomplete';
						item.accent = 'Vehicle has not completed its system checks';
					} else {
						item.img = 'img/checkmark.png';
						item.caption = 'Complete';
					}
				}
			}
		}
		this.spinner.visible = false;
	}.$bind(this);
	
	// Error trying to retrieve the test status
	this.onteststatusfail = function(data) {
		console.log('OBDTestError');
		console.log(data);
		this.spinner.visible = false;
	}.$bind(this);
	
	// Handle the return of trouble codes
	this.ondtcsuccess = function(data) {
		if (data && (data.result == 1)) {
			var codes = data.obd.dtcCodes;
			if (codes && codes.length > 0) {
				var code = codes[0],
					data = {
						badge: {
							caption: '<large>'+ code.code+'</large>',
							img: 'img/badge_engine_trouble.png',
							accent: 'Tap engine to clear codes'
						},
						description: {
							accent: 'Tap for more details',
							caption: code.title
						}
					}
				this.badgeProvider.data = data;
			} else {
				this.showNoDTC();
			}
		}
	}.$bind(this);
	
	// Handle the fail of a trouble code retrieval
	this.ondtcfail = function(data) {
		console.log('OBDDTCError');
		console.log(data);
	}.$bind(this);
}