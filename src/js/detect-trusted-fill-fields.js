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

    console.log('FILL FORM CHECKER');

    function detectUserFill(evt) {
        if (userFill || !evt.isTrusted) return;

        var el = evt.target.tagName;

        if (el !== 'INPUT' || el !== 'SELECT' || el !== 'TEXTAREA') return;

        userFill = true;

        main.runtime.sendMessage(null, 'form:filled', {});
    }

    w.addEventListener('input', detectUserFill, { capture: true });
    w.addEventListener('change', detectUserFill, { capture: true });
})(window);
