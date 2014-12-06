/*
 * AhKneeMay
 * https://github.com/raoul-van-rueschen-14-fhb/ahkneemay
 *
 * Copyright (c) 2014 Raoul van Rueschen
 * Licensed under the MIT license.
 */

"use strict";

var waterfall = require("async-waterfall"),
 AWS = require("aws-sdk"), s3, dynamoDB,
 tableName, bucketName, bucketURL;

/**
 * Basic AWS setup by loading a json configuration.
 *
 * @param {boolean} mock True if a mockup environment is desired (for testing).
 * @param {function} next Callback.
 */

function setupAWS(mock, next)
{
 // Create dummy objects with method stubs.
 if(mock)
 {
  s3 = {
   createBucket: function(params, callback)
   {
    callback(null, {Location: "Fake URL"});
   },
   putObject: function(params, callback)
   {
    callback(null, {});
   }
  };

  dynamoDB = {
   createTable: function(params, callback)
   {
    callback(null, {TableName: "Fake Table Name"});
   },
   putItem: function(params, callback)
   {
    callback(null, {});
   }
  };
 }
 else
 {
  // The real deal.
  AWS.config.loadFromPath("./config/aws.json");
  AWS.config.region = "eu-west-1";
  s3 = new AWS.S3();
  dynamoDB = new AWS.DynamoDB();
 }

 next();
}

/**
 * Tries to use a bucket with the given name or creates it if it doesn't exist.
 *
 * @param {string} name
 * @param {function} next Callback.
 */

function setupBucket(name, next)
{
 var bucket = {Bucket: name};

 // Remember this name for further operations.
 bucketName = name;

 s3.createBucket(bucket, function(error, info)
 {
  // Keep the url to the bucket in a variable for later use.
  bucketURL = (info && info.Location) ? info.Location : null;
  // It's ok if the bucket already exists.
  next((error && error.statusCode === 409) ? null : error);
 });
}

/**
 * Tries to use a table with the given name or creates it if it doesn't exist.
 *
 * @param {string} name
 * @param {function} next Callback.
 */

function setupTable(name, next)
{
 var table = {
  AttributeDefinitions: [{
   AttributeName: "title",
   AttributeType: "S"
  }],
  KeySchema: [{
   AttributeName: "title",
   KeyType: "HASH"
  }],
  ProvisionedThroughput: {
   ReadCapacityUnits: 1,
   WriteCapacityUnits: 1
  },
  TableName: name
 };

 dynamoDB.createTable(table, function(error, data)
 {
  // It's not considered an error if it's a ResourceInUseException.
  if(error && error.code === "ResourceInUseException") { error = null; }
  // Remember the table name for later use.
  tableName = data ? data.TableName : name;
  next(error);
 });
}

/**
 * Batch setup for all Amazon Web Services that will be used.
 *
 * @param {boolean} mock Tells whether the environment should be prepared for testing.
 * @param {string} name A name to use for creating or using a bucket and a table.
 * @param {function} next Callback.
 */

function init(mock, name, next)
{
 waterfall([
  function(callback)
  {
   setupAWS(mock, callback);
  },
  function(callback)
  {
   setupBucket(name, callback);
  },
  function(callback)
  {
   setupTable(name, callback);
  }
 ],
 function(error)
 {
  next(error);
 });
}

/**
 * Retrieves all animes from the db.
 *
 * @param {object} request
 * @param {object} response
 * @param {function} next Callback.
 */

function listAnimes(request, response, next)
{
 //var jadeLocals = response.locals.jade.locals;

 next();
}

/**
 * Adds an anime to the watched list if it doesn't already exist.
 * Existing items will be updated.
 *
 * @param {object} anime An object containing all the necessary information about the anime that will be added.
 * @param {function} next Callback.
 */

function addAnime(anime, next)
{
 var item = {
   TableName: tableName,
   Item: {
    title: {S: anime.title},
    img: {S: anime.img.name}
   }
  },
  object = {
   Bucket: bucketName,
   Key: anime.img.name,
   ACL: "public-read",
   Body: anime.img.buffer,
   ContentType: anime.img.mimetype,
   ContentLength: anime.img.size
  };

 // Add optional item attributes if set.
 if(anime.publisher) { item.Item.publisher = {S: anime.publisher}; }
 if(anime.year) { item.Item.year = {N: anime.year}; }
 if(anime.seasons) { item.Item.seasons = {N: anime.seasons}; }
 if(anime.author) { item.Item.author = {S: anime.author}; }

 waterfall([
  function(callback)
  {
   // Store the image.
   s3.putObject(object, function(error, info)
   {
    callback(error, info);
   });
  },
  function(info, callback)
  {
   // Insert or update the item.
   dynamoDB.putItem(item, function(error, data)
   {
    callback(error, data);
   });
  }
 ],
 function(error)
 {
  var result = error ? null : "The Anime has successfully been added!";
  next(error, result);
 });
}

/**
 * Removes an anime.
 *
 * @param {string} anime The id of the anime that should be removed.
 * @param {function} next Callback.
 */

function removeAnime(anime, next)
{
 next(anime);
}

// Reveal public members.
module.exports = {
 init: init,
 listAnimes: listAnimes,
 addAnime: addAnime,
 removeAnime: removeAnime
};
