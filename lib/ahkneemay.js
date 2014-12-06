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
 * Basic AWS setup and configuration from JSON.
 *
 * @param {boolean} mock True if a mockup environment is desired (for testing).
 * @param {function} next Callback.
 */

function setupAWS(mock, next)
{
 if(mock)
 {
  // Create dummy objects with method stubs.
  s3 = {
   createBucket: function(params, callback)
   {
    callback(null, {Location: "Fake URL"});
   }
  };
  dynamoDB = {
   createTable: function(params, callback)
   {
    callback(null, {TableName: "Fake Table Name"});
   }
  };
 }
 else
 {
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
 * @return {boolean} The result of the operation.
 */

function setupBucket(name, next)
{
 var bucket = {Bucket: name};

 // Remember this name for further operations.
 bucketName = name;

 s3.createBucket(bucket, function(error, info)
 {
  if(error)
  {
   // It's ok if the bucket already exists.
   next((error.statusCode === 409) ? null : error);
  }
  else
  {
   // Keep the url to the bucket in a variable.
   bucketURL = info.Location || null;
   next(null);
  }
 });
}

/**
 * Tries to use a table with the given name or creates it if it doesn't exist.
 *
 * @param {string} name
 * @param {function} next Callback.
 * @return {boolean} The result of the operation.
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
 * @param {boolean} mock
 * @param {string} name
 * @param {function} next Callback.
 * @return {boolean} The result of the operation.
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
 *
 * @param {object} anime An object containing all the necessary information about an anime.
 * @param {object} jadeLocals An object that will be used in the jade engine for rendering the page contents.
 * @param {function} next Callback.
 */

function addAnime(anime, jadeLocals, next)
{
 var item = {
   TableName: tableName,
   Item: {
    title: {S: anime.title},
    author: {S: anime.author},
    year: {N: anime.year},
    publisher: {S: anime.publisher},
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

 waterfall([
  function(callback)
  {
   // Store the image.
   s3.putObject(object, function(error, info)
   {
    for(var p in info) { console.log(p + ": " + info.p); }
    callback(error, info);
   });
  },
  function(info, callback)
  {
   // Insert or update the item.
   dynamoDB.putItem(item, function(error, data)
   {
    for(var p in data) { console.log(p + ": " + data.p); }
    callback(error, data);
   });
  }
 ],
 function(error, result)
 {
  jadeLocals.message = result;
  next(error);
 });
}

/**
 * Removes an anime.
 *
 * @param {string} anime The id of the anime that should be removed.
 * @param {object} jadeLocals An object that will be used in the jade engine for rendering the page contents.
 * @param {function} next Callback.
 */

function removeAnime(anime, jadeLocals, next)
{
 jadeLocals.message = anime;
 next();
}

// Reveal public members.
module.exports = {
 init: init,
 listAnimes: listAnimes,
 addAnime: addAnime,
 removeAnime: removeAnime
};
