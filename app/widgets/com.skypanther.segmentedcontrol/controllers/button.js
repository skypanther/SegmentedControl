var args = arguments[0] || {};
$.segCtrlBtn.applyProperties(_.omit(args, 'id', '__parentSymbol', '__itemTemplate', '$model'));

/*
 * Handle the click events in the parent controller 
 *
*/
