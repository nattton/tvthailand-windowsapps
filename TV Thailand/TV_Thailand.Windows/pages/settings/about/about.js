(function () {
    "use strict";

    WinJS.UI.Pages.define("/pages/settings/about/about.html", {
        ready: function (element, options) {
            var version = Windows.ApplicationModel.Package.current.id.version;
            element.querySelector("#version").textContent = "Version: " + version.major + "." + version.minor + "." + version.build + "." + version.revision;
        }
    });
})();
