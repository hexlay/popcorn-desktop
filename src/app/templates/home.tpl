<div class="filter-bar-region"></div>
<div class="home-page">
    <% if (loading) { %>
        <div class="home-loading">
            <div class="loading-container"><div class="ball"></div><div class="ball1"></div></div>
        </div>
    <% } else if (error) { %>
        <div class="home-error">
            <h2><%= i18n.__('Home could not be loaded') %></h2>
            <p><%= error %></p>
            <button class="retry-button"><%= i18n.__('Retry') %></button>
        </div>
    <% } else { %>
        <% var spotlightItems = sections.spotlight || []; %>
        <% if (spotlightItems.length) { %>
            <% var hero = spotlightItems[0]; %>
            <section class="home-section home-spotlight">
                <div class="home-section-title">
                    <span class="section-icon"><i class="fa fa-star"></i></span>
                    <h2><%= i18n.__('Spotlight') %></h2>
                    <em><%= spotlightItems.length %> <%= i18n.__('trending now') %></em>
                </div>
                <div class="spotlight-grid">
                    <article class="spotlight-hero home-card" data-type="<%= hero.type %>" data-imdb-id="<%= hero.imdb_id %>">
                        <div class="home-card-bg" style="background-image:url('<%= hero.backdrop || hero.poster %>')"></div>
                        <div class="home-card-shade"></div>
                        <span class="rank-pill">#1 <%= i18n.__('Trending') %></span>
                        <% if (hero.ratingText) { %><span class="rating-pill"><i class="fa fa-star"></i><%= hero.ratingText %></span><% } %>
                        <div class="spotlight-copy">
                            <h3><%= hero.title %></h3>
                            <% if (hero.synopsis) { %><p><%= hero.synopsis %></p><% } %>
                        </div>
                    </article>
                    <div class="spotlight-side">
                        <% _.each(spotlightItems.slice(1, 5), function(item) { %>
                            <article class="spotlight-tile home-card" data-type="<%= item.type %>" data-imdb-id="<%= item.imdb_id %>">
                                <div class="home-card-bg" style="background-image:url('<%= item.backdrop || item.poster %>')"></div>
                                <div class="home-card-shade"></div>
                                <% if (item.ratingText) { %><span class="rating-pill"><i class="fa fa-star"></i><%= item.ratingText %></span><% } %>
                                <h3><span><%= item.title %></span></h3>
                            </article>
                        <% }); %>
                    </div>
                </div>
            </section>
        <% } %>

        <% _.each(sections.rows, function(section) { if (section.items.length) { %>
            <section class="home-section home-row-section">
                <div class="home-section-title">
                    <span class="section-icon"><i class="fa <%= section.icon %>"></i></span>
                    <h2><%= i18n.__(section.title) %></h2>
                    <% if (section.badge) { %><b><%= i18n.__(section.badge) %></b><% } %>
                </div>
                <div class="home-row <%= section.layout %>">
                    <% _.each(section.items, function(item, index) { %>
                        <article class="home-poster-card home-card<%= item.faded ? ' watched' : '' %>" data-type="<%= item.type %>" data-imdb-id="<%= item.imdb_id %>" style="--poster-bg:url('<%= item.poster || item.backdrop %>')">
                            <% if (section.numbered) { %><span class="big-rank"><%= index + 1 %></span><% } %>
                            <div class="poster-frame" style="background-image:url('<%= item.poster || item.backdrop %>')">
                                <div class="home-card-shade"></div>
                                <% if (item.ratingText) { %><span class="rating-pill"><i class="fa fa-star"></i><%= item.ratingText %></span><% } %>
                                <span class="seen-chip"><i class="fa fa-eye"></i><%= i18n.__("Seen") %></span>
                            </div>
                            <div class="home-card-meta">
                                <div class="home-card-actions">
                                    <% if (item.type === 'movie') { %><i class="fa fa-eye home-watched<%= item.watched ? ' selected' : '' %>"></i><% } %>
                                    <i class="fa fa-heart home-favorite<%= item.bookmarked ? ' selected' : '' %>"></i>
                                </div>
                                <h3><span><%= item.title %></span></h3>
                                <% if (item.year) { %><p><%= item.year %></p><% } %>
                                <% if (typeof item.num_seasons !== 'undefined') { %>
                                    <p class="home-seasons"><%= item.num_seasons %> <%= item.num_seasons == 1 ? i18n.__("Season") : i18n.__("Seasons") %></p>
                                <% } %>
                            </div>
                        </article>
                    <% }); %>
                </div>
            </section>
        <% }}); %>
    <% } %>
</div>
