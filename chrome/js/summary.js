/*
 * Prevent Duplicate Tabs
 * Copyright (c) 2023 Guilherme Nascimento (brcontainer@yahoo.com.br)
 * Released under the MIT license
 *
 * https://github.com/brcontainer/prevent-duplicate-tabs
 */

(function (w, d, u) {
    "use strict";

    function setEvent(widget, key) {
        widget.addEventListener("toggle", function () {
            setStorage(key, widget.open);
        });
    }

    var details = d.querySelectorAll("details");

    for (var i = details.length - 1; i >= 0; i--) {
        var widget = details[i],
            summary = widget.querySelector("[data-i18n]"),
            key = "details:" + summary.getAttribute("data-i18n"),
            stored = getStorage(key);

        if (typeof stored === "boolean") {
            widget.open = stored;
        }

        setEvent(widget, key);
    }
})(window, document);
