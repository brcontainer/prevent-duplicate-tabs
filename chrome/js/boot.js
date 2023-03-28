/*
 * Prevent Duplicate Tabs
 * Copyright (c) 2023 Guilherme Nascimento (brcontainer@yahoo.com.br)
 * Released under the MIT license
 *
 * https://github.com/brcontainer/prevent-duplicate-tabs
 */

function empty() {}

function setStorage(key, value) {
    localStorage.setItem(key, JSON.stringify({ "value": value }));
}

function getStorage(key, fallback) {
    var value = localStorage[key];

    if (!value || value[0] !== "{" || value.substr(-1) !== "}") {
        return fallback;
    }

    var current = JSON.parse(value);

    return current ? current.value : fallback;
}

function runtimeConnected() {
    return !!browser && browser.runtime && browser.runtime.sendMessage;
}

function sendMessage(message, callback) {
    if (runtimeConnected()) {
        browser.runtime.sendMessage(null, message, {}, callback || empty);
    }
}
