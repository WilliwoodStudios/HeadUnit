/* Copyright (c) 2015 Workshop 12 Inc. */
function main() {
	this.component = $ui.WindowPane;

	// Handle toggle clicks.
	this.toggleClicked = function(which) {
		var command = which.bank + " ";
		if (which.position == -1) {
			command += "2"; // The arduino code is unsigned for easiness.
		} else {
			command += which.position;
		}
		$system.accessoryManager.sendCommandToAccessory(which.board, command);
	}.$bind(this);

	this.content = [{
		component: $ui.Toggle,
		visible: false,
		caption: '',
		bank: 's:0',
		onclick: this.toggleClicked
	}, {
		component: $ui.Toggle,
		visible: false,
		caption: '',
		bank: 's:1',
		onclick: this.toggleClicked
	}, {
		component: $ui.Toggle,
		visible: false,
		caption: '',
		bank: 's:2',
		onclick: this.toggleClicked
	}, {
		component: $ui.Toggle,
		visible: false,
		caption: '',
		bank: 's:3',
		onclick: this.toggleClicked
	}, {
		component: $ui.Toggle,
		visible: false,
		style: $ui.Toggle.Style.OnOffOn,
		caption: '',
		bank: 'd:0',
		onclick: this.toggleClicked
	}, {
		component: $ui.Toggle,
		visible: false,
		style: $ui.Toggle.Style.OnOffOn,
		caption: '',
		bank: 'd:1',
		onclick: this.toggleClicked
	}, {
		component: $ui.Toggle,
		visible: false,
		style: $ui.Toggle.Style.OnOffOn,
		caption: '',
		bank: 'd:2',
		onclick: this.toggleClicked
	}, {
		component: $ui.Toggle,
		visible: false,
		style: $ui.Toggle.Style.OnOffOn,
		caption: '',
		bank: 'd:3',
		onclick: this.toggleClicked
	}];

	this.onshow = function() {
		$ui.addEventListener('relay_switch_config_change', this.onswitchchange, this);
		$system.relays.getRelayList(this.onrelaylistload);
	}

	// Update the relay to be the proper style based on the data provided
	this.updateRelay = function(relay) {
		var i,
			toggle;
		for (i = 0; i < this.content.length; i++) {
			toggle = this.content[i];
			if (toggle.component == $ui.Toggle && toggle.bank == relay.bank) {
				toggle.visible = (relay.shown == false) ? false : true;
				toggle.caption = relay.name;
				toggle.board = relay.board;
				toggle.duration = relay.duration;
				toggle.positiveLabel = relay.positiveLabel;
				toggle.negativeLabel = relay.negativeLabel;
				toggle.position = 0;
				var duration = toggle.duration;
				if (toggle.style != $ui.Toggle.Style.OnOffOn) { // Cannot change this style
					if (relay.isMomentary == true) {
						toggle.style = $ui.Toggle.Style.Momentary;
						duration = 50; // short duration for momentary.
					} else {
						toggle.style = $ui.Toggle.Style.OnOff;
					}
				}
				if ("number" === typeof(duration)) {
					if (duration < 0) {
						duration = 0;
					}
				} else {
					duration = 0;
				}
				var command = toggle.bank + ":t " + duration;
				$system.accessoryManager.sendCommandToAccessory(toggle.board, command);
				break;
			}
		}
	}.$bind(this);

	// The relay boards can report their current switch settings. This code takes that and maps it to
	// the toggles.
	this.processStatus = function(board, response) {
		if ("response" in response) {
			response = response.response;
		} else {
			return;
		}
		var lines = response.split("\n");
		for (var i = 0; i < lines.length; ++i) {
			var values = lines[i].split(" ");
			if (values.length != 2) {
				continue;
			}
			var details = values[0].split(":");
			if (details.length < 2) {
				continue;
			}
			if (details.length == 2) {
				var toggle = this.findToggle(board, details[0] + ":" + details[1]);
				if (!toggle) {
					continue;
				}
				try {
					var position = parseInt(values[1]);
					if (position == 2) { // The relay board API is unsigned, using positions 0,1,2...
						position = -1;
					}
					toggle.position = position;
				} catch (thatIntSucked) {
					// ignore
				}
			} else {
				// other things - like time - ignoring.
			}
		}
	}.$bind(this);

	// Find the toggle for a given board and bank.
	this.findToggle = function(board, bank) {
		for (i = 0; i < this.content.length; i++) {
			toggle = this.content[i];
			if (toggle.component == $ui.Toggle && toggle.board == board && toggle.bank == bank) {
				return toggle;
			}
		}
		return null;
	}.$bind(this);

	// Handle the loading of the relay list
	this.onrelaylistload = function(relays) {
		if (relays == undefined) return;
		var boards = [];
		for (var i = 0; i < relays.length; i++) {
			this.updateRelay(relays[i])
			var board = relays[i].board;
			if (boards.indexOf(board) == -1) {
				boards.push(board);
			}
		}
		for (i = 0; i < boards.length; ++i) {
			function generateCallback(that, board) {
				return function(response) {
					that.processStatus(board, response);
				}
			}
			$system.accessoryManager.sendCommandToAccessory(boards[i], "set", generateCallback(this, boards[i]));
		}
	}.$bind(this);

	// Handle any config changes
	this.onswitchchange = function(event) {
		if (event && event.data) {
			this.updateRelay(event.data);
			var serialNumber = event.board;
		}
	}.$bind(this);
}