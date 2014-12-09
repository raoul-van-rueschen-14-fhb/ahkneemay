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
 tableName, bucketName, bucketURL,
 cloudFront = "http://dtwqtnxvycfxi.cloudfront.net/", /* Renders the S3 bucket setup superfluous :( */
 onlyNumbers = /^[0-9]+$/;

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
   },
   deleteObject: function(params, callback)
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
 var bucket = {Bucket: name.toLowerCase()};

 // Remember this name for further operations.
 bucketName = name;

 s3.createBucket(bucket, function(error, info)
 {
  // Keep the url to the bucket in a variable for later use.
  bucketURL = (info && info.Location) ? info.Location : name + ".s3-website-" + AWS.config.region + ".amazonaws.com";
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
  TableName: name.toLowerCase()
 };

 dynamoDB.createTable(table, function(error, data)
 {
  // It's not considered an error if it's a ResourceInUseException, because we created that resource.
  if(error && error.code === "ResourceInUseException") { error = null; }
  // Remember the table name for later use.
  tableName = data ? data.TableName : name.toLowerCase();
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
 * @param {object} locals Jade locals that are used for rendering the page.
 * @param {function} next Callback.
 */

function listAnimes(locals, next)
{
 var params = {TableName: tableName};

 // Change this to a query when implementing user authentication and filter for user ids!
 dynamoDB.scan(params, function(error, data)
 {
  if(!error)
  {
   locals.animes = data.Items;
   locals.totalAnimes = data.Count;
   locals.cloudFront = cloudFront;
  }

  next(error);
 });
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

 if(anime.title) { item.Item.title.S = anime.title.toLowerCase(); }
 // Add optional item attributes if they are set.
 if(anime.publisher) { item.Item.publisher = {S: anime.publisher.toLowerCase()}; }
 if(anime.year) { item.Item.year = {N: anime.year}; }
 if(anime.seasons) { item.Item.seasons = {N: anime.seasons}; }
 if(anime.author) { item.Item.author = {S: anime.author.toLowerCase()}; }

 // Starts with input validation.
 waterfall([
  function(callback)
  {
   // Check if the required fields are set.
   var error = (anime.title && anime.img) ? null : new Error("Please fill out every required field!");
   callback(error);
  },
  function(callback)
  {
   // Check if the year is set and if so: make sure it's a numeric value.
   var error = (!anime.year || (anime.year && onlyNumbers.test(anime.year))) ? null : new Error("Please provide a numeric value for the year.");
   callback(error);
  },
  function(callback)
  {
   // Check if the seasons count is set and if so: make sure it's a numeric value.
   var error = (!anime.seasons || (anime.seasons && onlyNumbers.test(anime.seasons))) ? null : new Error("Please provide a numeric value for the amount of seasons.");
   callback(error);
  },
  function(callback)
  {
   // Check if the provided file is an image.
   var error = (anime.img.mimetype === "image/jpeg" || anime.img.mimetype === "image/png") ? null : new Error("The image's type must be JPG or PNG.");
   callback(error);
  },
  function(callback)
  {
   var params = {
    Key: {
     title: {S: item.Item.title.S}
    },
    TableName: tableName
   };

   // Check if we're updating an existing anime.
   dynamoDB.getItem(params, function(error, data)
   {
    callback(error, data);
   });
  },
  function(data, callback)
  {
   var oldObject;

   // Does this anime already exist?
   if(data && data.Item)
   {
    oldObject = {Bucket: bucketName, Key: null};
    if(data.Item.img) { oldObject.Key = data.Item.img.S; }

    // Remove the old image.
    s3.deleteObject(oldObject, function(error)
    {
     callback(error);
    });
   }
   else
   {
    callback(null);
   }
  },
  function(callback)
  {
   // Store the new image.
   s3.putObject(object, function(error)
   {
    callback(error);
   });
  },
  function(callback)
  {
   // Insert or update the item.
   dynamoDB.putItem(item, function(error)
   {
    callback(error);
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
 * @param {string} anime The name of the anime that should be removed.
 * @param {function} next Callback.
 */

function removeAnime(anime, next)
{
 var params = {
   Key: {
    title: {S: anime.toLowerCase()}
   },
   TableName: tableName
  },
  object = {
   Bucket: bucketName
  };

 waterfall([
  function(callback)
  {
   // Get the image name that's connected with this anime.
   dynamoDB.getItem(params, function(error, data)
   {
    callback(error, data);
   });
  },
  function(data, callback)
  {
   if(data && data.Item)
   {
    object.Key = data.Item.img ? data.Item.img.S : null;
    // Remove the image first.
    s3.deleteObject(object, function(error, info)
    {
     callback(error, info);
    });
   }
   else
   {
    callback(new Error("The specified anime could not be found!"));
   }
  },
  function(info, callback)
  {
   // Remove the anime now.
   dynamoDB.deleteItem(params, function(error, data)
   {
    callback(error, data);
   });
  }
 ],
 function(error)
 {
  var result = error ? null : "The anime \"" + anime + "\" has been removed.";
  next(error, result);
 });
}

// Reveal public members.
module.exports = {
 init: init,
 listAnimes: listAnimes,
 addAnime: addAnime,
 removeAnime: removeAnime
};
