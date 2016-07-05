var Listing = require("./listing.model");
var async = require("async");

var send = (res, next) =>
  (err, response) => {
    if (err) {
      return next(err);
    }
    return res.json(response);
  };

var findOne = (req, next, callback) => {
  return Listing.findOne({
    listing_id: req.params.listing_id
  }, (err, listing) => {
    if (!err && (listing == null)) {
      return next({
        name: 'NotFound'
      });
    }
    return callback(err, listing);
  });
};

exports.getAll = (req, res, next) => Listing.find({}, send(res, next))

exports.getOne = (req, res, next) => findOne(req, next, send(res, next))

exports.create = (req, res, next) => {
  var listing;
  listing = req.body;
  listing.initial_sold_quantity = req.body.sold_quantity;
  return Listing.create(listing, send(res, next));
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
  
  Listing.findOne({listing_id : listing.listing_id}, function(err,item){
    if(!err && item == null) {
      listing.initial_sold_quantity = listing.sold_quantity;
      return Listing.create(listing,callback);
    }

    var newQuantity = listing.sold_quantity - item.initial_sold_quantity;
    if (item.quantity == newQuantity) {
      return callback(null,item);
    }
    item.quantity = newQuantity;
    return item.save((err) => callback(err,item));
    
  });

}

exports.upsert = (req, res, next) => {
  var listings = req.body, 
      i = -1;

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
            rv.err.push({listing:listing, err: err});
          } else {
            rv.ok.push(listing);
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
