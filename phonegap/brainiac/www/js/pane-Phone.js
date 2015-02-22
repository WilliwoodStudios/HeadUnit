function panePhone() {
	this.component = ws12.WindowPane;
	
	this.menuImgClass = 'ws12-icon-head-unit-phone';
	
	this.content = [
		{
			component: ws12.SplitView,
			left: [
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
			],
			right: [
				{
					component: ws12.DialPad,
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