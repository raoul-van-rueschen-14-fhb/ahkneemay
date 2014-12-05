/**
 * Test Suite for the AhKneeMay Module.
 */

"use strict";

var ahkneemay = require("../lib/ahkneemay.js");

module.exports = {
 setUp: function(done)
 {
  // Setup AWS as Mockup.
  ahkneemay.setupAWS(false);
  done();
 },
 tearDown: function(done)
 {
  // Cleanup
  done();
 },
 "create or use a bucket with an arbitrary name": function(test)
 {
  test.expect(1);

  ahkneemay.setupBucket("ahkneemay", function(result)
  {
   test.ok(result, "Bucket setup should succeed.");
   test.done();
  });
 }
};
