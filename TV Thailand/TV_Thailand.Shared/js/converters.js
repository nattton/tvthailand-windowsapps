(function () {
    "use strict";

    WinJS.Namespace.define("Converters", {
        cssBackgroundUrl: WinJS.Binding.converter(function (backgroundUrl) {
            if (backgroundUrl.length && backgroundUrl.length > 0) {
                return "url('" + backgroundUrl + "')";
            }
        }),

        getSrcType: WinJS.Binding.converter(function (srcType) {
            switch (srcType) {
                case "0":
                    return "YouTube";
                    break;
                case "1":
                    return "DailyMotion";
                    break;
                case "11":
                    return "URL Open with Browser";
                    break;
                case "12":
                    return "URL (mp4) Open With Player";
                    break;
                case "14":
                    return "Mthai";
                    break;
                case "15":
                    return "Mthai with password";
                    break;
                default:
                    return srcType;
                    break;
            }
        }),

        toggleLive: WinJS.Binding.converter(function (data) {
            // Radio
            if (data.category) {
                return "live hidden";
            } else {
            // Channel
                if (data.url.trim().length === 0) {
                    return "live hidden";
                } else {
                    return "live";
                }
            }
        }),

        concatTitle: WinJS.Binding.converter(function (data) {
            var title = "";
            if (data.groupTitle && data.groupTitle !== data.title) {
                title += data.groupTitle + " ";
            }
            title += data.title;
            return title;
        }),
    });
})();