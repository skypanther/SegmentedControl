
var win = Ti.UI.createWindow({
	backgroundColor:'#fff'
});
var buttons = ['Frodo', 'Gandalf', 'Aragorn'];
var myCB = function (idx) {
  alert(buttons[idx]+' is the coolest');
}
var tbar = require('/custTabBar').makeTabbedBar({
		labels:buttons, 
		top:100,
		/* CUSTOM PROPERTIES TO SET BACKGROUND IMAGES ON ANDROID */
		androidBackgroundImage: '/images/SegmentedControlAndroidGradient.png',
		androidBackgroundSelectedImage: '/images/SegmentedControlAndroidSelectedGradient.png'
	}, 
	myCB);
win.add(tbar);
win.open();

