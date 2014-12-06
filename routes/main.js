/**
 * These are the main routes which do not require authentication.
 *
 * @author Raoul van Rueschen
 * @version 0.0.1, 06.09.2014
 */

"use strict";

var ahkneemay = require("../lib/ahkneemay"),
 http = require("http");

/**
 * The Homepage.
 */

module.exports.index = function(request, response, next)
{
 response.locals.jade = {};
 response.locals.jade.template = "index";
 response.locals.jade.locals = {
  title: "AhKneeMay",
  description: "This page shows you an overview of your watched animes.",
  currentPage: "Home",
  message: request.flash("info")
 };

 ahkneemay.listAnimes(response.locals.jade.locals, next);
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
 * An info page that uses the external "TV-Rage" API for fetching quickinfos about a given show.
 * This page is more of a workaround because ajax alone cannot request external resources, but it
 * works great.
 */

module.exports.quickinfo = function(request, response, next)
{
 var apiCall, responseText = "",
  options = {
   host: "services.tvrage.com", port: 80, method: "GET",
   path: "/tools/quickinfo.php?show=" + request.params.anime
  };

 apiCall = http.request(options, function(res)
 {
  res.on("data", function(chunk) { responseText += chunk; });
  res.on("end", function()
  {
   response.writeHead(res.statusCode, {"Content-Type": "text/plain"});
   response.end(responseText);
  });
 });

 apiCall.end();
 apiCall.on("error", function(error)
 {
  responseText = error.message;
  response.writeHead(500, {"Content-Type": "text/plain"});
  response.end(responseText);
 });
};

/**
 * Shows a form for adding an anime.
 */

module.exports.form = function(request, response, next)
{
 response.locals.jade = {};
 response.locals.jade.template = "form";
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

 ahkneemay.addAnime(anime, function(error, result)
 {
  request.flash("info", error ? error.message : result);
  response.redirect(request.params.json ? "/animes/json" : "/animes");
 });
};

/**
 * Removes an anime.
 */

module.exports.removeAnime = function(request, response, next)
{
 var anime = request.params.anime;

 ahkneemay.removeAnime(anime, function(error, result)
 {
  request.flash("info", error ? error.message : result);
  response.redirect(request.params.json ? "/json" : "/");
 });
};
