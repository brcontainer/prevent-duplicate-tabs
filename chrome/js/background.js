/*
 * Prevent Duplicate Tabs 0.1.0
 * Copyright (c) 2017 Guilherme Nascimento (brcontainer@yahoo.com.br)
 * Released under the MIT license
 *
 * https://github.com/brcontainer/prevent-duplicate-tabs
 */

(function (browser) {
    "use strict";

    var running = false, configs = {};

    function setStorage(key, value) {
        localStorage.setItem(key, JSON.stringify({ "value": value }));
    }

    function getStorage(key) {
        var itemValue = localStorage[key];

        if (!itemValue && !/^\{(.*?)\}$/.test(itemValue)) {
            return false;
        }

        var current = JSON.parse(itemValue);

        return current ? current.value : itemValue;
    }

    function empty() {}

    function checkTabs(type) {
        if (running || !configs[type]) {
            return;
        }

        running = true;

        browser.tabs.query({}, function (tabs) {

            var url, groupTabs = {};

            for (var i = tabs.length - 1; i >= 0; i--) {
                if (tabs[i].pinned) {
                    continue;
                }

                url = (tabs[i].incognito ? "incognito" : "normal") + "::" + tabs[i].url;

                if (!groupTabs[url]) {
                    groupTabs[url] = [];
                }

                groupTabs[url].push({ "id": tabs[i].id, "actived": tabs[i].active });
            }

            for (var url in groupTabs) {
                closeTabs(groupTabs[url]);
            }

            groupTabs = tabs = null;

            running = false;
        });
    }

    function sortTabs(tab) {
        return !tab.active;
    }

    function closeTabs(tabs) {
        tabs = tabs.sort(sortTabs);

        var i = 1, j = tabs.length;

        if (j < 2) {
            return;
        }

        for (var i = tabs.length - 1; i >= 1; i--) {
            browser.tabs.remove(tabs[i].id, empty);
        }
    }

    function createEvent(type) {
        return function () {
            setTimeout(checkTabs, 10, type);
        };
    }

    if (!getStorage("firstrun")) {
        configs = {
            "start": true,
            "incognito": false,
            "replace": true,
            "update": true,
            "create": true,
            "remove": true,
            "query": false,
            "hash": false
        };

        for (var config in configs) {
            setStorage(config, configs[config]);
        }

        setStorage("firstrun", true);
    }

    setTimeout(checkTabs, 100);

    browser.tabs.onUpdated.addListener(createEvent("update"));
    browser.tabs.onCreated.addListener(createEvent("create"));
    browser.tabs.onRemoved.addListener(createEvent("remove"));
    browser.tabs.onReplaced.addListener(createEvent("replace"));

    browser.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        if (request.setup) {
            configs[request.setup] = request.actived;
            setStorage(request.setup, request.actived);
        } else if (request.configs) {
            sendResponse({
                "start": getStorage("start"),
                "incognito": getStorage("incognito"),
                "replace": getStorage("replace"),
                "update": getStorage("update"),
                "create": getStorage("create"),
                "remove": getStorage("remove"),
                "query": getStorage("query"),
                "hash": getStorage("hash")
            });
        }
    });
})(chrome||browser);
