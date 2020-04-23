/*
 * Prevent Duplicate Tabs 0.5.1
 * Copyright (c) 2020 Guilherme Nascimento (brcontainer@yahoo.com.br)
 * Released under the MIT license
 *
 * https://github.com/brcontainer/prevent-duplicate-tabs
 */

(function (w, d) {
    "use strict";

    var sync = false;

    if (typeof browser === "undefined") {
        w.browser = chrome;
    } else if (!w.browser) {
        w.browser = browser;
    }

    function changeSwitch(e) {
        if (browser && browser.runtime && browser.runtime.sendMessage) {
            sync = true;

            browser.runtime.sendMessage({
                "enable": this.checked,
                "setup": this.id
            }, function (response) {});
        }
    }

    browser.runtime.sendMessage({ "configs": true }, function (response) {
        var current, toggles = d.querySelectorAll(".toggle input[type=checkbox]");

        for (var i = 0, j = toggles.length; i < j; i++) {
            current = toggles[i];
            current.checked = !!response[current.id];
            current.disabled = false;
        }
    });

    browser.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        if (sync && request.setup) {
            d.getElementById(request.setup).checked = request.enable;
        }

        sync = false;
    });

    var toggles = d.querySelectorAll(".toggle input[type=checkbox]");

    for (var i = 0, j = toggles.length; i < j; i++) {
        toggles[i].addEventListener("change", changeSwitch);
    }
})(window, document);
