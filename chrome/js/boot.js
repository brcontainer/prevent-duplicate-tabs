/*
 * Prevent Duplicate Tabs
 * Copyright (c) 2023 Guilherme Nascimento (brcontainer@yahoo.com.br)
 * Released under the MIT license
 *
 * https://github.com/brcontainer/prevent-duplicate-tabs
 */

var browser = chrome,
    manifest = browser.runtime.getManifest(),
    usesPromise = manifest.manifest_version >= 3;

var _incognito = browser.extension.isAllowedIncognitoAccess,
    _storage = browser.storage,
    _tabs = browser.tabs;

var storage = {
    get: getStorage,
    set: setStorage,
    addListener: addStorageListener,
};

var tabs = {
    create: createTab,
    query: queryTabs,
    onActivated: _tabs.onActivated,
    onAttached: _tabs.onAttached,
    onCreated: _tabs.onCreated,
    onReplaced: _tabs.onReplaced,
    onUpdated: _tabs.onUpdated,
};

function getStorage(keys) {
    if (usesPromise) return _storage.local.get(keys);

    return new Promise((resolve) => {
        _storage.local.get(keys, resolve);
    });
}

function setStorage(keys) {
    if (usesPromise) return _storage.local.set(keys);

    return new Promise((resolve) => {
        _storage.local.set(keys, resolve);
    });
}

function addStorageListener(callback) {
    _storage.onChanged.addListener((changes, namespace) => {
        if (namespace !== 'local') return;

        for (var item of Object.entries(changes)) {
            callback(item[0], item[1].newValue);
        }
    });
}

function createTab(props) {
    if (usesPromise) return _tabs.create(props);

    return new Promise((resolve) => {
        _tabs.create(props, resolve);
    });
}

function queryTabs(options) {
    if (usesPromise) return _tabs.query(options);

    return new Promise((resolve) => {
        _tabs.query(options, resolve);
    });
}

function connected() {
    return new Promise((resolve, reject) => {
        if (!browser.runtime || !browser.runtime.sendMessage) {
            return reject(new Error('Extension not connected'));
        }

        return resolve();
    });
}

function sendMessage(message) {
    return connected().then(() => browser.runtime.sendMessage(null, message, {}));
}

function incognito() {
    if (usesPromise) return _incognito();

    return new Promise((resolve) => {
        _incognito(resolve)
    });
}

export {
    browser,
    connected,
    incognito,
    manifest,
    sendMessage,
    storage,
    tabs
};