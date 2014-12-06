/**
 * Test Suite for the AhKneeMay Module.
 */

"use strict";

var ahkneemay;

module.exports = {
 setUp: function(done)
 {
  ahkneemay = require("../lib/ahkneemay.js");
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
