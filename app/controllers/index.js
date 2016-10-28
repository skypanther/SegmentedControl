$.tbar1.init(['One', 'Two', 'Three'], callback);

function callback(e) {
	alert('You clicked button ' + (e.index + 1));
	console.log('The selected index is ' + e.index);
}


var tbar2Buttons = ['NO', 'YES'];
$.tbar2.init(tbar2Buttons, tbar2Callback);

setTimeout(function () {
	$.tbar2.setIndex(1);
}, 2000);


function tbar2Callback(e) {
	alert('You clicked  ' + tbar2Buttons[e.index]);
}

var tbar3Buttons = ['Blue', 'Yellow', 'Argggh!'];
$.tbar3.init(tbar3Buttons, tbar3Callback);
$.tbar3.disableButton(2);

function tbar3Callback(e) {
	alert('You clicked  ' + tbar3Buttons[e.index]);
}


$.skipindex.init(['1', '2', '4', '5'], callback, {
	skipindex: 2
});

function setSkipIndex() {
	console.log('Setting the control to the fourth index (3) which should highlight the button labeled Four');
	$.skipindex.setIndex(3);
	setTimeout(function () {
		console.log('The selected index is ' + $.skipindex.getIndex());
	}, 10);
}

$.index.open();