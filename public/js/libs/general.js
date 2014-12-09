/**
 * Copyright (c) 2014 Raoul van Rueschen
 * 
 * This software is provided 'as-is', without any express or implied
 * warranty. In no event will the authors be held liable for any damages
 * arising from the use of this software.
 * 
 * Permission is granted to anyone to use this software for any purpose,
 * including commercial applications, and to alter it and redistribute it
 * freely, subject to the following restrictions:
 *  1. The origin of this software must not be misrepresented; you must not
 *     claim that you wrote the original software. If you use this software
 *     in a product, an acknowledgment in the product documentation would be
 *     appreciated but is not required.
 *  2. Altered source versions must be plainly marked as such, and must not be
 *     misrepresented as being the original software.
 *  3. This notice may not be removed or altered from any source distribution.

 * @author Raoul van Rueschen
 * @version 0.0.1, 16.09.2014
 */

(function(undefined, window, document)
{
 "use strict";

/**
 * Generalize the Animation API.
 */

(function animationAPI()
{
 var lastTime = 0,
  vendors = ["webkit", "moz"];

 for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x)
 {
  window.requestAnimationFrame = window[vendors[x] + "RequestAnimationFrame"];
  window.cancelAnimationFrame = window[vendors[x] + "CancelAnimationFrame"] || window[vendors[x] + "CancelRequestAnimationFrame"];
 }

 // Fallback for requestAnimationFrame
 if(!window.requestAnimationFrame)
 {
  window.requestAnimationFrame = function(callback)
  {
   var currTime = new Date().getTime(),
    timeToCall = Math.max(0, 16 - (currTime - lastTime)),
    id = window.setTimeout(function() { callback(currTime + timeToCall); }, timeToCall);

   lastTime = currTime + timeToCall;

   return id;
  };
 } 

 // Fallback for cancelAnimationFrame
 if(!window.cancelAnimationFrame)
 {
  window.cancelAnimationFrame = function(id)
  {
   window.clearTimeout(id);
  };
 }
}());

/**
 * Provides information about the screen size.
 *
 * @return An object containing the current width and height of the screen.
 */

window.getScreenSize = function()
{
 var size = {width: 0, height: 0};

 if(typeof window.innerWidth === "number")
 {
  size.width = window.innerWidth;
  size.height = window.innerHeight;
 }
 else if(document.documentElement && (document.documentElement.clientWidth || document.documentElement.clientHeight))
 {
  // IE 6+ ("standards compliant mode")
  size.width = document.documentElement.clientWidth;
  size.height = document.documentElement.clientHeight;
 }
 else if(document.body && (document.body.clientWidth || document.body.clientHeight))
 {
  // IE 4
  size.width = document.body.clientWidth;
  size.height = document.body.clientHeight;
 }

 return size;
};

/**
 * Solid addEvent implementation.
 */

window.EventCache = (function()
{
 var listOfEvents = [];

 return {
  add: function(obj, type, fn)
  {
   listOfEvents.push(arguments);
  },

  remove: function(obj, type, fn)
  {
   var i, args;

   for(i = listOfEvents.length - 1; i >= 0; --i)
   {
    args = listOfEvents[i];

    if(args[0] === obj && args[1] === type && args[2] === fn)
    {
     listOfEvents.splice(i, 1);
     i = 0;
    }
   }
  },

  flush: function()
  {
   var i, args, obj, type, fn;

   for(i = listOfEvents.length - 1; i >= 0; --i)
   {
    args = listOfEvents[i];
    obj = args[0], type = args[1], fn = args[2];

    if(obj.removeEventListener)
    {
     obj.removeEventListener(type, fn, false);
    }

    if(type.substring(0, 2) !== "on")
    {
     type = "on" + type;
    }

    if(obj.detachEvent)
    {
     obj.detachEvent(type, fn);
    }

    obj[type] = null;
   }
  }
 };
}());

window.addEvent = function(obj, type, fn)
{
 if(obj.addEventListener)
 {
  obj.addEventListener(type, fn, false);
  EventCache.add(obj, type, fn);
 }
 else if(obj.attachEvent)
 {
  obj["e" + type + fn] = fn;

  obj[type + fn] = function()
  {
   obj["e" + type + fn](window.event);
  };

  obj.attachEvent("on" + type, obj[type + fn]);
  EventCache.add(obj, type, fn);
 }
 else
 {
  obj["on" + type] = obj["e" + type + fn];
 }

 return arguments;
};

window.removeEvent = function(obj, type, fn)
{
 if(obj.removeEventListener)
 {
  obj.removeEventListener(type, fn, false);
  EventCache.remove(obj, type, fn);
 }
 else if(obj.detachEvent)
 {
  obj.detachEvent("on" + type, obj[type + fn]);
  EventCache.remove(obj, type, fn);
 }
 else
 {
  obj["on" + type] = null;
 }
};

window.addEvent(window, "unload", EventCache.flush);

/**
 * Returns a generalized Ajax object for xmlHttpRequests.
 * 
 * @return {XMLHttpRequest} A new ajax object.
 */

window.generateAjaxObject = function()
{
 var xmlHttpRequest = null;

 if(window.XMLHttpRequest)
 {
  xmlHttpRequest = new XMLHttpRequest();

  if(xmlHttpRequest.overrideMimeType)
  {
   xmlHttpRequest.overrideMimeType("text/json");
  }
 }
 else if(window.ActiveXObject)
 {
  try
  {
   xmlHttpRequest = new ActiveXObject("Msxml2.XMLHTTP");
  }
  catch(e)
  {
   try
   {
    xmlHttpRequest = new ActiveXObject("Microsoft.XMLHTTP");
   }
   catch(e)
   {
    xmlHttpRequest = false;
   }
  }
 }

 if((xmlHttpRequest === null || !xmlHttpRequest) && XMLHttpRequest !== undefined)
 {
  xmlHttpRequest = new XMLHttpRequest();
 }

 return xmlHttpRequest;
};

/** End of Strict-Mode-Encapsulation **/
}(undefined, window, document));
