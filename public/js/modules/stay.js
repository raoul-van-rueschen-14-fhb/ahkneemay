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
 * @version 0.0.1, 10.10.2014
 */

var general = general || {};

(function(undefined, window, document, general)
{
 "use strict";

/**
 * Stay Module.
 *
 * Used for requesting page content asynchronously
 * while staying on one main page.
 *
 * Each request has a hard timeout to avoid endless
 * loading times that are often deemed to fail anyways.
 */

general.Stay = (function()
{
 var ajax, localEventCache = [],
  contents, navigation, nextPage = null,
  locked = false, backForward = true;

 /**
  * Uses ajax to request pages.
  * Locks the whole system until the response has
  * been received and processed.
  * 
  * @param {HTMLElement} firingElement A registered element whose click event was triggered.
  */

 function navigate(firingElement)
 {
  var formData, json;

  // Collect post data if the firing element is a form.
  if(firingElement.action)
  {
   nextPage = firingElement.action;
   formData = new FormData(firingElement);
  }
  else
  {
   nextPage = firingElement.href;
  }

  locked = true;

  if(nextPage.lastIndexOf("/") === nextPage.length - 1)
  {
   // Homepage
   json = "json";
   //TODO
  }
  else
  {
   json = "/json";
  }

  if(formData)
  {
   ajax.open("POST", nextPage + json, true);
   ajax.timeout = 10000;
   ajax.send(formData);
  }
  else
  {
   ajax.open("GET", nextPage + json, true);
   ajax.timeout = 4000;
   ajax.send(null);
  }
 }

 /**
  * This function acts when a requested page has completely been received.
  * The response will be a json object or a 404 page. Anything else will 
  * be treated as a json parse exception.
  *
  * @this {XMLHttpRequest}
  */

 function handleResponse()
 {
  var response;

  if(this.readyState === 4)
  {
   if(this.status === 404)
   {
    contents.innerHTML = "<h1>Error 404</h1><p>Not found.</p>";
   }
   else if(this.status === 0)
   {
    contents.innerHTML = "<h1>Error</h1><p>The server doesn't respond.</p>";
   }
   else if(this.status !== 200)
   {
    contents.innerHTML = "<h1>Error " + this.status + "</h1><p>The request failed.</p>";
   }
   else
   {
    try
    {
     response = JSON.parse(this.responseText);
     contents.innerHTML = response.html;

     if(navigation.innerText !== response.navigation)
     {
      navigation.innerHTML = response.navigation;
     }

     bindListeners();
     general.Move.reset();
     general.Quickinfo.reset();
     History.pushState(null, response.title, nextPage); // this.responseURL contains "/json" at the end.
    }
    catch(e)
    {
     contents.innerHTML = "<h1>Error</h1><p>" + e.message + "</p>";
    }
   }

   locked = false;
  }
 };

 /**
  * This function is bound to all links and forms
  * and executes the desired page navigation on left clicks.
  *
  * The context in which this function is called allows access
  * to all attributes of the respective "a" or "submit" element.
  *
  * @this {HTMLElement}
  */

 function handlePageSwitch(event)
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

  if(!isRightClick && !locked)
  {
   event.preventDefault();
   backForward = false;
   navigate(this);
  }
 }

 /**
  * Binds event listeners to all links and forms.
  */

 function bindListeners()
 {
  var links = document.getElementsByTagName("a"),
   forms = document.getElementsByTagName("form"),
   i, len, signature;

  for(i = 0, len = localEventCache.length; i < len; ++i)
  {
   signature = localEventCache[i];
   window.removeEvent(signature[0], signature[1], signature[2]);
  }

  for(i = 0, len = links.length; i < len; ++i)
  {
   signature = window.addEvent(links[i], "click", handlePageSwitch);
   localEventCache.push(signature);
  }

  for(i = 0, len = forms.length; i < len; ++i)
  {
   signature = window.addEvent(forms[i], "submit", handlePageSwitch);
   localEventCache.push(signature);
  }
 }

 /**
  * Support browser functionality "back" and "forward".
  * Depends on the boolean variable backForward in order to
  * determine whether this navigation should be executed.
  */

 function handleBackForward()
 {
  var state = History.getState();

  if(backForward)
  {
   if(state.hash !== "/")
   {
    navigate({href: state.cleanUrl});
   }
   else
   {
   }
  }
  else
  {
   backForward = true;
  }
 };

 /**
  * Acts when an ajax timeout occurs.
  */

 function handleTimeout()
 {
  contents.innerHTML = "<h1>Error</h1><p>The server didn't respond in time. Please try again later!</p>";
  locked = false;
 }

 /**
  * Initialization.
  */

 function init()
 {
  contents = document.getElementById("contents") || document.body;
  navigation = document.getElementById("navigation") || document.body;

  if(contents && navigation)
  {
   ajax = window.generateAjaxObject();
   window.addEvent(ajax, "readystatechange", handleResponse);
   window.addEvent(ajax, "timeout", handleTimeout);

   if(History.Adapter) { History.Adapter.bind(window, "statechange", handleBackForward); }

   bindListeners();
  }
 }

 // Initialized when DOM content is loaded.
 window.addEvent(document, "DOMContentLoaded", init);
}());

/** End of Strict-Mode-Encapsulation **/
}(undefined, window, document, general));



