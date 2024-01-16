/*
 * Prevent Duplicate Tabs
 * Copyright (c) 2023 Guilherme Nascimento (brcontainer@yahoo.com.br)
 * Released under the MIT license
 *
 * https://github.com/brcontainer/prevent-duplicate-tabs
 */

/** @type {(...args: any[]) => void} */
function empty() {}

/**
 * @typedef ConfigStorage
 * @prop {boolean} turnoff
 * @prop {boolean} old
 * @prop {boolean} active
 * @prop {boolean} start
 * @prop {boolean} replace
 * @prop {boolean} update
 * @prop {boolean} create
 * @prop {boolean} attach
 * @prop {boolean} datachange
 * @prop {boolean} http
 * @prop {boolean} query
 * @prop {boolean} hash
 * @prop {boolean} incognito
 * @prop {boolean} windows
 * @prop {boolean} containers
 */

/**
 * @typedef IgnoredStorage
 * @prop {string[]} urls
 * @prop {string[]} hosts
 */

/**
 * @typedef StateStorage
 * @prop {boolean} firstrun
 */

/** @typedef {{ [K in `${'data' | 'details'}:${string}`]: any }} ExtraStorage */

/**
 * @typedef ExtraDataItem
 * @prop {string} id
 * @prop {any} value
 */

/** @typedef {ConfigStorage & IgnoredStorage & StateStorage & ExtraStorage} ExtensionStorage */

/**
 * @template {keyof ExtensionStorage} K
 * @param {K} key
 * @param {ExtensionStorage[K]} value
 */
function setStorage(key, value) {
    localStorage.setItem(key, JSON.stringify({ "value": value }));
}

/**
 * @template {keyof ExtensionStorage} K
 * @param {K} key
 * @param {ExtensionStorage[K]} [fallback]
 * @returns {ExtensionStorage[K]}
 */
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

/**
 * @typedef ExtensionIgnoreMessage
 * @prop {never} [setup]
 * @prop {never} [data]
 * @prop {'host' | 'url'} type
 * @prop {boolean} ignore
 * @prop {string} value
 * @prop {number} tabId
 * @prop {string} [url]
 */

/**
 * @typedef ExtensionSetupMessage
 * @prop {never} [ignore]
 * @prop {never} [data]
 * @prop {keyof ConfigStorage} setup
 * @prop {boolean} enable
 */

/**
 * @typedef ExtensionDataMessage
 * @prop {never} [ignore]
 * @prop {never} [setup]
 * @prop {'color-scheme'} data
 * @prop {any} value
 */

/**
 * @typedef ExtensionGetMessage
 * @prop {never} [ignore]
 * @prop {never} [setup]
 * @prop {never} [data]
 * @prop {true} [extra]
 * @prop {true} [configs]
 * @prop {true} [ignored]
 */

/**
 * @overload
 * @param {Pick<ExtensionGetMessage, 'extra'>} message
 * @param {(response: ExtraDataItem[]) => void} callback
 * @returns {void}
 */
/**
 * @overload
 * @param {Pick<ExtensionGetMessage, 'configs'>} message
 * @param {(response: ConfigStorage) => void} callback
 * @returns {void}
 */
/**
 * @overload
 * @param {Pick<ExtensionGetMessage, 'ignored'>} message
 * @param {(response: IgnoredStorage) => void} callback
 * @returns {void}
 */
/**
 * @overload
 * @param {ExtensionDataMessage | ExtensionSetupMessage | ExtensionIgnoreMessage} message
 * @returns {void}
 */
/**
 * @param {ExtensionGetMessage | ExtensionDataMessage | ExtensionSetupMessage | ExtensionIgnoreMessage} message
 * @param {(response: any) => void} [callback]
 * @returns {void}
 */
function sendMessage(message, callback) {
    if (runtimeConnected()) {
        browser.runtime.sendMessage(null, message, {}, callback || empty);
    }
}
