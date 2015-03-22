(function () {
    "use strict";

    var _suggestionArray;

    function suggestionsRequestedHandler(args) {
        var query = args.detail.queryText.toLocaleLowerCase();

        // Retrieve the system-supplied suggestions.
        var suggestionCollection = args.detail.searchSuggestionCollection;

        if (query.length > 1) {
            query = encodeURIComponent(query);
            args.detail.setPromise(
                API.search(query).then(function (data) {
                    _suggestionArray = data;
                    for (var i = 0; i < data.length; i++) {
                        suggestionCollection.appendQuerySuggestion(data[i].title);
                    }
                }, function (error) {
                    // Do nothing.
                })
            );
        }
    }

    function querySubmitted(args) {
        var query = args.detail.queryText;

        if (query.length > 0 && _suggestionArray && _suggestionArray.length > 0) {
            for (var i = 0; i < _suggestionArray.length; i++) {
                if (query === _suggestionArray[i].title) {
                    WinJS.Navigation.navigate("/pages/episode/episode.html", _suggestionArray[i]);
                }
            }
        }
    }

    WinJS.Namespace.define("API.Search", {
        suggestionsRequestedHandler: WinJS.UI.eventHandler(suggestionsRequestedHandler),
        querySubmitted: WinJS.UI.eventHandler(querySubmitted)
    });
})();