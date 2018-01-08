// ==UserScript==
// @name          Anti abas duplas
// @description   Closes the latest tab, does not "refresh" the tab old and does not close tabs with the protocol "opera:"
// @author        Brcontainer
// @include *
// ==/UserScript==

(function (w, o) {
    function update(e)
    {
        o.extension.postMessage("update");
    }

    w.addEventListener("DOMContentLoaded", update, false);
    w.addEventListener("message", update, false);
    o.extension.onmessage = update;
})(window, opera);
