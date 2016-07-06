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
		console.log('')
		console.log('Haciendo upserts de todos los listings del seller '+constants.SELLER_ID+' contra la API de listing tracker en ' + utils.listingTrackerUrl)
		console.log('Haciendo pedido inicial a la API de ML')
		
		self.getListings(0,(responseML) => {
			self.processMLResponse(responseML, (responseAPI)=>
				self.processListings(responseAPI.totalListings)
				)
			
		})
	},
	getCurrentListingTrackerUrl: function() {
		return utils.listingTrackerUrl;
	},
	transforMLResponseToListings: function(response) {
		return response.results.map((listing) => {
				return {
					listing_id: listing.id,
					seller_id: listing.seller.id,
					sold_quantity: listing.sold_quantity,
					title: listing.title
				}
			});
	},
	processMLResponse: function(response,callback) {
		var paging = response.paging,
			self = this,
			listings = self.transforMLResponseToListings(response);

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
			callback(response);
		});
		
	},
	processListings: function(totalListings) {
		self = this;
		var q = async.queue((offset, next) => {
		    self.getListings(offset, (response) => {
		    	self.processMLResponse(response,()=>next());
		    	
		    }) 
		}, constants.SIMULTANEOUS_REQUESTS);


		q.drain = () => {
		    console.log('');
		    console.log('Se ha finalizado el proceso.');
		}

		var offsets = self.getBatchesOffset(totalListings);
		console.log('Tiene '+totalListings+' listings en total. Se haran '+offsets.length+' pedidos mas a la API de ML (se piden de a '+constants.OFFSET_STEP+' por vez)');
		for(var offset in offsets) q.push(offsets[offset])
		
	},
	getBatchesOffset: function(totalListings) {
		return _.range(constants.OFFSET_STEP,totalListings,constants.OFFSET_STEP)
	}
}

module.exports = SellerListingsUpdaterService.prototype;