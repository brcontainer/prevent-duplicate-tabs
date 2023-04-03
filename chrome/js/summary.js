/*
 * Prevent Duplicate Tabs
 * Copyright (c) 2023 Guilherme Nascimento (brcontainer@yahoo.com.br)
 * Released under the MIT license
 *
 * https://github.com/brcontainer/prevent-duplicate-tabs
 */

import { storage } from './boot.js';

var keys = {},
    widgets = {},
    details = document.querySelectorAll('details');

details.forEach((widget) => {
    var summary = widget.querySelector('summary'),
        key = 'details:' + summary.getAttribute('data-i18n');

    widget.addEventListener('toggle', () => toggle(key, value, widget));

    key.push(key);

    widgets[key] = widget;
});

storage.get(keys).then((result) => {
    for (var key of keys) {
        widgets[key].open = result[key];
    }
});

function toggle(widget, key, value) {
    storage.set({ [key]: value }).then(() => {
        widget.open = value;
    });
}