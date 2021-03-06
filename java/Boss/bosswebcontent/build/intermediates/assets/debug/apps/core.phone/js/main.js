/* Copyright (c) 2015 Workshop 12 Inc. */
function main() {
	this.component = $ui.WindowPane;
	this.content = [{
		component: $ui.SplitView,
		left: [{
			component: $ui.DockLayout,
			dock: [{
				component: $ui.SegmentedControl,
				marginTop: true,
				marginBottom: true,
				marginLeft: true,
				marginRight: true,
				selectedIndex: 0,
				options: ['Contacts', 'Calls'],
				onclick: function() {
					if (this.selectedIndex === 0) {
						this.screen.tabbedPane.selectTab(this.screen.contactListTab);
					} else {
						this.screen.tabbedPane.selectTab(this.screen.recentCallsTab);
						if (this.screen.callsProvider.data == undefined) {
							$system.phone.getCallLog(this.screen.updateCallLog);
						}
					}
				}
			}],
			content: [{
				component: $ui.TabbedPane,
				id: 'tabbedPane',
				tabs: [{ // Contact list tab
					component: $ui.Tab,
					id: 'contactListTab',
					content: [{
						component: $ui.Spinner,
						id: 'listSpinner',
						size: $ui.Spinner.LARGE,
						visible: false
					}, {
						component: $ui.List,
						id: 'contactList',
						visible: false,
						style: $ui.GenericListItem,
						provider: {
							id: 'contactProvider',
							property: 'contacts'
						},
						onaction: function(event) {
							$system.initiateCall({
								name: event.target.title,
								phoneNumber: event.target.accent,
								img: event.target.img
							});
						}
					}]
				}, { // This is the Recent Calls Tab
					component: $ui.Tab,
					id: 'recentCallsTab',
					content: [{
						component: $ui.List,
						style: $ui.PhoneLogListItem,
						provider: {
							id: 'callsProvider',
							property: 'calls'
						}
					}]
				}]
			}]
		}],
		right: [{
			component: $ui.DialPad,
			onkeypadpress: function(key) {
				if (key.dial) {
					$ui.playTouchSound();
					var number = this.number.number;
					if (number.length > 0) {
							$system.initiateCall({
								name: this.number.prettyNumber,
								phoneNumber: number,
								img: ""
							});
					}
					this.number.number = "";
				} else {
					this.number.appendToNumber(key.caption);
				}
			},
			number: {
				ondeleteclick: function() {
					$ui.playTouchSound();
					this.deleteFromNumber();
				}
			}
		}]
	}];

	this.attachedObjects = [{
		component: $ui.DataProvider,
		id: 'contactProvider',
		onload: function() {
			this.screen.listSpinner.visible = false;
			this.screen.contactList.visible = true;
		}
	}, {
		component: $ui.DataProvider,
		id: 'callsProvider'
	}];

	this.onshow = function() {
		this.listSpinner.visible = true;
		$system.contacts.getContactList(this.updateContactList);
	}

	// Populate the contacts list provider
	this.updateContactList = function(data) {
		this.contactProvider.data = data;
	}
	this.updateContactList = this.updateContactList.bind(this);

	// Populate the calls list provider
	this.updateCallLog = function(data) {
		this.callsProvider.data = data;
	}
	this.updateCallLog = this.updateCallLog.bind(this);
}