/**
 * Copyright (c) 2014 Raoul van Rueschen
 * Licensed under the Zlib license.
 * 
 * This module offers methods that are closely tied to authentication.
 *
 * @author Raoul van Rueschen
 * @version 1.0.0, 15.12.2014
 */

"use strict";

/**
 * Counterpart of "onlyAnonymous".
 *
 * Optional middleware for accepting only authenticated requests
 * and redirecting all others to the login page.
 */

module.exports.onlyAuthenticated = function(request, response, next)
{
 if(!request.isAuthenticated())
 {
  response.redirect(request.params.json ? "/login/json" : "/login");
 }
 else
 {
  next();
 }
}

/**
 * Counterpart of "onlyAuthenticated".
 *
 * Optional middleware for accepting only requests from anonymous
 * users and redirecting all others to the account page.
 */

module.exports.onlyAnonymous = function(request, response, next)
{
 if(request.isAuthenticated())
 {
  response.redirect(request.params.json ? "/json" : "/");
 }
 else
 {
  next();
 }
}

/**
 * Session lifetime middleware for the login.
 */

module.exports.remember = function(request, response)
{
 if(request.body.remember)
 {
  request.session.cookie.maxAge = 1000 * 60 * 3;
 }
 else
 {
  request.session.cookie.expires = false;
 }
}

/**
 * The Login Page.
 */

module.exports.login = function(request, response, next)
{
 response.locals.jade = {};
 response.locals.jade.template = "login";
 response.locals.jade.locals = {
  title: "Login - AhKneeMay",
  description: "User login page.",
  currentPage: "Login",
  display: (request.isAuthenticated() ? "authenticated" : "anonymous"),
  message: request.flash("info"),
  user: request.user
 };

 next();
};

/**
 * The Signup Page.
 */

module.exports.signup = function(request, response, next)
{
 response.locals.jade = {};
 response.locals.jade.template = "signup";
 response.locals.jade.locals = {
  title: "Signup - AhKneeMay",
  description: "Signup page.",
  currentPage: "Signup",
  display: (request.isAuthenticated() ? "authenticated" : "anonymous"),
  message: request.flash("info"),
  user: request.user
 };

 next();
};
