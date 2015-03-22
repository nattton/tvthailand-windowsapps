(function () {
    "use strict";

    var popups = Windows.UI.Popups;

    var _errorCode = {
        noInternet: {
            get: function () {
                return 0;
            }
        },
        radioCantPlay: {
            get: function () {
                return 1;
            }
        },
        unknown: {
            get: function () {
                return 99;
            }
        }
    }

    var _errorMsg = {
        noInternet: "ไม่สามารถรับข้อมูลได้ กรุณาตรวจสอบการเชื่อมต่อและลองใหม่อีกครั้ง",
        radioCantPlay: "ไม่สามารถฟังวิทยุได้ในขณะนี้ กรุณาลองใหม่ภายหลัง",
        unknown: "พบข้อผิดพลาด กรุณาลองใหม่ภายหลัง"
    };

    function isInternetConnectionAvailable() {
        var networkInfo = Windows.Networking.Connectivity.NetworkInformation;
        var networkConnectivityInfo = Windows.Networking.Connectivity.NetworkConnectivityLevel;

        var connectionProfile = networkInfo.getInternetConnectionProfile();
        if (connectionProfile == null) {
            return false;
        }

        var networkConnectivityLevel = connectionProfile.getNetworkConnectivityLevel();
        if (networkConnectivityLevel == networkConnectivityInfo.none
            || networkConnectivityLevel == networkConnectivityInfo.localAccess
            || networkConnectivityLevel == networkConnectivityInfo.constrainedInternetAccess) {
            return false;
        }
        return true;
    }

    WinJS.Namespace.define("ErrorHandler", {
        errorCode: _errorCode,

        showMessageDialog: function (message) {
            try {
                var messageDialog = new popups.MessageDialog(message);
                messageDialog.showAsync();
            } catch (ex) { }
        },

        check: function (error) {
            var errorMsg = "";
            if (!isInternetConnectionAvailable()) {
                errorMsg = _errorMsg.noInternet;
            } else if (error.code) {
                switch (error.code) {
                    case _errorCode.noInternet:
                        errorMsg = _errorMsg.noInternet;
                        break;
                    case _errorCode.radioCantPlay:
                        errorMsg = _errorMsg.radioCantPlay;
                        break;
                    case _errorCode.unknown:
                        errorMsg = _errorMsg.unknown;
                        break;
                }
            } else if (error.message) {
                errorMsg = error.message;
            } else {
                errorMsg = _errorMsg.unknown;
            }
            ErrorHandler.showMessageDialog(errorMsg);
        }
    });
})();