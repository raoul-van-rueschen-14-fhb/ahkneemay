/**
 * Test Suite for the AhKneeMay Module.
 */

"use strict";

var ahkneemay = require("../lib/ahkneemay.js");

module.exports = {
 setUp: function(done)
 {
  done();
 },
 tearDown: function(done)
 {
  done();
 },
 "initializing aws": function(test)
 {
  test.expect(1);

  ahkneemay.init(true, "ahkneemay", function(error)
  {
   test.equal(error, null, "should finish without errors under mockup conditions.");
   test.done();
   // What happens if there IS an error? -The server will log the error and then exit.
   // Note: Errors in private sub-methods which are used by init will bubble up.
  });
 },
 "adding an anime": function(test)
 {
  var anime = {title: "dummy", img: {mimetype: "image/jpeg"}};

  test.expect(1);

  ahkneemay.addAnime(anime, function(error)
  {
   test.equal(error, null, "should not yield any errors under mockup conditions.");
   test.done();
  });
 },
 "listing all animes": function(test)
 {
  var locals = {};

  test.expect(2);

  ahkneemay.listAnimes(locals, function(error)
  {
   test.equal(error, null, "should not result in an error under mockup conditions.");
   test.ok(locals.animes, "and there should be a set of animes in the provided locals afterwards.");
   test.done();
  });
 },
 "removing an anime": function(test)
 {
  test.expect(1);

  ahkneemay.removeAnime("dummy", function(error)
  {
   test.equal(error, null, "should not result in an error under mockup conditions.");
   test.done();
  });
 }
};
