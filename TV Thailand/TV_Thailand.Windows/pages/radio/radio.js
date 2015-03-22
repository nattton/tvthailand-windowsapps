(function () {
    "use strict";

    var radioList, progress, playBtn, radioPlayer, audtag, systemMediaControls;

    WinJS.UI.Pages.define("/pages/radio/radio.html", {
        ready: function (element, radioIndex) {
            Appbar.setup("radio");
            progress = element.querySelector(".page-progress");
            radioList = element.querySelector("#radioList").winControl;
            radioPlayer = element.querySelector("#radioPlayer").winControl;
            if (radioIndex || radioIndex === 0) {
                initialRadio();
                radioList.selection.set(radioIndex);
            }
        },

        radioSelectionChanged: WinJS.Utilities.markSupportedForProcessing(function (args) {
            /// <var type="WinJS.UI.ListView" />
            var thisList = args.currentTarget.winControl;
            thisList.selection.getItems().done(function (items) {
                if (items.length > 0) {
                    /// <var type="Menu.Item" />
                    var data = items[0].data;
                    changeRadio(data.url);
                    WinJS.Binding.processAll(radioPlayer, data);
                }
            }.bind(this));
        }),

        unload: function () {
            resetRadio();
        },

        updateLayout: function (element) {
            /// <param name="element" domElement="true" />

            radioList.forceLayout();
        }
    });

    function processRadioLink(radioLink) {
        /// <param name="radioLink" type="String">Radio Link</param>
        var linkSplit = radioLink.split(".");
        var lastChar = radioLink.substr(radioLink.length - 1);
        var last3Char = radioLink.substr(radioLink.length - 3);
        if (linkSplit[linkSplit.length - 1] === "m3u8" ||
            linkSplit[linkSplit.length - 1] === "m3u" ||
            linkSplit[linkSplit.length - 1] === "mp3" ||
            lastChar === ";") {
            return radioLink;
        } else if (lastChar === "/") {
            return radioLink + ";";
        } else if (!isNaN(+last3Char)) {
            return radioLink + "/;";
        } else {
            return radioLink;
        }
    }

    function initialRadio() {
        // Add event for Play button
        playBtn = document.querySelector("#playBtn");
        playBtn.onclick = function () {
            if (audtag) {
                if (!audtag.paused) {
                    audtag.pause();
                } else {
                    audtag.play();
                }
            }
        }

        if (!systemMediaControls) {
            // Create the media control.
            systemMediaControls = Windows.Media.SystemMediaTransportControls.getForCurrentView();

            // Add event listener for the mandatory media commands and enable them.
            // These are necessary to play streams of type 'backgroundCapableMedia'
            systemMediaControls.addEventListener("buttonpressed", mediaButtonPressed, false);
            systemMediaControls.isPlayEnabled = true;
            systemMediaControls.isPauseEnabled = true;
        }
        if (!audtag) {
            audtag = document.createElement('audio');
            audtag.setAttribute("id", "audtag");
            audtag.setAttribute("msAudioCategory", "BackgroundCapableMedia");
            audtag.addEventListener("playing", audioPlay, false);
            audtag.addEventListener("pause", audioPause, false);
            document.getElementById("MediaElement").appendChild(audtag);
            audtag.oncanplay = function () {
                Utility.hideElement(progress);
                if (playBtn) {
                    playBtn.disabled = false;
                    playBtn.textContent = WinJS.UI.AppBarIcon.stop;
                }
                if (audtag) {
                    audtag.play();
                }
            }
            audtag.onabort = function (event) {
                // Do Nothing.
                // Have this to prevent abort fallback into error.
            }
            audtag.onerror = function (event) {
                Utility.hideElement(progress);
                ErrorHandler.check({ code: ErrorHandler.errorCode.radioCantPlay });
            }
        }
    }

    function changeRadio(radioLink) {
        if (audtag) {
            Utility.showElement(progress);
            if (playBtn) {
                playBtn.disabled = true;
                playBtn.textContent = WinJS.UI.AppBarIcon.play;
            }
            radioLink = processRadioLink(radioLink);
            audtag.setAttribute("src", radioLink);
            audtag.load();
        }
    }

    function resetRadio() {
        /// <summary>
        /// Remove the audio tag and then null it.
        /// Then unload event listeners so you don't press play on another media element you switched from.
        /// </summary>

        if (audtag) {
            document.getElementById("MediaElement").removeChild(audtag);
            audtag.removeEventListener("playing", audioPlay, false);
            audtag.removeEventListener("pause", audioPause, false);
            audtag = null;
        }
        if (systemMediaControls) {
            systemMediaControls.removeEventListener("buttonpressed", mediaButtonPressed, false);
            systemMediaControls.isPlayEnabled = false;
            systemMediaControls.isPauseEnabled = false;
            systemMediaControls.playbackStatus = Windows.Media.MediaPlaybackStatus.closed;
            systemMediaControls = null;
        }
        if (document.querySelector("#playBtn")) {
            document.querySelector("#playBtn").textContent = WinJS.UI.AppBarIcon.play;
        }
    }

    function audioPlay() {
        systemMediaControls.playbackStatus = Windows.Media.MediaPlaybackStatus.playing;
        playBtn.textContent = WinJS.UI.AppBarIcon.stop;
    }

    function audioPause() {
        systemMediaControls.playbackStatus = Windows.Media.MediaPlaybackStatus.paused;
        playBtn.textContent = WinJS.UI.AppBarIcon.play;
    }

    function mediaButtonPressed(e) {
        switch (e.button) {
            case Windows.Media.SystemMediaTransportControlsButton.play:
                audtag.play();
                break;

            case Windows.Media.SystemMediaTransportControlsButton.pause:
                audtag.pause();
                break;
        }
    }
})();
