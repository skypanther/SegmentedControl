function doClick(e) {
    alert($.label.text);
}

$.tbar1.init(['One', 'Two', 'Three'], callback);

function callback(index) {
	alert('You clicked button ' + (index+1));
}


var tbar2Buttons = ['NO', 'YES']
$.tbar2.init(tbar2Buttons, tbar2Callback);

function tbar2Callback(index) {
	alert('You clicked  ' + tbar2Buttons[index]);
}

var tbar3Buttons = ['Blue', 'Yellow', 'Argggh!']
$.tbar3.init(tbar3Buttons, tbar3Callback);
$.tbar3.disableButton(2);

function tbar3Callback(index) {
	alert('You clicked  ' + tbar3Buttons[index]);
}



$.index.open();
