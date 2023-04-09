/*
 * Prevent Duplicate Tabs
 * Copyright (c) 2023 Guilherme Nascimento (brcontainer@yahoo.com.br)
 * Released under the MIT license
 *
 * https://github.com/brcontainer/prevent-duplicate-tabs
 */

import { debug, storage } from './core.js';

var media = window.matchMedia('(prefers-color-scheme: dark)'),
    cKey = 'data:color-scheme',
    scheme = 'default',
    syncing = false,
    d = document;

media.onchange = (e) => changeScheme(e.matches);

storage.addListener((key, value) => {
    if (key === cKey) {
        syncing = true;
        setScheme(value);
        updateInputs(false);
        syncing = false;
    }
});

(async function () {
    var current = 'default',
        results = await storage.get(['data:color-scheme']);

    if (cKey in results) current = results['data:color-scheme'];

    setScheme(current);

    if (d.readyState === 'complete') {
        updateInputs(true);
    } else {
        d.addEventListener('DOMContentLoaded', () => updateInputs(true));
    }
})();

async function setScheme(value) {
    if (value === 'dark' || value === 'light') {
        scheme = value;
    } else {
        scheme = 'default';
    }

    d.querySelectorAll('link[data-scheme=dark]').forEach((link) => {
        if (scheme === 'dark') {
            link.media = 'screen';
        } else if (scheme === 'light') {
            link.media = '(max-width: 0px)';
        } else {
            link.media = '(prefers-color-scheme: dark)';
        }
    });

    updateInputs(false);
}

function changeInputs(e) {
    if (syncing) return;

    storage.set({ 'data:color-scheme': e.target.value });

    if (debug) console.info('[color-scheme]', e.target.value, new Date());
}

function updateInputs(setup) {
    d.querySelectorAll('input[name=color-scheme]').forEach((radio) => {
        if (radio.value === scheme) radio.checked = true;

        if (setup) {
            radio.addEventListener('change', changeInputs);
            radio.disabled = false;
        }
    });
}
