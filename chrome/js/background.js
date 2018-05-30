/*
 * Prevent Duplicate Tabs 0.5.0
 * Copyright (c) 2017 Guilherme Nascimento (brcontainer@yahoo.com.br)
 * Released under the MIT license
 *
 * https://github.com/brcontainer/prevent-duplicate-tabs
 */

(function () {
    "use strict";

    var browser = window.chrome||window.browser;

    var configs,
        running = false,
        isHttpRE = /^https?:\/\/\w/,
        linkJsonRE = /^\{(.*?)\}$/,
        removeHashRE = /#[\s\S]+?$/,
        removeQueryRE = /\?[\s\S]+?$/;

    function empty() {}

    function setStorage(key, value) {
        localStorage.setItem(key, JSON.stringify({ "value": value }));
    }

    function getStorage(key) {
        var itemValue = localStorage[key];

        if (!itemValue && !linkJsonRE.test(itemValue)) {
            return false;
        }

        var current = JSON.parse(itemValue);

        return current ? current.value : itemValue;
    }

    function checkTabs(type) {
        if (running || !configs[type]) {
            return;
        }

        running = true;

        browser.tabs.query({}, function (tabs) {

            var url,
                groupTabs = {},
                onlyHttp = !configs.http,
                ignoreHash = !configs.hash,
                ignoreQuery = !configs.query,
                ignoreIncognitos = !configs.incognito;

            for (var i = tabs.length - 1; i >= 0; i--) {
                if (
                    tabs[i].pinned ||
                    (ignoreIncognitos && tabs[i].incognito) ||
                    (onlyHttp && isHttpRE.test(tabs[i]))
                ) {
                    continue;
                }

                url = tabs[i].url;

                if (ignoreHash) {
                    url = url.replace(removeHashRE, "");
                }

                if (ignoreQuery) {
                    url = url.replace(removeQueryRE, "");
                }

                url = (tabs[i].incognito ? "incognito" : "normal") + "::" + url;

                if (!groupTabs[url]) {
                    groupTabs[url] = [];
                }

                groupTabs[url].push({ "id": tabs[i].id, "actived": tabs[i].active });
            }

            for (var url in groupTabs) {
                closeTabs(groupTabs[url]);
            }

            groupTabs = tabs = null;

            setTimeout(function () {
                running = false;
            }, 1000);
        });
    }

    function sortTabs(tab, nextTab) {
        if (configs.active && (tab.actived || nextTab.actived)) {
            return tab.actived ? -1 : 1;
        }

        return configs.old && tab.id < nextTab.id ? 1 : -1;
    }

    function closeTabs(tabs) {
        var j = tabs.length;

        if (j < 2) {
            return;
        }

        tabs = tabs.sort(sortTabs);

        for (var i = 1; i < j; i++) {
            browser.tabs.remove(tabs[i].id, empty);
        }
    }

    function createEvent(type) {
        return function () {
            setTimeout(checkTabs, 10, type);
        };
    }

    function getConfigs() {
        return {
            "old": getStorage("old"),
            "active": getStorage("active"),
            "start": getStorage("start"),
            "replace": getStorage("replace"),
            "update": getStorage("update"),
            "create": getStorage("create"),
            "remove": getStorage("remove"),
            "http": getStorage("http"),
            "query": getStorage("query"),
            "hash": getStorage("hash"),
            "incognito": getStorage("incognito")
        };
    }

    if (!getStorage("firstrun")) {
        configs = {
            "old": true,
            "active": true,
            "start": true,
            "replace": true,
            "update": true,
            "create": true,
            "remove": true,
            "http": true,
            "query": true,
            "hash": false,
            "incognito": false
        };

        for (var config in configs) {
            setStorage(config, configs[config]);
        }

        setStorage("firstrun", true);
    } else {
        configs = getConfigs();
    }

    setTimeout(checkTabs, 100, "start");

    browser.tabs.onReplaced.addListener(createEvent("replace"));
    browser.tabs.onUpdated.addListener(createEvent("update"));
    browser.tabs.onCreated.addListener(createEvent("create"));
    browser.tabs.onRemoved.addListener(createEvent("remove"));

    browser.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        if (request.setup) {
            configs[request.setup] = request.enable;
            setStorage(request.setup, request.enable);
        } else if (request.configs) {
            sendResponse(getConfigs());
        }
    });
})();
