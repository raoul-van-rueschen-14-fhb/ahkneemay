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
 "initialize aws": function(test)
 {
  test.expect(1);

  ahkneemay.init(true, "ahkneemay", function(result)
  {
   test.equal(result, null, "aws initialization should finish without errors under optimal conditions.");
   test.done();
  });
 },
 "add an anime": function(test)
 {
  var anime = {title: "dummy", img: {mimetype: "image/jpeg"}};

  ahkneemay.addAnime(anime, function(result)
  {
   test.equal(result, null, "adding an anime should not yield any errors under optimal conditions.");
   test.done();
  });
 }
};
