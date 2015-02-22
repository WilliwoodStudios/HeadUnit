function panePhone() {
	this.component = ws12.WindowPane;
	
	this.menuImgClass = 'ws12-icon-head-unit-phone';
	
	this.content = [
		{
			component: ws12.SplitView,
			left: [
				{
					component: ws12.List,
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
			id: 'contactProvider'
		}
	];
	
	this.onshow = function() {
		this.contactProvider.loadFromUrl('spec/data/data-contactList.json');
	}
}