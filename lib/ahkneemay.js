/**
 * Copyright (c) 2014 Raoul van Rueschen
 * Licensed under the Zlib license.
 *
 * AhKneeMay Main Module.
 * The AWS magic happens here.
 *
 * @author Raoul van Rueschen
 * @version 1.0.0, 15.12.2014
 */

"use strict";

var waterfall = require("async-waterfall"),
 aws = require("../config/aws"),
 cloudFront = "http://dtwqtnxvycfxi.cloudfront.net/",
 onlyNumbers = /^[0-9]+$/;

/**
 * Retrieves all animes from the db.
 *
 * @param {object} locals - Jade locals that are used for rendering the page.
 * @param {string} username - The current user.
 * @param {function} next - Callback.
 */

function listAnimes(locals, username, next)
{
 var params = {
   ScanFilter: {
    username: {
     ComparisonOperator: "EQ",
     AttributeValueList: [{
      S: username
     }]
    }
   },
   TableName: aws.animeTable
  };

 locals.animes = [];
 locals.totalAnimes = 0;
 locals.cloudFront = cloudFront;

 if(username)
 {
  aws.dynamoDB.scan(params, function(error, data)
  {
   if(!error && data && data.Items)
   {
    locals.animes = data.Items;
    locals.totalAnimes = data.Count;
   }

   next(error);
  });
 }
 else
 {
  next();
 }
}

/**
 * Adds an anime to the watched list if it doesn't already exist.
 * Existing items will be updated.
 *
 * @param {object} anime - An object containing all the necessary information about the anime that will be added.
 * @param {string} username - The current user.
 * @param {function} next - Callback.
 */

function addAnime(anime, username, next)
{
 var object = {
   Bucket: aws.animeBucket,
   ACL: "public-read"
  },
  item = {
   TableName: aws.animeTable,
   Item: {
    title: {S: null},
    username: {S: username},
    img: {S: null}
   }
  };

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
   // Set the required parameters now.
   item.Item.title.S = anime.title.toLowerCase();
   item.Item.img.S = anime.img.name;
   object.Key = anime.img.name;
   object.Body = anime.img.buffer;
   object.ContentType = anime.img.mimetype;
   object.ContentLength = anime.img.size;
   callback();
  },
  function(callback)
  {
   var params = {
    Key: {
     title: {S: item.Item.title.S},
     username: {S: item.Item.username.S}
    },
    TableName: item.TableName
   };

   // Check if we're updating an existing anime.
   aws.dynamoDB.getItem(params, function(error, data)
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
    oldObject = {Bucket: aws.animeBucket, Key: null};
    if(data.Item.img) { oldObject.Key = data.Item.img.S; }

    // Remove the old image.
    aws.s3.deleteObject(oldObject, function(error)
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
   aws.s3.putObject(object, function(error)
   {
    callback(error);
   });
  },
  function(callback)
  {
   // Insert or update the item.
   aws.dynamoDB.putItem(item, function(error)
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
 * @param {string} anime - The name of the anime that should be removed.
 * @param {string} username - The current user.
 * @param {function} next - Callback.
 */

function removeAnime(anime, username, next)
{
 var params = {
   Key: {
    title: {S: anime.toLowerCase()},
    username: {S: username}
   },
   TableName: aws.animeTable
  },
  object = {
   Bucket: aws.animeBucket
  };

 waterfall([
  function(callback)
  {
   // Get the image name that's connected with this anime.
   aws.dynamoDB.getItem(params, function(error, data)
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
    aws.s3.deleteObject(object, function(error, info)
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
   aws.dynamoDB.deleteItem(params, function(error, data)
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
 listAnimes: listAnimes,
 addAnime: addAnime,
 removeAnime: removeAnime
};
