(function (w) {
    var userFill = false;

    console.log('FILL FORM CHECKER');

    function detectUserFill(e) {
        if (userFill || !e.isTrusted) return;

        userFill = true;

        chrome.runtime.sendMessage(null, 'form:filled', {});
    }

    w.addEventListener('input', detectUserFill, { capture: true });
    w.addEventListener('change', detectUserFill, { capture: true });
})(window);