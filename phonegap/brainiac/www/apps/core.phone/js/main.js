function main() {
	this.component = $ui.WindowPane;
	
	this.disableAnimation = true;
	
	this.content = [
		{
			component: $ui.SplitView,
			left: [
				{
					component: $ui.DockLayout,
					dock: [
						{
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
										$system.phone.getCallList(this.screen.updateCallsList);
									}
								}
							}
						}
					],
					content: [
						{
							component: $ui.TabbedPane,
							id: 'tabbedPane',
							tabs: [
								{	// Contact list tab
									component: $ui.Tab,
									id: 'contactListTab',
									content: [
										{
											component: $ui.Spinner,
											id: 'listSpinner',
											size: $ui.Spinner.LARGE,
											visible: false
										},
										{
											component: $ui.List,
											id: 'contactList',
											visible: false,
											style: $ui.GenericListItem,
											provider: {
												id: 'contactProvider',
												property: 'contacts'
											}
										}
									]
								},
								{	// This is the Recent Calls Tab
									component: $ui.Tab,
									id: 'recentCallsTab',
									content: [
										{
											component: $ui.List,
											style: $ui.PhoneLogListItem,
											provider: {
												id: 'callsProvider',
												property: 'calls'
											}
										}
									]
								}
							]
						}
					]
				}
			],
			right: [
				{
					component: $ui.DialPad,
					onkeypadpress: function(key) {
						switch (key.caption) {
							case '0':
								$system.audio.playSoundEffect($system.SoundEffect.TONE0);
								break;
							case '1':
								$system.audio.playSoundEffect($system.SoundEffect.TONE1);
								break;
							case '2':
								$system.audio.playSoundEffect($system.SoundEffect.TONE2);
								break;
							case '3':
								$system.audio.playSoundEffect($system.SoundEffect.TONE3);
								break;
							case '4':
								$system.audio.playSoundEffect($system.SoundEffect.TONE4);
								break;
							case '5':
								$system.audio.playSoundEffect($system.SoundEffect.TONE5);
								break;
							case '6':
								$system.audio.playSoundEffect($system.SoundEffect.TONE6);
								break;
							case '7':
								$system.audio.playSoundEffect($system.SoundEffect.TONE7);
								break;
							case '8':
								$system.audio.playSoundEffect($system.SoundEffect.TONE8);
								break;
							case '9':
								$system.audio.playSoundEffect($system.SoundEffect.TONE9);
								break;
							case '#':
								$system.audio.playSoundEffect($system.SoundEffect.TONE_POUND);
								break;
							case '*':
								$system.audio.playSoundEffect($system.SoundEffect.TONE_ASTERIK);
								break;
						}
					}
				}
			]
		}
	];
	
	this.attachedObjects = [
		{
			component: $ui.DataProvider,
			id: 'contactProvider',
			onload: function() {
				this.screen.listSpinner.setVisible(false);
				this.screen.contactList.setVisible(true);
			}
		},
		{
			component: $ui.DataProvider,
			id: 'callsProvider'
		}
	];
	
	this.onshow = function() {
		this.listSpinner.setVisible(true);
		$system.contacts.getContactList(this.updateContactList);
	}
	
	// Populate the contacts list provider
	this.updateContactList = function(data) {
		this.contactProvider.setData(data);
	}
	this.updateContactList = this.updateContactList.bind(this);
	
	// Populate the calls list provider
	this.updateCallsList = function(data) {
		this.callsProvider.setData(data);
	}
	this.updateCallsList = this.updateCallsList.bind(this);
}