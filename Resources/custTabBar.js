/*
	Cross-platform segmented control (TabbedBar)
	by @skypanther
	
	Requires Ti SDK 1.8+ (or modify makeTabbedBar to use Ti.UI.createTabbedBar instead of Ti.UI.iOS.createTabbedBar)
	
	Usage:
	var tbar = require('/path/custTabBar').makeTabbedBar({paramObj}, _fn);
	
	Params: 
		{paramObj} is map of properties to match those defined by Ti.UI.iOS.TabbedBar, see DEFAULTS below for list of params that can be set on Android (all the native props are supported on iOS)
		_fn is a is a function to be called when a button on the tabbed bar is clicked, it will be passed the index of the button clicked 

	iOS: returns an instance of Ti.UI.iOS.TabbedBar
	Android: returns custom UI control to mimic TabbedBar

*/

var DEFAULTS = {
	labels: ['One', 'Two'],
	index: 0,
	backgroundColor: '#ccc',
	backgroundSelectedColor: 'blue',
	borderColor: '#444',
	borderWidth: 1,
	height: 'auto',
	androidHeight: 30, /* Needs to be numeric on Android, supply a different images/SegmentedControlAndroidGradient.png with different size */
	width: '90%',
	color: '#000',
	fontWeight: 'bold',
	fontSize: 18
};

//Extend an object with the properties from another 
//(thanks Dojo - http://docs.dojocampus.org/dojo/mixin)
var empty = {};
function mixin(/*Object*/ target, /*Object*/ source){
	var name, s, i;
	for(name in source){
		s = source[name];
		if(!(name in target) || (target[name] !== s && (!(name in empty) || empty[name] !== s))){
			target[name] = s;
		}
	}
	return target; // Object
}
function combine(/*Object*/ obj, /*Object...*/ props){
	if(!obj){ obj = {}; }
	for(var i=1, l=arguments.length; i<l; i++){
		mixin(obj, arguments[i]);
	}
	return obj; // Object
}

var osname = Ti.Platform.osname;

exports.makeTabbedBar = function(/*map*/_params, /*function*/ _fn){
    if (osname != 'android') {
        // if iOS, just return the native tabbed bar
        var tb1 = Titanium.UI.iOS.createTabbedBar(mixin(DEFAULTS, _params));
        if(_fn) {
	        tb1.addEventListener('click', function(e){
	            _fn(e.source.index);
	        });
        }
        return tb1;
        
    } else {
		// build pseudo tabbed bar for Android
        var wrapper = Ti.UI.createView({
			width:(_params.width) ? _params.width : DEFAULTS.width,
			height: (_params.height) ? _params.height : DEFAULTS.androidHeight,
			top: (_params.top) ? _params.top : DEFAULTS.top,
			left: (_params.left) ? _params.left : DEFAULTS.left
		});
		var numButtons = (_params.labels.length) ? _params.labels.length : DEFAULTS.labels.length;
		// need to calculate width of sub-buttons, but view.width could have been set as a string
		var tmpWidth = (_params.width) ? _params.width : DEFAULTS.width;
		var subBtnWidth = 0;
		if(typeof(tmpWidth)=='number') {
			subBtnWidth = Math.round(tmpWidth/numButtons);
		} else if(typeof(tmpWidth)=='string' && !isNaN(parseInt(tmpWidth))) {
			// looks like we've got a percentage width
			subBtnWidth = Math.round((parseInt(tmpWidth)/100 * Ti.Platform.displayCaps.platformWidth)/numButtons);
		} else {
			// looks like 'auto' was used
			subBtnWidth = Math.round((0.9 * Ti.Platform.displayCaps.platformWidth)/numButtons);
		}
		
		var btnArray = [];
		for(var i=0; i<numButtons; i++) {
			// create the sub-buttons
			var subBtn = Ti.UI.createView({
				backgroundColor: (_params.backgroundColor) ? _params.backgroundColor : DEFAULTS.backgroundColor,
				borderColor: (_params.borderColor) ? _params.borderColor : DEFAULTS.borderColor,
				borderWidth: (_params.borderWidth) ? _params.borderWidth : DEFAULTS.borderWidth,
				left: (i * subBtnWidth),
				width: subBtnWidth,
				height: (_params.height) ? _params.height : DEFAULTS.androidHeight,
				myIndex: i
			});
			subBtn.add(Ti.UI.createLabel({
				text: _params.labels[i],
				color: (_params.color) ? _params.color : DEFAULTS.color,
				font: {
					fontWeight: (_params.fontWeight) ? _params.fontWeight : DEFAULTS.fontWeight,
					fontSize: (_params.fontSize) ? _params.fontSize : DEFAULTS.fontSize
				}
			}));
			if(_params.androidBackgroundImage) {
				subBtn.backgroundImage = _params.androidBackgroundImage;
			}
			if(i==0) {
				subBtn.backgroundColor = (_params.backgroundSelectedColor) ? _params.backgroundSelectedColor : DEFAULTS.backgroundSelectedColor;
				if(_params.androidBackgroundSelectedImage) {
					subBtn.backgroundImage = _params.androidBackgroundSelectedImage;
				}
			}
			
			btnArray.push(subBtn);
			wrapper.add(subBtn);
		}
        wrapper.addEventListener('click', function(e){
			for(var i=0; i<numButtons; i++) {
				btnArray[i].backgroundColor = (_params.backgroundColor) ? _params.backgroundColor : DEFAULTS.backgroundColor;
				if(_params.androidBackgroundImage) {
					btnArray[i].backgroundImage = _params.androidBackgroundImage;
				}
			}
			if(e.source.myIndex) {
				e.source.backgroundColor =  (_params.backgroundSelectedColor) ? _params.backgroundSelectedColor : DEFAULTS.backgroundSelectedColor;
				if(_params.androidBackgroundSelectedImage) {
					e.source.backgroundImage = _params.androidBackgroundSelectedImage;
				}
			} else {
				e.source.parent.backgroundColor =  (_params.backgroundSelectedColor) ? _params.backgroundSelectedColor : DEFAULTS.backgroundSelectedColor;
				if(_params.androidBackgroundSelectedImage) {
					e.source.parent.backgroundImage = _params.androidBackgroundSelectedImage;
				}
			}
			
	        if(_fn) {
	            _fn((e.source.myIndex) ? e.source.myIndex : e.source.parent.myIndex);
	        }
        });
		return wrapper;
	}
}; // end makeTabbedBar


