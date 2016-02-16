var args = arguments[0] || {},
	enabled = true;

// custom properties that can/should be set in the TSS of the view where you're putting the tabbed bar
var selectedButtonColor = args.selectedButtonColor || "#d9bc1b",
	unselectedButtonColor = args.unselectedButtonColor || "#226e92", 
	selectedButtonTextColor = args.selectedButtonTextColor || "#fff",
	unselectedButtonTextColor = args.unselectedButtonTextColor || "#000",
	disabledTextColor = args.disabledTextColor || '#aaa',
	disabledButtonBackgroundColor = args.disabledButtonBackgroundColor || '#444',
	borderColor = args.borderColor || 'transparent',
	font = args.font || (OS_IOS ? {fontFamily: 'Avenir-Light', fontSize: 11} : {fontWeight: 'normal', fontSize: '15dp'});

args.borderColor = borderColor; // stuff this back in there in case it's not set in the tss

$.segCtrlWrapper.applyProperties(_.omit(args, 'id', '__parentSymbol', '__itemTemplate', '$model', 'selectedButtonColor', 'unselectedButtonColor', 'selectedButtonTextColor', 'unselectedButtonTextColor', 'font'));

var height = ((isNaN(parseInt($.segCtrlWrapper.height))) ? 40 : parseInt($.segCtrlWrapper.height)) - 2;
if (OS_ANDROID) {height += 'dp';}
$.segCtrlButtonContainer.height = Ti.UI.FILL;

var callback = function () {}; // empty function as placeholder

var buttons = [];
exports.init = function (labels, cb) {
	var wrapperWidthIsCalculated = false,
		calculatedWidth;
	if (typeof cb === 'function') {
		callback = cb;
	}
	if (!labels || !_.isArray(labels) || labels.length === 0) {
		labels = ['Yes', 'No'];
	}
	// calculate button width
	if (OS_ANDROID) {
		if ($.segCtrlWrapper.width.slice(-1) === '%') {
			calculatedWidth = Ti.Platform.displayCaps.platformWidth / Ti.Platform.displayCaps.logicalDensityFactor * parseInt($.segCtrlWrapper.width)/100;
		} else if (isNaN(parseInt($.segCtrlWrapper.width))) {
			calculatedWidth = Ti.Platform.displayCaps.platformWidth / Ti.Platform.displayCaps.logicalDensityFactor;
			wrapperWidthIsCalculated = true;
		}
	} else if (OS_IOS) {
		if ($.segCtrlWrapper.width.slice(-1) === '%') {
			calculatedWidth = Ti.Platform.displayCaps.platformWidth * parseInt($.segCtrlWrapper.width)/100;
			console.log('Calculated the width of ' + args.id + ' to be ' + calculatedWidth);
		} else if (isNaN(parseInt($.segCtrlWrapper.width))) {
			// iOS handles rotation, but the wrapper width needs to be calculated to be
			// the smaller of the height or width to avoid layout issues
			if (Ti.Platform.displayCaps.platformWidth < Ti.Platform.displayCaps.platformHeight) {
				calculatedWidth = Ti.Platform.displayCaps.platformWidth;
			} else {
				calculatedWidth = Ti.Platform.displayCaps.platformHeight;
			}
		}
	}

	var btnWidth = calculatedWidth / labels.length;
	if (OS_ANDROID) {btnWidth += 'dp';}

	// make our buttons
	for (var i = 0, j = labels.length; i < j; i++) {
		if (!wrapperWidthIsCalculated && i === j-1 && !isIphone6splus()) {
			// if an explicit width has been set, we need to shrink the last button
			// by 1 or it will be too wide for the container and won't be shown
			btnWidth = (parseInt(btnWidth) - 1);
			if (OS_ANDROID) {
				btnWidth += 'dp';
			}
		}
		var btn = Widget.createController('button', { // jshint ignore:line
			text: labels[i],
			width: btnWidth,
			height: Ti.UI.FILL,
			left: 0,
			top: 0,
			bottom: 0,
			color: unselectedButtonTextColor,
			backgroundColor: unselectedButtonColor,
			font: font
		}).getView();
		if (args.index === i) {
			_highlight(btn);
		}
		buttons.push(btn);
		$.segCtrlButtonContainer.add(btn);
	}

	// add the button dividers, if desired
	if(args.withDividers) {
		for (var i = 0, j = labels.length-1; i < j; i++) { // jshint ignore:line
			$.segCtrlWrapper.add(Ti.UI.createView({
				width: OS_ANDROID ? '1dp' : 1,
				height: height,
				left: OS_ANDROID ? ((parseInt(btnWidth) * (i+1) + 1) + 'dp') : (btnWidth * (i+1) + (!isIphone6splus() ? 1 : -1)),
				backgroundColor: selectedButtonColor,
				zIndex: 10
			}));
		}
	}

	// event listener on the wrapper determines button clicked by x coord of click location
	$.segCtrlWrapper.addEventListener('click', function (e) {
		var clickedButton,
			butWid;
		var point = e.source.convertPointToView({
			x: e.x,
			y: e.y
		}, $.segCtrlWrapper);
		if (OS_ANDROID) {
			butWid = parseFloat(btnWidth.replace('dp', '')) * Ti.Platform.displayCaps.logicalDensityFactor;
			clickedButton = Math.floor(point.x / butWid);
		} else {
			butWid = btnWidth;
			clickedButton = Math.floor(point.x / butWid);
		}
		if (buttons[clickedButton].disabled) {
			return;
		}
		_.each(buttons, function (element, index) {
			if (enabled) {
				if (index === clickedButton) {
					_highlight(element);
				} else {
					_unhighlight(element);
				}
			}
		});
		callback({
			index: clickedButton,
			source: {
				id: args.id || undefined
			}
		});
	});
};

function _highlight(btn) {
	if (btn) {
		btn.backgroundColor = selectedButtonColor;
		btn.color = selectedButtonTextColor;
	}
}

function _unhighlight(btn) {
	if (!btn.disabled) {
		btn.backgroundColor = unselectedButtonColor;
		btn.color = unselectedButtonTextColor;
	}
}

exports.select = function (num) {
	var btnNumber = parseInt(num) || 0;
	_highlight(buttons[btnNumber]);
};
exports.setIndex = function (num) {
	var btnNumber = parseInt(num) || 0;
	exports.deselectAll();
	_highlight(buttons[btnNumber]);
};
exports.deselect = function (num) {
	var btnNumber = parseInt(num) || 0;
	_unhighlight(buttons[btnNumber]);
};
exports.enable = function () {
	enabled = true;
};
exports.disable = function () {
	enabled = false;
};
exports.deselectAll = function () {
	_.each(buttons, _unhighlight);
};

exports.changeButtonLabels = function (arr) {
	if (!arr || !arr.length || arr.length !== buttons.length) {
		throw "You must pass an array with " + buttons.length + " members to this function";
	}
	for (var b = 0, c = buttons.length; b < c; b++) {
		buttons[b].text = arr[b];
	}
};


/*
Public function to disable a button (make it non-clickable)
*/
exports.disableButton = function (num) {
	if (typeof num !== 'number' || !buttons[num]) {
		return;
	}
	// turn it semi-transparent
	// disable the click handler
	_unhighlight(buttons[num]);
	buttons[num].opacity = 0.4;
	buttons[num].color = disabledTextColor;
	buttons[num].backgroundColor = disabledButtonBackgroundColor;
	buttons[num].disabled = true;
};
exports.disableAllButtons = function () {
	for (var i = 0, j = buttons.length; i < j; i++) {
		exports.disableButton(i);
	}
};
/*
Public function to enable a button (make it clickable)
*/
exports.enableButton = function (num) {
	// turn it fully opaque
	// enable the click handler
	if (typeof num !== 'number' || !buttons[num]) {
		return;
	}
	_unhighlight(buttons[num]);
	buttons[num].opacity = 1;
	buttons[num].color = unselectedButtonTextColor;
	buttons[num].disabled = false;
};
exports.enableAllButtons = function () {
	for (var i = 0, j = buttons.length; i < j; i++) {
		exports.enableButton(i);
	}
};


function isIphone6splus() {
	if (OS_ANDROID) {
		return false;
	}
	if (Ti.Gesture.isPortrait()) {
		return Ti.Platform.displayCaps.platformWidth >= 414;
	} else if (Ti.Gesture.isLandscape()) {
		return Ti.Platform.displayCaps.platformHeight >= 414;
	}
	return false;
}