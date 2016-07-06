var request = require('request');
var constants = require('../config/constants');

var Utils = function(argv, logger) {
	this.listingTrackerUrl = this.getUrlFromArguments(argv, constants.LOCAL_LISTING_TRACKER_URL);
	this.logger = logger;
}

Utils.prototype = {

	mercadolibreSearchGet: function(offset, callback, retries) {
		var self = this,
			currentRetries = retries || 0;

		if (currentRetries > 0) {

			self.logger.info('REINTENTO ' + currentRetries + ' de ' + constants.RETRIES_TO_ML + ' de batch con offset: ' + offset)
		}

		request({
			url: constants.ML_SEARCH_URL,
			qs: {
				seller_id: constants.SELLER_ID,
				offset: offset,
				attributes: 'results,paging'
			},
			json: true,
		}, (error, status, response) => {
			if (error) {
				self.logger.error(error);
			} else if (status.statusCode == 200) {
				callback(response);
			} else {
				self.logger.error('Error al obtener batch con offset: ' + offset + ". Status code: " + status.statusCode)
				if (currentRetries < constants.RETRIES_TO_ML) {
					self.mercadolibreSearchGet(offset, callback, currentRetries + 1)
				} else {
					self.logger.error('No se seguirá reintentando para el batch con offset: ' + offset)
				}
			}
		});
	},
	listingTrackerUpsert: function(listings, callback) {
		var self = this;
		request.post(
			self.listingTrackerUrl + '/listings/upsert', {
				json: listings
			},
			callback
		);
	},
	getUrlFromArguments: function(argv, defaultValue) {
		var obtained = this.getFromArguments(argv, "url");
		var url = (obtained != null) ? obtained : defaultValue;
		return url;
	},

	getFromArguments: function(argv, argument) {
		var ret = null
		argv.forEach((val, index, array) => {
			if (val.indexOf(argument) > -1) {
				if (val.indexOf("=") > -1) {
					ret = splitBy(val, "=")
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