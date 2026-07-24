<div class="settings-container">
    <div class="fa fa-times close-icon"></div>
    <div class="success_alert" style="display:none"><%= i18n.__("Saved") %>&nbsp;<span id="checkmark-notify"><div id="stem-notify"></div><div id="kick-notify"></div></span></div>

    <section id="title">
        <div class="title"><%= i18n.__("Settings") %></div>
        <div class="content">
            <span>
                <i class="far fa-keyboard keyboard tooltipped" data-toggle="tooltip" data-placement="bottom" title="<%= i18n.__("Keyboard Shortcuts") %>"></i>
                <i class="fa fa-info-circle about tooltipped" data-toggle="tooltip" data-placement="bottom" title="<%= i18n.__("About") %>"></i>
                <i class="fa fa-question-circle help tooltipped" data-toggle="tooltip" data-placement="bottom" title="<%= i18n.__("FAQ") %>"></i>
            </span>
        </div>
    </section>

    <section id="localisation">
        <div class="title"><%= i18n.__("Language") %></div>
        <div class="content">
            <span>
                <div class="dropdown subtitles-language">
                    <p><%= i18n.__("Default Language") %></p>
                    <%
                        var langs = "";
                        for(var key in App.Localization.allTranslations) {
                            key = App.Localization.allTranslations[key];
                            if (App.Localization.langcodes[key] !== undefined) {
                                langs += "<option "+(Settings.language == key? "selected='selected'":"")+" value='"+key+"'>"+ App.Localization.langcodes[key].nativeName+"</option>";
                            }
                        }
                    %>
                    <select name="language"><%=langs%></select>
                    <div class="dropdown-arrow"></div>
                </div>
            </span>
            <span>
                <div class="dropdown subtitles-language">
                    <p><%= i18n.__("Default Content Language") %></p>
                    <%
                        var langs = "<option "+(Settings.contentLanguage == ""? "selected='selected'":"")+" value=''>"+i18n.__("Same as Default Language")+"</option>";
                        for(var key in App.Localization.allTranslations) {
                            key = App.Localization.allTranslations[key];
                            if (App.Localization.langcodes[key] !== undefined) {
                                langs += "<option "+(Settings.contentLanguage == key? "selected='selected'":"")+" value='"+key+"'>"+ App.Localization.langcodes[key].nativeName+"</option>";
                            }
                        }
                    %>
                    <select name="contentLanguage"><%=langs%></select>
                    <div class="dropdown-arrow"></div>
                </div>
                <input class="settings-checkbox" name="contentLangOnly" id="contentLangOnly" type="checkbox" <%=(Settings.contentLangOnly? "checked='checked'":"")%>>
                <label class="settings-label" for="contentLangOnly" id="contentLangOnly"><%= i18n.__("Only show content available in this language") %> </label>
            </span>
            <span>
                <div class="dropdown translateTitle">
                    <p><%= i18n.__("Title translation") %></p>
                    <select name="translateTitle">
                        <option <%=(Settings.translateTitle == "origin"? "selected='selected'":"") %> value="origin"><%= i18n.__("Original only") %></option>
                        <option <%=(Settings.translateTitle == "origin-translated"? "selected='selected'":"") %> value="origin-translated"><%= i18n.__("Original - Translated") %></option>
                        <option <%=(Settings.translateTitle == "translated-origin"? "selected='selected'":"") %> value="translated-origin"><%= i18n.__("Translated - Original") %></option>
                        <option <%=(Settings.translateTitle == "translated"? "selected='selected'":"") %> value="translated"><%= i18n.__("Translated only") %></option>
                    </select>
                    <div class="dropdown-arrow"></div>
                </div>
            </span>
            <span>
                <input class="settings-checkbox" name="translateEpisodes" id="translateEpisodes" type="checkbox" <%=(Settings.translateEpisodes? "checked='checked'":"")%>>
                <label class="settings-label" for="translateEpisodes"><%= i18n.__("Translate Episode Titles") %></label>
            </span>
            <span>
                <input class="settings-checkbox" name="translateSynopsis" id="translateSynopsis" type="checkbox" <%=(Settings.translateSynopsis? "checked='checked'":"")%>>
                <label class="settings-label" for="translateSynopsis"><%= i18n.__("Translate Synopsis") %></label>
            </span>
            <span>
                <input class="settings-checkbox" name="translatePosters" id="translatePosters" type="checkbox" <%=(Settings.translatePosters? "checked='checked'":"")%>>
                <label class="settings-label" for="translatePosters"><%= i18n.__("Translate Posters") %></label>
            </span>
            <span id="translation_info">
                <em>* <%= i18n.__("Translations depend on availability. Some options also might not be supported by all API servers") %></em>
            </span>
        </div>
    </section>

    <section id="subtitles">
        <div class="title"><%= i18n.__("Subtitles") %></div>
        <div class="content">
            <div class="opensubtitles-options">
                <% if (Settings.opensubtitlesAuthenticated) { %>
                    <span>
                        <div class="dropdown subtitles-language-default">
                            <p><%= i18n.__("Default Subtitle") %></p>
                            <%
                                var sub_langs = "<option "+(Settings.subtitle_language == "none"? "selected='selected'":"")+" value='none'>" +
                                                    i18n.__("Disabled") + "</option>";
                                for(var key in App.Localization.langcodes) {
                                    if (App.Localization.langcodes[key].subtitle !== undefined && App.Localization.langcodes[key].subtitle == true) {
                                        sub_langs += "<option "+(Settings.subtitle_language == key? "selected='selected'":"")+" value='"+key+"'>"+ App.Localization.langcodes[key].nativeName+"</option>";
                                    }
                                }
                            %>
                            <select name="subtitle_language"><%=sub_langs%></select>
                            <div class="dropdown-arrow"></div>
                        </div>
                    </span>
                    <span>
                        <div class="dropdown subtitles-font">
                            <p><%= i18n.__("Font") %></p>
                            <%
                                var arr_fonts = [
                                    {name:"AljazeeraMedExtOf", id:"aljazeera"},
                                    {name:"Deja Vu Sans", id:"dejavusans"},
                                    {name:"Droid Sans", id:"droidsans"},
                                    {name:"Comic Sans MS", id:"comic"},
                                    {name:"Georgia", id:"georgia"},
                                    {name:"Geneva", id:"geneva"},
                                    {name:"Helvetica", id:"helvetica"},
                                    {name:"Khalid Art", id:"khalid"},
                                    {name:"Lato", id:"lato"},
                                    {name:"Montserrat", id:"montserrat"},
                                    {name:"OpenDyslexic", id:"opendyslexic"},
                                    {name:"Open Sans", id:"opensans"},
                                    {name:"PT Sans",id:"pts"},
                                    {name:"Tahoma", id:"tahoma"},
                                    {name:"Trebuchet MS", id:"trebuc"},
                                    {name:"Roboto",id:"roboto"},
                                    {name:"Ubuntu", id:"ubuntu"},
                                    {name:"Verdana", id:"verdana"},
                                ];
                                var font_folder = path.resolve({
                                    win32:  "/Windows/fonts",
                                    darwin: "/Library/Fonts",
                                    linux:  "/usr/share/fonts"
                                }[process.platform]);
                                var files = [];
                                var recursive = function (dir) {
                                    if (fs.statSync(dir).isDirectory()) {
                                        fs.readdirSync(dir).forEach(function (name) {
                                            var newdir = path.join(dir, name);
                                            recursive(newdir);
                                        });
                                    } else {
                                        files.push(dir);
                                    }
                                };
                                try {
                                    recursive(font_folder);
                                } catch (e) {}
                                var avail_fonts = ["Arial"];
                                for (var i in arr_fonts) {
                                    for (var key in files) {
                                        var found = files[key].toLowerCase();
                                        var toFind = arr_fonts[i].id;
                                        if (found.indexOf(toFind) != -1) {
                                            avail_fonts.push(arr_fonts[i].name);
                                            break;
                                        }
                                    }
                                }
                                var sub_fonts = "";
                                for (var key in avail_fonts) {
                                    sub_fonts += "<option "+(Settings.subtitle_font == avail_fonts[key]+",Arial"? "selected='selected'":"")+" value='"+avail_fonts[key]+",Arial'>"+avail_fonts[key]+"</option>";
                                }
                            %>
                            <select name="subtitle_font"><%=sub_fonts%></select>
                            <div class="dropdown-arrow"></div>
                        </div>
                    </span>
                    <span>
                        <div class="dropdown subtitles-decoration">
                            <p><%= i18n.__("Decoration") %></p>
                            <%
                                var arr_deco = ["None", "Outline", "Opaque Background", "See-through Background"];
                                var sub_deco = "";
                                for(var key in arr_deco) {
                                    sub_deco += "<option "+(Settings.subtitle_decoration == arr_deco[key]? "selected='selected'":"")+" value='"+arr_deco[key]+"'>"+i18n.__(arr_deco[key])+"</option>";
                                }
                            %>
                            <select name="subtitle_decoration"><%=sub_deco%></select>
                            <div class="dropdown-arrow"></div>
                        </div>
                    </span>
                    <span>
                        <div class="dropdown subtitles-size">
                            <p><%= i18n.__("Size") %></p>
                            <%
                                var arr_sizes = ["20px","22px","24px","26px","28px","30px","32px","34px","36px","38px","40px","42px","44px","46px","48px","50px","52px","54px","56px","58px","60px"];
                                var sub_sizes = "";
                                for(var key in arr_sizes) {
                                    sub_sizes += "<option "+(Settings.subtitle_size == arr_sizes[key]? "selected='selected'":"")+" value='"+arr_sizes[key]+"'>"+arr_sizes[key]+"</option>";
                                }
                            %>
                            <select name="subtitle_size"><%=sub_sizes%></select>
                            <div class="dropdown-arrow"></div>
                        </div>
                    </span>
                    <span>
                        <div class="subtitles-custom">
                            <p><%= i18n.__("Color") %></p>
                            <input class="colorsub" id="subtitles_color" type="color" size="7" name="subtitle_color" value="<%=Settings.subtitle_color%>" list="subs_colors">
                                <datalist id="subs_colors">
                                    <option>#ffffff</option>
                                    <option>#ffff00</option>
                                    <option>#ff0000</option>
                                    <option>#ff00ff</option>
                                    <option>#00ffff</option>
                                    <option>#00ff00</option>
                                </datalist>
                        </div>
                    </span>
                    <span>
                        <input class="settings-checkbox" name="subtitles_bold" id="subsbold" type="checkbox" <%=(Settings.subtitles_bold? "checked='checked'":"")%>>
                        <label class="settings-label" for="subsbold"><%= i18n.__("Bold") %></label>
                    </span>
                    <span>
                        <input class="settings-checkbox" name="multipleExtSubtitles" id="multipleExtSubtitles" type="checkbox" <%=(Settings.multipleExtSubtitles? "checked='checked'":"")%>>
                        <label class="settings-label" for="multipleExtSubtitles"><%= i18n.__("Show all available subtitles for default language in flag menu") %></label>
                    </span>
                    <span>
                        <em>* <%= i18n.__("You are currently connected to %s", "OpenSubtitles.com") %>.
                        <a id="unauthOpensubtitles" class="unauthtext" href="#"><%= i18n.__("Disconnect account") %></a></em>
                    </span>
                <% } else { %>
                    <span>
                        <p><%= i18n.__("Username") %></p>
                        <input type="text" size="50" id="opensubtitlesUsername" name="opensubtitlesUsername">
                        <div class="loading-spinner" style="display: none"></div>
                        <div class="valid-tick" style="display: none"></div>
                        <div class="invalid-cross" style="display: none"></div>
                    </span>
                    <span>
                        <p><%= i18n.__("Password") %></p>
                        <input type="password" size="50" id="opensubtitlesPassword" name="opensubtitlesPassword" placeholder="* <%= i18n.__('Used once to create a local access token') %>"><br>
                    </span>
                    <span>
                        <em>* <a class="syncOpensubtitles" id="authOpensubtitles" href="#"><%= i18n.__("Connect to %s", "OpenSubtitles.com") %></a>
                        <%= i18n.__("to automatically fetch subtitles for movies and episodes you watch in %s", Settings.projectName) %>&nbsp;&nbsp;
                        (<a class="createOpensubtitles" href="#"><%= i18n.__("Create an account") %></a>)</em>
                    </span>
                <% } %>
            </div>
        </div>
    </section>

    <section id="playback">
        <div class="title"><%= i18n.__("Playback") %></div>
        <div class="content">
            <span>
                <input class="settings-checkbox" name="alwaysFullscreen" id="alwaysFullscreen" type="checkbox" <%=(Settings.alwaysFullscreen? "checked='checked'":"")%>>
                <label class="settings-label" for="alwaysFullscreen"><%= i18n.__("Always start playing in fullscreen") %></label>
            </span>
            <span>
                <input class="settings-checkbox" name="playNextEpisodeAuto" id="playNextEpisodeAuto" type="checkbox" <%=(Settings.playNextEpisodeAuto? "checked='checked'":"")%>>
                <label class="settings-label" for="playNextEpisodeAuto"><%= i18n.__("Play next episode automatically") %></label>
                <% if (Settings.playNextEpisodeAuto) { %>
                &nbsp;&nbsp;&nbsp;<input id="preloadNextEpisodeTime" type="number" min="0" max="99999" name="preloadNextEpisodeTime" value="<%=Settings.preloadNextEpisodeTime%>" autocomplete="off"/>&nbsp;&nbsp;&nbsp;<em><%= i18n.__("minute(s) remaining before preloading next episode") %>,&nbsp;&nbsp;&nbsp;<%= i18n.__("0 = Disable preloading") %></em>
                <% } %>
            </span>
            <span>
                <input class="settings-checkbox" name="audioPassthrough" id="audioPassthrough" type="checkbox" <%=(Settings.audioPassthrough? "checked='checked'":"")%>>
                <label class="settings-label" for="audioPassthrough" title="<%= i18n.__("Disables audio resampling and may cause audio/video sync issues on some devices") %>"><%= i18n.__("Allow Audio Passthrough") %></label>
            </span>
        </div>
    </section>

    <section id="features">
        <div class="title"><%= i18n.__("Features") %></div>
        <div class="content">
            <span>
                <input class="settings-checkbox" name="activateWatchlist" id="activateWatchlist" type="checkbox" <%=(Settings.activateWatchlist && App.Trakt.authenticated? "checked='checked'":"")%>>
                <label class="settings-label" for="activateWatchlist"><%= i18n.__("Watchlist") %></label>
                <div class="trakt-options<%= App.Trakt.authenticated ? " authenticated" : "" %>">
                    <% if (App.Trakt.authenticated) { %>
                        <span>
                            <em>* <%= i18n.__("You are currently connected to %s", "Trakt.tv") %>.&nbsp;&nbsp;
                            <a id="unauthTrakt" class="unauthtext" href="#"><%= i18n.__("Disconnect account") %></a>&nbsp;|
                            <a id="syncTrakt" class="syncTrakt" href="#"><%= i18n.__("Sync now") %></a></em>
                        </span>
                    <% } else { %>
                        <span id="authTraktSp">
                            <em>* <a class="syncTrakt" id="authTrakt" href="#"><%= i18n.__("Connect to %s", "Trakt.tv") %></a>
                            <%= i18n.__("to automatically 'scrobble' episodes you watch in %s", Settings.projectName) %></em>
                        </span>
                        </span>
                            <div id="authTraktCode" style="display:none;">
                                <%= i18n.__("Code:")%>
                                <input type="text" size="20" readonly/>
                                <i class="fa fa-times closeTraktCode"></i>
                            </div>
                        </span>
                    <% } %>
                </div>
            </span>
            <span>
                <input class="settings-checkbox" name="includeTorrentCollectionInMovieSources" id="includeTorrentCollectionInMovieSources" type="checkbox" <%=(Settings.includeTorrentCollectionInMovieSources? "checked='checked'":"")%>>
                <label class="settings-label" for="includeTorrentCollectionInMovieSources"><%= i18n.__("Include Torrent Collection in movie sources") %></label>
            </span>
            <span>
                <input class="settings-checkbox" name="activateTempf" id="activateTempf" type="checkbox" <%=(Settings.activateTempf? "checked='checked'":"")%>>
                <label class="settings-label" for="activateTempf"><%= i18n.__("Cache Folder Button") %></label>
            </span>
        </div>
    </section>

    <section id="remote-control">
        <div class="title"><%= i18n.__("Remote Control") %></div>
        <div class="content">
            <span>
                <input class="settings-checkbox" name="httpApiEnabled" id="httpApiEnabled" type="checkbox" <%=(Settings.httpApiEnabled ? "checked='checked'":"")%>>
                <label class="settings-label" for="httpApiEnabled"><%= i18n.__("Enable remote control") %></label>
                <% if (Settings.httpApiEnabled) { %>
                <i class="fa fa-qrcode qr-code tooltipped" title="<%= i18n.__('Generate Pairing QR code') %>"></i>
                <% } %>
            </span>
            <% if (Settings.httpApiEnabled) { %>
            <span>
                <p><%= i18n.__("Local IP Address") %></p>
                <input type="text" id="settingsIpAddr" value="<%= Settings.ipAddress %>" readonly="readonly" size="20" />
            </span>
            <span>
                <p><%= i18n.__("HTTP API Port") %></p>
                <input id="httpApiPort" type="number" size="5" name="httpApiPort" value="<%=Settings.httpApiPort%>">
            </span>
            <span>
                <p><%= i18n.__("HTTP API Username") %></p>
                <input id="httpApiUsername" type="text" name="httpApiUsername" value="<%=Settings.httpApiUsername%>">
            </span>
            <span>
                <p><%= i18n.__("HTTP API Password") %></p>
                <input id="httpApiPassword" type="text" name="httpApiPassword" value="<%=Settings.httpApiPassword%>">
            </span>
            <div id="qrcode-overlay" class="modal-overlay"></div>
            <div id="qrcode-modal" class="modal-content">
                <span class="modal-close fa-stack fa-1x" id="qrcode-close">
                    <i class="fa fa-circle-thin fa-stack-2x" style="margin-top: -2px;"></i>
                    <i class="fa fa-times fa-stack-1x" style="margin-top: -2px;"></i>
                </span>
                <canvas id="qrcode" width="200" height="200"></canvas>
            </div>
            <% } %>
        </div>
    </section>

    <section id="apiserver">
        <div class="title"><%= i18n.__("API Server(s)") %></div>
        <div class="content">
            <span>
                <div class="opensubtitles-options">
                    <p><%= i18n.__("Movies API Server(s)") %></p>
                    <input type="text" size="61" id="customMoviesServer" name="customMoviesServer" list="moviesServers" value="<%= encodeURI(Settings.customMoviesServer || Settings.providers.movie.uri[0].split('=')[1]) %>">
                    <datalist id="moviesServers">
                        <% var movieServList = [Settings.providers.movie.uri[0].split('=')[1]];
                           Settings.customServers && Settings.customServers.movie ? movieServList = movieServList.concat(Settings.customServers.movie) : null;
                           for (var i = 0; i < movieServList.length; ++i) {
                        %>
                        <option value="<%= encodeURI(movieServList[i]).replace(/%20/g, ' ') %>">
                        <% } %>
                    </datalist>
                </div>
            </span>
            <span>
                <div class="opensubtitles-options">
                    <p><%= i18n.__("Series API Server(s)") %></p>
                    <input type="text" size="61" id="customSeriesServer" name="customSeriesServer" list="seriesServers" value="<%= encodeURI(Settings.customSeriesServer || Settings.providers.tvshow.uri[0].split('=')[1]) %>">
                    <datalist id="seriesServers">
                        <% var seriesServList = [Settings.providers.tvshow.uri[0].split('=')[1]];
                           Settings.customServers && Settings.customServers.tvshow ? seriesServList = seriesServList.concat(Settings.customServers.tvshow) : null;
                           for (var i = 0; i < seriesServList.length; ++i) {
                        %>
                        <option value="<%= encodeURI(seriesServList[i]).replace(/%20/g, ' ') %>">
                        <% } %>
                    </datalist>
                </div>
            </span>
            <span id="apiserver_info">
                <em>* <%= i18n.__("You can add multiple API Servers separated with a , from which it will select randomly (*for load balancing) until it finds the first available") %></em>
            </span>
        </div>
    </section>

    <section id="connection">
        <div class="title"><%= i18n.__("Connection") %></div>
        <div class="content">
            <span>
                <p><%= i18n.__("Connection Limit") %></p>
                <input id="connectionLimit" type="number" name="connectionLimit" value="<%=Settings.connectionLimit%>" autocomplete="off"/>
            </span>
            <span>
                <p><%= i18n.__("DHT UDP Requests Limit") %></p>
                <input id="maxUdpReqLimit" type="number" name="maxUdpReqLimit" value="<%=Settings.maxUdpReqLimit%>" autocomplete="off"/>
            </span>
            <span>
                <p><%= i18n.__("Max. Down / Up Speed") %></p>
                <input id="downloadLimit" type="number" min="0" max="9999999" name="downloadLimit" placeholder="Unlimited" value="<%=Settings.downloadLimit%>" autocomplete="off"/>
                <input id="uploadLimit" type="number" min="0" max="9999999" name="uploadLimit" placeholder="Unlimited" value="<%=Settings.uploadLimit%>" autocomplete="off"/>&nbsp;&nbsp;
                <%
                    var limit_mult = {
                        "1024": "KB/s",
                        "1048576": "MB/s"
                    };
                    var select_default_mult = "";
                    for(var key in limit_mult) {
                        select_default_mult += "<option "+(Settings.maxLimitMult == key? "selected='selected'":"")+" value='"+key+"'>"+i18n.__(limit_mult[key])+"</option>";
                    }
                %>
                <select name="maxLimitMult"><%=select_default_mult%></select>
                <span class="dropdown-arrow"></span>
            </span>
            <span id="overallRatio">
                <p><%= i18n.__("Overall Ratio") %></p>
                <% var overallRatio = function () {
                    var ratio = (Settings.totalUploaded / Settings.totalDownloaded).toFixed(2);
                    isNaN(ratio) ? ratio = i18n.__("None") : ratio;
                    return ratio;
                   }
                %>
                <input type="text" size="20" name="overallRatio" value="<%= overallRatio() %>">&nbsp;&nbsp;&nbsp;<em><%= Common.fileSize(Settings.totalDownloaded) %><i class="fa fa-arrow-circle-down"></i><%= Common.fileSize(Settings.totalUploaded) %><i class="fa fa-arrow-circle-up"></i></em>
            </span>
            <span>
                <p><%= i18n.__("Port to stream on") %></p>
                <input id="streamPort" type="number" name="streamPort" value="<%=Settings.streamPort%>"/>&nbsp;&nbsp;&nbsp;<em><%= i18n.__("0 = Random") %></em>
            </span>
            <span>
                <input class="settings-checkbox" name="protocolEncryption" id="protocolEncryption" type="checkbox" <%=(Settings.protocolEncryption? "checked='checked'":"")%>>
                <label class="settings-label" for="protocolEncryption" id="protocolEnc"><%= i18n.__("Enable Protocol Encryption") %></label>
                <em><i class="fas fa-exclamation-circle">&nbsp;&nbsp;</i><%= i18n.__("Allows connecting to peers that use PE/MSE. Will in most cases increase the number of connectable peers but might also result in increased CPU usage") %></em>
            </span>
            <span>
                <div class="opensubtitles-options">
                    <p><%= i18n.__("Proxy Server") %></p>
                    <input type="text" size="50" id="proxyServer" name="proxyServer" value="<%= encodeURI(Settings.proxyServer) %>" placeholder="host:port (127.0.0.1:9050 or 127.0.0.1:4447)">
                    <div class="loading-spinner" style="display: none"></div>
                    <div class="valid-tick" style="display: none"></div>
                    <div class="invalid-cross" style="display: none"></div>
                </div>
            </span>
        </div>
    </section>

    <section id="cache">
        <div class="title"><%= i18n.__("Cache") %></div>
        <div class="content">
            <span>
                <p><%= i18n.__("Cache Directory") %></p>
                <input type="text" placeholder="<%= i18n.__("Cache Directory") %>" id="faketmpLocation" value="<%= Settings.tmpLocation %>" readonly="readonly" size="61" />
                <i class="open-tmp-folder fa fa-box-archive tooltipped" data-toggle="tooltip" data-placement="auto" title="<%= i18n.__("Open Cache Directory") %>"></i>
                <input type="file" name="tmpLocation" id="tmpLocation" nwdirectory style="display: none;" nwworkingdir="<%= Settings.tmpLocation %>" />
            </span>
            <span>
                <input class="settings-checkbox" name="deleteTmpOnClose" id="deleteTmpOnClose" type="checkbox" <%=(Settings.deleteTmpOnClose? "checked='checked'":"")%>>
                <label class="settings-label" for="deleteTmpOnClose"><%= i18n.__("Clear Cache Folder after closing the app?") %></label>
            </span>
            <span>
                <input class="settings-checkbox" name="keepWatchedTorrentFiles" id="keepWatchedTorrentFiles" type="checkbox" <%=(Settings.keepWatchedTorrentFiles? "checked='checked'":"")%>>
                <label class="settings-label" for="keepWatchedTorrentFiles"><%= i18n.__("Keep files downloaded while watching") %></label>
            </span>
        </div>
    </section>

    <section id="database">
        <div class="title"><%= i18n.__("Database") %></div>
        <div class="content">
            <span>
                <p><%= i18n.__("Database Directory") %></p>
                <input type="text" placeholder="<%= i18n.__("Database Directory") %>" id="fakedatabaseLocation" value="<%= Settings.databaseLocation %>" readonly="readonly" size="61" />
                <label><i class="fa fa-down-long database import-db tooltipped" title="<%= i18n.__("Import Database") %>"></i></label>
                <label for="exportdatabase"><i class="fa fa-up-long database export-database tooltipped" title="<%= i18n.__("Export Database") %>"></i></label>
                <input type="file" id="exportdatabase" style="display:none" nwdirectory>
                <i class="open-database-folder fa fa-database tooltipped" data-toggle="tooltip" data-placement="auto" title="<%= i18n.__("Open Database Directory") %>"></i>
                <input type="file" name="fakedatabaseLocation" id="fakedatabaseLocation" nwdirectory style="display: none;" nwworkingdir="<%= Settings.databaseLocation %>" />
            </span>
            <div class="btns database import-database">
                <div id="importdb-overlay" class="modal-overlay"></div>
                <div id="importdb-modal" class="modal-content">
                    <span class="modal-close fa-stack fa-1x" id="importdb-close">
                        <i class="fa fa-circle-thin fa-stack-2x" style="margin-top: -2px;"></i>
                        <i class="fa fa-times fa-stack-1x" style="margin-top: -2px;"></i>
                    </span>
                    <span>
                        <%= i18n.__("Please select which data types you want to import ?") %>
                    </span>
                    <span>
                        <input class="settings-checkbox" name="import-watched" id="import-watched" type="checkbox" checked='checked'>
                        <label class="settings-label" for="import-watched"><%= i18n.__("Watched items") %></label>
                    </span>
                    <span>
                        <input class="settings-checkbox" name="import-bookmarks" id="import-bookmarks" type="checkbox" checked='checked'>
                        <label class="settings-label" for="import-bookmarks"><%= i18n.__("Bookmarked items") %></label>
                    </span>
                    <span>
                        <input class="settings-checkbox" name="import-torcol" id="import-torcol" type="checkbox" checked='checked'>
                        <label class="settings-label" for="import-torcol"><%= i18n.__("Saved Torrents") %></label>
                    </span>
                    <span>
                        <input class="settings-checkbox" name="import-settings" id="import-settings" type="checkbox" checked='checked'>
                        <label class="settings-label" for="import-settings"><%= i18n.__("Settings") %></label>
                    </span>
                    <div class="btn-settings btn-block database">
                        <label class="import-database" for="importdatabase"  title="<%= i18n.__("Open File to Import") %>"><%= i18n.__("Import Database") %>&nbsp;</label>
                        <i class="fa fa-down-long">&nbsp;</i>
                        <input type="file" id="importdatabase" accept=".zip" style="display:none">
                    </div>
                </div>
            </div>
        </div>
    </section>

    <section id="maintenance">
        <div class="title"><%= i18n.__("Maintenance") %></div>
        <div class="content">
            <div class="maintenance-actions">
                <button type="button" class="btn-settings rebuild-bookmarks"><i class="fa fa-wrench"></i><span><%= i18n.__("Rebuild bookmarks database") %></span></button>
                <button type="button" class="btn-settings flush-bookmarks"><i class="fa fa-trash"></i><span><%= i18n.__("Flush bookmarks database") %></span></button>
                <button type="button" class="btn-settings flush-watched"><i class="fa fa-trash"></i><span><%= i18n.__("Flush watched database") %></span></button>
                <button type="button" class="btn-settings default-settings"><i class="fa fa-rotate-right"></i><span><%= i18n.__("Reset to Default Settings") %></span></button>
                <button type="button" class="btn-settings flush-databases"><i class="fa fa-rotate-right"></i><span><%= i18n.__("Reset all") %></span></button>
            </div>
        </div>
    </section>

</div>
