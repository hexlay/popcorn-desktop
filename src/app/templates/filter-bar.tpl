<ul class="nav nav-hor left">
    <li class="brand-lockup">
        <img src="/src/app/images/icon.png" alt="">
        <span>Popcorn Time</span>
    </li>
    <li class="source homeTabShow"><%= i18n.__("Home") %></li>
    <% _.each (App.Config.getTabTypes(), function (tab) { %>
    <% var providerURL = App.Config.getProviderForType(tab.type)[0].apiURL ? App.Config.getProviderForType(tab.type)[0].apiURL.slice(0) : [];
        providerURL.forEach(function(e, index) {
            providerURL[index] = e.replace(/http:\/\/|https:\/\/|\/$/g, '');
        });
        providerURL = encodeURI(providerURL.join('<br>')).replace(/%3Cbr%3E/g, '<br>');
    %>
    <li class="source <%= tab.type %>TabShow providerinfo" data-toggle="tooltip" data-placement="bottom" title="<%= providerURL %>"><%= i18n.__(tab.name) %></li>
    <% }); %>
    <% if (Settings.favoritesTabEnable) { %>
    <li id="filterbar-favorites" class="source" style="display:block">
    <% } else { %>
    <li id="filterbar-favorites" class="source" style="display:none">
    <% } %>
        <%= i18n.__("Favorites") %>
    </li>
    <% if (Settings.watchedTabEnable) { %>
    <li id="filterbar-watched" class="source" style="display:block">
    <% } else { %>
    <li id="filterbar-watched" class="source" style="display:none">
    <% } %>
        <%= i18n.__("Watched") %>
    </li>
</ul>
<ul id="nav-filters" class="nav nav-hor filters">
    <% filters = [
        {class: 'types', title: "Type", current: type, list: types},
        {class: 'ratings', title:  "Rating", current: rating, list: ratings},
        {class: 'genres', title:  "Genre", current: genre, list: genres},
        {class: 'sorters', title:  "Sort by", current: sorter, list: sorters},
    ] %>
    <% _.each (filters, function (filter) { if(typeof filter.current !== 'undefined' && filter.list.length !== 0){ %>
        <li class="dropdown filter <%= filter.class %>">
            <a class="dropdown-toggle" data-toggle="dropdown" href="#">
                <%= i18n.__(filter.title) %>
                <span class="value" data-value="<%= filter.current %>"></span>
                <span class="caret"></span>
            </a>
            <ul class="dropdown-menu">
                <% _.each(filter.list, function(val, key) { %>
                <li><a href="#" data-value="<%= key %>"><%= val %></a></li>
                <% }); %>
            </ul>
        </li>
    <% }}); %>
</ul>
<ul class="nav nav-hor right">
    <li>
        <div class="right search">
            <form>
                <input id="searchbox" type="text" placeholder="<%= i18n.__("Search") %>" autocomplete="off">
                <div class="clear fa fa-times"></div>
            </form>
        </div>
    </li>
    <!-- Watchlist -->
    <% if (Settings.activateWatchlist && App.Trakt.authenticated) { %>
    <li style="display:block">
    <% } else { %>
    <li style="display:none">
    <% } %>
        <i id="filterbar-watchlist" class="fa fa-inbox watchlist tooltipped" data-toggle="tooltip" data-placement="bottom" title="<%= i18n.__("Watchlist") %>"></i>
    </li>

    <!-- Cache Folder -->
    <% if (Settings.activateTempf) { %>
    <li style="display:block">
    <% } else { %>
    <li style="display:none">
    <% } %>
        <i id="filterbar-tempf" class="fa fa-box-archive about tooltipped" data-toggle="tooltip" data-placement="bottom" title="<%= i18n.__("Cache Folder") %>"></i>
    </li>

    <!-- Settings -->
    <li>
        <i id="filterbar-settings" class="fa fa-cog settings tooltipped" data-toggle="tooltip" data-placement="left" title="<%= i18n.__("Settings") %>"></i>
    </li>
</ul>
