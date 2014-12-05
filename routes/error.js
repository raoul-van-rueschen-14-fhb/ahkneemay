/**
 * Deals with the different error codes
 * and sets appropriate response messages
 * for a custom error page.
 *
 * @author Raoul van Rueschen
 * @version 0.0.1, 06.09.2014
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
  locals.description = "This page is not accessable by the public.";
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
 }
 else
 {
  locals.description = "An internal Server error occured. The error has been logged and is being worked on. Please try again later!";
  locals.message = "This page was killed so hard that it died to death.";
  logger.log("error", error + "\n" + error.stack);
 }

 /*if(error.json)
 {
  response.writeHead(error.status, {"Content-Type": "application/json"});
  response.end(JSON.stringify({
   message: locals.message
  }));
 }
 else
 {*/
 response.status(error.status);
 response.render("error", locals);
 //}
};
