/* Copyright (c) 2015 Workshop 12 Inc. */
function main() {
	this.component = $ui.WindowPane;
	
	this.content = [
		{
			component: $ui.Toggle,
			visible: false,
			caption: '',
			bank: 1
		},
		{
			component: $ui.Toggle,
			visible: false,
			caption: '',
			bank: 2
		},
		{
			component: $ui.Toggle,
			visible: false,
			caption: '',
			bank: 3
		},
		{
			component: $ui.Toggle,
			visible: false,
			caption: '',
			bank: 4
		},
		{
			component: $ui.Toggle,
			visible: false,
			style: $ui.Toggle.Style.OnOffOn,
			caption: '',
			bank: 5
		},
		{
			component: $ui.Toggle,
			visible: false,
			style: $ui.Toggle.Style.OnOffOn,
			caption: '',
			bank: 6
		},
		{
			component: $ui.Toggle,
			visible: false,
			style: $ui.Toggle.Style.OnOffOn,
			caption: '',
			bank: 7
		},
		{
			component: $ui.Toggle,
			visible: false,
			style: $ui.Toggle.Style.OnOffOn,
			caption: '',
			bank: 8
		}
	];

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
				if (toggle.style != $ui.Toggle.Style.OnOffOn) { // Cannot change this style
					if (relay.isMomentary == true) {
						toggle.style = $ui.Toggle.Style.Momentary;
					} else {
						toggle.style = $ui.Toggle.Style.OnOff;
					}
				}
				break;
			}
		}
	}.$bind(this);
	
	// Handle the loading of the relay list
	this.onrelaylistload = function(relays) {
		if (relays == undefined) return;
		for (var i = 0; i < relays.length; i++) {
			this.updateRelay(relays[i])
		}
	}.$bind(this);	
	
	// Handle any config changes
	this.onswitchchange = function(event) {
		if (event && event.data) {
			this.updateRelay(event.data);
		}
	}.$bind(this);
}