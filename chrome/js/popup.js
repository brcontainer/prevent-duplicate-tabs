/*
 * Prevent Duplicate Tabs 0.1.0
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

    function fixVideoBug(p) {
        if (p === 1) {
            d.body.classList.add("fix");
            fixTimer = setTimeout(fixVideoBug, 5, 2);
        } else if (p === 2) {
            d.body.classList.remove("fix");
        }
    }

    d.addEventListener("contextmenu", disableEvent);
    d.addEventListener("dragstart", disableEvent);

    d.addEventListener("click", function (e) {
        if (e.target.nodeName !== "A" || !isHttpRegex.test(e.target.href)) {
            return;
        }

        e.preventDefault();
        browser.tabs.create({ "url": e.target.href });
    });

    function doScroll() {
        if (fixTimer) {
            clearTimeout(fixTimer);
        }

        fixTimer = setTimeout(fixVideoBug, 50, 1);
    }

    w.addEventListener("scroll", doScroll);
    d.body.addEventListener("scroll", doScroll);
})(window, document, chrome||browser);
