(function () {
    "use strict";

    var _noAppBar = "noAppBar";

    WinJS.Namespace.define("Appbar", {
        show: function () {
            document.querySelector("#appbar").winControl.show();
        },

        hide: function () {
            document.querySelector("#appbar").winControl.hide();
        },

        setup: function (page) {
            /// <var type="WinJS.UI.AppBar" />
            var appbar = document.querySelector("#appbar").winControl;
            var appbarFavorite = document.querySelector("#appbarFavorite").winControl;
            var appbarInfo = document.querySelector("#appbarInfo").winControl;
            var appbarRefresh = document.querySelector("#appbarRefresh").winControl;
            var body = document.body;

            switch (page) {
                case "episode":
                    appbar.showOnlyCommands([appbarFavorite, appbarInfo, appbarRefresh]);
                    appbar.disabled = false;
                    WinJS.Utilities.removeClass(body, _noAppBar);
                    break;
                case "home":
                case "channelProgram":
                    appbar.showOnlyCommands([appbarRefresh]);
                    appbar.disabled = false;
                    WinJS.Utilities.removeClass(body, _noAppBar);
                    break;
                default:
                    appbar.showOnlyCommands([]);
                    appbar.disabled = true;
                    WinJS.Utilities.addClass(body, _noAppBar);
                    break;
            }
        }
    });
})();