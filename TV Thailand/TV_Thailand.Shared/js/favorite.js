/// <reference path="series9reader.js" />
(function () {
    "use strict";

    var localSettings = Windows.Storage.ApplicationData.current.roamingSettings;
    var localFolder = Windows.Storage.ApplicationData.current.roamingFolder;
    var fileIO = Windows.Storage.FileIO;
    var CONFIG = { FAVORITE_FILE_NAME: "favorite" }
    var _favoriteList = new WinJS.Binding.List();

    function deleteFileAsync(fileName) {
        /// <param name="fileName" type="String" />
        /// <param name="storageFolder" type="Windows.Storage.StorageFolder" />
        return localFolder.getFileAsync(fileName).then(function (file) {
            // If file exists, delete file.
            return WinJS.Promise.wrap(file.deleteAsync());
        });
    }
    function saveFileAsync(filename, content) {
        return localFolder.createFileAsync(filename, Windows.Storage.CreationCollisionOption.replaceExisting)
                .then(function createFileAsyncCompleted(file) {
                    return fileIO.writeTextAsync(file, content);
                }, function (error) {
                    console.error(error);
                });
    }
    function loadFileAsync(filename) {
        return new WinJS.Promise(function (c, e, p) {
            localFolder.getFileAsync(filename).then(
                function getFileAsyncCompleted(file) {
                    fileIO.readTextAsync(file).then(c, e, p);
                }, e, p);
        });
    }
    function loadFavorite() {
        return loadFileAsync(CONFIG.FAVORITE_FILE_NAME).then(function (result) {
            return WinJS.Promise.wrap(JSON.parse(result));
        }, function (error) {
            return WinJS.Promise.wrap([]);
        });
    }

    WinJS.Namespace.define("Favorite", {
        add: function (item) {
            return loadFavorite().then(function (favorites) {
                favorites.splice(0, 0, item); // Insert item into index 0
                return saveFileAsync(CONFIG.FAVORITE_FILE_NAME, JSON.stringify(favorites));
            }).then(function () {
                Favorite.list.unshift(item);
            });
        },
        remove: function (item) {
            return loadFavorite().then(function (favorites) {
                for (var i = 0; i < favorites.length; i++) {
                    if (favorites[i].id === item.id) {
                        favorites.splice(i, 1);

                        // Loop the list to find data to remove
                        for (var j = 0; j < Favorite.list.length; j++) {
                            var itemFromList = Favorite.list.getItem(j);
                            if (itemFromList.data.id === item.id) {
                                Favorite.list.dataSource.remove(itemFromList.key); // Remove item from list
                                break;
                            }
                        }

                        return saveFileAsync(CONFIG.FAVORITE_FILE_NAME, JSON.stringify(favorites));
                    }
                }
            });
        },
        isFavorite: function (item) {
            return loadFavorite().then(function (favorites) {
                for (var i = 0; i < favorites.length; i++) {
                    if (favorites[i].id === item.id) {
                        return WinJS.Promise.wrap(true);
                    }
                }
                return WinJS.Promise.wrap(false);
            });
        },
        get: loadFavorite,
        clearFavorite: function () {
            Favorite.list.splice(0, Favorite.list.length);
            return deleteFileAsync(CONFIG.FAVORITE_FILE_NAME);
        }
    });

    WinJS.Namespace.define("Favorite", {
        list: _favoriteList
    });

    // Get favorite first time.
    Favorite.get().then(function(itemArr){
        for (var i = 0; i < itemArr.length; i++) {
            Favorite.list.push(itemArr[i]);
        }
    });
})();