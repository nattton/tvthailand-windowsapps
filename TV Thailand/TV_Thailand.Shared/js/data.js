/// <reference path="config.js" />
/// <reference path="menu.js" />
(function () {
    "use strict";

    var _categoryList = new WinJS.Binding.List();
    var _channelList = new WinJS.Binding.List();
    var _radioList = (new WinJS.Binding.List()).createGrouped(function (item) {
        return item.category;
    }, function (item) {
        return item.category;
    });

    var _programList = new WinJS.Binding.List();

    function extractMthaiVideo(videoId, content) {
        try {
            var varKey = "defaultClip";
            var indexStart = content.indexOf(varKey) + varKey.length;
            var lastContent = content.substring(indexStart);
            var indexEnd = lastContent.indexOf(";");
            var clipUrl = lastContent.substring(0, indexEnd).replace(/ /g, "").replace(/=/g, "").replace(/'/g, "");

            return clipUrl;
        } catch (ex) {
            return ex;
        }
    }

    var _dailyMotionVideoKey = ["stream_h264_hd_url\":\"", "stream_h264_hq_url\":\"", "stream_h264_ld_url\":\"", "stream_h264_url\":\"", "stream_hls_url\":\""];
    function extractDailyMotionVideo(content, keyIndex) {
        if (!keyIndex) {
            keyIndex = 0;
        }
        var key = _dailyMotionVideoKey[keyIndex];
        var indexStart = content.indexOf(key) + key.length;
        var lastContent = content.substring(indexStart);
        var indexEnd = lastContent.indexOf("\",");
        var clipUrl = lastContent.substring(0, indexEnd).replace(/\\\//g, "/");
        try {
            var uri = new Windows.Foundation.Uri(clipUrl);
            return clipUrl;
        } catch (ex) {
            // Not valid uri, get url again with new key
            return extractDailyMotionVideo(content, keyIndex + 1);
        }
    }

    // Functions for getting data
    WinJS.Namespace.define("API", {
        getData: {
            category: function (refreshSomeList, time) {
                return API.WebService.getData(time).then(function (json) {
                    if (!refreshSomeList) {
                        // Setup category list
                        for (var i = 0; i < json.categories.length; i++) {
                            _categoryList.push(json.categories[i]);
                        }
                    }

                    if (!refreshSomeList || refreshSomeList === API.MenuEnum.Channels) {
                        // Setup channel list
                        for (var i = 0; i < json.channels.length; i++) {
                            _channelList.push(json.channels[i]);
                        }
                    }

                    if (!refreshSomeList || refreshSomeList === API.MenuEnum.Radio) {
                        // Setup radio list
                        for (var i = 0; i < json.radios.length; i++) {
                            _radioList.push(json.radios[i]);
                        }
                    }
                }, function (error) {
                    if (error.name !== "Canceled") {
                        ErrorHandler.check(error);
                    }
                });
            },

            programByCategory: function (categoryId, start, time) {
                var thisPromise;
                return thisPromise = API.WebService.getProgramByCategory(categoryId, start, time).then(function (json) {
                    for (var i = 0; i < json.programs.length; i++) {
                        _programList.push(json.programs[i]);
                    }
                    return WinJS.Promise.wrap(_programList);
                }, function (error) {
                    if (error.name === "Canceled") {
                        thisPromise.cancel();
                    } else {
                        ErrorHandler.check(error);
                        return WinJS.Promise.wrapError(error);
                    }
                });
            },

            programByChannel: function (channelId, start, time) {
                return API.WebService.getProgramByChannel(channelId, start, time).then(function (json) {
                    for (var i = 0; i < json.programs.length; i++) {
                        _programList.push(json.programs[i]);
                    }
                    return WinJS.Promise.wrap(_programList);
                });
            },

            programEpisode: function (programId, start, time) {
                return API.WebService.getProgram(programId, start, time).then(function (json) {
                    var dataArray = [];
                    var hasGroup = false;

                    for (var i = 0; i < json.episodes.length; i++) {
                        var episode = json.episodes[i];
                        var video_encrypt = json.episodes[i].video_encrypt.replace(/\-/g, '+').replace(/\_/g, '/')
					                        .replace(/\,/g, '=').replace(/\!/g, 'a').replace(/\@/g, 'b')
					                        .replace(/\#/g, 'c').replace(/\$/g, 'd').replace(/\%/g, 'e')
					                        .replace(/\^/g, 'f').replace(/\&/g, 'g').replace(/\*/g, 'h')
					                        .replace(/\(/g, 'i').replace(/\)/g, 'j').replace(/\{/g, 'k')
					                        .replace(/\}/g, 'l').replace(/\[/g, 'm').replace(/\]/g, 'n')
					                        .replace(/\:/g, 'o').replace(/\;/g, 'p').replace(/\</g, 'q')
					                        .replace(/\>/g, 'r').replace(/\?/g, 's');
                        var wsc = Windows.Security.Cryptography;
                        var buffer1b = wsc.CryptographicBuffer.decodeFromBase64String(video_encrypt);
                        var video_raw = wsc.CryptographicBuffer.convertBinaryToString(wsc.BinaryStringEncoding.utf8, buffer1b);
                        var splitVideo = video_raw.split(",");
                        for (var j = 0; j < splitVideo.length; j++) {

                            // Preparing group title
                            var groupTitle = episode.title;
                            if (parseInt(episode.ep, 10) <= 20000000) {
                                groupTitle = "ตอนที่ " + episode.ep;
                            }

                            var newData = {
                                id: episode.id,
                                ep: episode.ep,
                                title: episode.title.trim(),
                                srcType: episode.src_type,
                                date: episode.date,
                                viewCount: episode.view_count,
                                parts: episode.parts,
                                pwd: episode.pwd,
                                thumbnail: API.WebService.getImageUrl(splitVideo[j], episode.src_type),
                                videoKey: splitVideo[j],
                                groupTitle: groupTitle
                            }

                            if (splitVideo.length > 1) {
                                hasGroup = true;
                                // Change video title, if have group.
                                newData.title = "Part " + (j + 1) + "/" + splitVideo.length;
                            } else if (parseInt(newData.ep, 10) > 20000000) {
                                // Prevent too long title
                                if (newData.title.length < 30) {
                                    newData.title += " ออกอากาศวันที่ " + Utility.formatDate(newData.date);
                                }
                                newData.title = newData.title.trim();
                            } else {
                                var temp = newData.title;
                                newData.title = "ตอนที่ " + newData.ep;
                                if (temp.trim().length !== 0) {
                                    newData.title += " - " + temp;
                                }
                            }

                            dataArray.push(newData);
                        }
                    }

                    return WinJS.Promise.wrap({
                        data: dataArray,
                        info: json.info,
                        hasGroup: hasGroup,
                        episodeLength: json.episodes.length
                    });
                });
            }
        },

        getVideoLink: {
            youtube: function (videoKey) {
                return "https://www.youtube.com/embed/" + videoKey + "?html5=1&autoplay=1"; // + "?fs=0";
            },
            mThai: function (videoKey, password) {
                if (password) {
                    return WinJS.xhr({
                        type: "POST",
                        url: "http://video.mthai.com/cool/player/" + videoKey + ".html",
                        headers: { "Content-type": "application/x-www-form-urlencoded" },
                        data: "clip_password=" + encodeURIComponent(password)
                    }).then(function (result) {
                        var link = extractMthaiVideo(videoKey, result.responseText);
                        return WinJS.Promise.wrap(link);
                    });
                } else {
                    return WinJS.xhr({
                        url: "http://video.mthai.com/cool/player/" + videoKey + ".html"
                    }).then(function (result) {
                        var link = extractMthaiVideo(videoKey, result.responseText);
                        return WinJS.Promise.wrap(link);
                    });
                }
            },
            dailymotion: function (videoKey) {
                return WinJS.xhr({
                    url: "http://www.dailymotion.com/embed/video/" + videoKey
                }).then(function (result) {
                    var link = extractDailyMotionVideo(result.responseText);
                    return WinJS.Promise.wrap(link);
                });
            }
        },

        search: function (keyword) {
            return API.WebService.search(keyword).then(function (json) {
                return WinJS.Promise.wrap(json.programs);
            });
        }
    });

    //#region List
    WinJS.Namespace.define("API.List", {
        Category: {
            get: function () {
                return _categoryList;
            }
        },
        Channel: {
            get: function () {
                return _channelList;
            }
        },
        Radio: {
            get: function () {
                return _radioList;
            }
        },

        Program: _programList
    });
    //#endregion List
})();