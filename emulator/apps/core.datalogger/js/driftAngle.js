/* Copyright (c) 2015 Workshop 12 Inc. */
function driftAngle() {
	this.component = $ui.WindowPane;
	this.animated = true;
	this.backCaption = 'Back';
	
	this.content = [
		{
			component: $ui.TileGroup,
			tiles: [
				{
					component: $ui.TileRecord,
					id: 'recordTile',
					caption: 'Record Drift Angle',
					onstartclick: function() {
						this.screen.angleTile.angle = 0;
					},
					onstopclick: function() {
						window.clearInterval(this.screen._interval);
						this.screen.angleTile.angle = 0;
						this.screen.recordingFinished();
					},
					onrecord: function() {
						// Fake out our angles in the emulator
						if ($system.config.isEmulator == true || true) { // TODO - fix
							$ui.toast('The emulator simulates a short drifting run');
							var screen = this.screen;
							screen._angle = 1;
							// Slide Left
							screen._interval = window.setInterval(function() {
								var step = 10;
								if (screen._angle < 62) {
									screen._angle = screen._angle + step;
									screen.angleTile.angle = screen._angle;
								} else {
									window.clearInterval(screen._interval);
									// Slide right
									screen._interval = window.setInterval(function() {
										if (screen._angle > -105) {
											screen._angle = screen._angle - step;
											screen.angleTile.angle = screen._angle;
										} else {
											window.clearInterval(screen._interval);
											screen.angleTile.angle = 0;
											screen.recordingFinished();
										}
									}, 100);
								}
							},100);
						}
					},
				},
				{
					component: $ui.TileDriftAngle,
					id: 'angleTile',
					img: 'img/cartop.png',
				},
				{
					component: $ui.TileTimeDonut,
					targetHigh: true,
					provider: {
						id: 'angleProvider',
						property: 'longestDrift'
					}
				},
				{
					component: $ui.TileTimeDonut,
					targetHigh: true,
					provider: {
						id: 'angleProvider',
						property: 'angle'
					}
				},
				{
					component: $ui.TileTimeHistory,
					provider: {
						id: 'angleProvider',
						property: 'angleHistory'
					}
				}
			],
			attachedObjects: [
				{
					component: $ui.DataProvider,
					id: 'angleProvider'
				},
			]
		}	
	];
	
	this.onshow = function() {
		// Set the screen data
		var data = {
			longestDrift: {
				target: 6,
				value: 4,
				accent: 'Your Longest Drift',
				caption: 'sec'
			},
			angle: {
				target: 90,
				value: 72.5,
				accent: 'Your Largest Angle',
				caption: 'degrees'
			},
			angleHistory: {
				labels: ['Apr 10/14','May 12/14','Jul 18/14','Aug 22/14'],
				data: [10,40,37,55],
				caption: 'Recorded Drift Angles'
			}
		}
		// Populate the data provider
		this.angleProvider.data = data; 
	};
	
	// Do clean up
	this.ondestroy = function() {
		window.clearInterval(this._interval);
	}
	
	// Handle the dyno run being complete
	this.recordingFinished = function() {
		this.recordTile.reset();
		var date = new Date(),
			months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
			formattedDate = months[date.getMonth()] +' ' + date.getDate() + '/' + (date.getFullYear() - 2000);
		// Add new data to the provider
		var existing = this.angleProvider.data,
			data = {
				longestDrift: existing.longestDrift,
				angle: existing.angle,
				angleHistory: existing.angleHistory,
			};
		data.angle.value = 75.2;
		data.angleHistory.labels.push(formattedDate);
		data.angleHistory.data.push(data.angle.value);
		this.angleProvider.data = data;
	}.$bind(this);
}

