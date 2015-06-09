/* Copyright (c) 2015 Workshop 12 Inc. */
function bookmarks() {
	this.component = $ui.WindowPane;
	this.animated = true;
	this.backCaption = 'Back';
	
	this.content = [
		{
			component: $ui.List,
			style: $ui.GenericListItem,
			provider: {
				id: 'bookmarkProvider',
				property: 'items'
			},
			onaction: function(event) {
				var dataEvent = new $data.DataEvent('onbookmark',event.target.caption);
				$data.raiseEvent(dataEvent);
				$ui.pop();
			}
		}
	
	];
	
	this.attachedObjects = [
		{
			component: $ui.DataProvider,
			id: 'bookmarkProvider'
		}
	];
	
	this.onshow = function(data) {
		if (data) {
			var i,
				item, 
				items = [];
			for (i = 0; i < data.length; i++) {
				item = data[i];
				items.push({
					img: item.img,
					title: item.title,
					caption: item.caption
				})
			}
			

			this.bookmarkProvider.data = {items: items};
		}
	}
	
	
}