/*
 * Prevent Duplicate Tabs
 * Copyright (c) 2023 Guilherme Nascimento (brcontainer@yahoo.com.br)
 * Released under the MIT license
 *
 * https://github.com/brcontainer/prevent-duplicate-tabs
 */

var browser = chrome,
    storage = browser.storage.sync
    manifest = browser.runtime.getManifest();

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
