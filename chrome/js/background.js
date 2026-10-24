/*
 * Prevent Duplicate Tabs
 * Copyright (c) 2023 Guilherme Nascimento (brcontainer@yahoo.com.br)
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

    var ignoreds = { "urls": [], "hosts": [] },
        extras = {},
        timeout,
        isHttpRE = /^https?:\/\/\w/i,
        isNewTabRE = /^(about:blank|(chrome|edge):\/+?(newtab|startpageshared)\/?)$/i,
        removeHashRE = /#[\s\S]+?$/,
        removeQueryRE = /\?[\s\S]+?$/,
        browser = w.browser,
        storage = browser.storage.local,
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

    function empty() {
        // Reading lastError stops "Unchecked runtime.lastError" warnings
        void browser.runtime.lastError;
    }

    function setStorage(key, value) {
        var item = {};
        item[key] = value;
        return storage.set(item);
    }

    // A service worker is stopped when idle and started again on the next
    // event, so settings are loaded from storage every time it starts
    var ready = storage.get(null).then(function (stored) {
        if (!stored.firstrun) {
            stored = Object.assign({ "firstrun": true }, configs, stored);
            return storage.set(stored).then(function () { return stored; });
        }

        return stored;
    }).then(function (stored) {
        for (var key in stored) {
            if (key in configs) {
                configs[key] = stored[key];
            } else if (key.indexOf("data:") === 0) {
                extras[key.substr(5)] = stored[key];
            }
        }

        ignoreds = {
            "urls": Array.isArray(stored.urls) ? stored.urls : [],
            "hosts": Array.isArray(stored.hosts) ? stored.hosts : []
        };
    });

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
        try {
            return ignoreds.urls.indexOf(url) !== -1 || ignoreds.hosts.indexOf(new URL(url).host) !== -1;
        } catch (ee) {
            return false;
        }
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
                !url ||
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
            ready.then(function () {
                setTimeout(checkTabs, timeout, type);
                setTimeout(toggleIgnoreIcon, 100, tab.id || tab.tabId || tab, tab.url);
            });
        };
    }

    function getConfigs() {
        return Object.assign({}, configs);
    }

    function getExtraData() {
        var data = [];

        for (var key in extras) {
            data.push({ "id": key, "value": extras[key] });
        }

        return data;
    }

    function toggleIgnoreData(type, ignore, value) {
        var key = type + "s",
            contents = ignoreds[key].slice(),
            index = contents.indexOf(value);

        if (ignore && index === -1) {
            contents.push(value);
        } else if (!ignore && index !== -1) {
            contents.splice(index, 1);
        } else {
            return;
        }

        ignoreds[key] = contents;
        setStorage(key, contents);
    }

    function toggleIgnoreIcon(tab, url) {
        if (!url) {
            browser.tabs.get(tab, function (tab) {
                if (browser.runtime.lastError) return;

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

            browser.action.setIcon({
                "tabId": tab,
                "path": icon
            }, empty);
        }
    }

    function updateCurrentIcon(tabs) {
        if (tabs && tabs[0]) toggleIgnoreIcon(tabs[0].id, tabs[0].url);
    }

    // "start" event: runs when the browser launches, not on every service worker wake-up
    browser.runtime.onStartup.addListener(function () {
        ready.then(function () {
            setTimeout(checkTabs, 100, "start");
        });
    });

    browser.runtime.onInstalled.addListener(function () {
        ready.then(function () {
            setTimeout(checkTabs, 100, "start");
        });
    });

    browser.tabs.onAttached.addListener(createEvent("attach", 500));
    browser.tabs.onCreated.addListener(createEvent("create", 10));
    browser.tabs.onReplaced.addListener(createEvent("replace", 10));
    browser.tabs.onUpdated.addListener(createEvent("update", 10));

    browser.tabs.onActivated.addListener(function (tab) {
        ready.then(function () {
            toggleIgnoreIcon(tab.tabId);
        });
    });

    browser.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        ready.then(function () {
            if (request.ignore !== u) {
                toggleIgnoreData(request.type, request.ignore, request.value);
                toggleIgnoreIcon(request.tabId, request.url);
                sendResponse();
            } else if (request.setup) {
                configs[request.setup] = request.enable;
                setStorage(request.setup, request.enable);
                browser.tabs.query({ "active": true, "lastFocusedWindow": true }, updateCurrentIcon);
                sendResponse();
            } else if (request.data) {
                extras[request.data] = request.value;
                setStorage("data:" + request.data, request.value);
                sendResponse();
            } else if (request.extra) {
                sendResponse(getExtraData());
            } else if (request.configs) {
                sendResponse(getConfigs());
            } else if (request.ignored) {
                sendResponse(ignoreds);
            } else {
                sendResponse();
            }

            if (request.setup || request.ignore !== u) {
                if (configs.datachange) setTimeout(checkTabs, 10, "datachange");
            }
        }).catch(function () {
            // Always answer so the sender's callback is not left waiting
            sendResponse();
        });

        // Keeps the message channel open for the async sendResponse above
        return true;
    });
})(self);
