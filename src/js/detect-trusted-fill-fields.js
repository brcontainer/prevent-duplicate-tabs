(function (w) {
    var main, userFill = false;

    if (typeof browser !== 'undefined') {
        main = browser;
    } else {
        main = chrome;
    }

    if (!main || !main.runtime) {
        throw new Error('Prevent duplicate tabs context is not available');
    }

    function detectUserFill(e) {
        if (userFill || !e.isTrusted) return;

        var el = e.target.tagName;

        if (el !== 'INPUT' || el !== 'SELECT' || el !== 'TEXTAREA') return;

        userFill = true;

        if (el.value !== el.defaultValue) {
            main.runtime.sendMessage(null, 'form:filled', {});
        }
    }

    w.addEventListener('input', detectUserFill, { capture: true });
    w.addEventListener('change', detectUserFill, { capture: true });
})(window);
