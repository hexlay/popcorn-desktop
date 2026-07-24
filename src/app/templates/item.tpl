<%
    if (typeof rating === 'object') { var rating = rating.percentage /10; }
    var displayRating = parseFloat(rating);
%>
<div class="cover media-card-poster">
    <div class="cover-imgs media-card-image"></div>
    <div class="cover-overlay cover-info-overlay media-card-overlay">
        <i class="fa fa-play card-play-indicator media-card-play"></i>
    </div>
    <% if (!isNaN(displayRating)) { %>
        <span class="card-rating media-card-rating"><i class="fa fa-star"></i><%= displayRating.toFixed(1) %></span>
    <% } %>
    <span class="seen-chip media-card-seen"><i class="fa fa-eye"></i><%= i18n.__("Seen") %></span>
    <span class="offline-chip media-card-offline" title="<%=i18n.__('Available offline') %>"><i class="fa fa-download"></i><%=i18n.__('Offline') %></span>
</div>

<div class="item-meta media-card-meta">
    <div class="item-actions media-card-actions">
        <i class="fa fa-eye actions-watched tooltipped" data-toggle="tooltip" data-container="body" data-placement="top" data-delay='{ "show": "800", "hide": "100" }'></i>
        <i class="fa fa-heart actions-favorites tooltipped" data-toggle="tooltip" data-container="body" data-placement="top" data-delay='{ "show": "800", "hide": "100" }'></i>
    </div>
    <p class="title media-card-title tooltipped" data-titleholder="<%= title1 %>" data-toggle="tooltip" data-placement="auto bottom"  onmouseenter="if (this.offsetWidth < this.scrollWidth) { $(this).attr('data-original-title', $(this).attr('data-titleholder')); } else { $(this).attr('data-original-title', ''); }"><span><%= title1 %></span></p>
    <% if (typeof title2 !== 'undefined' && title2 !== '') { %>
        <p class="title2 media-card-secondary tooltipped" <% if(title2.length > 20){ %> title="<%= title2 %>" data-toggle="tooltip" data-placement="auto bottom" <% } %> ><%= title2 %></p>
    <%} %>
    <p class="year media-card-subtitle">
        <% if (typeof year !== 'undefined') { %>
            <%= year %>
        <% } %>
    </p>

    <% if (typeof item_data !== 'undefined') { %>
        <div class="item-meta-bottom media-card-bottom">
            <p class="seasons data media-card-tag">
                <%= i18n.__(item_data) %>
            </p>
        </div>
    <% } else if (typeof num_seasons !== 'undefined') { %>
        <div class="item-meta-bottom media-card-bottom">
            <p class="seasons media-card-tag">
                <%= num_seasons %> <%= num_seasons == 1 ? i18n.__("Season") : i18n.__("Seasons") %>
            </p>
        </div>
    <% } else if (typeof qualityList !== 'undefined') { %>
        <div class="item-meta-bottom media-card-bottom">
            <p class="seasons quality media-card-tag">
                <%= qualityList %>
            </p>
        </div>
    <% } %>
</div>
