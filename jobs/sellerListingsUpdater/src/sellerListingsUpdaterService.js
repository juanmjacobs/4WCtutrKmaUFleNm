var async = require('async');
var request = require('request');
var Utils = require('./utils');
var utils = new Utils(process.argv);
var constants = require('../config/constants');
var _ = require('lodash');


var SellerListingsUpdaterService = function () {}

SellerListingsUpdaterService.prototype = {
	start: function() {
		var self = this;
		self.getListings(0,(response) => {
			self.processListings(response.totalListings)
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

			callback({response: body, totalListings: paging.total});

		})
	},
	getListings: function(offset,callback) {
		var self = this;
		utils.mercadolibreSearchGet(offset, (response) => {
			self.processMLResponse(response,callback);
		});
		
	},
	processListings: function(totalListings) {
		self = this;
		var q = async.queue((offset, next) => {
		    self.getListings(offset, (x) => {
		    	next()
		    }) 
		}, constants.SIMULTANEOUS_REQUESTS);


		q.drain = () => {
		    console.log('All items have been processed');
		}
		
		var offsets = self.getBatchesOffset(totalListings);
		for(var offset in offsets) q.push(offsets[offset])
		
	},
	getBatchesOffset: function(totalListings) {
		return _.range(constants.OFFSET_STEP,totalListings,constants.OFFSET_STEP)
	}
}

module.exports = SellerListingsUpdaterService.prototype;