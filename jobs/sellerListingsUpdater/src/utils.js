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
		    } else if (status.statusCode == 200){
		        callback(response);
		    } else {
		    	console.log('Error al obtener batch con offset: '+offset+". Status code: " + status.statusCode)
		    }
		});	
	},
	listingTrackerUpsert: function(listings, callback) {
		var self = this;
		request.post(
		    self.listingTrackerUrl+'/listings/upsert',
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