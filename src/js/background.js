/*
 * Prevent Duplicate Tabs
 * Copyright (c) 2023 Guilherme Nascimento (brcontainer@yahoo.com.br)
 * Released under the MIT license
 *
 * https://github.com/brcontainer/prevent-duplicate-tabs
 */

import { main, debug, manifest, storage, tabs } from './core.js';

var isReady = false,
    tabId = null,
    toggleTimeout = null,
    findTimeout = null,
    tabQuery = {},
    ignoredTabIds = [],
    action = main['action' in main ? 'action' : 'browserAction'],
    isHttpRE = /^https?:\/\/\w/i;

var urls = [],
    hosts = [];

var configs = {
    turnoff: false,

    old: true,
    active: true,

    http: true,
    query: true,
    hash: false,

    start: true,
    update: true,
    create: true,
    replace: true,
    attach: true,
    datachange: true,

    windows: true,
    containers: true,
    groups: true,
    incognito: false
};

var storageKeys = Object.keys(configs).concat(['urls', 'hosts']);

var boot;

if (manifest.manifest_version < 3) {
    boot = migrate().then(() => storage.get(storageKeys));
} else {
    boot = storage.get(storageKeys);
}

boot.then((results) => {
    for (var key of storageKeys) {
        if (key === 'urls') {
            if (Array.isArray(results[key])) urls = results[key];
        } else if (key === 'hosts') {
            if (Array.isArray(results[key])) hosts = results[key];
        } else if (typeof results[key] === 'boolean') {
            configs[key] = results[key];
        }
    }

    ready();
});

tabs.onActivated.addListener((tab) => {
    tabId = tab.tabId;

    if (isReady) preToggleIcon();
});

main.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request === 'form:filled') {
        putIgnoredTabs(sender.tab.id, false);
    } else if (request === 'configs') {
        sendResponse(configs);
    } else if (request === 'ignored') {
        sendResponse({ url, hosts });
    } else if (request === 'backup:sync' || request === 'backup:restore') {
        storage.sync(request === 'backup:restore').then(() => delay(1000)).then(() => sendResponse());
    } else {
        return;
    }

    return true;
});

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

function preToggleIcon() {
    if (toggleTimeout !== null) clearTimeout(toggleTimeout);

    toggleTimeout = setTimeout(toggleIcon, 50);
}

function toggleIcon() {
    var path = isDisabled() ? 'icons/disabled' : 'icons';

    action.setIcon({
        'tabId': tabId,
        'path': {
            '16': `/images/${path}/16x.png`,
            '32': `/images/${path}/32x.png`,
            '48': `/images/${path}/48x.png`,
            '128': `/images/${path}/128x.png`,
        }
    });
}

function ready() {
    refreshTabQuery();

    storage.addListener(changeData);

    tabs.onAttached.addListener(() => preTriggerTabEvent('attach'));
    tabs.onCreated.addListener(() => preTriggerTabEvent('create'));
    tabs.onReplaced.addListener(() => preTriggerTabEvent('replace'));
    tabs.onUpdated.addListener(tabEventUpdate);

    setTimeout(preTriggerTabEvent, 100, 'start');

    preToggleIcon();

    isReady = true;
}

function refreshTabQuery() {
    tabQuery = configs.windows ? { 'lastFocusedWindow': true } : {};
}

function changeData(key, value) {
    if (typeof value === 'boolean' && key in configs) {
        configs[key] = value;

        if (key === 'windows') refreshTabQuery();

        toggleIcon();

        if (configs.datachange) setTimeout(preTriggerTabEvent, 100, 'datachange');
    }
}

function preTriggerTabEvent(type) {
    if (configs[type]) {
        if (findTimeout !== null) clearTimeout(findTimeout);

        findTimeout = setTimeout(triggerTabEvent, 50);
    }
}

function triggerTabEvent() {
    tabs.query(tabQuery).then(findTabs);
}

function tabEventUpdate(tabId, changeInfo) {
    if (changeInfo.url) {
        putIgnoredTabs(tabId, true);
        preTriggerTabEvent('update');
    }
}

function findTabs(results) {
    if (isDisabled()) return;

    var ns,
        url,
        prefix,
        groupTabs = {},
        closeItems = [],
        onlyHttp = configs.http,
        ignoreHash = !configs.hash,
        ignoreQuery = !configs.query,
        ignoreIncognito = !configs.incognito,
        diffWindows = configs.windows,
        diffContainers = configs.containers,
        diffGroups = configs.groups;

    for (const result of results) {
        url = result.url || result.pendingUrl;

        if (
            url === '' ||
            result.pinned ||
            isNewTab(url) ||
            ignoredTabIds.indexOf(result.id) !== -1 ||
            (ignoreIncognito && result.incognito) ||
            (onlyHttp && url.indexOf('https://') !== 0 && url.indexOf('http://') !== 0) ||
            isIgnored(url)
        ) {
            continue;
        }

        if (ignoreHash) url = sliceUrl(url, '#');

        if (ignoreQuery) url = sliceUrl(url, '?');

        if (result.incognito) {
            prefix = 'incognito:true';
        } else {
            prefix = 'incognito:false';
        }

        if (diffContainers && 'cookieStoreId' in result) {
            prefix += '|container:' + result.cookieStoreId;
        } else {
            prefix += '|container:false';
        }

        if (diffGroups && 'groupId' in result) {
            prefix += '|group:' + result.groupId;
        } else {
            prefix += '|group:false';
        }

        if (diffWindows) {
            prefix += '|window:' + result.windowId;
        } else {
            prefix += '|window:false';
        }

        ns = prefix + '::' + url;

        if (!groupTabs[ns]) {
            groupTabs[ns] = [];

            if (debug) console.info('[namespace]', new Date(), ns);
        }

        groupTabs[ns].push({ 'id': result.id, 'active': result.active });
    }

    for (var url in groupTabs) {
        if (groupTabs.hasOwnProperty(url)) {
            getDuplicateTabs(groupTabs[url], closeItems);
        }
    }

    if (debug) console.info('[findTabs]', closeItems, new Date());

    tabs.remove(closeItems);

    closeItems = groupTabs = null;
}

function isNewTab(url) {
    return url.indexOf('about:blank') === 0 ||
        url.indexOf('chrome://newtab') === 0 ||
        url.indexOf('chrome://startpageshared') === 0;
}

function isIgnored(url) {
    return urls.indexOf(url) !== -1 || hosts.indexOf(new URL(url).host) !== -1;
}

function sliceUrl(url) {
    var index = url.indexOf('#');
    return index > -1 ? url.substring(0, index) : url;
}

function getDuplicateTabs(items, closeItems) {
    if (items.length < 2) return;

    items.sort(sortTabs);

    for (var i = 1, j = items.length; i < j; i++) {
        closeItems.push(items[i].id);
    }
}

function sortTabs(tab, nextTab) {
    if (configs.active && (tab.active || nextTab.active)) {
        return tab.active ? -1 : 1;
    }

    return configs.old && tab.id < nextTab.id ? 1 : -1;
}

function putIgnoredTabs(tabId, remove) {
    if (remove) {
        var index = ignoredTabIds.indexOf(tabId);

        if (index !== -1) ignoredTabIds.splice(index, 1);
    } else {
        ignoredTabIds.push(tabId);
    }
}

function delay(timeout) {
    return new Promise((resolve) => {
        setTimeout(() => resolve(), timeout);
    });
}

function migrate() {
    var total = 0, data = {}, legacyConfigs = Object.keys(configs);

    for (var i = 0, j = localStorage.length; i < j; i++) {
        var key = localStorage.key(i);

        if (
            key === 'urls' ||
            key === 'hosts' ||
            key.indexOf('data:') === 0 ||
            key.indexOf('details:') === 0 ||
            legacyConfigs.includes(key)
        ) {
            try {
                var data = localStorage.getItem(key);

                if (!data) continue;

                var item = JSON.parse(data);

                if (key === 'hosts' || key === 'urls') {
                    if (Array.isArray(item.value)) {
                        data[key] = item.value;
                        ++total;
                    }
                } else if ('value' in item) {
                    data[key] = item.value;
                    ++total;
                }
            } catch (ee) {}
        }
    }

    if (debug) console.info('[migrate]', data, new Date());

    return total > 0 ? storage.set(data) : Promise.resolve();
}
