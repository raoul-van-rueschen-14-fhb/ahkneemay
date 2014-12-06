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
 tableName, bucket, bucketURL;

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
    callback(null, {TableName: params.TableName});
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
 var params = {Bucket: name};

 s3.createBucket(params, function(error, info)
 {
  if(error)
  {
   // It's ok if the bucket already exists.
   next((error.statusCode === 409) ? null : error);
  }
  else
  {
   // Remember this name for further operations.
   bucket = name;
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
 var params = {
  AttributeDefinitions: [{
   AttributeName: "name",
   AttributeType: "S"
  }],
  KeySchema: [{
   AttributeName: "name",
   KeyType: "HASH"
  }],
  ProvisionedThroughput: {
   ReadCapacityUnits: 0,
   WriteCapacityUnits: 0
  },
  TableName: name
 };

 dynamoDB.createTable(params, function(error, data)
 {
  // Remember the table name for later use.
  tableName = error ? null : data.TableName;
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
 var params = {
   Bucket: bucket,
   Key: anime.img.name,
   ACL: "public-read",
   Body: anime.img.buffer,
   ContentType: anime.img.mimetype,
   ContentLength: anime.img.size
  };

 // Store the image.
 s3.putObject(params, function(error, info)
 {
  if(error)
  {
   next(error);
  }
  else
  {
   jadeLocals.message = info;
   next();
  }
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
