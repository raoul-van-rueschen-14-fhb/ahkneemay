/**
 * These are the main routes which do not require authentication.
 *
 * @author Raoul van Rueschen
 * @version 0.0.1, 06.09.2014
 */

"use strict";

var ahkneemay = require("../lib/ahkneemay"),
 waterfall = require("async-waterfall"),
 onlyNumbers = /^[0-9]+$/;

/**
 * The Homepage.
 */

module.exports.index = function(request, response, next)
{
 response.locals.jade = {};
 response.locals.jade.template = "index";
 response.locals.jade.locals = {
  title: "AhKneeMay",
  description: "This is an overview of your watched animes.",
  currentPage: "Home"
 };

 ahkneemay.listAnimes(request, response, next);
};

/**
 * The About page.
 */

module.exports.about = function(request, response, next)
{
 response.locals.jade = {};
 response.locals.jade.template = "about";
 response.locals.jade.locals = {
  title: "About - AhKneeMay",
  description: "This website can keep track of your watched animes by storing information in the cloud.",
  currentPage: "About"
 };

 next();
};

/**
 * Shows a form for adding an anime.
 */

module.exports.formAddAnime = function(request, response, next)
{
 response.locals.jade = {};
 response.locals.jade.template = "anime";
 response.locals.jade.locals = {
  title: "Add an Anime - AhKneeMay",
  description: "Add a new title to your list of watched animes.",
  currentPage: "Add Anime",
  message: request.flash("info")
 };

 next();
};

/**
 * Adds a new anime to the list.
 */

module.exports.addAnime = function(request, response, next)
{
 var anime = {
  title: request.body.title,
  publisher: request.body.publisher,
  year: request.body.year,
  seasons: request.body.seasons,
  author: request.body.author,
  img: request.files.image
 };

 // Input validation.
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
   // All good, no try to add the anime.
   ahkneemay.addAnime(anime, callback);
  }
 ],
 function(error, result)
 {
  if(error) { request.flash("info", error.message); }
  else if(result) { request.flash("info", result); }
  response.redirect(request.params.json ? "/anime/json" : "/anime");
 });
};

/**
 * Removes an anime.
 */

module.exports.removeAnime = function(request, response, next)
{
 var anime = request.body.anime;

 if(anime)
 {
  ahkneemay.removeAnime(anime, next);
 }
 else
 {
  response.redirect("/");
 }
};
