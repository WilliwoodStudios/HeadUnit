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
											items: [
												{
													title: 'Anzor',
													caption: 'Mobile: (555) 659-9874'
												},
												{
													title: 'Anzor',
													caption: 'Home: (555) 659-1212',
													style: $ui.PhoneLogListItem.OUTGOING
												},
												{
													title: '(555) 659-9874',
													caption: 'Toronto, ON',
												},
												{
													title: 'Unknown',
													caption: 'Toronto, ON',
													style: $ui.PhoneLogListItem.MISSED
												}
											]
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
						// TODO: Handle key presses
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
		}
	];
	
	this.onshow = function() {
		this.listSpinner.setVisible(true);
		this.contactProvider.loadFromUrl('spec/data/data-contactList.json');
	}
}