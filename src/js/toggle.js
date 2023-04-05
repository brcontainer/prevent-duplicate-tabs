/*
 * Prevent Duplicate Tabs
 * Copyright (c) 2023 Guilherme Nascimento (brcontainer@yahoo.com.br)
 * Released under the MIT license
 *
 * https://github.com/brcontainer/prevent-duplicate-tabs
 */

import { browser, storage } from './core.js';

var keys = [],
    syncing = {},
    toggles = document.querySelectorAll('.toggle input[type=checkbox]');

toggles.forEach((toggle) => {
    syncing[toggle.id] = false;
    keys.push(toggle.id);
});

storage.get(keys).then((results) => {
    console.log('toggle', { results });

    toggles.forEach((toggle) => {
        if (toggle.id in results && results[toggle.id] === true) {
            toggle.checked = true;
        }

        toggle.disabled = false;
        toggle.addEventListener('change', changeSwitch);
    });
});

function changeSwitch(e) {
    var key = e.target.id;

    syncing[key] = true;

    console.log({ [key]: e.target.checked });

    storage.set({ [key]: e.target.checked }).finally(() => {
        syncing[key] = false;
    });
}