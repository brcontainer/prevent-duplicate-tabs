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

    var tabId,
        sync = false,
        browser = w.browser,
        isHttpRE = /^https?:\/\/\w/i,
        variables = {
            "url": null,
            "host": null,
            "version": browser.runtime.getManifest().version
        };

    /**
     * @param {string[]} hosts
     * @param {string[]} urls
     */
    function applyIgnoredData(hosts, urls) {
        var http = isHttpRE.test(variables.url);

        if (!http) return;

        var actions = d.getElementById("actions"),
            /** @type {NodeListOf<HTMLElement>} */
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
        /** @type {NodeListOf<HTMLButtonElement>} */
        var els = d.querySelectorAll("[data-ignored] .col:first-child > button");

        for (var i = els.length - 1; i >= 0; i--) {
            els[i].addEventListener("click", addRemoveUrl);
        }
    }

    /**
     * @param {MouseEvent} e
     */
    function addRemoveUrl(e) {
        /** @type {HTMLElement} */
        var target = e.target;

        if (target && w.runtimeConnected()) {
            sync = true;

            var type = target.dataset.type,
                ignore = !target.closest("[data-ignored]").classList.contains("data-ignored");

            sendMessage({
                "type": type,
                "value": type === "url" ? variables.url : variables.host,
                "ignore": ignore,
                "tabId": tabId,
                "url": variables.url
            });

            toggleIgnore(type, ignore);
        }
    }

    function toggleIgnore(type, ignore) {
        d.querySelector("[data-type='" + type + "']")
            .closest("[data-ignored]").classList
                .toggle("data-ignored", ignore);
    }

    function applyIgnoredVars(vars) {
        var query;

        if (vars) {
            query = "var[name='" + vars.join("'], var[name='") + "']";
        } else {
            query = "var[name]";
        }

        var varsElements = d.querySelectorAll(query);

        for (var i = varsElements.length - 1; i >= 0; i--) {
            var el = varsElements[i], key = el.getAttribute("name"), value = variables[key];

            if (key && value) {
                el.textContent = value;
                el.removeAttribute("name");
            }
        }
    }

    function containerConfigs(tab) {
        if (tab.cookieStoreId) {
            var configs = d.querySelectorAll(".support-containers");

            for (var i = configs.length - 1; i >= 0; i--) {
                configs[i].classList.toggle("supported-containers", true);
            }
        }
    }

    sendMessage({ "ignored": true }, function (response) {
        if (response) {
            browser.tabs.query({ active: true, lastFocusedWindow: true }, function (tabs) {
                if (tabs[0]) {
                    tabId = tabs[0].id;

                    variables.url = tabs[0].url;
                    variables.host = new URL(variables.url).host;

                    applyIgnoredVars(["url", "host"]);
                    applyIgnoredData(response.hosts, response.urls);

                    containerConfigs(tabs[0]);
                }
            });
        }
    });

    browser.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        if (!sync && request.type) toggleIgnore(request.type, request.ignore);

        sync = false;
    });

    applyIgnoredVars();
})(window, document);
