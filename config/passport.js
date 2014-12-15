/**
 * Copyright (c) 2014 Raoul van Rueschen
 * Licensed under the Zlib license.
 *
 * Configuration of passport with a local
 * strategy using a Dynamo database.
 *
 * @author Raoul van Rueschen
 * @version 1.0.0, 15.12.2014
 */

"use strict";

var LocalStrategy = require("passport-local").Strategy,
 waterfall = require("async-waterfall"),
 bcrypt = require("bcrypt-nodejs"),
 uuid = require("node-uuid");

module.exports = function(passport, aws)
{
 // Used to serialize the user for the session.
 passport.serializeUser(function(user, done)
 {
  done(null, user.username.S);
 });

 // Used to deserialize the user.
 passport.deserializeUser(function(username, done)
 {
  waterfall([
   function fetchUser(callback)
   {
    var params = {
      Key: {
       username: {S: username}
      },
      TableName: aws.userTable
     };

    aws.dynamoDB.getItem(params, function(error, data)
    {
     callback(error, (data && data.Item ? data.Item : null));
    });
   }
  ],
  function(error, result)
  {
   if(result)
   {
    done(error, result);
   }
   else
   {
    // User has been deleted while being logged in. Invalid session id.
    done(error, false);
   }
  });
 });

 // Local signup
 passport.use("local-signup",
  new LocalStrategy({
   usernameField: "username",
   passwordField: "password",
   passReqToCallback: true
  },
  function(request, username, password, done)
  {
   // Check if the fake input field is set (making it harder for spam bots).
   if(request.body.email || request.body.user || request.body.pass)
   {
    done(null, false);
   }
   else if(username.length < 6)
   {
    done(null, false, request.flash("info", "The username must be at least 6 characters in length."));
   }
   else if(username.length > 20)
   {
    done(null, false, request.flash("info", "The username cannot contain more than 20 characters."));
   }
   else if(password.length < 8)
   {
    done(null, false, request.flash("info", "The password must be at least 8 characters in length."));
   }
   else if(password !== request.body.password2)
   {
    done(null, false, request.flash("info", "The two passwords didn't match!"));
   }
   else
   {
    waterfall([
     function checkForDuplicate(callback)
     {
      var params = {
        Key: {
         username: {S: username}
        },
        TableName: aws.userTable
       };

      aws.dynamoDB.getItem(params, function(error, data)
      {
       var signUpError;

       if(data && data.Item)
       {
        // Have to inform the user.
        signUpError = new Error("This username is already taken.");
        signUpError.fatal = false;
        callback(signUpError);
       }
       else
       {
        callback(error);
       }
      });
     },
     function createUser(callback)
     {
      var date = new Date(),
       item = {
        TableName: aws.userTable,
         Item: {
         username: {S: username},
         password: {S: bcrypt.hashSync(password, null, null)},
         created: {S: date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + 
                      date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds()}
        }
       };

      aws.dynamoDB.putItem(item, function(error)
      {
       callback(error, item.Item);
      });
     }
    ],
    function(error, newUser)
    {
     if(error)
     {
      if(!error.fatal)
      {
       done(null, false, request.flash("info", error.message));
      }
      else
      {
       done(error);
      }
     }
     else
     {
      request.flash("info", "The registration was successful!");
      done(null, newUser);
     }
    });
   }
  })
 );

 // Local login
 passport.use("local-login",
  new LocalStrategy({
   usernameField: "username",
   passwordField: "password",
   passReqToCallback: true
  },
  function(request, username, password, done)
  {
   waterfall([
    function fetchUser(callback)
    {
     var params = {
       Key: {
        username: {S: username}
       },
       TableName: aws.userTable
      };

     aws.dynamoDB.getItem(params, function(error, data)
     {
      var loginError;

      if(data && data.Item && bcrypt.compareSync(password, data.Item.password.S))
      {
       callback(error, data.Item);
      }
      else
      {
       loginError = new Error("The login data was invalid. Please try again!");
       loginError.fatal = false;
       callback(loginError);
      }
     });
    }
   ],
   function(error, user)
   {
    if(error)
    {
     if(!error.fatal)
     {
      done(null, false, request.flash("info", error.message));
     }
     else
     {
      done(error);
     }
    }
    else
    {
     done(null, user);
    }
   });
  })
 );
};
