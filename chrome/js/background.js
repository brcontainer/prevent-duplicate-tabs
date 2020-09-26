/*
 * Prevent Duplicate Tabs
 * Copyright (c) 2020 Guilherme Nascimento (brcontainer@yahoo.com.br)
 * Released under the MIT license
 *
 * https://github.com/brcontainer/prevent-duplicate-tabs
 */

(function (w, u) {
    "use strict";

    if (typeof browser === "undefined") {
        w.browser = chrome;
    } else if (!w.browser) {
        w.browser = browser;
    }

    var configs,
        ignoreds,
        timeout,
        isHttpRE = /^https?:\/\/\w/i,
        isNewTabRE = /^(about:blank|chrome:\/+?(newtab|startpageshared)\/?)$/i,
        linkJsonRE = /^\{[\s\S]+?\}$/,
        removeHashRE = /#[\s\S]+?$/,
        removeQueryRE = /\?[\s\S]+?$/,
        browser = w.browser;

    function empty() {}

    function setStorage(key, value) {
        localStorage.setItem(key, JSON.stringify({ "value": value }));
    }

    function getStorage(key) {
        var itemValue = localStorage[key];

        if (!itemValue && !linkJsonRE.test(itemValue)) return false;

        var current = JSON.parse(itemValue);

        return current ? current.value : itemValue;
    }

    function checkTabs(type) {
        if (configs[type]) browser.tabs.query({}, preGetTabs);
    }

    function preGetTabs(tabs) {
        if (timeout) clearTimeout(timeout);

        timeout = setTimeout(getTabs, 50, tabs);
    }

    function isIgnored(url) {
        if (ignoreds) {
            return ignoreds.urls.indexOf(url) !== -1 || ignoreds.hosts.indexOf(new URL(url).host) !== -1;
        } else {
            return false;
        }
    }

    function isDisabled() {
        return configs.turnoff || (
            !configs.start &&
            !configs.replace &&
            !configs.update &&
            !configs.create &&
            !configs.datachange
        );
    }

    function getTabs(tabs) {
        if (isDisabled()) return;

        var tab,
            url,
            groupTabs = {},
            onlyHttp = configs.http,
            ignoreHash = !configs.hash,
            ignoreQuery = !configs.query,
            ignoreIncognitos = !configs.incognito;

        for (var i = tabs.length - 1; i >= 0; i--) {
            tab = tabs[i];
            url = tab.url;

            if (
                tab.pinned ||
                url === "" ||
                isNewTabRE.test(url) ||
                (ignoreIncognitos && tab.incognito) ||
                (onlyHttp && !isHttpRE.test(url)) ||
                isIgnored(url)
            ) {
                continue;
            }

            if (ignoreHash) url = url.replace(removeHashRE, "");

            if (ignoreQuery) url = url.replace(removeQueryRE, "");

            url = (tab.incognito ? "incognito" : "normal") + "::" + url;

            if (!groupTabs[url]) groupTabs[url] = [];

            groupTabs[url].push({ "id": tab.id, "actived": tab.active });
        }

        for (var url in groupTabs) {
            closeTabs(groupTabs[url]);
        }

        groupTabs = tabs = null;
    }

    function sortTabs(tab, nextTab) {
        if (configs.active && (tab.actived || nextTab.actived)) {
            return tab.actived ? -1 : 1;
        }

        return configs.old && tab.id < nextTab.id ? 1 : -1;
    }

    function closeTabs(tabs) {
        var j = tabs.length;

        if (j < 2) return;

        tabs = tabs.sort(sortTabs);

        for (var i = 1; i < j; i++) {
            browser.tabs.remove(tabs[i].id, empty);
        }
    }

    function createEvent(type) {
        return function (tab) {
            setTimeout(checkTabs, 10, type);
            setTimeout(toggleIgnoreIcon, 100, tab.id || tab.tabId || tab, tab.url);
        };
    }

    function getConfigs() {
        return {
            "turnoff": getStorage("turnoff"),
            "old": getStorage("old"),
            "active": getStorage("active"),
            "start": getStorage("start"),
            "replace": getStorage("replace"),
            "update": getStorage("update"),
            "create": getStorage("create"),
            "datachange": getStorage("datachange"),
            "http": getStorage("http"),
            "query": getStorage("query"),
            "hash": getStorage("hash"),
            "incognito": getStorage("incognito")
        };
    }

    function getIgnored() {
        var hosts = getStorage("hosts"),
            urls = getStorage("urls");

        return ignoreds = {
            "urls": Array.isArray(urls) ? urls : [],
            "hosts": Array.isArray(hosts) ? hosts : []
        };
    }

    function toggleIgnoreData(type, ignore, value) {
        var contents = getStorage(type);

        type = type === "url" ? "urls" : "hosts";

        if (!Array.isArray(contents)) contents = [];

        var index = contents.indexOf(value);

        if (index === -1) {
            if (ignore) {
                contents.push(value);
            } else {
                contents.splice(index, 1);
            }
        }

        setStorage(type, contents);

        ignoreds[type] = contents;

        contents = null;
    }

    function toggleIgnoreIcon(tab, url) {
        if (url === u) {
            browser.tabs.get(tab, function (tab) {
                if (tab) toggleIgnoreIcon(tab.id, tab.url);
            });
        } else {
            var icon;

            if (isDisabled() || ignoreds.urls.indexOf(url) !== -1 || ignoreds.hosts.indexOf(new URL(url).host) !== -1) {
                icon = "/images/disabled.png";
            } else {
                icon = "/images/icon.png";
            }

            browser.browserAction.setIcon({
                tabId: tab,
                path: icon
            });
        }
    }

    function updateCurrentIcon(tabs) {
        if (tabs[0]) toggleIgnoreIcon(tabs[0].id, tabs[0].url);
    }

    if (!getStorage("firstrun")) {
        configs = {
            "turnoff": false,
            "old": true,
            "active": true,
            "start": true,
            "replace": true,
            "update": true,
            "create": true,
            "datachange": true,
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
    setTimeout(getIgnored, 200);

    browser.tabs.onUpdated.addListener(createEvent("update"));
    browser.tabs.onCreated.addListener(createEvent("create"));
    browser.tabs.onReplaced.addListener(createEvent("replace"));

    browser.tabs.onActivated.addListener(function (tab) {
        toggleIgnoreIcon(tab.tabId);
    });

    browser.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        if (request.ignore !== u) {
            toggleIgnoreData(request.type, request.ignore, request.value);
            toggleIgnoreIcon(request.tabId, request.url);
        } else if (request.setup) {
            configs[request.setup] = request.enable;
            setStorage(request.setup, request.enable);
            browser.tabs.query({ active: true, lastFocusedWindow: true }, updateCurrentIcon);
        } else if (request.configs) {
            sendResponse(getConfigs());
        } else if (request.ignored) {
            sendResponse(getIgnored());
        }

        if (request.setup || request.ignore !== u) {
            if (configs.datachange) setTimeout(checkTabs, 10, "datachange");
        }
    });
})(window);
