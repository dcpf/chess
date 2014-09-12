'use strict';

// Timestamp of when the app was started. We use this for caching javascript and css files in the browser.
var runtimestamp = new Date().getTime();

exports.index = function (req, res) {
    renderIndex(res);
};

// private functions

function renderIndex (res) {
    var obj = {};
    // add the runtimestamp for versioning css and javascript
    obj.runtimestamp = runtimestamp;
    // set layout to false
    obj.layout = false;
    // set no-cache headers
    res.set({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
    });
    // render
    res.render('admin', obj);
}
