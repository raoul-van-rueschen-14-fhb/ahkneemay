/**
 * Copyright (c) 2014 Raoul van Rueschen
 * Licensed under the Zlib license.
 * 
 * Main Server Configuration.
 * 
 * @author Raoul van Rueschen
 * @version 1.0.0, 15.12.2014
 */

"use strict";

var cookieParser = require("cookie-parser"),
 session = require("express-session"),
 bodyParser = require("body-parser"),
 favicon = require("serve-favicon"),
 flash = require("connect-flash"),
 passport = require("passport"),
 aws = require("./config/aws"),
 express = require("express"),
 logger = require("winston"),
 multer  = require("multer"),
 http = require("http"),
 path = require("path"),
 server = express(),
 httpServer,
 startTime,
 args;

args = process.argv.slice(2);
server.set("port", (args[0] ? args[0] : 80));
server.set("env", (args[1] ? args[1] : "development"));

// Setup logging to a log file. (Only for production.)
if(server.get("env") === "production")
{
 logger.add(logger.transports.File, {filename: "./logs/server.log", json: false});
 logger.remove(logger.transports.Console);
}

// Configure passport and connect it with the db.
require("./config/passport")(passport, aws);

// Setup the template engine.
server.set("views", path.join(__dirname, "views"));
server.set("view engine", "jade");

// Read cookies.
server.use(cookieParser());

// Use sessions.
server.use(session({
 secret: "H/eX-N}Yp?T7jbW1337", /* Randomized */
 saveUninitialized: true,
 resave: true
}));

// Message relaying with sessions.
server.use(flash());

// Start passport with persistent login sessions and use it.
server.use(passport.initialize());
server.use(passport.session());

// Get information from html forms with enctype "x-www-form-urlencoded".
server.use(bodyParser.urlencoded({limit: "1mb", extended: false}));

// Get files from html forms with enctype "form-data" and hold it in memory for an S3 transfer.
server.use(multer({
 dest: "./uploads/",
 inMemory: true
}));

// Browsers fetch the favicon with an additional request. Handle that seperately.
server.use(favicon(path.join(__dirname, "public/img/favicon.ico")));

// Publish the static contents in the "public"-folder.
server.use(express.static(path.join(__dirname, "public")));

// Send html with newlines and indention. (Only for development.)
if(server.get("env") === "development")
{
 server.locals.pretty = true;
}

// Setup the routes.
require("./routes/index")(server, passport);

// Initialize AWS and start the http server afterwards.
aws.init(false, "ahkneemay", function(error)
{
 if(error)
 {
  logger.log("error", "Could not start the server. " + error);
 }
 else
 {
  // Start the server.
  httpServer = http.createServer(server);
  httpServer.listen(server.get("port"), function()
  {
   var timeString;

   startTime = new Date();
   server.set("startTime", startTime.getFullYear() + "-" + (startTime.getMonth() + 1) + "-" + startTime.getDate() + " " +
                startTime.getHours() + ":" + startTime.getMinutes() + ":" + startTime.getSeconds());

   logger.log("info", "Start time: " + server.get("startTime"));
   logger.log("info", "HTTP-Server is now running on port " + server.get("port"));
  });
 }
});
