/*
 * AhKneeMay
 * https://github.com/raoul-van-rueschen-14-fhb/ahkneemay
 *
 * Copyright (c) 2014 Raoul van Rueschen
 * Licensed under the MIT license.
 */

"use strict";

var waterfall = require("async-waterfall"),
 AWS = require("aws-sdk"),
 s3, ddb, tableName,
 bucket, bucketURL = "http://ahkneemay.s3-website-eu-west-1.amazonaws.com/";

/**
 * AWS Setup.
 *
 * @param {?boolean} mock True if a mockup environment is desired (for testing).
 */

module.exports.setupAWS = function(mock)
{
 if(mock)
 {
  s3 = {
   createBucket: function(params, callback)
   {
    callback(null, {Location: "Fake URL"});
   }
  };
 }
 else
 {
  AWS.config.loadFromPath("./config/aws.json");
  AWS.config.region = "eu-west-1";
  s3 = new AWS.S3();
  ddb = new AWS.DynamoDB();
 }
};

/**
 * Tries to use a bucket with the given name or creates it if it doesn't exist.
 *
 * @param {string} name
 * @param {function} next Callback.
 * @return {boolean} The result of the operation.
 */

module.exports.setupBucket = function(name, next)
{
 var params = {Bucket: name};

 // Remember this name for further operations.
 bucket = name;

 s3.createBucket(params, function(error, info)
 {
  if(error)
  {
   // It's ok if the bucket already exists.
   next(error.statusCode === 409);
  }
  else
  {
   // Keep the url to the bucket in a variable.
   bucketURL = info.Location || null;
   next(true);
  }
 });
};

/**
 * Tries to use a bucket with the given name or creates it if it doesn't exist.
 *
 * @param {string} name
 * @param {function} next Callback.
 * @return {boolean} The result of the operation.
 */

module.exports.setupDynamoDB = function(name, next)
{
 //var params = {Bucket: name};
 waterfall([
  function sth(callback)
  {
   callback(ddb, tableName);
  }
 ],
 function(error)
 {
  if(error)
  {
   next(error);
  }
  else
  {
  }
 });
};

/**
 * Retrieves all animes from the db.
 *
 * @param {object} request
 * @param {object} response
 * @param {function} next Callback.
 */

module.exports.listAnimes = function(request, response, next)
{
 //var jadeLocals = response.locals.jade.locals;

 next();
};

/**
 * Adds an anime to the watched list if it doesn't already exist.
 *
 * @param {object} anime An object containing all the necessary information about an anime.
 * @param {object} jadeLocals An object that will be used in the jade engine for rendering the page contents.
 * @param {function} next Callback.
 */

module.exports.addAnime = function(anime, jadeLocals, next)
{
 var params = {
   Bucket: bucket,
   Key: anime.img.name,
   ACL: "public-read",
   Body: anime.img.buffer,
   ContentType: anime.img.mimetype,
   ContentLength: anime.img.size
  };

 // Check if the file is an image.
 //if(anime.img.mimetype)

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
};
