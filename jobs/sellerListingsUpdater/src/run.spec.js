var nock = require("nock");
var constants = require("../config/constants");
var should = require("chai").should();
var request = require('supertest');
var service = require('./sellerListingsUpdaterService');
var app = include('app').app;

describe('SellerListingsUpdater', () => {

  var samsung, iphone;

  beforeEach((done) => {
     samsung = {
      id:'MLM1111',
      sold_quantity: 11,
      title: "Samsung Galaxy",
      seller: { id: constants.SELLER_ID },
      extraMLData:{}
    }
    iphone = {
      id:'MLM2222',
      sold_quantity: 22,
      title: "iPhone 6",
      seller: { id: constants.SELLER_ID },
      extraMLData:{}
    }
    done();
  });
  
  it('should get 2 batches for a seller with 110 listings', (done) => {

    var batchesOffset = service.getBatchesOffset(110);

    batchesOffset.should.eql([1,2].map((offset)=>{return offset*constants.OFFSET_STEP}));
    done();
  
  });
  
  it('should get and map first batch of listings', (done) => {

    var mercadolibre = nock(constants.ML_API_URL)
                .get('/sites/MLM/search')
                .query({seller_id: constants.SELLER_ID, offset:0,attributes:'results,paging'})
                .reply(200, {
                  paging: {
                    offset:0,
                    total:2,
                    limit:50
                  },
                  results:[samsung,iphone]
                 });

    service.getListings(0,(response)=>{
          response.should.eql({
                  totalListings: 2,
                  response: {
                      ok: [
                      {
                        listing_id:'MLM1111',
                        initial_sold_quantity: 11,
                        title: "Samsung Galaxy",
                        quantity: 0,
                        seller_id: constants.SELLER_ID
                      },
                      {
                        listing_id:'MLM2222',
                        initial_sold_quantity: 22,
                        title: "iPhone 6",
                        quantity: 0,
                        seller_id: constants.SELLER_ID
                      }
                    ],
                    err:[ ]
                  }
                 });

          done();
    })
  
  });

});