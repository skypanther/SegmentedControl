// this sets the background color of the master UIView (when there are no windows/tab groups on it)
Titanium.UI.setBackgroundColor('#fff');

// set up our namespace so we don't crash into things
var sc = {};

(function() {
	
	/*
	 * FIRST, A COUPLE OF HELPER FUNCTIONS PULLED FROM THE TWEETANIUM PROJECT
	 * 
	 */

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
	};
	sc.mixin = function(/*Object*/ obj, /*Object...*/ props){
		if(!obj){ obj = {}; }
		for(var i=1, l=arguments.length; i<l; i++){
			mixin(obj, arguments[i]);
		}
		return obj; // Object
	};
	
	//create a new object, combining the properties of the passed objects with the last arguments having
	//priority over the first ones
	sc.combine = function(/*Object*/ obj, /*Object...*/ props) {
		var newObj = {};
		for(var i=0, l=arguments.length; i<l; i++){
			mixin(newObj, arguments[i]);
		}
		return newObj;
	};


	//OS, Locale, and Density specific branching helpers adapted from the Helium library
	//for Titanium: http://github.com/kwhinnery/Helium
	var osname = Ti.Platform.osname;

	/* Branching logic based on OS */
	sc.os = function(/*Object*/ map) {
		var def = map.def||null; //default function or value
		if (map[osname]) {
			if (typeof map[osname] == 'function') { return map[osname](); }
			else { return map[osname]; }
		}
		else {
			if (typeof def == 'function') { return def(); }
			else { return def; }
		}
	};




    /*
     * HERE'S WHAT YOU'RE LOOKING FOR:
     *  - CUSTOM SEGMENTED / TABBEDBAR CONTROL
     *  - CROSS PLATFORM CAPABLE
     *  - ACCEPTS TWO PARAMS:
     *  	@params: a map of parameters to be assigned to control
     *  		_params defined like: {labels:['One','Two'], top:100, foo:'bar'}
     *  	@cb: the callback (click event handler function)
     */	
    sc.makeTabbedBar = function(/*map*/_params, /*function*/ _cb){
        if (Ti.Platform.osname == 'iphone') {
            // if iphone, just return the native tabbed bar
            var _tb1 = Titanium.UI.createTabbedBar(sc.combine(sc.properties.TabbedBar, _params));
            _tb1.addEventListener('click', function(e){
                return _cb(e.index);
            });
            return _tb1;
            
        } else {
            // build pseudo tabbed bar for Android
            if (typeof(_params.labels) != 'undefined' && null !== _params.labels) {
                // one or more labels passed in, we'll make a button for each
                // first, determine the width of the sub-buttons
				var tbBtnWidth, tbWidth;
                if (typeof(_params.width) != 'undefined' && null !== _params.width) {
                    tbBtnWidth = Math.round(_params.width / _params.labels.length);
                    tbWidth = _params.width;
                    Ti.API.info('A) tbBtnWidth = ' + tbBtnWidth + ', tbWidth =' + tbWidth);
                } else  if (undefined !== sc.properties.TabbedBarAndroidView.width && null !== sc.properties.TabbedBarAndroidView.width) {
                    tbBtnWidth = Math.round(sc.properties.TabbedBarAndroidView.width / _params.labels.length);
                    tbWidth = sc.properties.TabbedBarAndroidView.width;
                    //Ti.API.info('B) tbBtnWidth = ' + tbBtnWidth + ', tbWidth =' + tbWidth);
                } else {
                    tbBtnWidth = Math.round(Ti.Platform.displayCaps.platformWidth * 0.9 / _params.labels.length);
                    tbWidth = (Ti.Platform.displayCaps.platformWidth * 0.9);
                }
                // create the wrapper view
                var _tbV = Titanium.UI.createView(sc.combine(sc.properties.TabbedBarAndroidView, _params));
                var activeButtonIndex = (typeof(_params.index) != 'undefined') ? _params.index : 0;
                // now create the buttons
                var _numBtns = _params.labels.length;
                for (i = 0; i < _numBtns; i++) {
                    var _left = i * (tbWidth / _numBtns);
                    _tbV.add(function(I, P){
                        var tbVbutton = Ti.UI.createButton(sc.combine(sc.properties.TabbedBarAndroidSubButton, {
                            title: P.labels[I],
                            left: _left,
                            index: I,
                            width: tbBtnWidth
                        }));
                        if (activeButtonIndex == i) {
                            tbVbutton.backgroundColor = sc.properties.TabbedBarAndroidSubButtonSelected.backgroundColor;
                            tbVbutton.backgroundImage = sc.properties.TabbedBarAndroidSubButtonSelected.backgroundImage;
                        }
                        tbVbutton.addEventListener('click', function(e){
                            for (x = 0; x < _tbV.children.length; x++) {
                                _tbV.children[x].backgroundColor = sc.properties.TabbedBarAndroidSubButton.backgroundColor;
                                _tbV.children[x].backgroundImage = sc.properties.TabbedBarAndroidSubButton.backgroundImage;
                            }
                            tbVbutton.backgroundColor = sc.properties.TabbedBarAndroidSubButtonSelected.backgroundColor;
                            tbVbutton.backgroundImage = sc.properties.TabbedBarAndroidSubButtonSelected.backgroundImage;
                            return _cb(I);
                        });
                        return tbVbutton;
                    }(i, _params));
                }
                // all done
                return _tbV;
            } else {
                // return a single button so the app doesn't crash
                return Titanium.UI.createButton(sc.combine(sc.properties.Button, _params));
            }
        }
    }; // end makeTabbedBar

	/*
	 * CENTRALIZED STYLES AND THEME SETTINGS, AGAIN, PULLED FROM TWEETANIUM
	 * 	- alternative to jss files
	 */
	sc.theme = {
		textColor:'#000000',
		white:'#ffffff',
		grayTextColor:'#cfcfcf',
		mediumGray:'#9a9a9a',
		darkGray:'#666666',
		headerColor:'#ffffff',
		lightBlue:'#5e96d0',
		darkBlue:'#22366e',
		mediumBlue:'#68a6e6',
		selectedBlue:'#004ea1',
		yellow:'#f7bf00',
		orange:'#f79400',
		red:'f75300',
		fontFamily: sc.os({
			iphone:'Helvetica Neue',
			android:'Droid Sans'
		})
	};
	sc.properties = {
		//set default styles for various components
		Label: {
			color:sc.theme.textColor,
			font: {
				fontFamily:sc.theme.fontFamily,
				fontSize:16
			},
			width:sc.os({
				iphone:'90%',
				android:Math.round(Ti.Platform.displayCaps.platformWidth*0.9)
			}), 
			height:'auto'
		},
		TabbedBar: {
			backgroundColor: sc.theme.mediumBlue,
			style: Titanium.UI.iPhone.SystemButtonStyle.BAR,
			height: 50,
			width: 300,
			index: 0
		
		},
		TabbedBarAndroidView: {
			borderRadius: 10
		},
		TabbedBarAndroidSubButton: {
			height: 30,
			width: 100,
			backgroundImage:'images/3partbutton_middle_off.png',
			color: '#000',
			borderRadius: 10,
			font: {
				fontSize: 14,
				fontWeight: 'bold'
			}
		},
		TabbedBarAndroidSubButtonSelected: {
			backgroundImage:'images/3partbutton_middle_on.png'
		}
	};

	/*
	 * CREATE OUR SAMPLE APP'S ELEMENTS TO TEST THE CODE AND OUTPUT SOMETHING
	 */
	sc.win = Titanium.UI.createWindow({  
	    title:'Segmented Control',
	    backgroundColor:'#fff',
		navBarHidden:false
	});

	var label1 = Titanium.UI.createLabel(sc.combine(sc.properties.Label, {
		text:'Cross platform segmented control',
		fontSize:18,
		textAlign:'center',
		top:20
	}));	
	sc.win.add(label1);

	/*
	 * FINALLY, LET'S ADD OUR SEGMENTED CONTROL
	 * 
	 */
	var fueltype = sc.makeTabbedBar({
		labels: ['Oil', 'Nat. Gas', 'Propane'],
		fuelnames: ['oil', 'ng', 'lp'],
		width: 300,
		height: 35,
		top: 75
	}, fthandler);
	// fthandler() is our callback function
	function fthandler(_idx){
		// ACCESS THE BTN CLICKED BY ITS INDEX
		Ti.API.info('Fuel selection: ' + fueltype.fuelnames[_idx]);
		switch(_idx) {
			case 0:
				alert('You picked Oil');
			break;
			case 1:
				alert('You picked Natural Gas');
			break;
			case 2:
				alert('You picked Propane');
			break;
		} // end switch
	} // end handler
	sc.win.add(fueltype);

})();


// finally, open the window
sc.win.open();
