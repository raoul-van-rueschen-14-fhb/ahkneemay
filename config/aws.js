/**
 * Copyright (c) 2014 Raoul van Rueschen
 * Licensed under the Zlib license.
 *
 * AWS Setup Module.
 *
 * @author Raoul van Rueschen
 * @version 1.0.0, 15.12.2014
 */

"use strict";

var waterfall = require("async-waterfall"),
 AWS = require("aws-sdk"),
 _animeBucket,
 _animeTable,
 _userTable,
 _bucketURL,
 _dynamoDB,
 _s3;

/**
 * Basic AWS Setup.
 *
 * @param {boolean} mock - True if a mockup environment is desired (for testing).
 * @param {function} next - Callback.
 */

function setupAWS(mock, next)
{
 // Create dummy objects with method stubs.
 if(mock)
 {
  _s3 = {
   createBucket: function(params, callback)
   {
    callback(null, {Location: "Fake URL"});
   },
   putObject: function(params, callback)
   {
    callback(null, {});
   },
   deleteObject: function(params, callback)
   {
    callback(null, {});
   }
  };

  _dynamoDB = {
   createTable: function(params, callback)
   {
    callback(null, {TableName: "Fake Table Name"});
   },
   putItem: function(params, callback)
   {
    callback(null, {});
   },
   getItem: function(params, callback)
   {
    callback(null, {Item: {}});
   },
   deleteItem: function(params, callback)
   {
    callback(null, {});
   },
   scan: function(params, callback)
   {
    callback(null, {Items: [], Count: 0});
   }
  };
 }
 else
 {
  AWS.config.loadFromPath("./config/aws.json");
  AWS.config.region = "eu-west-1";
  _s3 = new AWS.S3();
  _dynamoDB = new AWS.DynamoDB();
 }

 next();
}

/**
 * Tries to use a bucket with the given name or creates it if it doesn't exist.
 *
 * @param {string} prefix - Bucket prefix.
 * @param {function} next - Callback.
 */

function setupBucket(prefix, next)
{
 var bucket = {Bucket: prefix.toLowerCase()};

 // Remember this name for further operations.
 _animeBucket = bucket.Bucket;

 _s3.createBucket(bucket, function(error, info)
 {
  // Keep the url to the bucket in a variable for later use.
  _bucketURL = (info && info.Location) ? info.Location : bucket.Bucket + ".s3-website-" + AWS.config.region + ".amazonaws.com";
  // It's ok if the bucket already exists.
  next((error && error.statusCode === 409) ? null : error);
 });
}

/**
 * Tries to create the tables that are crucial for 
 * all further operations.
 *
 * @param {string} prefix - The table name prefix.
 * @param {function} next - Callback.
 */

function setupTables(prefix, next)
{
 var t1 = {
  AttributeDefinitions: [{
   AttributeName: "username",
   AttributeType: "S"
  }],
  KeySchema: [{
   AttributeName: "username",
   KeyType: "HASH"
  }],
  ProvisionedThroughput: {
   ReadCapacityUnits: 1,
   WriteCapacityUnits: 1
  },
  TableName: prefix.toLowerCase() + "_users"
 },
 t2 = {
  AttributeDefinitions: [{
   AttributeName: "title",
   AttributeType: "S"
  }, {
   AttributeName: "username",
   AttributeType: "S"
  }],
  KeySchema: [{
   AttributeName: "title",
   KeyType: "HASH"
  }, {
   AttributeName: "username",
   KeyType: "RANGE"
  }],
  ProvisionedThroughput: {
   ReadCapacityUnits: 1,
   WriteCapacityUnits: 1
  },
  TableName: prefix.toLowerCase() + "_animes"
 };

 waterfall([
  function(callback)
  {
   _dynamoDB.createTable(t1, function(error, data)
   {
    // It's not an error if it's a ResourceInUseException, because we created that resource.
    if(error && error.code === "ResourceInUseException") { error = null; }
    _userTable = data ? data.TableName : t1.TableName;
    callback(error);
   });
  },
  function(callback)
  {
   _dynamoDB.createTable(t2, function(error, data)
   {
    if(error && error.code === "ResourceInUseException") { error = null; }
    _animeTable = data ? data.TableName : t2.TableName;
    callback(error);
   });
  }
 ],
 function(error)
 {
  next(error);
 });
}

/**
 * Batch setup for all Amazon Web Services that will be used.
 *
 * @param {boolean} mock - Tells whether the environment should be prepared for testing.
 * @param {string} prefix - A prefix to use for creating or using buckets and tables.
 * @param {function} next - Callback.
 */

function init(mock, prefix, next)
{
 waterfall([
  function(callback)
  {
   setupAWS(mock, callback);
  },
  function(callback)
  {
   setupBucket(prefix, callback);
  },
  function(callback)
  {
   setupTables(prefix, callback);
  }
 ],
 function(error)
 {
  next(error);
 });
}

// Reveal public members.
module.exports = {
 init: init,
 get userTable() { return _userTable; },
 get animeTable() { return _animeTable; },
 get animeBucket() { return _animeBucket; },
 get bucketURL() { return _bucketURL; },
 get dynamoDB() { return _dynamoDB; },
 get s3() { return _s3; }
};
