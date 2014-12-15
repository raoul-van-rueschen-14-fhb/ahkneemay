/**
 * Copyright (c) 2014 Raoul van Rueschen
 * Licensed under the Zlib license.
 * 
 * A simple list of links.
 * The order matters.
 *
 * The display flag determines when the
 * respective link should be visible:
 *  - anonymous = only when logged out
 *  - authenticated = only when logged in
 *  - always = not never
 * 
 * @author Raoul van Rueschen
 * @version 1.0.0, 15.12.2014
 */

"use strict";

module.exports = [
 {name: "Home", href: "/", display: "always"},
 {name: "Login", href: "/login", display: "anonymous"},
 {name: "Logout", href: "/logout", display: "authenticated"},
 {name: "Add Anime", href: "/animes", display: "authenticated"},
 {name: "About", href: "/about", display: "always"}
];
