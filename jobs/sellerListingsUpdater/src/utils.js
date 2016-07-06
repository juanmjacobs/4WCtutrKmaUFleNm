var request = require('request');
var constants = require('../config/constants');

var Utils = function(argv) { 
	this.listingTrackerUrl = this.getUrlFromArguments(argv, constants.LOCAL_LISTING_TRACKER_URL);
}

Utils.prototype = {

	mercadolibreSearchGet: (offset, callback) => {
		request({
		    url: constants.ML_SEARCH_URL,
		    qs: {seller_id: constants.SELLER_ID, offset: offset, attributes:'results,paging'},
		    json: true,
		}, (error, status, response) => {
		    if(error) {
		        console.log(error);
		    } else {
		        callback(response);
		    }
		});	
	},
	listingTrackerUpsert: function(listings, callback) {
		var self = this;
		request.post(
		    LISTING_TRACKER_URL+'/listings/upsert',
		    { json: listings },
		    callback
		);
	},
	getUrlFromArguments: function (argv, defaultValue) {
		var obtained = this.getFromArguments(argv, "url");
		var url = (obtained != null)? obtained : defaultValue;
		return url;
	},

	getFromArguments: function (argv, argument) {
		var ret = null
		argv.forEach((val, index, array) => {
			if (val.indexOf(argument) > -1) {
				if (val.indexOf("=")  > -1) {
					ret =  splitBy(val, "=")
				}
			}
		});

		return ret;
	}
}

function splitBy(val, pattern) {
	return val.split(pattern)[1]
}

module.exports = Utils;