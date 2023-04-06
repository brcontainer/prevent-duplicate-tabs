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

var debug = false,
    manifest = main.runtime.getManifest(),
    usesPromise = manifest.manifest_version >= 3;

if (main.runtime.id && !('requestUpdateCheck' in main.runtime)) {
    if (/@temporary-addon$/.test(main.runtime.id)) debug = true;
} else if (!('update_url' in manifest)) {
    debug = true;
}

var _incognito = main.extension.isAllowedIncognitoAccess,
    _storage = main.storage,
    _tabs = main.tabs;

var storage = {
    get: getStorage,
    set: setStorage,
    addListener: addListenerStorage,
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

function queryTabs(options) {
    if (usesPromise) return _tabs.query(options);

    return new Promise((resolve) => {
        _tabs.query(options, resolve);
    });
}

function sendMessage(message) {
    return new Promise((resolve) => {
        main.runtime.sendMessage(null, message, {}, resolve);
    });
}

function container() {
    return queryTabs({ active: true, lastFocusedWindow: true }).then((tabs) => {
        if (tabs?.[0]?.cookieStoreId) return Promise.resolve(true);

        return Promise.resolve(false);
    });
}

function incognito() {
    if (usesPromise) return _incognito();

    return new Promise((resolve) => {
        _incognito(resolve)
    });
}

export {
    main,
    container,
    debug,
    incognito,
    manifest,
    sendMessage,
    storage,
    tabs
};
