## About

Simple add-on for prevent duplicate tabs, you can custom this using options in popup

![promocional](promo.png)

## Requirements

- Chrome 30+
- Firefox 48+
- Opera 40+

## Install

- [Opera](https://addons.opera.com/en/extensions/details/prevent-duplicate-tabs/)
- [Firefox](https://addons.mozilla.org/en-US/firefox/addon/smart-prevent-duplicate-tabs/)

## Configs

### Sort order

- **Close olders**

    Closes the old tabs (enabled or disabled if the tab is active it will keep)

- **Prefer tab activated**

    Keeping tab that is activated (visible)

### Events

- **start**

    Fired when you start the browser

- **Update**

    Fired when a tab is updated, more details in [`tabs.onUpdated.addListener`](https://developer.chrome.com/extensions/tabs#event-onUpdated)

- **create**

    Fired when a tab is created, more details in [`tabs.onCreated.addListener`](https://developer.chrome.com/extensions/tabs#event-onCreated)

- **remove**

    Fired when a tab is closed, more details in [`tabs.onRemoved.addListener`](https://developer.chrome.com/extensions/tabs#event-onRemoved)

- **replace**

    Fired when a tab is replaced with another tab due to prerendering or instant, more details in [`tabs.onReplaced.addListener`](https://developer.chrome.com/extensions/tabs#event-onReplaced)

### URLs

- **querystring**

    If disabled (off) it's ignore querystring in URLs, then this `http://foo/bar?baz` will be equivalent to this `http://foo/bar`

- **hash**

    If disabled (off) it's ignore hash in URLs, then this `http://foo/bar#baz` will be equivalent to this `http://foo/bar`

### Others

- **incognito**

    Check anonymous/private tabs (requires you to manually enable in your browser)
