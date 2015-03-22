(function () {
    "use strict";

    var _listId = ["menuList", "categoryList"];
    var _menuHideClass = "hide";
    var _menuScrollPosition = 0;
    var headerTitle, progress, getCategoryPromise, _channelClicked;
    /// <var type="WinJS.UI.ListView" />
    var programItemList;
    var util = WinJS.Utilities;
    var getData = false;
    var selected = {
        list: _listId[1],
        index: 0
    };
    var promise, _data, loading, _dataTime, appbarRefresh;
    var _listDataCached, _indexOfFirstVisible;

    WinJS.UI.Pages.define("/pages/home/home.html", {
        ready: function (element, options) {
            Appbar.setup("home");
            _dataTime = Date.now();

            appbarRefresh = document.querySelector("#appbarRefresh").winControl;
            headerTitle = element.querySelector("#headerTitle");
            programItemList = element.querySelector("#programItemList").winControl;
            progress = element.querySelector(".page-progress");
            var listSection = element.querySelector(".list-section");
            var menuButton = element.querySelector("#menuButton");
            menuButton.onclick = function () {
                Utility.toggleClass(listSection, _menuHideClass);
            }

            programItemList.oniteminvoked = programInvoked;

            /// <var type="WinJS.UI.ListView" />
            var categoryList = element.querySelector("#categoryList").winControl;

            // Get category & channel & radio data.
            if (!getData) {
                Utility.showElement(progress);
                getCategoryPromise = API.getData.category().then(function (categoryData) {
                    getCategoryPromise = null;
                    getData = true;

                    // Set latest selected
                    if (selected.list === _listId[0]) {
                        element.querySelector("#menuList").winControl.selection.set(selected.index);
                    } else {
                        categoryList.selection.set(selected.index);
                    }

                    Utility.hideElement(progress);
                });

                //#region Refresh handler (used only no internet at launch)
                appbarRefresh.onclick = function () {
                    if (API.List.Category.length === 0) {
                        Utility.showElement(progress);
                        getCategoryPromise = API.getData.category().then(function (categoryData) {
                            getCategoryPromise = null;
                            getData = true;

                            // Set latest selected
                            if (selected.list === _listId[0]) {
                                element.querySelector("#menuList").winControl.selection.set(selected.index);
                            } else {
                                categoryList.selection.set(selected.index);
                            }

                            Utility.hideElement(progress);
                        });
                    }
                }.bind(this);
                //#endregion
            } else {
                // Set latest selected when go back from previos page.
                if (selected.list === _listId[0]) {
                    element.querySelector("#menuList").winControl.selection.set(selected.index);
                } else {
                    categoryList.selection.set(selected.index);
                }

                // Set scroll position after menu list loaded
                if (_menuScrollPosition !== 0) {
                    categoryList.onloadingstatechanged = function (args) {
                        if (categoryList.loadingState === "complete") {
                            document.querySelector("#list").scrollTop = _menuScrollPosition;

                            // Set this 1 time only, so null it.
                            categoryList.onloadingstatechanged = null;
                        }
                    };
                }
            }

            //#region Channel Menu
            var channelRerun = element.querySelector("#channelRerun");
            var channelLive = element.querySelector("#channelLive");
            channelRerun.onclick = channelRerunClicked;
            channelLive.onclick = channelLiveClicked;
            //#endregion Channel Menu
        },

        listSelectionChanging: util.markSupportedForProcessing(function (args) {
            args.detail.newSelection.getItems().done(function (items) {
                if (items.length > 0) {
                    /// <var type="Menu.Item" />
                    var data = items[0].data;

                    // If settings selected, don't need to change selection
                    if (data.id === API.MenuEnum.Settings) {
                        args.preventDefault();
                        // Show setting charm
                        WinJS.UI.SettingsFlyout.show();
                    }
                }
            }.bind(this));
        }),

        listSelectionChanged: util.markSupportedForProcessing(function (args) {
            var thisId = args.currentTarget.id;
            /// <var type="WinJS.UI.ListView" />
            var thisList = args.currentTarget.winControl;
            thisList.selection.getItems().done(function (items) {
                if (items.length > 0) {
                    //#region Left menu selection
                    // Clear selection of another list, if any
                    for (var index = 0; index < _listId.length; index++) {
                        if (thisId !== _listId[index]) {
                            /// <var type="WinJS.UI.ListView" />
                            var anotherList = document.querySelector("#" + _listId[index]).winControl;
                            anotherList.selection.clear();
                            break;
                        }
                    }
                    //#endregion

                    _data = items[0].data;
                    headerTitle.textContent = _data.title;

                    // No list have group except Radio, so null it by default.
                    programItemList.groupDataSource = null;

                    // Prevent UI bug
                    programItemList.layout = new WinJS.UI.GridLayout({
                        orientation: WinJS.UI.Orientation.vertical
                    });

                    // Remove old load data
                    programItemList.onloadingstatechanged = null;

                    // Cancel old request, if any.
                    if (promise && promise.cancel) {
                        promise.cancel();
                        Utility.hideElement(progress);
                    }

                    // Menu clicked
                    if (thisId === _listId[0]) {
                        // Prevent UI bug
                        programItemList.layout = new WinJS.UI.GridLayout({
                            orientation: WinJS.UI.Orientation.vertical
                        });

                        // Set data & template according to menu clicked
                        switch (_data.id) {
                            case API.MenuEnum.Favorite:
                                programItemList.itemDataSource = Favorite.list.dataSource;
                                programItemList.itemTemplate = document.querySelector("#programItemTemplate");
                                break;
                            case API.MenuEnum.Channels:
                                programItemList.itemDataSource = API.List.Channel.dataSource;
                                programItemList.itemTemplate = document.querySelector("#programSquareTemplate");

                                appbarRefresh.onclick = function () {
                                    Utility.showElement(progress);
                                    programItemList.itemDataSource = null;
                                    API.List.Channel.splice(0, API.List.Channel.length);
                                    _dataTime = Date.now();
                                    getCategoryPromise = API.getData.category(API.MenuEnum.Channels, _dataTime).then(function (categoryData) {
                                        getCategoryPromise = null;
                                        programItemList.itemDataSource = API.List.Channel.dataSource;
                                        Utility.hideElement(progress);
                                    });
                                };
                                break;
                            case API.MenuEnum.Radio:
                                programItemList.itemDataSource = API.List.Radio.dataSource;
                                programItemList.groupDataSource = API.List.Radio.groups.dataSource;
                                programItemList.itemTemplate = document.querySelector("#programSquareTemplate");

                                appbarRefresh.onclick = function () {
                                    Utility.showElement(progress);
                                    programItemList.itemDataSource = null;
                                    programItemList.groupDataSource = null;
                                    API.List.Radio.splice(0, API.List.Radio.length);
                                    _dataTime = Date.now();
                                    getCategoryPromise = API.getData.category(API.MenuEnum.Radio, _dataTime).then(function (categoryData) {
                                        getCategoryPromise = null;
                                        programItemList.itemDataSource = API.List.Radio.dataSource;
                                        programItemList.groupDataSource = API.List.Radio.groups.dataSource;
                                        Utility.hideElement(progress);
                                    });
                                };
                                break;
                            default:
                                programItemList.itemDataSource = null;
                                appbarRefresh.onclick = null;
                        }
                        // Category clicked
                    } else {
                        programItemList.itemTemplate = document.querySelector("#programItemTemplate");

                        // Prevent "Container missing after updateContainers" error
                        programItemList.itemDataSource = null;

                        // If go back from other page.
                        if (_listDataCached) {
                            API.List.Program = _listDataCached;
                            programItemList.itemDataSource = API.List.Program.dataSource;
                            programItemList.indexOfFirstVisible = _indexOfFirstVisible;
                            _listDataCached = null;
                        } else {
                            // Remove old items
                            API.List.Program.splice(0, API.List.Program.length);
                        }


                        // Load data
                        loading = false;
                        programItemList.onloadingstatechanged = onLoadingstatechanged;

                        //#region Refresh handler
                        appbarRefresh.onclick = function () {
                            _dataTime = Date.now();

                            // Remove old items
                            API.List.Program.splice(0, API.List.Program.length);

                            // Load data
                            loading = false;
                            programItemList.onloadingstatechanged = onLoadingstatechanged;
                        }.bind(this);
                        //#endregion
                    }
                    selected.list = thisId;
                    selected.index = items[0].index;
                }
            }.bind(this));
        }),

        updateLayout: function (element) {
            /// <param name="element" domElement="true" />

            // Prevent UI bug
            programItemList.forceLayout();
        },

        unload: function () {
            // Cancel old request, if any.
            if (promise && promise.cancel) {
                promise.cancel();
                promise = null;
            }
            if (getCategoryPromise && getCategoryPromise.cancel) {
                getCategoryPromise.cancel();
                getCategoryPromise = null;
            }
        }
    });

    function onLoadingstatechanged(args) {
        var thisList = args.currentTarget.winControl;
        if (thisList.loadingState === "complete" &&
            thisList.indexOfLastVisible === API.List.Program.length - 1 &&
            !loading) {
            loading = true;
            Utility.showElement(progress);
            promise = API.getData.programByCategory(_data.id, API.List.Program.length, _dataTime).then(function () {
                promise = null;
                loading = false;
                if (programItemList.itemDataSource != API.List.Program.dataSource) {
                    programItemList.itemDataSource = API.List.Program.dataSource;
                }
                Utility.hideElement(progress);
            }, function (error) {
                promise = null;
                loading = false;
                Utility.hideElement(progress);
            });
        }
    }

    function programInvoked(args) {
        _menuScrollPosition = document.querySelector("#list").scrollTop;
        var goToPage = null;
        if (selected.list === _listId[0]) {
            // Channel
            if (selected.index === API.MenuIndex.Channels) {
                args.detail.itemPromise.done(function (item) {
                    _channelClicked = item.data;

                    if (_channelClicked.has_show === "1" && _channelClicked.url.trim().length !== 0) {
                        var channelFlyout = document.querySelector("#channelFlyout").winControl;
                        channelFlyout.show(args.srcElement);
                    } else if (_channelClicked.url.trim().length === 0) {
                        channelRerunClicked();
                    } else {
                        channelLiveClicked();
                    }
                });
                // Radio
            } else if (selected.index === API.MenuIndex.Radio) {
                WinJS.Navigation.navigate("/pages/radio/radio.html", args.detail.itemIndex);
                // Favorite
            } else {
                goToPage = "/pages/episode/episode.html";
            }
            // Category
        } else {
            _indexOfFirstVisible = args.currentTarget.winControl.indexOfFirstVisible;
            _listDataCached = args.currentTarget.winControl.itemDataSource.list;
            goToPage = "/pages/episode/episode.html";
        }

        if (goToPage) {
            args.detail.itemPromise.done(function (item) {
                WinJS.Navigation.navigate(goToPage, item.data);
            });
        }
    }

    function channelRerunClicked(args) {
        WinJS.Navigation.navigate("/pages/channelProgram/channelProgram.html", _channelClicked);
    }

    function channelLiveClicked(args) {
        WinJS.Navigation.navigate("/pages/video/video.html", {
            data: _channelClicked
        });
    }
})();
