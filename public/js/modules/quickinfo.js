/**
 * Copyright (c) 2014 Raoul van Rueschen
 * Licensed under the Zlib license.
 *
 * @author Raoul van Rueschen
 * @version 1.0.0, 15.12.2014
 */

var general = general || {};

(function(undefined, window, document)
{
 "use strict";

/**
 * Quickinfo Module.
 * Fetches information about anime series from TV-Rage.
 */

general.Quickinfo = (function()
{
 var ajax, localEventCache = [],
  locked = false, lastTitle = "",
  inputTitle, inputYear,
  inputSeasons, inputPublisher,
  selectedFile, inputImage;

 /**
  * Uses ajax to request quickinfos.
  * Locks the whole system until the response has
  * been received and processed.
  */

 function fetchInfos()
 {
  var title = inputTitle.value;

  if(title.length > 3 && title !== lastTitle)
  {
   locked = true;
   ajax.open("GET", "/animes/quickinfo/" + encodeURIComponent(title), true);
   ajax.timeout = 10000;
   ajax.send(null);
  }
 }

 /**
  * Updates the input form with new values.
  *
  * @param {object} infos - The most important quickinfos from TV-Rage.
  */

 function updateForm(infos)
 {
  lastTitle = infos.title;
  inputTitle.value = infos.title;
  inputYear.value = infos.year;
  inputSeasons.value = infos.seasons;
  inputPublisher.value = infos.publisher;
 }

 /**
  * Parses the quickinfos from TV-Rage.
  *
  * @param {string} response - The server response text.
  */

 function parseInfos(response)
 {
  var i, len, splinters, s, infos = {};

  if(response.indexOf("@") > -1)
  {
   // Remove "<pre>" and the last newline from the string.
   response = response.slice(5, response.length - 1);
   splinters = response.split(/@|\n/g);

   for(i = 0, len = splinters.length; i < len; ++i)
   {
    infos[splinters[i]] = splinters[++i];
   }

   // Don't suggest non-animes.
   if(infos["Classification"] === "Animation")
   {
    // Includes the amount of seasons.
    s = infos["Latest Episode"].split(/x/);

    updateForm({
     title: infos["Show Name"],
     year: infos["Premiered"],
     seasons: s[0],
     publisher: infos["Network"]
    });
   }
  }
 }

 /**
  * This function acts when a requested page has completely been received.
  *
  * @this {XMLHttpRequest}
  */

 function handleResponse()
 {
  if(this.readyState === 4)
  {
   if(this.status === 200)
   {
    parseInfos(this.responseText);
   }

   locked = false;
  }
 };

 /**
  * Simple update method for showing a currently selected file.
  */

 function updateSelectedFile()
 {
  var splinters, value, index;

  value = "No file chosen";
  selectedFile.removeChild(selectedFile.firstChild);

  if(inputImage.files.length)
  {
   splinters = inputImage.files[0].name.split("\\");
   value = splinters[splinters.length - 1];
   index = value.lastIndexOf(".");
   if(index > -1) { value = value.slice(0, index); }
   if(value.length > 10) { value = value.slice(0, 9) + "..."; }
  }

  selectedFile.appendChild(document.createTextNode(value));
 }

 /**
  * Acts when an ajax timeout occurs.
  */

 function handleTimeout()
 {
  locked = false;
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
  localEventCache.push(window.addEvent(inputTitle, "blur", fetchInfos));
  localEventCache.push(window.addEvent(inputImage, "change", updateSelectedFile));
 }

 /**
  * Implements repeatable operations to reset this module.
  */

 function reset()
 {
  inputTitle = document.getElementById("inputTitle");
  inputYear = document.getElementById("inputYear");
  inputSeasons = document.getElementById("inputSeasons");
  inputPublisher = document.getElementById("inputPublisher");
  selectedFile = document.getElementById("selectedFile");
  inputImage = document.getElementById("inputImage");

  unbindListeners();

  // Only proceed if the crucial elements exist in the current view.
  if(inputTitle && inputYear && inputSeasons && inputPublisher && selectedFile && inputImage)
  {
   bindListeners();
  }
 }

 /**
  * Initialization.
  */

 function init()
 {
  ajax = window.generateAjaxObject();
  window.addEvent(ajax, "readystatechange", handleResponse);
  window.addEvent(ajax, "timeout", handleTimeout);

  reset();
 }

 // Initialized when DOM content is loaded.
 window.addEvent(document, "DOMContentLoaded", init);

 // Reveal public members.
 return {
  reset: reset
 };
}());

/** End of Strict-Mode-Encapsulation **/
}(undefined, window, document));



