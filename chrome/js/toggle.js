/*
 * Prevent Duplicate Tabs
 * Copyright (c) 2023 Guilherme Nascimento (brcontainer@yahoo.com.br)
 * Released under the MIT license
 *
 * https://github.com/brcontainer/prevent-duplicate-tabs
 */

(function (w, d, u) {
    "use strict";

    if (typeof browser === "undefined") {
        w.browser = chrome;
    } else if (!w.browser) {
        w.browser = browser;
    }

    var sync = false, browser = w.browser;
    var dataChange = { "data": u, "value": u };
    var dataEvent = new CustomEvent("change:data", { "detail": dataChange });

    function changeSwitch(e) {
        if (runtimeConnected()) {
            sync = true;

            sendMessage({ "enable": this.checked, "setup": this.id });
        }
    }

    function changeRadio(e) {
        if (runtimeConnected()) {
            sync = true;

            sendMessage({ "data": this.name, "value": this.value });
            triggerEvent(this.name, this.value);
        }
    }

    function updateRadio(id, value, response, trigger) {
        var els = d.querySelectorAll("input[type=radio][name='" + id + "']");

        for (var i = els.length - 1; i >= 0; i--) {
            var current = els[i];

            current.disabled = false;

            if (current.value === value) current.checked = true;
        }
    }

    var timeoutEvent = 0;

    function triggerEvent(data, value) {
        clearTimeout(timeoutEvent);

        timeoutEvent = setTimeout(function () {
            dataChange.data = data;
            dataChange.value = value;

            d.dispatchEvent(dataEvent);
        }, 100);
    }

    sendMessage({ "configs": true }, function (response) {
        var current, toggles = d.querySelectorAll(".toggle input[type=checkbox]");

        for (var i = toggles.length - 1; i >= 0; i--) {
            current = toggles[i];
            current.checked = !!response[current.id];
            current.disabled = false;
        }
    });

    sendMessage({ "extra": true }, function (response) {
        for (var i = response.length - 1; i >= 0; i--) {
            updateRadio(response[i].id, response[i].value, response[i], false);
        }
    });

    browser.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        if (!sync) {
            if (request.setup) {
                d.getElementById(request.setup).checked = request.enable;
            } else if (request.data) {
                updateRadio(request.data, request.value, request, true);
                triggerEvent(request.data, request.value);
            }
        }

        sync = false;
    });

    var toggles = d.querySelectorAll(".toggle input[type=checkbox]");

    for (var i = toggles.length - 1; i >= 0; i--) {
        toggles[i].addEventListener("change", changeSwitch);
    }

    var radios = d.querySelectorAll(".radio input[type=radio]");

    for (var i = radios.length - 1; i >= 0; i--) {
        radios[i].addEventListener("change", changeRadio);
    }
})(window, document);
