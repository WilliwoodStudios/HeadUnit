/* Copyright (c) 2015 Workshop 12 Inc. */
function clearCodeScreen() {
	this.component = $ui.ConfirmationScreen;
	this.caption = 'Clear Engine Codes?';
	this.options = [
		{
			caption: 'Yes',
			img: '../img/checkmark.png'
		},
		{
			caption: 'No',
			img: '../img/cancel.png'
		}/*,
		{
			caption: 'Maybe',
			img: '../img/cancel.png'
		}*/
	]
	// Handle the users choice
	this.onchoice = function(index) {
		console.log('index: ' + index)
		$ui.pop();
	};
}