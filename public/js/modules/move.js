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
 * @version 0.0.1, 08.12.2014
 */

var general = general || {};

(function(undefined, window, document)
{
 "use strict";

/**
 * Move Module.
 */

general.Move = (function()
{
 var localEventCache = [], 
  screenSize = null, mouseLocked = true,
  element = null, animId = 0, then = 0,
  origin = {x: 0, y: 0},
  offsets = {x: 0, y: 0},
  displacements = {x: 0, y: 0},
  currentPos = {x: 0, y: 0},
  movement = {
   x: new general.SmoothMovement(),
   y: new general.SmoothMovement()
  },
  limits = {
   x: {min: 0, max: 0},
   y: {min: 0, max: 0}
  };

 /**
  * Computes the displacement and moves the screen
  * to the target location.
  */

 function handleMovement()
 {
  var x = movement.x.update(),
  y = movement.y.update();

  displacements.x = (x - currentPos.x);
  displacements.y = (y - currentPos.y);
  currentPos.x = x;
  currentPos.y = y;

  element.style.transform = "translate(" + currentPos.x + "px, " + currentPos.y + "px)";
 }

 /**
  * Makes sure that the new target values are properly restricted.
  */

 function respectBoundaries()
 {
  if(movement.x.target > limits.x.max) { movement.x.target = limits.x.max; }
  if(movement.x.target < limits.x.min) { movement.x.target = limits.x.min; }
  if(movement.y.target > limits.y.max) { movement.y.target = limits.y.max; }
  if(movement.y.target < limits.y.min) { movement.y.target = limits.y.min; }
 }

 /**
  * Modifies the target position.
  */

 function mMove(event)
 {
  if(!mouseLocked)
  {
   if(origin.x > event.clientX)
   {
    movement.x.target -= (origin.x - event.clientX) << 1;
   }
   else if(origin.x < event.clientX)
   {
    movement.x.target += (event.clientX - origin.x) << 1;
   }

   if(origin.y > event.clientY)
   {
    movement.y.target -= (origin.y - event.clientY) << 1;
   }
   else if(origin.y < event.clientY)
   {
    movement.y.target += (event.clientY - origin.y) << 1;
   }

   respectBoundaries();

   origin.x = event.clientX;
   origin.y = event.clientY;
  }
 }

 /**
  * Allows the modification of the target position.
  */

 function mDown(event)
 {
  var isRightClick = false;

  if(event.which)
  {
   isRightClick = (event.which === 3);
  }
  else if(event.button)
  {
   isRightClick = (event.button === 2);
  }

  if(!isRightClick)
  {
   event.preventDefault();
   window.getSelection().removeAllRanges();

   origin.x = event.clientX;
   origin.y = event.clientY;
   mouseLocked = false;
  }
 }

 /**
  * Prevents the modification of the target position.
  */

 function mUp()
 {
  mouseLocked = true;
  then = Date.now();
 }

 /**
  * Modifies the target position based on mouse wheel scrolling.
  */

 function mScroll(event)
 {
  event.preventDefault();
  movement.x.target -= event.detail ? event.detail * 120 : event.deltaX;
  movement.y.target -= event.detail ? event.detail * 120 : event.deltaY;
  respectBoundaries();
 }

 /**
  * Sets the movement boundaries based on the positions and sizes of the 
  * children of the moveable element. Takes the dimensions of the parent
  * container and the screen size into account.
  */

 function setupScreen()
 {
  var i, res, len, boundaries = {x: 0, y: 0},
   parent = element.parentNode, screenSize;

  window.cancelAnimationFrame(animId);

  screenSize = window.getScreenSize();
  boundaries.x = parent ? parent.offsetWidth : screenSize.width;
  boundaries.y = parent ? parent.offsetHeight : screenSize.height;

  limits.x.min = ~(offsets.x + element.offsetWidth - boundaries.x);
  limits.x.max = ~offsets.x;
  limits.y.min = ~(offsets.y + element.offsetHeight - boundaries.y);
  limits.y.max = ~offsets.y;

  // Prevent very small movements.
  if(Math.abs(limits.x.min) < 20) { limits.x.min = 0; }
  if(Math.abs(limits.x.max) < 20) { limits.x.max = 0; }
  if(Math.abs(limits.y.min) < 20) { limits.y.min = 0; }
  if(Math.abs(limits.y.max) < 20) { limits.y.max = 0; }

  animId = window.requestAnimationFrame(update);
 }

 /**
  * Maintains the smooth movement.
  */

 function update()
 {
  if(!movement.x.hasStopped() || !movement.y.hasStopped() || animId === 0)
  {
   handleMovement();
  }

  animId = window.requestAnimationFrame(update);
 }

 /**
  * Cleans up all event listeners.
  */

 function unbindListeners()
 {
  var i, len, signature;

  for(i = 0, len = localEventCache.length; i < len; ++i)
  {
   signature = localEventCache[i];
   window.removeEvent(signature[0], signature[1], signature[2]);
  }
 }

 /**
  * Binds event listeners and stores their signatures.
  */

 function bindListeners()
 {
  localEventCache.push(window.addEvent(document, "mousemove", mMove));
  localEventCache.push(window.addEvent(document, "mousedown", mDown));
  localEventCache.push(window.addEvent(document, "mouseup", mUp));
  localEventCache.push(window.addEvent(window, "mousewheel", mScroll));
  localEventCache.push(window.addEvent(window, "DOMMouseScroll", mScroll));
  localEventCache.push(window.addEvent(window, "resize", setupScreen));
 }

 /**
  * Initialization.
  */

 function init()
 {
  var contents = document.getElementById("contents");
  element = document.getElementById("animes");

  window.cancelAnimationFrame(animId);
  unbindListeners();
  movement.x.reset();
  movement.y.reset();

  if(contents) { contents.style.overflowY = "hidden"; }

  if(element)
  {
   element.className = "moveable";
   offsets.x = element.offsetLeft;
   offsets.y = element.offsetTop;
   bindListeners();
   setupScreen();
  }
 }

 // Initialized when DOM content is loaded.
 window.addEvent(document, "DOMContentLoaded", init);

 // Reveal public members.
 return {
  reset: init
 };
}());

/** End of Strict-Mode-Encapsulation **/
}(undefined, window, document));



