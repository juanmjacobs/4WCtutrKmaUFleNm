var async = require('async');
var request = require('request');
var Utils = require('./utils');
var utils = new Utils(process.argv);
var constants = require('../config/constants');


function processMLResponse(response,callback) {
	var paging = response.paging,
		listings = response.results.map((listing) => {
			return {
				listing_id: listing.id,
				seller_id: listing.seller.id,
				sold_quantity: listing.sold_quantity,
				title: listing.title
			}
		});

	utils.listingTrackerUpsert(listings, (error,response, body) => { 
				
        if (!error && response.statusCode == 200) {
        	console.log("Finalizado batch con offset: "+paging.offset
				+" OK: "+body.ok.length
				+" ERR: "+body.err.length
			)
			console.log('-------------');
		} else {
			console.log("Error procesando batch con offset: "+paging.offset)
		}

		callback(paging.total);

	})
}
function getListings(offset,callback) {

	var cb = callback || () => {};
	utils.mercadolibreSearchGet(offset,function (response) {
		processMLResponse(response,cb);
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
	}, constants.SIMULTANEOUS_REQUESTS);


	q.drain = function() {
	    console.log('all items have been processed');
	}

	for(var i = constants.OFFSET_STEP; i < totalListings; i += constants.OFFSET_STEP){
	   q.push({offset:i});
	}
	
}

initProcess();