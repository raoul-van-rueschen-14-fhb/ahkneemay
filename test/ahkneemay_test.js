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
 "setup aws": function(test)
 {
  test.expect(1);

  ahkneemay.init(true, "ahkneemay", function(result)
  {
   test.equal(result, null, "AWS initialization should run without errors.");
   test.done();
  });
 }
};
