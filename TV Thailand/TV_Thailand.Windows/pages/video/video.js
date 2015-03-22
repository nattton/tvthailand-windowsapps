(function () {
    "use strict";

    var _iFrame, _playerFramework, _getLink;

    WinJS.UI.Pages.define("/pages/video/video.html", {
        ready: function (element, options) {
            Appbar.setup("video");
            if (options) {
                var data = options.data;
                _iFrame = element.querySelector("#videoPlayer");
                _playerFramework = element.querySelector("#playerFramework");

                // Set title
                if (options.hasGroup && data.groupTitle !== data.title) {
                    element.querySelector(".pagetitle").textContent = data.groupTitle + " " + data.title;
                } else {
                    element.querySelector(".pagetitle").textContent = data.title;
                }

                processVideoLink(data);

                //#region Video List
                if (options.videoList) {
                    /// <var type="WinJS.UI.ListView" />
                    var videoList = element.querySelector("#videoList").winControl;
                    videoList.itemDataSource = options.videoList.dataSource;
                    // Find index of selected video
                    var selectedIndex;
                    var list = videoList.itemDataSource.list;
                    for (var i = 0; i < list.length; i++) {
                        if (list.getAt(i).videoKey === data.videoKey) {
                            selectedIndex = i;
                            break;
                        }
                    }
                    videoList.selection.set(selectedIndex);
                    videoList.ensureVisible(selectedIndex);
                } else {
                    Utility.hideElement(element.querySelector("#videoListSession"));
                }
                //#endregion
            }
        },

        listSelectionChanged: WinJS.Utilities.markSupportedForProcessing(function (args) {
            _playerFramework.winControl.pause();
            _playerFramework.winControl.src = "";
            /// <var type="WinJS.UI.ListView" />
            var thisList = args.currentTarget.winControl;
            thisList.selection.getItems().done(function (items) {
                if (items.length > 0) {
                    var data = items[0].data;
                    // Cancel old promise
                    if (_getLink && _getLink.cancel) {
                        _getLink.cancel();
                    }
                    processVideoLink(data);

                    if (data.groupTitle !== data.title) {
                        document.querySelector(".pagetitle").textContent = data.groupTitle + " " + data.title;
                    } else {
                        document.querySelector(".pagetitle").textContent = data.title;
                    }
                }
            });
        }),

        unload: function () {
            _playerFramework.winControl.dispose();
            _playerFramework = null;
            _iFrame = null;
        }
    });

    function processVideoLink(data) {
        _getLink = null;
        switch (data.srcType) {
            case "0":
                _iFrame.src = API.getVideoLink.youtube(data.videoKey);
                Utility.hideElement(_playerFramework);
                break;
            case "1":
                _getLink = API.getVideoLink.dailymotion(data.videoKey);
                break;
            case "11":
                var url = new Windows.Foundation.Uri(data.videoKey);
                Windows.System.Launcher.launchUriAsync(url);
                break;
            case "12":
                _playerFramework.winControl.src = data.videoKey;
                Utility.hideElement(_iFrame);
                break;
            case "14":
                _getLink = API.getVideoLink.mThai(data.videoKey);
                break;
            case "15":
                _getLink = API.getVideoLink.mThai(data.videoKey, data.pwd);
                break;
            default:
                // This is from channel
                _playerFramework.winControl.src = data.url;
                Utility.hideElement(_iFrame);
                WinJS.Utilities.addClass(document.querySelector("section[role=main]"), "live");
                break;
        }
        if (_getLink) {
            _getLink.then(function (link) {
                _getLink = null;
                if (_playerFramework) {
                    _playerFramework.winControl.src = link;
                }
                if (_iFrame) {
                    Utility.hideElement(_iFrame);
                }
            });
        }
    }
})();