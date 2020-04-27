/*
 * Prevent Duplicate Tabs 0.6.0
 * Copyright (c) 2020 Guilherme Nascimento (brcontainer@yahoo.com.br)
 * Released under the MIT license
 *
 * https://github.com/brcontainer/prevent-duplicate-tabs
 */

(function (w, d) {
    "use strict";

    var sync = false, url, host, tabId;

    if (typeof browser === "undefined") {
        w.browser = chrome;
    } else if (!w.browser) {
        w.browser = browser;
    }
    
    var isHttpRE = /^https?:\/\/\w/i;

    function applyData(hosts, urls) {
        var http = isHttpRE.test(url);

        if (!http) return;

        var actions = d.getElementById("actions"),
            values = d.querySelectorAll("[data-value]"),
            ignoreds = d.querySelectorAll("[data-ignored]");

        actions.style.display = "block";

        for (var i = 0, j = values.length; i < j; i++) {
            var el = values[i], value = el.dataset.value;

            if (value === "url") {
                el.textContent = url;
                el.title = url;
            } else if (value === "host") {
                el.textContent = host;
            }
        }

        for (var i = 0, j = ignoreds.length; i < j; i++) {
            var el = ignoreds[i], data = el.dataset.ignored;

            if (data.indexOf("urls[") === 0) {
                if (urls.indexOf(url) !== -1) el.classList.toggle("data-ignored", true);
            } else if (data.indexOf("!urls[") === 0) {
                if (urls.indexOf(url) === -1) el.classList.toggle("data-ignored", true);
            } else if (data.indexOf("hosts[") === 0) {
                if (hosts.indexOf(host) !== -1) el.classList.toggle("data-ignored", true);
            } else if (data.indexOf("!hosts[") === 0) {
                if (hosts.indexOf(host) === -1) el.classList.toggle("data-ignored", true);
            }
        }

        applyEvents();
    }

    function applyEvents() {
        var els = d.querySelectorAll("[data-ignored] .col:first-child > button");

        for (var i = 0, j = els.length; i < j; i++) {
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
                "value": type === "url" ? url : host,
                "ignore": ignore,
                "tabId": tabId,
                "url": url
            }, function (response) {});

            toggleIgnore(type, ignore);
        }
    }

    function toggleIgnore(type, ignore) {
        d.querySelector("[data-type='" + type + "']")
            .closest("[data-ignored]").classList
                .toggle("data-ignored", ignore);
    }

    browser.runtime.sendMessage({ "ignored": true }, function (response) {
        if (response) {
            browser.tabs.query({ active: true, lastFocusedWindow: true }, function (tabs) {
                if (tabs[0]) {
                    url = tabs[0].url;
                    host = new URL(url).host;
                    tabId = tabs[0].id;

                    applyData(response.hosts, response.urls);
                }
            });
        }
    });

    browser.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        if (!sync && request.type) toggleIgnore(request.type, request.ignore);

        sync = false;
    });
})(window, document);
