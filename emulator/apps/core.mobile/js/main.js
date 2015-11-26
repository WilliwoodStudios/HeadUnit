/* Copyright (c) 2015 Workshop 12 Inc. */
function main() {
	this.component = $ui.WindowPane;
	this.content = [
		{
			component: $ui.List,
			style: $ui.PostListItem,
			items: [
				{
					user: 'brcewane',
					avatar: 'img/avatar.jpg',
					img: 'img/engine.jpg',
					caption: 'After a lot of hard work, the engine bay shave and wire tuck is complete!',
					title: 'Engine Bay Finished!',
					numLikes: 112,
					numComments: 12,
					liked: false,
					time: 'Sat Nov 21 2015 12:00:16 GMT-0400'
				},
				{
					user: 'brcewane',
					avatar: 'img/avatar.jpg',
					img: 'img/kickstartertitle.jpg',
					caption: 'Installed Brainiac into the WRX and it\'s looking great!',
					title: 'Finally Installed!',
					numLikes: 20,
					numComments: 7,
					liked: false,
					time: 'Wed Nov 18 2015 12:44:16 GMT-0400'
				},
				{
					user: 'brcewane',
					avatar: 'img/avatar.jpg',
					img: 'img/show.jpg',
					caption: 'Quick shot from the Toronto Subaru Club HyperMeet',
					title: 'Hypermeet',
					numLikes: 221,
					numComments: 5,
					liked: false,
					time: 'Sun Nov 15 2015 12:00:16 GMT-0400'
				},
				{
					user: 'brcewane',
					avatar: 'img/avatar.jpg',
					img: 'img/trunk.jpg',
					caption: 'Gotta have a loud bump in the trunk!',
					title: 'Boom chica Boom',
					numLikes: 32,
					numComments: 6,
					liked: false,
					time: 'Thu Nov 5 2015 12:00:16 GMT-0400'
				}
			]
		}
	];
}