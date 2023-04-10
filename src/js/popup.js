/*
 * Prevent Duplicate Tabs
 * Copyright (c) 2023 Guilherme Nascimento (brcontainer@yahoo.com.br)
 * Released under the MIT license
 *
 * https://github.com/brcontainer/prevent-duplicate-tabs
 */

import { main, debug, incognito, sendMessage, storage, supports, tabs } from './core.js';

var d = document,
    s = d.scrollingElement || d.body,
    inputImport = d.getElementById('input-import');

if (!debug) {
    d.oncontextmenu = disableEvent;
    d.ondragstart = disableEvent;
}

var actions = {
    'backupSync': backupSync,
    'backupRestore': backupRestore,
    'backupExport': () => {
        storage.export();
    },
    'backupImport': () => {
        inputImport.click();
    }
};

var locales = d.querySelectorAll('[data-i18n]');

for (var i = locales.length - 1; i >= 0; i--) {
    var el = locales[i], message = main.i18n.getMessage(el.dataset.i18n);

    if (message) el.innerHTML = markdown(message);
}

d.addEventListener('click', (e) => {
    if (e.button !== 0) return;

    var el = e.target;

    anchorCreateTab(e, el);

    btnAction(el);
});

incognito().then((allowed) => {
    d.getElementById('incognito_warn').classList.toggle('hide', allowed === true);
});

supports().then((results) => {
    d.querySelectorAll('.container-support').forEach((config) => {
        config.classList.toggle('supported', results.containers);
    });
    d.querySelectorAll('.group-support').forEach((config) => {
        config.classList.toggle('supported', results.groups);
    });
});

// inputImport.addEventListener('change', getImportedFile);

setTimeout(() => {
    s.style.transform = 'scale(2)';

    setTimeout(() => {
        s.style.transform = 'scale(1)';

        setTimeout(() => {
            s.style.transform = null;
        }, 20);
    }, 20);
}, 10);

function anchorCreateTab(e, el) {
    if (el.nodeName !== 'A' && !el.closest('a[href]')) return;

    var protocol = el.protocol;

    if (protocol !== 'http:' && protocol !== 'https:') return;

    e.preventDefault();

    tabs.create({ 'url': el.href });
}

function btnAction(el) {
    if (el.nodeName !== 'BUTTON' && !el.dataset.action) return;

    var action = el.dataset.action;

    var callback = actions[action];

    if (!callback) throw new Error('Invalid action: [' + action + ']');

    callback(el);
}

function disableEvent(e) {
    e.preventDefault();
    return false;
}

function markdown(message) {
    return message
        .replace(/(^|\s|[>])_(.*?)_($|\s|[<])/g, '$1<i>$2<\/i>$3')
        .replace(/(^|\s|[>])`(.*?)`($|\s|[<])/g, '$1<code>$2<\/code>$3')
        .replace(/\{([a-z])(\w+)?\}/gi, '<var name="$1$2"><\/var>')
        .replace(/(^|\s|[>])\*(.*?)\*($|\s|[<])/g, '$1<strong>$2<\/strong>$3');
}

function backupSync(el) {
    el.disabled = true;

    sendMessage('backup:sync').then(() => {
        el.disabled = false;
    });
}

function backupRestore(el) {
    el.disabled = true;

    sendMessage('backup:restore').then(() => {
        el.disabled = false;
    });
}

function getImportedFile(e) {
    var files = inputImport.files;

    if (!files || !files[0]) return;

    storage.import(files[0]).then(() => {}, () => {});
}
