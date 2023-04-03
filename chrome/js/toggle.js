/*
 * Prevent Duplicate Tabs
 * Copyright (c) 2023 Guilherme Nascimento (brcontainer@yahoo.com.br)
 * Released under the MIT license
 *
 * https://github.com/brcontainer/prevent-duplicate-tabs
 */

import { storage } from './boot.js';

var keys = [],
    syncing = {},
    toggles = document.querySelectorAll('.toggle input[type=checkbox]');

toggles.forEach((toggle) => {
    syncing[toggle.id] = false;

    toggle.addEventListener('change', changeSwitch);
});

function changeSwitch(e) {
    var key = e.target.id;

    syncing[key] = true;

    storage.set({ [key]: value }).finally(() => {
        syncing[key] = false;
    });
}