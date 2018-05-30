/*
 * Prevent Duplicate Tabs 0.5.0
 * Copyright (c) 2017 Guilherme Nascimento (brcontainer@yahoo.com.br)
 * Released under the MIT license
 *
 * https://github.com/brcontainer/prevent-duplicate-tabs
 */

(function (w, d) {
    "use strict";

    var browser = w.chrome||w.browser;

    function changeSwitch() {
        if (!browser || !browser.runtime || !browser.runtime.sendMessage) {
            return;
        }

        browser.runtime.sendMessage({
            "enable": this.checked,
            "setup": this.id
        }, function (response) {});
    }

    browser.runtime.sendMessage({ "configs": true }, function (response) {
        var current, toggles = d.querySelectorAll(".toggle input[type=checkbox]");

        for (var i = 0, j = toggles.length; i < j; i++) {
            current = toggles[i];
            current.checked = !!response[current.id];
            current.disabled = false;

            current.addEventListener("change", changeSwitch);
        }
    });
})(window, document);
