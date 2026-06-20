<div class="play-control">
    <div class="flex-left">
        <div class="row setup-container">
            <div class="toggles-container">
                <div class="favourites-toggle"><%=i18n.__("Add to bookmarks") %></div>
                <div class="watched-toggle"><%=i18n.__("Not Seen") %></div>
            </div>
            <div class="subtitle-control dropdowns-container">
                <% if (Settings.opensubtitlesAuthenticated) { %>
                <div id="subs-dropdown"></div>
                <% } else { %>
                <div id="subs-dropdown" class="connect-opensubtitles"></div>
                <% } %>
            </div>
        </div>
        <div class="row">
            <div id="player-chooser"   class="play-selector"></div>
            <div id="watch-trailer"    class="button play-selector"><%=i18n.__("Watch Trailer") %></div>
            <% if (Settings.activateSeedbox) { %>
            <div id="download-torrent"    class="button play-selector"><%=i18n.__("Download") %></div>
            <% } %>
            <div id="quality-selector" class="quality-selector"></div>
            <div class="torrent-source-status is-loading">
                <span class="source-loader source-loader-compact"><span class="source-loader-core"></span></span>
                <i class="torrent-source-empty fa fa-exclamation-circle"></i>
                <span class="torrent-source-status-text"><%=i18n.__("Loading torrent sources...") %></span>
            </div>
            <% if (showTorrentsMore) { %>
            <div id="show-all-torrents" class="show-all-torrents"><%=i18n.__("more...") %></div>
            <% } %>
        </div>
    </div>
</div>
