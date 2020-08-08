/*
 * Prevent Duplicate Tabs
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

    var debugMode = false,
        browser = w.browser,
        isHttpRE = /^https?:\/\/[^\/]/i,
        view = d.getElementById("version"),
        manifest = browser.runtime.getManifest();

    if (browser.runtime.id && !browser.runtime.requestUpdateCheck) {
        if (/@temporary-addon$/.test(browser.runtime.id)) debugMode = true;
    } else if (!("update_url" in manifest)) {
        debugMode = true;
    }

    console.log(!("update_url" in manifest))

    version.textContent = "Version " + manifest.version;

    function disableEvent(e) {
        e.preventDefault();
        return false;
    }

    if (!debugMode) {
        d.oncontextmenu = disableEvent;
        d.ondragstart = disableEvent;
    }

    d.addEventListener("click", function (e) {
        if (e.button !== 0) return;

        var el = e.target;

        if (el.nodeName !== "A") {
            el = el.closest("a[href]");

            if (!el) return;
        }

        if (!isHttpRE.test(el.href)) return;

        e.preventDefault();

        browser.tabs.create({ "url": el.href });
    });
})(window, document);
