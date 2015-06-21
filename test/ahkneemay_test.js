"use strict";

var aws = require("../config/aws"),
 ahkneemay = require("../lib/ahkneemay");

module.exports = {
 setUp: function(done)
 {
  aws.init(true, "dummy", done);
 },
 tearDown: function(done)
 {
  done();
 },
 "the aws module": function(test)
 {
  test.expect(6);
  test.ok(aws.userTable, "should reveal the name of the table that holds all users.");
  test.ok(aws.animeTable, "should reveal the name of the table that holds all animes.");
  test.ok(aws.animeBucket, "should reveal the name of the image bucket.");
  test.ok(aws.bucketURL, "should reveal the url of the image bucket.");
  test.ok(aws.dynamoDB, "should reveal the dynamoDB object.");
  test.ok(aws.s3, "should reveal the s3 object.");
  test.done();
 },
 "adding an anime (1)": function(test)
 {
  test.expect(1);
  ahkneemay.addAnime({}, null, function(error)
  {
   test.notEqual(error, null, "requires the title parameter.");
   test.done();
  });
 },
 "adding an anime (2)": function(test)
 {
  test.expect(1);
  ahkneemay.addAnime({title: "dummy"}, null, function(error)
  {
   test.notEqual(error, null, "requires the img parameter.");
   test.done();
  });
 },
 "adding an anime (3)": function(test)
 {
  test.expect(1);
  ahkneemay.addAnime({title: "dummy", img: {mimetype: "image/jpeg"}}, null, function(error)
  {
   test.ifError(error, "should work if the required parameters are set.");
   test.done();
  });
 },
 "listing all animes": function(test)
 {
  var locals = {};

  test.expect(2);
  ahkneemay.listAnimes(locals, null, function(error)
  {
   test.ifError(error, "should not result in an error under mockup conditions.");
   test.ok(locals.animes, "should populate the given locals object with a list of animes.");
   test.done();
  });
 },
 "removing an anime": function(test)
 {
  test.expect(1);
  ahkneemay.removeAnime("dummy", null, function(error)
  {
   test.ifError(error, "should not result in an error under mockup conditions.");
   test.done();
  });
 }
};
