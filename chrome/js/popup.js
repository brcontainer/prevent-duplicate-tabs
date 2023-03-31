/*
 * Prevent Duplicate Tabs
 * Copyright (c) 2023 Guilherme Nascimento (brcontainer@yahoo.com.br)
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
        manifest = browser.runtime.getManifest();

    if (browser.runtime.id && !("requestUpdateCheck" in browser.runtime)) {
        if (/@temporary-addon$/.test(browser.runtime.id)) debugMode = true;
    } else if (!("update_url" in manifest)) {
        debugMode = true;
    }

    function disableEvent(e) {
        e.preventDefault();
        return false;
    }

    if (!debugMode) {
        d.oncontextmenu = disableEvent;
        d.ondragstart = disableEvent;
    }

    function markdown(message) {
        return message
                .replace(/(^|\s|[>])_(.*?)_($|\s|[<])/g, '$1<i>$2<\/i>$3')
                    .replace(/(^|\s|[>])`(.*?)`($|\s|[<])/g, '$1<code>$2<\/code>$3')
                        .replace(/\{([a-z])(\w+)?\}/gi, '<var name="$1$2"><\/var>')
                            .replace(/(^|\s|[>])\*(.*?)\*($|\s|[<])/g, '$1<strong>$2<\/strong>$3');
    }

    var locales = d.querySelectorAll("[data-i18n]");

    for (var i = locales.length - 1; i >= 0; i--) {
        var el = locales[i], message = browser.i18n.getMessage(el.dataset.i18n);

        if (message) el.innerHTML = markdown(message);
    }

    d.addEventListener("click", function (e) {
        if (e.button !== 0) return;

        var el = e.target;

        if (el.nodeName !== "A") {
            el = el.closest("a[href]");

            if (!el) return;
        }

        var protocol = el.protocol;

        if (protocol === "http:" || protocol === "https:") {
            e.preventDefault();

            browser.tabs.create({ "url": el.href });
        }
    });

    if (browser.extension && browser.extension.isAllowedIncognitoAccess) {
        var incognitoWarn = d.getElementById("incognito_warn");

        browser.extension.isAllowedIncognitoAccess(function (allowed) {
            incognitoWarn.classList.toggle("hide", allowed === true);
        });
    }

    var se = d.scrollingElement || d.body;

    setTimeout(function () {
        se.style.transform = "scale(2)";

        setTimeout(function () {
            se.style.transform = "scale(1)";

            setTimeout(function () {
                se.style.transform = null;
            }, 20);
        }, 20);
    }, 10);
})(window, document);
