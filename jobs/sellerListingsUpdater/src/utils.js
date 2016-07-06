var request = require('request');
var SELLER_ID = 154901871;
var LOCAL_LISTING_TRACKER = "http://localhost:9000";
var LISTING_TRACKER_URL;
function Utils(argv) { 
	
	LISTING_TRACKER_URL = this.getUrlFromArguments(argv, LOCAL_LISTING_TRACKER);

}

Utils.prototype = {

	mercadolibreSearchGet: (offset, callback) => {
		request({
		    url: 'https://api.mercadolibre.com/sites/MLM/search',
		    qs: {seller_id: SELLER_ID, offset: offset, attributes:'results,paging'},
		    json: true,
		}, function(error, status, response){
		    if(error) {
		        console.log(error);
		    } else {
		        callback(response);
		    }
		});	
	},
	listingTrackerUpsert: (listings, callback) => {
		var self = this;
		request.post(
		    LISTING_TRACKER_URL+'/listings/upsert',
		    { json: listings },
		    callback
		);
	},
	getUrlFromArguments: function (argv, defaultPort) {
		var obtainedPort = this.getFromArguments(argv, "url");
		var port = (obtainedPort != null)? obtainedPort : defaultPort;
		console.log(port);
		return port;
	},

	getFromArguments: function (argv, argument) {
		var ret = null
		argv.forEach(function(val, index, array) {
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