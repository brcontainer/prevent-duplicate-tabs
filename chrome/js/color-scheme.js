/*
 * Prevent Duplicate Tabs
 * Copyright (c) 2023 Guilherme Nascimento (brcontainer@yahoo.com.br)
 * Released under the MIT license
 *
 * https://github.com/brcontainer/prevent-duplicate-tabs
 */

import { storage } from './boot.js';

var media = window.matchMedia('(prefers-color-scheme: dark)'),
    cKey = 'data:color-scheme',
    scheme = 'default';

media.onchange = (e) => changeScheme(e.matches);

storage.addListener((key, value) => {
    if (key === cKey) setScheme(value);
});

(async function () {
    var results = await storage.get(['data:color-scheme']);

    if (cKey in results) {
        setScheme(results['data:color-scheme']);
    }

    if (document.readyState === 'complete') {
        setupInputs();
    } else {
        document.addEventListener('DOMContentLoaded', setupInputs);
    }
})();

async function setScheme(value) {
    if (value === 'dark' || value === 'light') {
        scheme = value;
    } else {
        scheme = 'default';
    }

    document.querySelectorAll('link[data-scheme=dark]').forEach((link) => {
        if (scheme === 'dark') {
            link.media = 'screen';
        } else if (scheme === 'light') {
            link.media = '(max-width: 0px)';
        } else {
            link.media = '(prefers-color-scheme: dark)';
        }
    });
}

function changeInputs(e) {
    var el = e.target;

    if (el.matches('input[name=color-scheme]')) {
        storage.set({ 'data:color-scheme': el.value });
    }
}

function setupInputs() {
    document.querySelectorAll('input[name=color-scheme]').forEach((radio) => {
        if (radio.value === scheme) radio.checked = true;

        radio.addEventListener('change', changeInputs);
        radio.disabled = false;
    });
}