/*
 * Prevent Duplicate Tabs
 * Copyright (c) 2023 Guilherme Nascimento (brcontainer@yahoo.com.br)
 * Released under the MIT license
 *
 * https://github.com/brcontainer/prevent-duplicate-tabs
 */

var browser = chrome,
    manifest = browser.runtime.getManifest();

var _storage = browser.storage;

var storage = {
    get: _storage.local.get,
    set: _storage.local.set,
    addListener: addStorageListener,
};

function addStorageListener(callback) {
    return _storage.onChanged.addListener((changes, namespace) => {
        if (namespace !== 'local') return;

        for (var item of Object.entries(changes)) {
            callback(item[0], item[1].newValue);
        }
    });
}

function connected() {
    return new Promise(() => {
        if (!browser.runtime || !browser.runtime.sendMessage) {
            return Promise.reject(new Error('Extension not connected'));
        }

        return Promise.resolve();
    });
}

function sendMessage(message) {
    return connected().then(() => browser.runtime.sendMessage(null, message, {}));
}

export {
    browser,
    connected,
    manifest,
    sendMessage,
    storage
};
