/* Copyright (c) 2015 Workshop 12 Inc. */
function quarterMile() {
	this.component = $ui.WindowPane;
	this.animated = true;	
	this.backCaption = 'Back';
	
	this.content = [
		{
			component: $ui.TileGroup,
			visible: ($system.isClientDevice == true) ? false : true,
			tiles: [
				{
					component: $ui.TileRecord,
					id: 'recordTile',
					caption: 'Record 1/4 Mile',
					countdown: true,
					onstartclick: function() {
						this.screen.timerTile.reset();
					},
					onrecord: function() {
						this.screen.timerTile.start();
						$system.audio.playSoundEffect($system.SoundEffect.HORN);
						// Fake out a 10 second run in the emulator
						if ($system.config.isEmulator == true || true) { // TODO - fix
							$ui.toast('The emulator simulates a 10 second 1/4 mile.');
							var screen = this.screen;
							window.setTimeout(function() {
								screen.fakeout();
							},10000);
						}
					},
					oncountdown: function() {
						$system.audio.playSoundEffect($system.SoundEffect.BLIP);
					}
				},
				{
					component: $ui.TileTimer,
					id: 'timerTile'
				}
			]
		},
		{
			component: $ui.Header,
			caption: 'Recorded Times'
		},
		{
			component: $ui.TileGroup,
			tiles: [
				{
					component: $ui.TileTimeDonut,
					provider: {
						id: 'quarterMileProvider',
						property: 'quarterMile'
					}
				},
				{
					component: $ui.TileTimeHistory,
					provider: {
						id: 'quarterMileProvider',
						property: 'quarterMileHistory'
					}
				},
				{
					component: $ui.TileTimeDonut,
					//animated: false,
					targetHigh: true,
					provider: {
						id: 'quarterMileProvider',
						property: 'quarterMileMPH'
					}
				},
				{
					component: $ui.TileTimeHistory,
					//animated: false,
					provider: {
						id: 'quarterMileProvider',
						property: 'quarterMileMPHHistory'
					}
				},
				{
					component: $ui.TileTimeDonut,
					animated: false,
					provider: {
						id: 'quarterMileProvider',
						property: 'reactionTime'
					}
				},
				{
					component: $ui.TileTimeHistory,
					animated: false,
					provider: {
						id: 'quarterMileProvider',
						property: 'reactionTimeHistory'
					}
				},
				{
					component: $ui.TileTimeDonut,
					animated: false,
					provider: {
						id: 'quarterMileProvider',
						property: 'sixtyFoot'
					}
				},
				{
					component: $ui.TileTimeHistory,
					animated: false,
					provider: {
						id: 'quarterMileProvider',
						property: 'sixtyFootHistory'
					}
				},
				{
					component: $ui.TileTimeDonut,
					animated: false,
					provider: {
						id: 'quarterMileProvider',
						property: 'threeThirtyFoot'
					}
				},
				{
					component: $ui.TileTimeHistory,
					animated: false,
					provider: {
						id: 'quarterMileProvider',
						property: 'threeThirtyFootHistory'
					}
				},
				{
					component: $ui.TileTimeDonut,
					animated: false,
					provider: {
						id: 'quarterMileProvider',
						property: 'eighthMile'
					}
				},
				{
					component: $ui.TileTimeHistory,
					animated: false,
					provider: {
						id: 'quarterMileProvider',
						property: 'eighthMileHistory'
					}
				},
				{
					component: $ui.TileTimeDonut,
					animated: false,
					targetHigh: true,
					provider: {
						id: 'quarterMileProvider',
						property: 'eighthMileMPH'
					}
				},
				{
					component: $ui.TileTimeHistory,
					animated: false,
					provider: {
						id: 'quarterMileProvider',
						property: 'eighthMileMPHHistory'
					}
				}
			],
			attachedObjects: [
				{
					component: $ui.DataProvider,
					id: 'quarterMileProvider'
				}
			]
		}	
	];
	
	this.onshow = function() {
		// Set the screen data
		var data = {
			quarterMile: {
				target: 12.4,
				value: 13.21,
				accent: 'Your Best Time',
				caption: 'sec 1/4 mile'
			},
			quarterMileHistory: {
				labels: ['Apr 10/14','May 12/14','Jul 18/14','Aug 22/14'],
				data: [14.4,13.5,13.9,13.21],
				caption: '1/4 mile times (sec)'
			},
			quarterMileMPH: {
				target: 130,
				value: 117.06,
				accent: 'Your Best Speed',
				caption: 'mph 1/4 mile'
			},
			quarterMileMPHHistory: {
				labels: ['Apr 10/14','May 12/14','Jul 18/14','Aug 22/14'],
				data: [105,116.2,112.56,117.06],
				caption: '1/4 mile speed (mph)'
			},
			reactionTime: {
				target: 0.4,
				value: 1.353,
				accent: 'Best Reaction Time',
				caption: 'sec R/T'
			},
			reactionTimeHistory: {
				labels: ['Apr 10/14','May 12/14','Jul 18/14','Aug 22/14'],
				data: [1.5,1.4,1.5,1.353],
				caption: 'Reaction times (sec)'
			},
			sixtyFoot: {
				target: 2.0,
				value: 2.481,
				accent: 'Best 60 ft Time',
				caption: 'sec 60 ft'
			},
			sixtyFootHistory: {
				labels: ['Apr 10/14','May 12/14','Jul 18/14','Aug 22/14'],
				data: [3,2.5,2.7,2.481],
				caption: 'Sixty Foot times (sec)'
			},
			threeThirtyFoot: {
				target: 4,
				value: 4.8,
				accent: 'Best 330 ft Time',
				caption: 'sec 330 ft'
			},
			threeThirtyFootHistory: {
				labels: ['Apr 10/14','May 12/14','Jul 18/14','Aug 22/14'],
				data: [5.5,6,4.8,5],
				caption: '330 Foot times (sec)'
			},
			eighthMile: {
				target: 7,
				value: 7.21,
				accent: 'Best 1/8 mile Time',
				caption: 'sec 1/8 mile'
			},
			eighthMileHistory: {
				labels: ['Apr 10/14','May 12/14','Jul 18/14','Aug 22/14'],
				data: [9.1,8.3,8.2,7.21],
				caption: '1/8 mile times (sec)'
			},
			eighthMileMPH: {
				target: 102,
				value: 98.25,
				accent: 'Your Best Speed',
				caption: 'mph 1/8 mile'
			},
			eighthMileMPHHistory: {
				labels: ['Apr 10/14','May 12/14','Jul 18/14','Aug 22/14'],
				data: [98,97,95,98.25],
				caption: '1/8 mile speed (mph)'
			},
		};
		// Populate the data provider
		this.quarterMileProvider.data = data; 
	};
	
	// Handle any speed change events
	this.fakeout = function() {
		// Stop and reset our tiles
		this.timerTile.stop();
		this.recordTile.reset();
		var date = new Date(),
			months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
			formattedDate = months[date.getMonth()] +' ' + date.getDate() + '/' + (date.getFullYear() - 2000),
			existing = this.quarterMileProvider.data,
			data = { // Retrieve the existing data
				quarterMile: existing.quarterMile,
				quarterMileHistory: existing.quarterMileHistory,
				quarterMileMPH: existing.quarterMileMPH,
				quarterMileMPHHistory: existing.quarterMileMPHHistory,
				reactionTime: existing.reactionTime,
				reactionTimeHistory: existing.reactionTimeHistory,
				sixtyFoot: existing.sixtyFoot,
				sixtyFootHistory: existing.sixtyFootHistory,
				threeThirtyFoot: existing.threeThirtyFoot,
				threeThirtyFootHistory: existing.threeThirtyFootHistory,
				eighthMile: existing.eighthMile,
				eighthMileHistory: existing.eighthMileHistory,
				eighthMileMPH: existing.eighthMileMPH,
				eighthMileMPHHistory: existing.eighthMileMPHHistory
			};
		// Set our new values
		data.quarterMile.value = this.timerTile.getSeconds();
		data.quarterMileHistory.labels.push(formattedDate);
		data.quarterMileMPH.value = 127.08;
		data.quarterMileMPHHistory.labels.push(formattedDate);
		data.quarterMileMPHHistory.data.push(data.quarterMileMPH.value);
		data.quarterMileHistory.data.push(data.quarterMile.value);
		data.reactionTime.value = 0.749;
		data.reactionTimeHistory.labels.push(formattedDate);
		data.reactionTimeHistory.data.push(data.reactionTime.value);
		data.sixtyFoot.value = 1.667;
		data.sixtyFootHistory.labels.push(formattedDate);
		data.sixtyFootHistory.data.push(data.sixtyFoot.value);
		data.threeThirtyFoot.value = 4.615;
		data.threeThirtyFootHistory.labels.push(formattedDate);
		data.threeThirtyFootHistory.data.push(data.threeThirtyFoot.value);
		data.eighthMile.value = 7.04;
		data.eighthMileHistory.labels.push(formattedDate);
		data.eighthMileHistory.data.push(data.eighthMile.value);
		data.eighthMileMPH.value = 100.28;
		data.eighthMileMPHHistory.labels.push(formattedDate);
		data.eighthMileMPHHistory.data.push(data.eighthMileMPH.value);
		// Populate the data provider
		this.quarterMileProvider.data = data; 
	}.$bind(this);
}

