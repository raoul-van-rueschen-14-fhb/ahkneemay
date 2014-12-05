/*
 * AhKneeMay
 * https://github.com/raoul-van-rueschen-14-fhb/ahkneemay
 *
 * Copyright (c) 2014 Raoul van Rueschen
 * Licensed under the MIT license.
 */

"use strict";

var AWS = require("aws-sdk"),
 s3, bucket, bucketURL = "http://ahkneemay.s3-website-eu-west-1.amazonaws.com/";

/**
 * AWS Setup.
 *
 * @param {boolean} mock False if AWS should be used, true if a mockup environment is desired (e.g. for testing).
 */

module.exports.setupAWS = function(mock)
{
 if(!mock)
 {
  AWS.config.loadFromPath("./config/aws.json");
  AWS.config.region = "eu-west-1";
  s3 = new AWS.S3();
 }
 else
 {
  s3 = {};

  s3.createBucket = function(params, callback)
  {
   callback(null, {Location: "Fake URL"});
  };
 }
};

/**
 * Tries to use a bucket with the given name or creates it if it doesn't exist.
 *
 * @param {string} name
 * @param {Function} next Callback.
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
 * Retrieves all animes from the db.
 *
 * @param {Object} request
 * @param {Object} response
 * @param {Function} next Callback.
 */

module.exports.listAnimes = function(request, response, next)
{
 //var jadeLocals = response.locals.jade.locals;

 next();
};

/**
 * Adds an anime to the watched list if it doesn't already exist.
 *
 * @param {Object} anime An object containing all the necessary information about an anime.
 * @param {Object} jadeLocals An object that will be used in the jade engine for rendering the page contents.
 * @param {Function} next Callback.
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
