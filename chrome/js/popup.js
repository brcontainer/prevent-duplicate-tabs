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

var locales = d.querySelectorAll('[data-i18n]');

for (var i = locales.length - 1; i >= 0; i--) {
    var el = locales[i], message = browser.i18n.getMessage(el.dataset.i18n);

    if (message) el.innerHTML = markdown(message);
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

function markdown(message) {
    return message
        .replace(/(^|\s|[>])_(.*?)_($|\s|[<])/g, '$1<i>$2<\/i>$3')
        .replace(/(^|\s|[>])`(.*?)`($|\s|[<])/g, '$1<code>$2<\/code>$3')
        .replace(/\{([a-z])(\w+)?\}/gi, '<var name="$1$2"><\/var>')
        .replace(/(^|\s|[>])\*(.*?)\*($|\s|[<])/g, '$1<strong>$2<\/strong>$3');
}