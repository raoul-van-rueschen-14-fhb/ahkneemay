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
 test1: function(test)
 {
  test.expect(1);

  ahkneemay.init(true, "ahkneemay", function(result)
  {
   test.equal(result, null, "aws initialization should finish without errors under optimal conditions.");
   test.done();
  });
 },
 test2: function(test)
 {
  var anime = {
   title: "dummy",
   author: "dummy",
   year: 2000,
   publisher: "dummy",
   img: {}
  };

  ahkneemay.addAnime(anime, {}, function(result)
  {
   test.equal(result, null, "adding an anime should not yield any errors under optimal conditions.");
   test.done();
  });
 }
};
