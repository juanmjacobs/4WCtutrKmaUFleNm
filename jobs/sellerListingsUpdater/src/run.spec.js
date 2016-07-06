var nock = require("nock");
var constants = require("../config/constants");
var should = require("chai").should();
var request = require('supertest');
var service = require('./sellerListingsUpdaterService');
var app = include('app').app;

describe('SellerListingsUpdater', () => {

  var samsung, iphone, samsungListing, iphoneListing, responseML;

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
    samsungListing = {
      listing_id:'MLM1111',
      sold_quantity: 11,
      title: "Samsung Galaxy",
      seller_id: constants.SELLER_ID 
    }
    iphoneListing = {
      listing_id:'MLM2222',
      sold_quantity: 22,
      title: "iPhone 6",
      seller_id: constants.SELLER_ID
    }
    responseML = {
      paging: {
        offset:0,
        total:2,
        limit:50
      },
      results:[samsung,iphone]
    };
    done();
  });

  it('should get batch with offset 0 to start process', (done) => {

    var mercadolibre = nock(constants.ML_API_URL)
                .get('/sites/MLM/search')
                .query({seller_id: constants.SELLER_ID, offset:0,attributes:'results,paging'})
                .reply(200, responseML);

    service.getListings(0,(response)=>{

          response.should.eql({
                  paging: {
                    offset:0,
                    total:2,
                    limit:50
                  },
                  results:[samsung,iphone]
          });
          done();
    })
  
  });

  it('should get 2 batches for a seller with 110 listings with offset step 50', (done) => {

    var batchesOffset = service.getBatchesOffset(110);
    batchesOffset.should.eql([50,100]);
    done();
  
  });

  it('should map response from mercadolibre to a listing array with the format of listing tracker API', (done) => {
    
    var listings = service.transforMLResponseToListings(responseML);
    listings.should.eql([samsungListing,iphoneListing]);
    done();

  });

  it('should send all listings in responseML to listing tracker API and upsert them', (done) => {
    
     var listingTracker = nock(service.getCurrentListingTrackerUrl())
                .post('/listings/upsert',[samsungListing,iphoneListing])
                .reply(200, {
                   ok:[ 
                        {
                          listing_id:'MLM1111',
                          initial_sold_quantity: 11,
                          quantity:0,
                          title: "Samsung Galaxy",
                          seller_id: constants.SELLER_ID 
                        },
                        {
                          listing_id:'MLM2222',
                          initial_sold_quantity: 22,
                          quantity:0,
                          title: "iPhone 6",
                          seller_id: constants.SELLER_ID 
                        }
                    ],
                   err:[]
                 });

    
    service.processMLResponse(responseML, (responseAPI)=>{
        responseAPI.should.eql({
          response: {
            ok:[ 
                {
                  listing_id:'MLM1111',
                  initial_sold_quantity: 11,
                  quantity:0,
                  title: "Samsung Galaxy",
                  seller_id: constants.SELLER_ID 
                },
                {
                  listing_id:'MLM2222',
                  initial_sold_quantity: 22,
                  quantity:0,
                  title: "iPhone 6",
                  seller_id: constants.SELLER_ID 
                }
            ],
           err:[]
          },
          totalListings:2
          
        });
        done();
    });
    
  });



});