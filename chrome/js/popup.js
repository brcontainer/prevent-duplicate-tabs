import { browser, manifest, storage } from './boot.js';

var d = document, debugMode = false;

if (browser.runtime.id && !('requestUpdateCheck' in browser.runtime)) {
    if (/@temporary-addon$/.test(browser.runtime.id)) debugMode = true;
} else if (!('update_url' in manifest)) {
    debugMode = true;
}

function disableEvent(e) {
    e.preventDefault();
    return false;
}

if (!debugMode) {
    d.oncontextmenu = disableEvent;
    d.ondragstart = disableEvent;
}

d.addEventListener('click', function (e) {
    if (e.button !== 0) return;

    var el = e.target;

    if (el.nodeName !== 'A' && !el.closest('a[href]')) return;

    var protocol = el.protocol;

    if (protocol === 'http:' || protocol === 'https:') {
        e.preventDefault();
        browser.tabs.create({ 'url': el.href });
    }
});

browser.extension.isAllowedIncognitoAccess().then((allowed) => {
    d.getElementById('incognito_warn').classList.toggle('hide', allowed === true);
});

var s = d.scrollingElement || d.body;

setTimeout(function () {
    s.style.transform = 'scale(2)';

    setTimeout(function () {
        s.style.transform = 'scale(1)';

        setTimeout(function () {
            s.style.transform = null;
        }, 20);
    }, 20);
}, 10);