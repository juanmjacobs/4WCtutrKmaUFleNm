var async = require('async');
var request = require('request');
var SELLER_ID = 154901871;
var OFFSET_STEP = 50;
var SIMULTANEOUS_REQUESTS = 5;

var allListings = 0;
function processMLResponse(response,callback) {
	var paging = response.paging,
		listings = response.results;
	allListings += listings.length;
	console.log(allListings)
	callback(paging.total);

}
function getListings(offset,callback) {

	var cb = callback || () => {};
	request({
	    url: 'https://api.mercadolibre.com/sites/MLM/search',
	    qs: {seller_id: SELLER_ID, offset: offset, attributes:'results,paging'},
	    json: true,
	    
	}, function(error, status, response){
	    if(error) {
	        console.log(error);
	    } else {
	        processMLResponse(response,cb);
	    }
	});	
}
function initProcess() {
	getListings(0,(totalListings) => {
		processListings(totalListings)
	})
}
function processListings(totalListings) {
	
	var q = async.queue(function (task, next) {
	    getListings(task.offset, function(x) {
	    	next()
	    }) 
	}, SIMULTANEOUS_REQUESTS);


	q.drain = function() {
	    console.log('all items have been processed');
	}

	for(var i = OFFSET_STEP; i < totalListings; i += OFFSET_STEP){
	   q.push({offset:i});
	}
	
}

initProcess();