/*
 * Prevent Duplicate Tabs 0.5.1
 * Copyright (c) 2020 Guilherme Nascimento (brcontainer@yahoo.com.br)
 * Released under the MIT license
 *
 * https://github.com/brcontainer/prevent-duplicate-tabs
 */

(function (w, d) {
    "use strict";

    if (typeof browser === "undefined") {
        w.browser = chrome;
    } else if (!w.browser) {
        w.browser = browser;
    }

    var isHttpRE = /^https?:\/\/\w/i,
        view = d.getElementById("version");

    var debugMode = !(
        "update_url" in browser.runtime.getManifest() ||
        browser.runtime.id === "stackexchangenotifications@mozilla.org"
    );

    version.textContent = "Version " + browser.runtime.getManifest().version;

    function disableEvent(e) {
        if (!debugMode) {
            e.preventDefault();
            return false;
        }
    }

    d.addEventListener("contextmenu", disableEvent);
    d.addEventListener("dragstart", disableEvent);

    d.addEventListener("click", function (e) {
        if (e.button !== 0) {
            return;
        }

        var el = e.target;

        if (el.nodeName !== "A") {
            el = el.closest("a[href]");

            if (!el) {
                return;
            }
        }

        if (!isHttpRE.test(el.href)) return;

        e.preventDefault();

        browser.tabs.create({ "url": el.href });
    });
})(window, document);
