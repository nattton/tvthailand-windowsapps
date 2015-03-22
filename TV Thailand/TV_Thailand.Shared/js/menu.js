(function () {
    "use strict";
    var menuImagePath = "/images/menu/";
    var menuKey = {
        //Facebook: "menuFbLogin",
        Favorite: "menuFavorite",
        Channels: "menuChannel",
        Radio: "menuRadio",
        Settings: "menuSettings"
    };
    var menuIndex = {
        Favorite: 0,
        Channels: 1,
        Radio: 2,
        Settings: 3
    };
    //var menuIndex = {
    //    Facebook: 0,
    //    Favorite: 1,
    //    Channels: 2,
    //    Radio: 3,
    //    Settings: 4
    //};

    var menu = new WinJS.Binding.List([
        //new Menu.Item(menuKey.Facebook, "Login", menuImagePath + "fbLogin.png"),
        new Menu.Item(menuKey.Favorite, "Favorite", menuImagePath + "favorite.png"),
        new Menu.Item(menuKey.Channels, "Channels", menuImagePath + "channel.png"),
        new Menu.Item(menuKey.Radio, "Radio", menuImagePath + "radio.png"),
        new Menu.Item(menuKey.Settings, "Settings", menuImagePath + "setting.png")
    ]);

    WinJS.Namespace.define("API", {
        Menu: {
            get: function () {
                return menu;
            }
        },

        MenuEnum: menuKey,
        MenuIndex: menuIndex
    });
})();