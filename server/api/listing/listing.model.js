var mongoose = require('mongoose');
var _ = require('lodash');
var Schema = mongoose.Schema;

ListingSchema = new Schema({
  listing_id: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  seller_id: {
    type: Number,
    index: true,
    required: true
  },
  initial_sold_quantity: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    "default": 0
  }
});

ListingSchema.methods.toJSON = function() {
  return _.omit(this.toObject(), ['_id', '__v']);
};

ListingSchema.statics.createInitializedListing = function(listing, callback) {
  listing.initial_sold_quantity = listing.sold_quantity;
  return this.create(listing,callback);
};

module.exports = mongoose.model('Listing', ListingSchema);