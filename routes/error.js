/**
 * Copyright (c) 2014 Raoul van Rueschen
 * Licensed under the MIT license.
 *
 * This module deals with the different http 
 * error codes and sets appropriate response
 * messages on a dedicated error page.
 *
 * @author Raoul van Rueschen
 * @version 1.0.0, 15.12.2014
 */

"use strict";

var navigation = require("./navigation"),
 logger = require("winston");

module.exports = function(error, request, response, next)
{
 var locals = {
  title: "Error",
  description: "An error occured.",
  currentPage: null,
  navigation: navigation,
  message: null,
  error: error
 };

 if(error.status === 400)
 {
  locals.description = "The request could not be understood due to malformed syntax.";
  locals.message = locals.description;
 }
 else if(error.status === 401)
 {
  locals.description = "This page is private and cannot be accessed without authentication.";
  locals.message = locals.description;
 }
 else if(error.status === 403)
 {
  locals.description = "This page is not publicly available.";
  locals.message = locals.description;
 }
 else if(error.status === 404)
 {
  locals.description = "The requested page does not exist.";
  locals.message = "The requested page does not exist.";
 }
 else if(error.status >= 400 && error.status < 500)
 {
  locals.description = "The received request was invalid and has thus been dropped.";
  locals.message = locals.description;
 }
 else if(error.status === 503)
 {
  locals.description = "This website is currently unavailable. Please try again later!";
  locals.message = locals.description;
  logger.log("error", error + "\n" + error.stack);
 }
 else
 {
  locals.description = "An internal Server error occured. The error has been logged and is being worked on. Please try again later!";
  locals.message = "This page was killed so hard that it died to death.";
  logger.log("error", error + "\n" + error.stack);
 }

 response.status(error.status);
 response.render("error", locals);
};
