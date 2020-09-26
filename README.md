## About

Prevents from automatically creating new tabs or repeating tabs when two or more tabs have the same addresses

The process of closing repeated tabs is automatic based on settings that you can determine within the extension/add-on, it is also possible to quickly disable and activate the add-on without having to access the extensions panel.

You can add a host or URL to specify as an exception so that the extension/add-on does not close repeated tabs.

The extension/add-on has support for closing repeated tabs in incognito/anonymous mode, but this works in isolation and will not share any information in anonymous mode with normal mode, being completely separate actions.

Among the configurations you can choose to consider or disregard querystring and hashes in URLs as a factor to differentiate them.

![promocional](promo.png)

## Supported browsers

- Chrome 30+
- Firefox 48+
- Edge (Chromium)
- Opera 40+

## Install

- [Chrome](https://chrome.google.com/webstore/detail/prevent-duplicate-tabs/eednccpckdkpojaiemedoejdngappaag)
- [Firefox](https://add-ons.mozilla.org/en-US/firefox/add-on/smart-prevent-duplicate-tabs/)
- [Edge](https://microsoftedge.microsoft.com/add-ons/detail/iijplllphnkkeepcinimpjobncicbbmb)
- [Opera](https://add-ons.opera.com/en/extensions/details/prevent-duplicate-tabs/)

## Configs

### Sort order

It is also possible to configure whether you prefer to close the oldest tabs and whether you want to prevent the active tab (currently visible) from being closed:

Configuration | Description
--- | ---
`close olders` | Close the old tabs and keep the most recent one with the same URL
`keep the tab that is active` | Don't close active tabs

### Events

The closing of the tabs works based on events from the Chrome API and you can disable or reactivate such events within the extension/add-on:

Event | Description
--- | ---
`start` | Close repeated tabs when your browser is launched
`update` | Close repeated tabs when a tab is updated, more details in [`tabs.onUpdated.addListener`](https://developer.chrome.com/extensions/tabs#event-onUpdated)
`create` | Close repeated tabs when a new tab is created, more details in [`tabs.onCreated.addListener`](https://developer.chrome.com/extensions/tabs#event-onCreated)
`replace` | Close repeated tabs when a tab is replaced with another tab due to prerendering or instant, more details in [`tabs.onReplaced.addListener`](https://developer.chrome.com/extensions/tabs#event-onReplaced)
`datachange` | Close repeated tabs when you change `Sort order`, `Events`, `URLs` and `Others` configurations from extension

### URLs

Configuration | Description
--- | ---
`only http` | Close only tabs with HTTP(s) urls
`querystring` | If disabled (off) it's ignore querystring in URLs, then this `http://foo/bar?baz` will be equivalent to this `http://foo/bar`
`hash` | If disabled (off) it's ignore hash in URLs, then this `http://foo/bar#baz` will be equivalent to this `http://foo/bar`

### Others

Configuration | Description
--- | ---
`incognito` | Check repeated anonymous tabs (requires you to manually enable in your browser)
