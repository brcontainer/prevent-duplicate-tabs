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
    export: exportStorage,
    import: importStorage,
    sync: syncStorage,
    get: (keys) => getStorage('local', keys),
    set: (keys) => setStorage('local', keys),
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

var _supports;

function exportStorage(data) {
    return getStorage('local').then((results) => {
        var output;

        if (typeof results !== 'object' || !Object.entries(results).length) {
            output = '{}';
        } else {
            output = JSON.stringify(results);
        }

        var date = new Date().toISOString(),
            dateName = date.substring(0, date.indexOf('Z') - 4),
            fileName = `${dateName}-${manifest.name}`.replace(/[^\w\-]+/g, '_') + '.json';

        return queryTabs({
            'lastFocusedWindow': true,
            'active': true,
            'windowType': 'normal'
        }).then((tabs) => {
            var tab = tabs?.[0],
                opts = {
                    url: URL.createObjectURL(new File([output], fileName, {
                        type: 'application/json'
                    }))
                };

            if (tab && tab.index) opts.index = tab.index + 1;

            return createTab(opts);
        });
    });
}

function importStorage(file) {
    return new Promise((resolve, reject) => {
        if (!file.type || !file.size) return reject(new Error('Invalid file'));

        return file.text().then((data) => {
            data = JSON.parse(data);

            var value, imported = {};

            for (var key of Object.entries(data)) {
                value = data[key];

                if (key === 'hosts' || key === 'url') {
                    var items = value.filter(onlyString);

                    if (items.length) imported[key] = items;
                } else if (key in configs && typeof value === 'boolean') {
                    imported[key] = value;
                } else if (key.indexOf('data:') !== -1 || key.indexOf('details:') !== -1) {
                    imported[key] = value;
                }
            }

            if (!Object.entries(imported).length) return Promse.resolve();

            return getStorage('local', ['hosts', 'url']).then((local) => {
                if (imported.hosts && local.hosts) {
                    imported = imported.hosts.concat(local.hosts);
                }

                if (imported.url && local.url) {
                    imported = imported.url.concat(local.url);
                }

                return setStorage('local', imported);
            });
        });
    });
}

function onlyString(item) {
    return typeof item === 'string';
}

function syncStorage(restore) {
    var source = restore ? 'sync' : 'local',
        dest = restore ? 'local' : 'sync';

    return getStorage(source).then((results) => setStorage(dest, results));
}

function getStorage(type, keys) {
    var handler;

    if (usesPromise) {
        handler = _storage[type].get(keys);
    } else {
        handler = new Promise((resolve) => {
            _storage[type].get(keys, resolve);
        });
    }

    return handler.then((results) => {
        if (typeof results === 'object' && Object.entries(results).length) {
            return results;
        }

        return {};
    });
}

function setStorage(type, keys) {
    if (usesPromise) return _storage[type].set(keys);

    return new Promise((resolve) => {
        _storage[type].set(keys, resolve);
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
    if (usesPromise) return _runtime.sendMessage(null, message, {});

    return new Promise((resolve) => {
        _runtime.sendMessage(null, message, {}, resolve);
    });
}

function supports() {
    return new Promise((resolve) => {
        if (_supports) return resolve(_supports);

        return queryTabs({}).then((tabs) => {
            var tab = tabs?.[0];

            _supports = {
                containers: ('cookieStoreId' in tab),
                groups: ('groupId' in tab)
            };

            return resolve(_supports);
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
    supports,
    tabs
};
