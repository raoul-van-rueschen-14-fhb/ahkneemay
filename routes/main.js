/**
 * These are the main routes which do not require authentication.
 *
 * @author Raoul van Rueschen
 * @version 0.0.1, 06.09.2014
 */

"use strict";

var ahkneemay = require("../lib/ahkneemay");

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
 * Adds a new anime to the db or shows a form for doing that.
 */

module.exports.addAnime = function(request, response, next)
{
 var anime = {
  title: request.body.title,
  author: request.body.author,
  year: request.body.year,
  publisher: request.body.publisher,
  img: request.files.pic
 };

 response.locals.jade = {};
 response.locals.jade.template = "anime";
 response.locals.jade.locals = {
  title: "Add an Anime - AhKneeMay",
  description: "Add a new title to your list of watched animes.",
  currentPage: "Add Anime",
  message: request.flash("error")
 };

 if(anime.title && anime.author && anime.year && anime.publisher && anime.img)
 {
  if(/^[0-9]+$/.test(anime.year))
  {
   // Check if the file is an image.
   if(anime.img.mimetype === "image/jpeg" || anime.img.mimetype === "image/png")
   {
    ahkneemay.addAnime(anime, response.locals.jade.locals, next);
   }
   else
   {
    request.flash("error", "The image's type must be JPG or PNG.");
    next();
   }
  }
  else
  {
   request.flash("error", "The year must be a numeric value!");
   next();
  }
 }
 else
 {
  request.flash("error", "Please fill out every field before submitting!");
  next();
 }
};

/**
 * Removes an anime.
 */

module.exports.removeAnime = function(request, response, next)
{
 var id = request.body.id;

 if(id)
 {
  ahkneemay.removeAnime(id, next);
 }
 else
 {
  response.redirect("/");
 }
};
