/*
@note: Work in Opera 12 - Windows 7 64bit, Opera 12 - Debian 6, Opera 12 - MacOSX Lion and Opera Mobile 12 Emulator (Experimental).
*/
(function () {
    "use strict";

    var running = false;

    //@note: http://stackoverflow.com/questions/13572935/convert-javascript-object-of-one-type-into-another/13572989#13572989

    function SortTabs(a, b)
    {
        return a - b;
    }

    function FindDuplicates(tabs)
    {
        var urls = Object.keys(tabs).sort(SortTabs);

        var i = 1, j = urls.length;

        if (j > 1) {
            for (; i < j; i++) {
                current = tabs[urls[i]];
                current && current.close();
            }
        }

        tabs = urls = null;//Clean Memory
    }

    function CloseDuplicates()
    {
        if (running) {
            return;
        }

        running = true;

        try {
            var tabs = opera.extension.tabs.getAll();
            var i = 0, j = tabs.length, byUrl = {}, url, id;

            for (; i < j; i++) {
                url = tabs[i].url;
                id = parseInt(tabs[i].id);

                if (!/^opera[:]/i.test(url)) {
                    if (typeof byUrl[url] === "undefined") {
                        byUrl[url] = {};
                    }

                    byUrl[url][id] = _current;
                }
            }

            for (var url in byUrl) {
                FindDuplicates(byUrl[url]);
            }

            byUrl = {};
        } catch(ee) {}

        running = false;
    }

    opera.extension.addEventListener("beforeunload", CloseDuplicates, false);
    opera.extension.addEventListener("message", CloseDuplicates, false);
    opera.extension.addEventListener("connect", CloseDuplicates, false);
    opera.extension.addEventListener("load", CloseDuplicates, false);
})();
