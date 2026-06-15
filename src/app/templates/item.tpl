<%
    if (typeof rating === 'object') { var rating = rating.percentage /10; }
    var displayRating = parseFloat(rating);
%>
<div class="cover">
    <div class="cover-imgs"></div>
    <div class="cover-overlay cover-info-overlay">
        <i class="fa fa-play card-play-indicator"></i>
        <i class="fa fa-heart actions-favorites tooltipped" data-toggle="tooltip" data-container="body" data-placement="top" data-delay='{ "show": "800", "hide": "100" }'></i>
        <i class="fa fa-eye actions-watched tooltipped" data-toggle="tooltip" data-container="body" data-placement="top" data-delay='{ "show": "800", "hide": "100" }'></i>
    </div>
</div>

<div class="item-meta">
    <p class="title tooltipped" data-titleholder="<%= title1 %>" data-toggle="tooltip" data-placement="auto bottom"  onmouseenter="if (this.offsetWidth < this.scrollWidth) { $(this).attr('data-original-title', $(this).attr('data-titleholder')); } else { $(this).attr('data-original-title', ''); }"><%= title1 %></p>
    <% if (typeof title2 !== 'undefined' && title2 !== '') { %>
        <p class="title2 tooltipped" <% if(title2.length > 20){ %> title="<%= title2 %>" data-toggle="tooltip" data-placement="auto bottom" <% } %> ><%= title2 %></p>
    <%} %>
    <p class="year">
        <% if (typeof year !== 'undefined') { %>
            <%= year %>
        <% } %>
    </p>

    <div class="item-meta-bottom">
        <% if (!isNaN(displayRating)) { %>
            <span class="card-rating"><i class="fa fa-star"></i><%= displayRating.toFixed(1) %></span>
        <% } %>
        <% if (typeof item_data !== 'undefined') { %>
            <p class="seasons data">
                <%= i18n.__(item_data) %>
            </p>
        <% } else if (typeof num_seasons !== 'undefined') { %>
            <p class="seasons">
                <%= num_seasons %> <%= num_seasons == 1 ? i18n.__("Season") : i18n.__("Seasons") %>
            </p>
        <% } else if (typeof qualityList !== 'undefined') { %>
            <p class="seasons quality">
                <%= qualityList %>
            </p>
        <% } %>
    </div>
</div>
