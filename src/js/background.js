/*
 * Prevent Duplicate Tabs
 * Copyright (c) 2023 Guilherme Nascimento (brcontainer@yahoo.com.br)
 * Released under the MIT license
 *
 * https://github.com/brcontainer/prevent-duplicate-tabs
 */

import { browser, storage, tabs } from './core.js';

var isReady = false,
    tabId = null,
    toggleTimeout = null,
    findTimeout = null,
    tabQuery = {},
    ignoredTabs = [],
    action = browser['action' in browser ? 'action' : 'browserAction'];

var urls = [],
    hosts = [];

var configs = {
    turnoff: false,
    old: true,
    active: true,
    start: true,
    replace: true,
    update: true,
    create: true,
    attach: true,
    datachange: true,
    http: true,
    query: true,
    hash: false,
    incognito: false,
    windows: true,
    containers: true
};

var storageKeys = Object.keys(configs).concat(['urls', 'hosts']);

storage.get(storageKeys).then((results) => {
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

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request === 'form:filled') preventTabClose(sender.tab.id);
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
    var path = isDisabled() ? '/images/disabled' : '/images';

    action.setIcon({
        'tabId': tabId,
        'path': {
            '16': `${path}/16x.png`,
            '32': `${path}/32x.png`,
            '48': `${path}/48x.png`,
            '128': `${path}/128x.png`,
        }
    });
}

function ready() {
    refreshTabQuery();

    storage.addListener(changeData);

    tabs.onAttached.addListener(tabEvent('attach'));
    tabs.onCreated.addListener(tabEvent('create'));
    tabs.onReplaced.addListener(tabEvent('replace'));
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

        if (configs.datachange) {
            setTimeout(preTriggerTabEvent, 100, 'datachange');
        }
    }
}

function tabEvent(type) {
    return () => preTriggerTabEvent(type);
}

function tabEventUpdate(tabId, changeInfo) {
    if (changeInfo.url) preTriggerTabEvent('update');
}

function preTriggerTabEvent(type) {
    if (configs[type]) {
        if (findTimeout !== null) clearTimeout(findTimeout);

        findTimeout = setTimeout(triggerTabEvent, 50);
    }
}

function triggerTabEvent() {
    tabs.query(tabQuery).then(findDuplicateTabs);
}

function findDuplicateTabs(tabs) {
    if (isDisabled()) return;

    console.log('findDuplicateTabs', tabs, new Date().toISOString());
}

function preventTabClose(tabId) {
    ignoredTabs.push(tabId);
}