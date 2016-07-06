var async = require('async');
var request = require('request');
var Utils = require('./utils');
var utils = new Utils(process.argv);
var constants = require('../config/constants');


var SellerListingsUpdaterService = function () {}

SellerListingsUpdaterService.prototype = {
	start: function() {
		var self = this;
		self.getListings(0,(totalListings) => {
			self.processListings(totalListings)
		})
	},
	processMLResponse: function(response,callback) {
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
	},
	getListings: function(offset,callback) {
		var self = this;
		var cb = callback || () => {};
		utils.mercadolibreSearchGet(offset, (response) => {
			self.processMLResponse(response,cb);
		});
		
	},
	processListings: function(totalListings) {
		self = this;
		var q = async.queue((task, next) => {
		    self.getListings(task.offset, (x) => {
		    	next()
		    }) 
		}, constants.SIMULTANEOUS_REQUESTS);


		q.drain = () => {
		    console.log('All items have been processed');
		}

		for(var i = constants.OFFSET_STEP; i < totalListings; i += constants.OFFSET_STEP){
		   q.push({offset:i});
		}
		
	}
}

module.exports = SellerListingsUpdaterService.prototype;