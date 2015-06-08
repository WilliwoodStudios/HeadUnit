function activeCall() {
	this.component = $ui.ActiveCallScreen;
	this.iconIncomingCall = '../img/incomingCall.png';
	this.iconHangUp = '../img/hangupCall.png';
	
	this.onhangup = function() {
		$ui.pop();
	};
	
	this.onshow = function(data) {
		if (data) {
			this.img = data.img;
			this.number = data.phoneNumber;
			this.name = data.name;
		}
	};
}