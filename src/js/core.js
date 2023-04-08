/*
 * Prevent Duplicate Tabs
 * Copyright (c) 2023 Guilherme Nascimento (brcontainer@yahoo.com.br)
 * Released under the MIT license
 *
 * https://github.com/brcontainer/prevent-duplicate-tabs
 */

var main;

if (typeof browser !== 'undefined') {
    main = browser;
} else {
    main = chrome;
}

var _incognito = main.extension.isAllowedIncognitoAccess,
    _runtime = main.runtime,
    _storage = main.storage,
    _tabs = main.tabs;

var debug = false,
    manifest = _runtime.getManifest(),
    usesPromise = manifest.manifest_version >= 3;

if (_runtime.id && !('requestUpdateCheck' in _runtime)) {
    if (/@temporary-addon$/.test(_runtime.id)) debug = true;
} else if (!('update_url' in manifest)) {
    debug = true;
}

var storage = {
    get: getStorage,
    set: setStorage,
    addListener: addListenerStorage,
};

var tabs = {
    create: createTab,
    remove: removeTabs,
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

function addListenerStorage(callback) {
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

function removeTabs(ids) {
    if (usesPromise) return _tabs.remove(ids);

    return new Promise((resolve) => {
        _tabs.remove(ids, resolve);
    });
}

function queryTabs(options) {
    if (usesPromise) return _tabs.query(options);

    return new Promise((resolve) => {
        _tabs.query(options, resolve);
    });
}

function sendMessage(message) {
    if (usesPromise) return _runtime.sendMessage(null, message, {}, resolve);

    return new Promise((resolve) => {
        _runtime.sendMessage(null, message, {}, resolve);
    });
}

function support() {
    return queryTabs({}).then((tabs) => {
        var tab = tabs?.[0];
        return Promise.resolve({
            containers: ('cookieStoreId' in tab),
            groups: ('groupId' in tab)
        });
    });
}

function incognito() {
    if (usesPromise) return _incognito();

    return new Promise((resolve) => {
        _incognito(resolve);
    });
}

export {
    main,
    debug,
    incognito,
    manifest,
    sendMessage,
    storage,
    support,
    tabs
};
