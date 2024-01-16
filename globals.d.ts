var browser: undefined | typeof chrome

interface DocumentEventMap {
  "change:data": CustomEvent<{ data: string, value: string }>;
}

declare namespace chrome.tabs {
  interface Tab {
    /** The CookieStoreId used for the tab. See `@types/firefox-webext-browser`'s browser.tabs.Tab*/
    cookieStoreId?: string | undefined;
  }
}
