/* Copyright (c) 2015 Workshop 12 Inc. */
function relayScreen() {
	this.component = $ui.WindowPane;
	this.animated = true;
	this.backCaption = 'Back';
	this.content = [
		{
			component: $ui.List,
			id: 'relayList',
			style: $ui.GenericListItem,
			provider: {
				id: 'relayProvider',
				property: 'items'
			},
			onaction: function(event) {
				$ui.push(switchScreen, event.target)
			}
		}
	];
	
	this.attachedObjects = [
		{
			component: $ui.DataProvider,
			id: 'relayProvider',
			onbeforeupdate: function() {
				if (this.data && this.data.items) {
					var i,
						item,
						firstPolarity;
					for (i = 0; i < this.data.items.length; i++) {
						item = this.data.items[i];
						item.title = item.name;
						item.caption = 'Bank #' + item.bank;
						item.accent = 'Relay Accessory Serial No. ' + item.board;
						if (item.isPolaritySwitch == true) {
							item.img = 'img/polarity.png';
							if (firstPolarity == undefined) {
								firstPolarity = item;
							}
						} else {
							item.img = 'img/relays.png';
						}
					}
					// Add our headers
					this.data.items.splice(0,0,{component: $ui.Header, caption: 'On/Off Switches'});
					if (firstPolarity != undefined) {
						this.data.items.splice(this.data.items.indexOf(firstPolarity),0,{component: $ui.Header, caption: 'Reverse Polarity Switches'});
					}
				}
			}
		}
	];
	
	// Initial show of screen
	this.onshow = function() {
		$ui.addEventListener('relay_switch_config_change', this.onswitchchange, this);
		$system.relays.getRelayList(this.onrelaylistload);	
	}
	
	// Handle the loading of the relay list
	this.onrelaylistload = function(items) {
		this.relayProvider.data = {items: items};
	}.$bind(this);
	
	// Handle any config changes
	this.onswitchchange = function(event) {
		var i, 
			item;
		for (i = 0; i < this.relayList.items.length; i++) {
			item = this.relayList.items[i];
			if (item.board == event.data.board && item.bank == event.data.bank) {
				item.title = event.data.name;
				item.isMomentary = event.data.isMomentary;
				item.shown = event.data.shown;
				item.duration = event.data.duration;
				item.positiveLabel = event.data.positiveLabel;
				item.negativeLabel = event.data.negativeLabel;
				break;
			}
		}
	}.$bind(this);
}