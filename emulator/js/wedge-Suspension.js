/* Copyright (c) 2015 Workshop 12 Inc. */
function wedgeSuspension() {
	this.component = $ui.WedgeNumber;
	this.min = 0;
	
	this.direction = $ui.WedgeNumber.Direction.RIGHT;
	
	this.backButton = {
		icon: 'img/suspension.png',
		caption: 'Done'
	};
	
	this.onchange = function() {
		var corner = this.corner;
		if (this.oldValue == undefined) this.oldValue = 0;
		if (this.value < this.oldValue) {
			$system.suspension.releaseAir(corner);
			window.setTimeout(function() {
				$system.suspension.closeValve(corner)
			}, 500);
		} else if (this.value > this.oldValue) {
			$system.suspension.addAir(corner);
			window.setTimeout(function() {
				$system.suspension.closeValve(corner)
			}, 500);
		}
		this.oldValue = this.value;
	};
	
	// Adjust the direction of the screen
	this.oncreate = function(data) {
		if (data && data.corner) {
			if (data.corner[0] == 'l') {
				this.direction = $ui.WedgeNumber.Direction.LEFT;
			}
		}
	};
	
	// Retrieve our corner pressure
	this.onshow = function(data) {
		if (data && data.corner) {
			this.corner = data.corner;
			$ui.addEventListener($system.EventType.ONSUSPENSIONDATA, this.onsuspensiondata, this);
			$system.suspension.requestCurrentData();
		}
	};
	
	// Update the suspension levels
	this.onsuspensiondata = function(event) {
		if (event && event.data) {
			this.value = event.data[this.corner];
			this.oldValue = this.value;
		}
	}.$bind(this);
}