﻿// For an introduction to the Navigation template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkID=392287
(function () {
    "use strict";

    var activation = Windows.ApplicationModel.Activation;
    var app = WinJS.Application;
    var nav = WinJS.Navigation;
    var sched = WinJS.Utilities.Scheduler;
    var ui = WinJS.UI;

    app.addEventListener("activated", function (args) {
        if (args.detail.kind === activation.ActivationKind.launch) {
            if (args.detail.previousExecutionState !== activation.ApplicationExecutionState.terminated) {
                // TODO: This application has been newly launched. Initialize
                // your application here.

                app.onsettings = function (e) {
                    e.detail.applicationcommands = {
                        "about": {
                            href: "/pages/settings/about/about.html",
                            title: "About"
                        }
                    }

                    WinJS.UI.SettingsFlyout.populateSettings(e);
                };

                // Add Privacy Policy to settings
                var settingsPane = Windows.UI.ApplicationSettings.SettingsPane.getForCurrentView();
                settingsPane.oncommandsrequested = function onCommandsRequested(eventArgs) {
                    var settingsCommand = new Windows.UI.ApplicationSettings.SettingsCommand("privacyPolicy", "Privacy Policy",
                        function onSettingsCommand(settingsCommand) {
                            var uri = new Windows.Foundation.Uri("http://tv.makathon.com/privacy/windows");
                            Windows.System.Launcher.launchUriAsync(uri);
                        });
                    eventArgs.request.applicationCommands.append(settingsCommand);
                };
            } else {
                // TODO: This application has been reactivated from suspension.
                // Restore application state here.
            }

            nav.history = app.sessionState.history || {};
            nav.history.current.initialPlaceholder = true;

            // Optimize the load of the application and while the splash screen is shown, execute high priority scheduled work.
            ui.disableAnimations();
            var p = ui.processAll().then(function () {
                return nav.navigate(nav.location || Application.navigator.home, nav.state);
            }).then(function () {
                return sched.requestDrain(sched.Priority.aboveNormal + 1);
            }).then(function () {
                ui.enableAnimations();
            });

            args.setPromise(p);
        }
    });

    app.oncheckpoint = function (args) {
        // TODO: This application is about to be suspended. Save any state
        // that needs to persist across suspensions here. If you need to 
        // complete an asynchronous operation before your application is 
        // suspended, call args.setPromise().
        app.sessionState.history = nav.history;
    };

    app.start();
})();
