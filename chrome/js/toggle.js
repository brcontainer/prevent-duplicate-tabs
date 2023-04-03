/*
 * Prevent Duplicate Tabs
 * Copyright (c) 2023 Guilherme Nascimento (brcontainer@yahoo.com.br)
 * Released under the MIT license
 *
 * https://github.com/brcontainer/prevent-duplicate-tabs
 */

import { browser, storage } from './boot.js';

var keys = [],
    syncing = {},
    toggles = document.querySelectorAll('.toggle input[type=checkbox]');

toggles.forEach((toggle) => {
    syncing[toggle.id] = false;

    keys.push(toggle.id);

    toggle.addEventListener('change', changeSwitch);
});

storage.get(keys).then((results) => {
    toggle.disabled = false;
});

function changeSwitch(e) {
    var key = e.target.id;

    syncing[key] = true;

    storage.set({ [key]: e.target.checked }).finally(() => {
        syncing[key] = false;
    });
}