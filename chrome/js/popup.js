/*
 * Prevent Duplicate Tabs 0.5.0
 * Copyright (c) 2017 Guilherme Nascimento (brcontainer@yahoo.com.br)
 * Released under the MIT license
 *
 * https://github.com/brcontainer/prevent-duplicate-tabs
 */

(function (w, d) {
    "use strict";

    var isHttpRegex = /^https?:\/\//,
        browser = w.chrome||w.browser,
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
        if (e.button !== 0 || e.target.nodeName !== "A" || !isHttpRegex.test(e.target.href)) {
            return;
        }

        var el = e.target;

        if (!el.href) {
            while ((el = el.parentNode) && el.nodeType === 1) {
                if (el.tagName === "A") {
                    break;
                }
            }
        }

        if (!el || !el.href) return;

        e.preventDefault();
        browser.tabs.create({ "url": el.href });
    });
})(window, document);
