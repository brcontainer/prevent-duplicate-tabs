/*
 * Prevent Duplicate Tabs
 * Copyright (c) 2023 Guilherme Nascimento (brcontainer@yahoo.com.br)
 * Released under the MIT license
 *
 * https://github.com/brcontainer/prevent-duplicate-tabs
 */

import { debug, sendMessage, storage } from './core.js';

var keys = [],
    syncing = {},
    toggles = document.querySelectorAll('.toggle input[type=checkbox]');

toggles.forEach((toggle) => {
    syncing[toggle.id] = false;
    keys.push(toggle.id);
});

sendMessage('configs').then((results) => {
    toggles.forEach((toggle) => {
        if (toggle.id in results && results[toggle.id] === true) {
            toggle.checked = true;
        }

        toggle.disabled = false;
        toggle.addEventListener('change', changeSwitch);
    });
});

storage.addListener((key, value) => {
    toggles.forEach((toggle) => {
        if (key === toggle.id) {
            toggle.checked = value === true;
        }
    });
});

function changeSwitch(e) {
    if (syncing[key]) return;

    var key = e.target.id;

    syncing[key] = true;

    if (debug) console.info('toggle', { [key]: e.target.checked }, new Date());

    storage.set({ [key]: e.target.checked }).finally(() => {
        syncing[key] = false;
    });
}
