/* Copyright (c) 2015 Workshop 12 Inc. */
function zeroToSixty() {
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
					caption: 'Record 0-60 Time',
					countdown: true,
					onstartclick: function() {
						this.screen.timerTile.reset();
					},
					onrecord: function() {
						this.screen.timerTile.start();
						$system.audio.playSoundEffect($system.SoundEffect.HORN);
						// Fake out reaching 60 mph in 4.9 seconds in the emulator
						if ($system.config.isEmulator == true) {
							$ui.toast('The emulator simulates a 4.9 second 0-60');
							window.setTimeout(function() {
								if ($core) {
									var systemEvent = new $core.SystemEvent($system.EventType.ONSPEEDCHANGE, {speed: 60});
									$core.raiseEvent(systemEvent);
								}
							},4900);
						}
					},
					oncountdown: function() {
						$system.audio.playSoundEffect($system.SoundEffect.BLIP);
					}
				},
				{
					component: $ui.TileTimer,
					id: 'timerTile'
				},
				{
					component: $ui.TileTimeDonut,
					provider: {
						id: 'zeroToSixtyProvider',
						property: 'zeroToSixty'
					}
				},
				{
					component: $ui.TileTimeHistory,
					provider: {
						id: 'zeroToSixtyProvider',
						property: 'zeroToSixtyHistory'
					}
				}
			],
			attachedObjects: [
				{
					component: $ui.DataProvider,
					id: 'zeroToSixtyProvider'
				}
			]
		}	
	];
	
	this.onshow = function() {
		// Set the screen data
		var data = {
			zeroToSixty: {
				target: 4.7,
				value: 5.2,
				accent: 'Your Best Time',
				caption: 'sec 0-60'
			},
			zeroToSixtyHistory: {
				labels: ['Apr 10/14','May 12/14','Jul 18/14','Aug 22/14'],
				data: [6.2,6.3,5.2,5.5],
				caption: 'Recorded 0-60 times (sec)'
			}
		}
		// Populate the data provider
		this.zeroToSixtyProvider.data = data; 
		// Set our speed change listener
		$system.addEventListener($system.EventType.ONSPEEDCHANGE, this.onspeedchange, this);
	};
	
	// Handle any speed change events
	this.onspeedchange = function(data) {
		if (data && (data.speed >= 60)) {
			// Stop and reset our tiles
			this.timerTile.stop();
			this.recordTile.reset();
			var date = new Date(),
				months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
				formattedDate = months[date.getMonth()] +' ' + date.getDate() + '/' + (date.getFullYear() - 2000),
				data = this.zeroToSixtyProvider.data,
				time = this.timerTile.getSeconds();
			// Add new data to the grid
			data.zeroToSixtyHistory.labels.push(formattedDate);
			data.zeroToSixtyHistory.data.push(time);
			// See if our new time is the fastest
			if (time < data.zeroToSixty.value) {
				data.zeroToSixty.value = time;
			}
			// Re-populate the data provider
			this.zeroToSixtyProvider.data = data; 
		}
	}.$bind(this);
}

