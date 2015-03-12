function zeroToSixty() {
	this.component = ws12.WindowPane;
	
	this.menuImgClass = 'ws12-icon-head-unit-zero-to-sixty';
	
	this.backCaption = 'Back';
	
	this.content = [
		{
			component: ws12.TileGroup,
			tiles: [
				{
					component: ws12.TileZeroToSixty,
					provider: {
						id: 'zeroToSixtyProvider',
						property: 'zeroToSixty'
					}
				},
				{
					component: ws12.TileZeroToSixtyHistory,
					provider: {
						id: 'zeroToSixtyProvider',
						property: 'zeroToSixtyHistory'
					}
				},
				{
					component: ws12.TileRecord,
					id: 'recordTile',
					caption: 'Record 0-60 Time',
					countdown: true,
					onstartclick: function() {
						this.screen.timerTile.reset();
					},
					onrecord: function() {
						this.screen.timerTile.start();
						audioManager.playSoundEffect(SoundEffect.HORN);
						// Fake out reaching 60 mph in 4.9 seconds
						window.setTimeout(function() {
							var systemEvent = new SystemEvent(ws12.EventType.ONSPEEDCHANGE, {speed: 60});
							ws12.eventBroker.raiseEvent(systemEvent);
						},4900);
					},
					oncountdown: function() {
						audioManager.playSoundEffect(SoundEffect.BLIP);
					}
				},
				{
					component: ws12.TileTimer,
					id: 'timerTile'
				}
			],
			attachedObjects: [
				{
					component: ws12.DataProvider,
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
				accent: 'Your Best Time'
			},
			zeroToSixtyHistory: {
				labels: ['Apr 10/14','May 12/14','Jul 18/14','Aug 22/14'],
				data: [6.2,6.3,5.2,5.5]
			}
		}
		// Populate the data provider
		this.zeroToSixtyProvider.setData(data); 
		// Set our speed change listener
		ws12.eventBroker.addEventListener(ws12.EventType.ONSPEEDCHANGE, this.onspeedchange, this);
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
			this.zeroToSixtyProvider.setData(data); 
		}
	}
	this.onspeedchange = this.onspeedchange.bind(this);
}

