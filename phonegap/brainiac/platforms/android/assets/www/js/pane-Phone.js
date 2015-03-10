function panePhone() {
	this.component = ws12.WindowPane;
	
	this.menuImgClass = 'ws12-icon-head-unit-phone';
	
	this.content = [
		{
			component: ws12.SplitView,
			left: [
				{
					component: ws12.DockLayout,
					dock: [
						{
							component: ws12.SegmentedControl,
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
							component: ws12.TabbedPane,
							id: 'tabbedPane',
							tabs: [
								{	// Contact list tab
									component: ws12.Tab,
									id: 'contactListTab',
									content: [
										{
											component: ws12.Spinner,
											id: 'listSpinner',
											size: ws12.Spinner.LARGE,
											visible: false
										},
										{
											component: ws12.List,
											id: 'contactList',
											visible: false,
											style: ws12.GenericListItem,
											provider: {
												id: 'contactProvider',
												property: 'contacts'
											}
										}
									]
								},
								{	// This is the Recent Calls Tab
									component: ws12.Tab,
									id: 'recentCallsTab',
									content: [
										{
											component: ws12.List,
											style: ws12.PhoneLogListItem,
											items: [
												{
													title: 'Anzor',
													caption: 'Mobile: (555) 659-9874'
												},
												{
													title: 'Anzor',
													caption: 'Home: (555) 659-1212',
													style: ws12.PhoneLogListItem.OUTGOING
												},
												{
													title: '(555) 659-9874',
													caption: 'Toronto, ON',
												},
												{
													title: 'Unknown',
													caption: 'Toronto, ON',
													style: ws12.PhoneLogListItem.MISSED
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
					component: ws12.DialPad,
					onkeypadpress: function(key) {
						// TODO: Handle key presses
					}
				}
			]
		}
	];
	
	this.attachedObjects = [
		{
			component: ws12.DataProvider,
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