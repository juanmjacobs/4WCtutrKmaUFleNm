var should = require("chai").should();
var request = require('supertest');
var app = include('app').app;
var Listing = require('./listing.model');

describe('Listing', () => {
  var samsung = {
    listing_id: "MLA1111",
    title: "Samsung Galaxy",
    seller_id: 1234,
    initial_sold_quantity: 12,
    quantity: 0
  };

  beforeEach((done) => {
    return Listing.create(samsung, done);
  });

  describe('POST /listings', function() {

    it('should create the listing with the given sold_quantity as the initial_sold_quantity', (done) => {
      var data = {
        listing_id: "MLA1234",
        title: "iPhone 6s 32GB",
        seller_id: 1234,
        sold_quantity: 20
      };

      request(app).post('/listings').send(data).expect(200, {
        listing_id: "MLA1234",
        title: "iPhone 6s 32GB",
        seller_id: 1234,
        initial_sold_quantity: 20,
        quantity: 0
      }, done);
    });

    it('should return 400 Bad Request when a required property is missing', (done) => {
      var data = {
        title: "iPhone 6s 32GB",
        seller_id: 1234,
        sold_quantity: 20
      };
      request(app).post('/listings').send(data).expect(400, done);
    });

  });

  describe('GET /listings', function() {

    it('should return all the listings', (done) => {
      request(app).get('/listings').expect(200, [samsung], done);
    });

  });
  describe('GET /listings/:listing_id', function() {

    it('should return the requested listing', (done) => {
      request(app).get('/listings/MLA1111').expect(200, samsung, done);
    });

    it('should return 404 Not Found when the requested listing does not exist', (done) => {
      request(app).get('/listings/WRONGID').expect(404, done);
    });

  });

  describe('PUT /listings/:listing_id', function() {

    it('should update the listing incrementing the quantity with the difference between the current sold_quantity and the initial_sold_quantity', (done) => {
      var data = {
        sold_quantity: 14
      };

      request(app).put('/listings/MLA1111').send(data).expect(200, {
        listing_id: "MLA1111",
        title: "Samsung Galaxy",
        seller_id: 1234,
        initial_sold_quantity: 12,
        quantity: 2
      }, done);

    });

    it('should return 404 Not Found when the requested listing does not exist', (done) => {
      request(app).put('/listings/WRONGID').send({}).expect(404, done);
    });

  });

  describe('POST /listings/upsert', function() {

    it('should update the listing if it already existed, incrementing the quantity with the difference between the current sold_quantity and the initial_sold_quantity', (done) => {
      var newSamsung = {
        listing_id: "MLA1111",
        title: "Samsung Galaxy",
        seller_id: 1234,
        sold_quantity: 20
      };
      var data = [newSamsung]

      request(app).post('/listings/upsert').send(data).expect(200, {
        ok:[
          {
            listing_id: "MLA1111",
            title: "Samsung Galaxy",
            seller_id: 1234,
            initial_sold_quantity: 12,
            quantity: 8
          }
        ],
        err: [ ]
        
      }, done);

    });

    it('should create the listing if it did not exist with the given sold_quantity as the initial_sold_quantity', (done) => {
       var iphone = {
        listing_id: "MLA1234",
        title: "iPhone 6s 32GB",
        seller_id: 1234,
        sold_quantity: 20
      };
      var data = [iphone];

      request(app).post('/listings/upsert').send(data).expect(200, {
        ok:[
          {
            listing_id: "MLA1234",
            title: "iPhone 6s 32GB",
            seller_id: 1234,
            initial_sold_quantity: 20,
            quantity: 0
          }
        ],
        err: [ ]
        
      }, done);

    });

    it('should put listing with missing property in err array of result for further processing', (done) => {
       var iphone = {
        listing_id: "MLA1234",
        title: "iPhone 6s 32GB",
        seller_id: 1234
      };
      var data = [iphone];

      request(app).post('/listings/upsert').send(data).expect(200, {
        ok:[ ],
        err: [ iphone ]
        
      }, done);

    });

      it('should return 400 Bad Request when requested with more than 50 elements in body array', (done) => {
       var iphone = {
        listing_id: "MLA1234",
        title: "iPhone 6s 32GB",
        seller_id: 1234,
        sold_quantity: 20
      };
      var data = [];
      for(var i = 0; i < 59; i++) {
        data.push(iphone);
      }

      request(app).post('/listings/upsert').send(data).expect(400, done);

    });

  });
  
});
