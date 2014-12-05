/**
 * A simple list of links.
 * The order matters.
 *
 * The display flag determines when the
 * respective link should be visible:
 *  - anonymous = only when logged out
 *  - authenticated = only when logged in
 *  - always = not never
 */

"use strict";

module.exports = [
 {name: "Home", href: "/"},
 {name: "Add Anime", href: "/anime"},
 {name: "About", href: "/about"}
];
