(function () {
    "use strict";

    var _domain = "http://tv.makathon.com";
    var _device = "windows";
    var version = Windows.ApplicationModel.Package.current.id.version;
    var _version = version.major + "." + version.minor + "." + version.build + "." + version.revision;
    var paramUrl = "?device=" + _device + "&app_version=" + _version;
    var _nowInMinutes = Math.round(new Date() / 60000);

    WinJS.Namespace.define("API.WebService", {
        getData: function (time) {
            var url = _domain + "/api2/section" + paramUrl;

            if (time) {
                url += "time=" + time;
            } else {
                url += "time=" + _nowInMinutes;
            }

            return WinJS.xhr({
                url: url
            }).then(function (result) {
                try {
                    var json = JSON.parse(result.responseText);
                    return WinJS.Promise.wrap(json);
                } catch (ex) {
                    return WinJS.Promise.wrapError(ex);
                }
            });
        },

        getProgramByCategory: function (categoryId, start, time) {
            var url;
            if (typeof start != "undefined" && null != start) {
                url = _domain + "/api2/category/" + categoryId + "/" + start + paramUrl;
            } else {
                url = _domain + "/api2/category/" + categoryId + paramUrl;
            }

            if (time) {
                url += "time=" + time;
            } else {
                url += "time=" + _nowInMinutes;
            }

            return WinJS.xhr({
                url: url
            }).then(function (result) {
                try {
                    var json = JSON.parse(result.responseText);
                    return WinJS.Promise.wrap(json);
                } catch (ex) {
                    return WinJS.Promise.wrapError(ex);
                }
            });
        },

        getProgramByChannel: function (channelId, start, time) {
            var url;
            if (typeof start != "undefined" && null != start) {
                url = _domain + "/api2/channel/" + channelId + "/" + start + paramUrl;
            } else {
                url = _domain + "/api2/channel/" + channelId + paramUrl;
            }

            if (time) {
                url += "time=" + time;
            } else {
                url += "time=" + _nowInMinutes;
            }

            return WinJS.xhr({
                url: url
            }).then(function (result) {
                try {
                    var json = JSON.parse(result.responseText);
                    return WinJS.Promise.wrap(json);
                } catch (ex) {
                    return WinJS.Promise.wrapError(ex);
                }
            });
        },

        getProgram: function (programId, start, time) {
            var url;
            if (typeof start != "undefined" && null != start) {
                url = _domain + "/api2/episode/" + programId + "/" + start + paramUrl;
            } else {
                url = _domain + "/api2/episode/" + programId + paramUrl;
            }

            if (time) {
                url += "time=" + time;
            } else {
                url += "time=" + _nowInMinutes;
            }

            return WinJS.xhr({
                url: url
            }).then(function (result) {
                try {
                    var json = JSON.parse(result.responseText);
                    return WinJS.Promise.wrap(json);
                } catch (ex) {
                    return WinJS.Promise.wrapError(ex);
                }
            });
        },

        getImageUrl: function (key, srcType) {
            var imageUrl;
            switch (srcType) {
                case "0":
                    imageUrl = "http://i.ytimg.com/vi/%s/mqdefault.jpg".replace("%s", key);
                    break;
                case "1":
                    imageUrl = "http://www.dailymotion.com/thumbnail/video/%s".replace("%s", key);
                    break;
                case "11":
                case "12":
                    imageUrl = "http://www.makathon.com/placeholder.png";
                    break;
                case "14":
                case "15":
                    imageUrl = "http://video.mthai.com/thumbnail/%s.jpg".replace("%s", key);
                    break;
            }
            return imageUrl;
        },

        search: function (keyword) {
            var url = _domain + "/api2/search?keyword=" + keyword;
            return WinJS.xhr({
                url: url
            }).then(function (result) {
                try {
                    var json = JSON.parse(result.responseText);
                    return WinJS.Promise.wrap(json);
                } catch (ex) {
                    return WinJS.Promise.wrapError(ex);
                }
            });
        }
    });
})();