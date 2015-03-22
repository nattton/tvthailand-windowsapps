(function () {
    "use strict";

    var episodeList, progress, hasGroup, getEpisodePromise;
    var _indexOfFirstVisible = 0;
    var _videoListCached = null;
    var isSetupData = false;
    var _videoInfo;
    var loading = false;
    var _dataTime;
    var _dataLength = 0;

    WinJS.UI.Pages.define("/pages/episode/episode.html", {
        _dataList: null,
        _options: null,

        ready: function (element, options) {
            Appbar.setup("episode");
            /// <var type="WinJS.UI.ListView" />
            episodeList = element.querySelector("#episodeList").winControl;
            episodeList.layout.orientation = WinJS.UI.Orientation.vertical;
            progress = element.querySelector(".page-progress");

            if (options) {
                this._options = options;
                element.querySelector(".pagetitle").textContent = options.title;

                //#region Favorite
                var appbarFavorite = document.querySelector("#appbarFavorite").winControl;
                Favorite.isFavorite(options).then(function (isFavorite) {
                    if (isFavorite) {
                        appbarFavorite.label = "Unfavorite";
                        appbarFavorite.icon = "unfavorite";
                    } else {
                        appbarFavorite.label = "Favorite";
                        appbarFavorite.icon = "favorite";
                    }
                });

                appbarFavorite.onclick = function () {
                    Favorite.isFavorite(options).then(function (isFavorite) {
                        if (isFavorite) {
                            Favorite.remove(options);

                            appbarFavorite.label = "Favorite";
                            appbarFavorite.icon = "favorite";
                        } else {
                            Favorite.add(options);

                            appbarFavorite.label = "Unfavorite";
                            appbarFavorite.icon = "unfavorite";
                        }
                    });
                }
                //#endregion Favorite

                //#region Info
                var appbarInfo = document.querySelector("#appbarInfo").winControl;
                var videoInfo = element.querySelector(".video-info");
                var videoInfoSection = element.querySelector("#videoInfoSection");
                var closeButton = element.querySelector(".close-button");
                appbarInfo.onclick = function () {
                    Utility.toggleClass(videoInfo, "hide");
                    Appbar.hide();
                }
                closeButton.onclick = function () {
                    WinJS.Utilities.addClass(videoInfo, "hide");
                }
                videoInfo.onclick = function () {
                    // Close info panel if outer space clicked.
                    WinJS.Utilities.addClass(videoInfo, "hide");
                }
                videoInfoSection.onclick = function (e) {
                    // Prevent closing info panel when clicking inside panel.
                    e.stopPropagation();
                }
                //#endregion Info

                //#region Refresh
                var appbarRefresh = document.querySelector("#appbarRefresh").winControl;
                appbarRefresh.onclick = function () {
                    _dataTime = Date.now();
                    this._dataList = new WinJS.Binding.List();
                    _dataLength = 0;
                    setupData(this._dataList, episodeList, hasGroup);
                    episodeList.onloadingstatechanged = this.onLoadingstatechanged.bind(this);
                    this.loadData(options.id);
                    Appbar.hide();
                }.bind(this);
                //#endregion

                // If go back from video page.
                if (_videoListCached) {
                    this._dataList = _videoListCached;
                    setupData(this._dataList, episodeList, hasGroup);
                    episodeList.indexOfFirstVisible = _indexOfFirstVisible;
                    _videoListCached = null;

                    // Binding Info
                    WinJS.Binding.processAll(videoInfoSection, _videoInfo);

                    isSetupData = true;
                } else {
                    this._dataList = new WinJS.Binding.List();
                    _dataLength = 0;
                    _dataTime = Date.now();
                    isSetupData = false;
                }

                // Load data
                loading = false;
                episodeList.onloadingstatechanged = this.onLoadingstatechanged.bind(this);
            }
        },

        onLoadingstatechanged: function (args) {
            var thisList = args.currentTarget.winControl;
            if (thisList.loadingState === "complete" &&
                thisList.indexOfLastVisible === this._dataList.length - 1 &&
                !loading) {
                this.loadData(this._options.id);
            }
        },

        loadData: function (id) {
            Utility.showElement(progress);
            loading = true;
            getEpisodePromise = API.getData.programEpisode(id, _dataLength, _dataTime).then(function (data) {
                var dataArray = data.data;
                _dataLength += data.episodeLength;

                // No more data, stop getting more data.
                if (data.episodeLength === 0) {
                    episodeList.onloadingstatechanged = null;
                }

                // Setup list if not done yet.
                if (!isSetupData) {
                    _videoInfo = data.info;
                    hasGroup = data.hasGroup;
                    setupData(this._dataList, episodeList, hasGroup);

                    // Binding Info
                    WinJS.Binding.processAll(videoInfoSection, _videoInfo);

                    isSetupData = true;
                }

                // insert data
                for (var i = 0; i < dataArray.length; i++) {
                    this._dataList.push(dataArray[i]);
                }

                getEpisodePromise = null;
                loading = false;
                Utility.hideElement(progress);
            }.bind(this), function (error) {
                if (error.name !== "Canceled") {
                    this.loadData(id);
                }
            }.bind(this));
        },

        episodeInvoked: WinJS.Utilities.markSupportedForProcessing(function (args) {
            var thisList = args.currentTarget.winControl;
            _videoListCached = args.currentTarget.winControl.itemDataSource.list;
            args.detail.itemPromise.done(function (item) {
                _indexOfFirstVisible = thisList.indexOfFirstVisible;
                var data = item.data;
                WinJS.Navigation.navigate("/pages/video/video.html", {
                    data: data,
                    hasGroup: hasGroup,
                    videoList: _videoListCached
                });
            }.bind(this));
        }),

        unload: function () {
            // Cancel old request, if any.
            if (getEpisodePromise && getEpisodePromise.cancel) {
                getEpisodePromise.cancel();
                getEpisodePromise = null;
            }
        },

        updateLayout: function (element) {
            /// <param name="element" domElement="true" />
            episodeList.forceLayout();
        }
    });

    function setupData(bindingList, listView, isHasGroup) {
        /// <param name="bindingList" type="WinJS.Binding.List"></param>
        /// <param name="listView" type="WinJS.UI.ListView"></param>
        /// <param name="isHasGroup" type="String"></param>

        if (isHasGroup) {
            bindingList = bindingList.createGrouped(function (item) {
                return item.ep;
            }, function (item) {
                return {
                    ep: item.ep,
                    title: item.groupTitle,
                    date: " ออกอากาศวันที่ " + Utility.formatDate(item.date)
                }
            }, function compareGroups(leftKey, rightKey) {
                return rightKey - leftKey;
            });
            listView.groupDataSource = bindingList.groups.dataSource;
        }
        listView.itemDataSource = bindingList.dataSource;
    }
})();
