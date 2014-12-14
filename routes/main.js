/**
 * Copyright (c) 2014 Raoul van Rueschen
 * Licensed under the Zlib license.
 * 
 * This module defines methods which actually generate and
 * assemble all the necessary data for each kind of request.
 * Most of these methods utilize methods from another module,
 * but some of them also act independently.
 *
 * @author Raoul van Rueschen
 * @version 0.1.0, 13.12.2014
 */

"use strict";

var http = require("http"),
 ahkneemay = require("../lib/ahkneemay");

/**
 * The Homepage.
 */

module.exports.index = function(request, response, next)
{
 response.locals.jade = {};
 response.locals.jade.template = "index";
 response.locals.jade.locals = {
  title: "AhKneeMay",
  description: "This page gives you an overview of your watched animes!",
  currentPage: "Home",
  display: (request.isAuthenticated() ? "authenticated" : "anonymous"),
  message: request.flash("info"),
  user: request.user
 };

 try
 {
  ahkneemay.listAnimes(response.locals.jade.locals, (request.user ? request.user.username.S : null), next);
 }
 catch(e)
 {
  e.status = 503;
  next(e);
 }
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
  currentPage: "About",
  display: (request.isAuthenticated() ? "authenticated" : "anonymous"),
  user: request.user
 };

 next();
};

/**
 * An info page that uses the external "TV-Rage" API for fetching quickinfos about a given show.
 * This page is more of a workaround because ajax alone cannot request external resources.
 *
 * @todo Implement caching, maybe?
 */

module.exports.quickinfo = function(request, response, next)
{
 var apiCall, responseText = "",
  options = {
   host: "services.tvrage.com", port: 80, method: "GET",
   path: "/tools/quickinfo.php?show=" + encodeURIComponent(request.params.anime)
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
  response.writeHead(503, {"Content-Type": "text/plain"});
  response.end(responseText);
 });
};

/**
 * Shows a form for adding an anime.
 */

module.exports.showForm = function(request, response, next)
{
 response.locals.jade = {};
 response.locals.jade.template = "addanime";
 response.locals.jade.locals = {
  title: "Add an Anime - AhKneeMay",
  description: "Add a new title to your list of watched animes.",
  currentPage: "Add Anime",
  display: (request.isAuthenticated() ? "authenticated" : "anonymous"),
  message: request.flash("info"),
  user: request.user
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

 try
 {
  ahkneemay.addAnime(anime, request.user.username.S, function(error, result)
  {
   request.flash("info", error ? error.message : result);
   response.redirect(request.params.json ? "/animes/json" : "/animes");
  });
 }
 catch(e)
 {
  e.status = 503;
  next(e);
 }
};

/**
 * Removes an anime.
 */

module.exports.removeAnime = function(request, response, next)
{
 try
 {
  ahkneemay.removeAnime(request.params.anime, request.user.username.S, function(error, result)
  {
   request.flash("info", error ? error.message : result);
   response.redirect(request.params.json ? "/json" : "/");
  });
 }
 catch(e)
 {
  e.status = 503;
  next(e);
 }
};
