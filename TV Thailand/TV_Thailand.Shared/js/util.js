(function () {
    "use strict";

    var _util = WinJS.Utilities;
    var _hiddenClass = "hidden";
    var _monthNames = new Array("มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม");

    WinJS.Namespace.define("Utility", {
        toggleClass: function (element, className) {
            if (_util.hasClass(element, className)) {
                _util.removeClass(element, className);
            } else {
                _util.addClass(element, className);
            }
        },

        showElement: function (element) {
            _util.removeClass(element, _hiddenClass);
        },

        hideElement: function (element) {
            _util.addClass(element, _hiddenClass);
        },

        toggleHidden: function (element) {
            Utility.toggleClass(element, _hiddenClass);
        },

        formatDate: function (dateString) {
            var date = new Date(dateString);
            var thisDate = date.getDate();
            var thisMonth = date.getMonth();
            var thisYear = date.getFullYear();
            var thaiYear = thisYear + 543;
            return thisDate + " " + _monthNames[thisMonth] + " " + thaiYear;
        }
    });
})();