var Listing = require("./listing.model");
var async = require("async");
var UPSERT_LISTING_LIMIT = 50;
var NOOP = () => {};

var send = (res, next) =>
  (err, response) => {
    if (err) {
      return next(err);
    }
    return res.json(response);
  };

var findByListingId = (listing_id, callback) => {
  var onNotFound = callback.onNotFound || NOOP;
  var onSuccess = callback.onSuccess || NOOP;
  
  return Listing.findOne({
    listing_id: listing_id
  }, (err, listing) => {
    if (!err && (listing == null)) {
      return onNotFound();
    }
    return onSuccess(err, listing);
  });
};

var findOne = (req, next, callback) => {
  var findCallback = {
    onNotFound: () => {
      return next({ 
        name: 'NotFound'
      })
    },
    onSuccess: callback
  };
  return findByListingId(req.params.listing_id,findCallback);
};


exports.getAll = (req, res, next) => Listing.find({}, send(res, next))

exports.getOne = (req, res, next) => findOne(req, next, send(res, next))

exports.create = (req, res, next) => {
  var listing = req.body;
  return Listing.createInitializedListing(listing, send(res, next));
};

exports.update = (req, res, next) => {
  return findOne(req, next, (err, listing) => {
    var newQuantity;
    if (err) {
      return next(err);
    }
    newQuantity = req.body.sold_quantity - listing.initial_sold_quantity;
    if (listing.quantity == newQuantity) {
      return res.json(listing);
    }
    listing.quantity = newQuantity;
    return listing.save((err) => send(res, next)(err, listing));
  });
};

var upsertOne = function(listing,callback) {
  var upsertCallback = {
    onNotFound: () => {
      return Listing.createInitializedListing(listing,callback);
    },
    onSuccess: (err,item) => {
      var newQuantity = listing.sold_quantity - item.initial_sold_quantity;
      if (item.quantity == newQuantity) {
        return callback(null,item);
      }
      item.quantity = newQuantity;
      return item.save((err) => callback(err,item));
    }
  };

  return findByListingId (listing.listing_id,upsertCallback);
}

exports.upsert = (req, res, next) => {
  var listings = req.body, 
      i = -1;
  if(listings.length > UPSERT_LISTING_LIMIT) {
    return res.status(400).send("Listing limit exceeded");
  }

  var rv = {
    ok: [],
    err: []
  };

  async.whilst (

    () => {
      return ++i < listings.length
    },
    (done) => {

      var listing = listings[i];
      upsertOne(listing, function(err,item){
          if(err) {
            rv.err.push(listing);
          } else {
            rv.ok.push(item);
          }
          done()
      })
    },
    (err) => { 
      if(err) {
        return next(err) 
      } else {
        res.status(200).json(rv);
      }
      
    }
  );

};
