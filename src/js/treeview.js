/*
 * Prevent Duplicate Tabs
 * Copyright (c) 2023 Guilherme Nascimento (brcontainer@yahoo.com.br)
 * Released under the MIT license
 *
 * https://github.com/brcontainer/prevent-duplicate-tabs
 */

import { storage } from './core.js';

var keys = [],
    syncing = {},
    details = document.querySelectorAll('details');

details.forEach((widget) => {
    var key = 'details:' + widget.querySelector('summary').getAttribute('data-i18n');

    widget.setAttribute('id', key);

    syncing[key] = false;
    keys.push(key);
});

storage.get(keys).then((results) => {
    details.forEach((widget) => {
        if (widget.id in results && results[widget.id] === false) {
            widget.open = false;
        }

        widget.disabled = false;
        widget.addEventListener('toggle', toggleSwitch);
    });
});

storage.addListener((key, value) => {
    details.forEach((widget) => {
        if (key === widget.id) {
            widget.open = value === true;
        }
    });
});

function toggleSwitch(e) {
    if (syncing[key]) return;

    var key = e.target.id;

    syncing[key] = true;

    console.log({ [key]: e.target.open });

    storage.set({ [key]: e.target.open }).finally(() => {
        syncing[key] = false;
    });
}
