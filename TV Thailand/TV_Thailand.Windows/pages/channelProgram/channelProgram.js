(function () {
    "use strict";

    var getDataPromise, progress;
    var loading = false;
    var _dataTime;
    var _listDataCached, _indexOfFirstVisible;

    WinJS.UI.Pages.define("/pages/channelProgram/channelProgram.html", {
        _options: null,

        ready: function (element, options) {
            Appbar.setup("channelProgram");
            _dataTime = Date.now();
            this._options = options;
            var programList = element.querySelector("#programList").winControl;
            progress = element.querySelector(".page-progress");
            programList.layout.orientation = WinJS.UI.Orientation.vertical;
            if (options) {
                element.querySelector(".pagetitle").textContent = options.title;

                //#region Refresh
                var appbarRefresh = document.querySelector("#appbarRefresh").winControl;
                appbarRefresh.onclick = function () {
                    _dataTime = Date.now();
                    API.List.Program.splice(0, API.List.Program.length);
                    programList.onloadingstatechanged = this.onLoadingstatechanged.bind(this);
                }.bind(this);
                //#endregion

                // If go back from other page.
                if (_listDataCached) {
                    API.List.Program = _listDataCached;
                    programList.itemDataSource = API.List.Program.dataSource;
                    programList.indexOfFirstVisible = _indexOfFirstVisible;
                    _listDataCached = null;
                } else {
                    API.List.Program.splice(0, API.List.Program.length);
                }

                // Load data
                loading = false;
                programList.onloadingstatechanged = this.onLoadingstatechanged.bind(this);
            }
        },

        onLoadingstatechanged: function (args) {
            var thisList = args.currentTarget.winControl;
            if (thisList.loadingState === "complete" &&
                thisList.indexOfLastVisible === API.List.Program.length - 1 &&
                !loading) {
                loading = true;
                Utility.showElement(progress);
                getDataPromise = API.getData.programByChannel(this._options.id, API.List.Program.length, _dataTime).then(function () {
                    if (thisList.itemDataSource !== API.List.Program.dataSource) {
                        thisList.itemDataSource = API.List.Program.dataSource;
                    }
                    getDataPromise = null;
                    loading = false;
                    Utility.hideElement(progress);
                });
            }
        },

        programInvoked: WinJS.Utilities.markSupportedForProcessing(function (args) {
            _indexOfFirstVisible = args.currentTarget.winControl.indexOfFirstVisible;
            _listDataCached = args.currentTarget.winControl.itemDataSource.list;
            args.detail.itemPromise.done(function (item) {
                var data = item.data;
                WinJS.Navigation.navigate("/pages/episode/episode.html", data);
            });
        }),

        unload: function () {
            // Cancel old request, if any.
            if (getDataPromise && getDataPromise.cancel) {
                getDataPromise.cancel();
                getDataPromise = null;
            }
        }
    });
})();