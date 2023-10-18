/*
 * Prevent Duplicate Tabs
 * Copyright (c) 2023 Guilherme Nascimento (brcontainer@yahoo.com.br)
 * Released under the MIT license
 *
 * https://github.com/brcontainer/prevent-duplicate-tabs
 */

/**
 * @typedef {"attach" | "create" | "replace" | "update"} TabChangeType
 */

/**
 * @typedef TabGroupItem
 * @prop {number} id
 * @prop {boolean} actived
 */

(function (w, u) {
    "use strict";

    if (typeof browser === "undefined") {
        w.browser = chrome;
    } else if (!w.browser) {
        w.browser = browser;
    }

    /** @type {IgnoredStorage | undefined} */
    var ignoreds,
        /** @type {ReturnType<typeof setTimeout>} */
        timeout,
        isHttpRE = /^https?:\/\/\w/i,
        isNewTabRE = /^(about:blank|chrome:\/+?(newtab|startpageshared)\/?)$/i,
        removeHashRE = /#[\s\S]+?$/,
        removeQueryRE = /\?[\s\S]+?$/,
        browser = w.browser,
        /** @type {ConfigStorage} */
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


    var legacyConfigs = Object.keys(configs);

    /**
     * @param {TabChangeType} type
     */
    function checkTabs(type) {
        if (configs[type]) {
            browser.tabs.query(configs.windows ? { "lastFocusedWindow": true } : {}, preGetTabs);
        }
    }

    /**
     * @param {chrome.tabs.Tab[]} tabs
     */
    function preGetTabs(tabs) {
        if (timeout) clearTimeout(timeout);

        timeout = setTimeout(getTabs, 50, tabs);
    }

    /**
     * @param {string} url
     */
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

    /**
     * @param {chrome.tabs.Tab[]} tabs
     */
    function getTabs(tabs) {
        if (isDisabled()) return;

        var tab,
            /** @type {string} */ url,
            /** @type {{[url: string]: TabGroupItem[]}} */ groupTabs = {},
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

    /**
     * @param {TabGroupItem} tab
     * @param {TabGroupItem} nextTab
     */
    function sortTabs(tab, nextTab) {
        if (configs.active && (tab.actived || nextTab.actived)) {
            return tab.actived ? -1 : 1;
        }

        return configs.old && tab.id < nextTab.id ? 1 : -1;
    }

    /**
     * @param {TabGroupItem[]} tabs
     */
    function closeTabs(tabs) {
        var j = tabs.length;

        if (j < 2) return;

        tabs = tabs.sort(sortTabs);

        var activeWasClosed = false;

        for (var i = 1; i < j; i++) {
            var tab = tabs[i];
            if (tab.actived) {
                activeWasClosed = true;
            }
            browser.tabs.remove(tab.id, empty);
        }


        if (activeWasClosed) {
            chrome.tabs.update(tabs[0].id, { active: true });
        }
    }

    /**
     * @typedef TabQuery
     * @prop {number} [id]
     * @prop {number} [tabId]
     * @prop {string} [url]
     */

    /**
     * @param {TabChangeType} type
     * @param {number} timeout
     */
    function createEvent(type, timeout) {
        /**
         * @param {TabQuery | TabQuery & number} tab
         */
        return function (tab) {
            setTimeout(checkTabs, timeout, type);
            setTimeout(toggleIgnoreIcon, 100, tab.id || tab.tabId || tab, tab.url);
        };
    }

    /**
     * @return {typeof configs}
     */
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
                    "id": key.slice(5),
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

    /**
     * @param {'host' | 'url'} type
     * @param {boolean} ignore
     * @param {string} value
     */
    function toggleIgnoreData(type, ignore, value) {
        var changed = true,
            /** @type {'hosts' | 'urls'} */
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

    /**
     * @param {number} tab
     * @param {string} [url]
     */
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

    /**
     * @param {chrome.tabs.Tab[]} tabs
     */
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
            /** @type {`data:${string}`} */
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

    setTimeout(async function () {
        var store = {};

        for (var i = 0, j = localStorage.length; i < j; i++) {
            var key = localStorage.key(i);

            if (key === "urls" || key.indexOf("data:") === 0 || legacyConfigs.includes(key)) {
                try {
                    var item = JSON.parse(localStorage.getItem(key));

                    if (key === "urls" && Array.isArray(item.value)) {
                        store[key] = item.value;
                    } else if ("value" in item) {
                        store[key] = item.value;
                    }
                } catch (ee) {}
            }
        }

        await browser.storage.local.set(store);
    }, 1000);
})(window);
