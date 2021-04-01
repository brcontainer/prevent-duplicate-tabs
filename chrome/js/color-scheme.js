function setColorScheme(darkPrefer, userPrefer) {
    var disable, links = document.querySelectorAll("link[href*='-dark.css']");

    switch (userPrefer || getStorage("data:color-scheme")) {
        case "dark":
            disable = false;
            break;
        case "light":
            disable = true;
            break;
        default:
            disable = !darkPrefer;
    }

    for (var i = links.length - 1; i >= 0; i--) {
        links[i].disabled = disable;
    }
}

(function () {
    var media = window.matchMedia("(prefers-color-scheme: dark)");

    media.addEventListener("change", function (e) {
        setColorScheme(e.matches);
    });

    if (!getStorage("data:color-scheme")) {
        setStorage("data:color-scheme", "default");
    }

    setColorScheme(media.matches);

    document.addEventListener("change:data", function (e) {
        if (e.detail.data === "color-scheme") {
            setTimeout(setColorScheme, 100, media.matches, e.detail.value);
        }
    });
})();
