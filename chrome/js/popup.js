/*
 * Prevent Duplicate Tabs 0.3.0
 * Copyright (c) 2017 Guilherme Nascimento (brcontainer@yahoo.com.br)
 * Released under the MIT license
 *
 * https://github.com/brcontainer/prevent-duplicate-tabs
 */

(function (w, d, browser) {
    "use strict";

    var fixTimer, isHttpRegex = /^https?:\/\//;

    var debugMode = !(
        "update_url" in browser.runtime.getManifest() ||
        browser.runtime.id === "stackexchangenotifications@mozilla.org"
    );

    function disableEvent(e) {
        if (!debugMode) {
            e.preventDefault();
            return false;
        }
    }

    d.addEventListener("contextmenu", disableEvent);
    d.addEventListener("dragstart", disableEvent);

    d.addEventListener("click", function (e) {
        if (e.button !== 0 || e.target.nodeName !== "A" || !isHttpRegex.test(e.target.href)) {
            return;
        }

        e.preventDefault();
        browser.tabs.create({ "url": e.target.href });
    });
})(window, document, chrome||browser);
