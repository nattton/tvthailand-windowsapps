(function () {
    "use strict";

    WinJS.Namespace.define("Menu", {
        Item: WinJS.Class.define(
            function (id, title, thumbnail) {
                this.id = id;
                this.title = title;
                this.thumbnail = thumbnail;
            }
        )
    });
})();