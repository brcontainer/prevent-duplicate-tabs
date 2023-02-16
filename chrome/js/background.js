/*
 * Prevent Duplicate Tabs
 * Copyright (c) 2021 Guilherme Nascimento (brcontainer@yahoo.com.br)
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

    var ignoreds,
        timeout,
        isHttpRE = /^https?:\/\/\w/i,
        isNewTabRE = /^(about:blank|chrome:\/+?(newtab|startpageshared)\/?)$/i,
        removeHashRE = /#[\s\S]+?$/,
        removeQueryRE = /\?[\s\S]+?$/,
        browser = w.browser,
        configs = {
            "turnoff": false,
            "old": true,
            "active": true,
            "start": true,
            "replace": true,
            "update": true,
            "create": true,
            "attach": true,
            "datachange": true,
            "http": true,
            "query": true,
            "hash": false,
            "incognito": false,
            "windows": true,
            "containers": true
        };

    function checkTabs(type) {
        if (configs[type]) {
            browser.tabs.query(configs.windows ? { "lastFocusedWindow": true } : {}, preGetTabs);
        }
    }

    function preGetTabs(tabs) {
        if (timeout) clearTimeout(timeout);

        timeout = setTimeout(getTabs, 50, tabs);
    }

    function isIgnored(url) {
        return ignoreds && (ignoreds.urls.indexOf(url) !== -1 || ignoreds.hosts.indexOf(new URL(url).host) !== -1);
    }

    function isDisabled() {
        return configs.turnoff || (
            !configs.start &&
            !configs.replace &&
            !configs.update &&
            !configs.create &&
            !configs.attach &&
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
            ignoreIncognitos = !configs.incognito,
            diffWindows = configs.windows,
            diffContainers = configs.containers;

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

            var prefix;

            if (tab.incognito) {
                prefix = "incognito";
            } else if (diffContainers && tab.cookieStoreId) {
                prefix = String(tab.cookieStoreId);
            } else {
                prefix = "normal";
            }

            if (diffWindows) {
                url = prefix + "::" + tab.windowId + "::" + url;
            } else {
                url = prefix + "::" + url;
            }

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

    function createEvent(type, timeout) {
        return function (tab) {
            setTimeout(checkTabs, timeout, type);
            setTimeout(toggleIgnoreIcon, 100, tab.id || tab.tabId || tab, tab.url);
        };
    }

    function getConfigs() {
        return {
            "turnoff": getStorage("turnoff", configs.turnoff),
            "old": getStorage("old", configs.old),
            "active": getStorage("active", configs.active),
            "start": getStorage("start", configs.start),
            "replace": getStorage("replace", configs.replace),
            "update": getStorage("update", configs.update),
            "create": getStorage("create", configs.create),
            "attach": getStorage("attach", configs.attach),
            "datachange": getStorage("datachange", configs.datachange),
            "http": getStorage("http", configs.http),
            "query": getStorage("query", configs.query),
            "hash": getStorage("hash", configs.hash),
            "incognito": getStorage("incognito", configs.incognito),
            "windows": getStorage("windows", configs.windows),
            "containers": getStorage("containers", configs.containers)
        };
    }

    function getExtraData()
    {
        var data = [];

        for (var key in localStorage) {
            if (key.indexOf("data:") === 0) {
                data.push({
                    "id": key.substr(5),
                    "value": getStorage(key)
                });
            }
        }

        return data;
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
        var changed = true,
            storage = type + "s",
            contents = getStorage(storage);

        if (!Array.isArray(contents)) contents = [];

        var index = contents.indexOf(value);

        if (ignore && index === -1) {
            contents.push(value);
        } else if (!ignore && index !== -1) {
            contents.splice(index, 1);
        } else {
            changed = false;
        }

        if (changed) {
            setStorage(storage, contents);
            ignoreds[storage] = contents;
        }

        contents = null;
    }

    function toggleIgnoreIcon(tab, url) {
        if (!url) {
            browser.tabs.get(tab, function (tab) {
                if (tab) {
                    var url = tab.url || tab.pendingUrl;
                    setTimeout(toggleIgnoreIcon, url ? 0 : 500, tab.id, url);
                }
            });
        } else {
            var icon;

            if (isDisabled() || isIgnored(url)) {
                icon = "/images/disabled.png";
            } else {
                icon = "/images/icon.png";
            }

            browser.browserAction.setIcon({
                "tabId": tab,
                "path": icon
            });
        }
    }

    function updateCurrentIcon(tabs) {
        if (tabs && tabs[0]) toggleIgnoreIcon(tabs[0].id, tabs[0].url);
    }

    if (!getStorage("firstrun")) {
        for (var config in configs) {
            setStorage(config, configs[config]);
        }

        setStorage("firstrun", true);
    } else {
        configs = getConfigs();
    }

    setTimeout(checkTabs, 100, "start");
    setTimeout(getIgnored, 200);

    browser.tabs.onAttached.addListener(createEvent("attach", 500));
    browser.tabs.onCreated.addListener(createEvent("create", 10));
    browser.tabs.onReplaced.addListener(createEvent("replace", 10));
    browser.tabs.onUpdated.addListener(createEvent("update", 10));

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
            browser.tabs.query({ "active": true, "lastFocusedWindow": true }, updateCurrentIcon);
        } else if (request.data) {
            var key = "data:" + request.data;
            configs[key] = request.value;
            setStorage(key, request.value);
        } else if (request.extra) {
            sendResponse(getExtraData());
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
