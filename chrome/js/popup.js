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
        isHttpRE = /^https?:\/\/[^\/]/i,
        view = d.getElementById("version");

    if (x.runtime.id && !x.runtime.requestUpdateCheck) {
        if (/@temporary-addon$/.test(x.runtime.id)) debugMode = true;
    } else if (!"update_url" in manifest) {
        debugMode = true;
    }

    version.textContent = "Version " + browser.runtime.getManifest().version;

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
