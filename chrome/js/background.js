/*
 * Prevent Duplicate Tabs
 * Copyright (c) 2023 Guilherme Nascimento (brcontainer@yahoo.com.br)
 * Released under the MIT license
 *
 * https://github.com/brcontainer/prevent-duplicate-tabs
 */

import { browser, storage } from './boot.js';

var tabId = null,
    timeout = null,
    configs = {
        turnoff: false,
        old: true,
        active: true,
        start: true,
        replace: true,
        update: true,
        create: true,
        attach: true,
        datachange: true,
        http: true,
        query: true,
        hash: false,
        incognito: false,
        windows: true,
        containers: true
    };

storage.addListener((key, value) => {
    if (typeof value === 'boolean' && key in configs) {
        configs[key] = value;
        toggleIcon();
    }
});

browser.tabs.onActivated.addListener((tab) => {
    tabId = tab.tabId;
    preToggleIcon();
});

function isDisabled() {
    return configs.turnoff || (
        !configs.start &&
        !configs.replace &&
        !configs.update &&
        !configs.create &&
        !configs.attach &&
        !configs.datachange
    );
}

function preToggleIcon() {
    if (timeout !== null) clearTimeout(timeout);

    timeout = setTimeout(toggleIcon, 50);
}

function toggleIcon() {
    var path = isDisabled() ? '/images/disabled' : '/images';

    browser.action.setIcon({
        'tabId': tabId,
        'path': {
            '16': `${path}/16x.png`,
            '32': `${path}/32x.png`,
            '48': `${path}/48x.png`,
            '128': `${path}/128x.png`,
        }
    });
}