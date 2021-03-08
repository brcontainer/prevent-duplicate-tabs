/*
 * Prevent Duplicate Tabs
 * Copyright (c) 2021 Guilherme Nascimento (brcontainer@yahoo.com.br)
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

    var tabId,
        sync = false,
        browser = w.browser,
        isHttpRE = /^https?:\/\/\w/i,
        variables = {
            "url": null,
            "host": null,
            "version": browser.runtime.getManifest().version
        };

    function applyData(hosts, urls) {
        var http = isHttpRE.test(variables.url);

        if (!http) return;

        var actions = d.getElementById("actions"),
            ignoreds = d.querySelectorAll("[data-ignored]");

        actions.style.display = "block";

        for (var i = ignoreds.length - 1; i >= 0; i--) {
            var el = ignoreds[i], data = el.dataset.ignored;

            if (data.indexOf("urls[") === 0) {
                if (urls.indexOf(variables.url) !== -1) el.classList.toggle("data-ignored", true);
            } else if (data.indexOf("!urls[") === 0) {
                if (urls.indexOf(variables.url) === -1) el.classList.toggle("data-ignored", true);
            } else if (data.indexOf("hosts[") === 0) {
                if (hosts.indexOf(variables.host) !== -1) el.classList.toggle("data-ignored", true);
            } else if (data.indexOf("!hosts[") === 0) {
                if (hosts.indexOf(variables.host) === -1) el.classList.toggle("data-ignored", true);
            }
        }

        applyEvents();
    }

    function applyEvents() {
        var els = d.querySelectorAll("[data-ignored] .col:first-child > button");

        for (var i = els.length - 1; i >= 0; i--) {
            els[i].addEventListener("click", addRemoveUrl);
        }
    }

    function addRemoveUrl(e) {
        var target = e.target;

        if (target && browser && browser.runtime && browser.runtime.sendMessage) {
            sync = true;

            var type = target.dataset.type,
                ignore = !target.closest("[data-ignored]").classList.contains("data-ignored");

            browser.runtime.sendMessage({
                "type": type,
                "value": type === "url" ? variables.url : variables.host,
                "ignore": ignore,
                "tabId": tabId,
                "url": variables.url
            }, function (response) {});

            toggleIgnore(type, ignore);
        }
    }

    function toggleIgnore(type, ignore) {
        d.querySelector("[data-type='" + type + "']")
            .closest("[data-ignored]").classList
                .toggle("data-ignored", ignore);
    }

    function markdown(message) {
        return message
                .replace(/(^|\s|[>])_(.*?)_($|\s|[<])/g, '$1<i>$2<\/i>$3')
                    .replace(/(^|\s|[>])`(.*?)`($|\s|[<])/g, '$1<code>$2<\/code>$3')
                        .replace(/\{([a-z])(\w+)?\}/gi, '<var name="$1$2"><\/var>')
                            .replace(/(^|\s|[>])\*(.*?)\*($|\s|[<])/g, '$1<strong>$2<\/strong>$3');
    }

    function applyVars(vars) {
        var query;

        if (vars) {
            query = "var[name='" + vars.join("'], var[name='") + "']";
        } else {
            query = "var[name]";
        }

        var vars = d.querySelectorAll(query);

        for (var i = vars.length - 1; i >= 0; i--) {
            var el = vars[i], key = el.getAttribute("name"), value = variables[key];

            if (key && value) {
                el.textContent = value;
                el.removeAttribute("name");
            }
        }
    }

    function containerConfigs() {
        var configs = d.querySelectorAll(".support-containers");

        for (var i = configs.length - 1; i >= 0; i--) {
            configs[i].classList.toggle("supported-containers", true);
        }
    }

    browser.runtime.sendMessage({ "ignored": true }, function (response) {
        if (response) {
            browser.tabs.query({ active: true, lastFocusedWindow: true }, function (tabs) {
                if (tabs[0]) {
                    tabId = tabs[0].id;

                    variables.url = tabs[0].url;
                    variables.host = new URL(variables.url).host;

                    applyVars(["url", "host"]);

                    applyData(response.hosts, response.urls);

                    if (tabs[0].cookieStoreId) containerConfigs();
                }
            });
        }
    });

    browser.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        if (!sync && request.type) toggleIgnore(request.type, request.ignore);

        sync = false;
    });

    var locales = d.querySelectorAll("[data-i18n]");

    for (var i = locales.length - 1; i >= 0; i--) {
        var el = locales[i], message = browser.i18n.getMessage(el.dataset.i18n);

        if (message) el.innerHTML = markdown(message);
    }

    applyVars();
})(window, document);
