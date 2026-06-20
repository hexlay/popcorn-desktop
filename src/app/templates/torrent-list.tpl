<% if (state === 'loading') { %>
<div class="torrent-list-state torrent-list-loading">
    <span class="source-loader"><span class="source-loader-core"></span></span>
    <span><%=i18n.__("Loading torrent sources...") %></span>
</div>
<% } else if (state === 'empty') { %>
<div class="torrent-list-state"><i class="fa fa-info-circle"></i> <%=i18n.__("No torrents found") %></div>
<% } else if (state === 'error') { %>
<div class="torrent-list-state torrent-list-error"><i class="fa fa-exclamation-circle"></i> <%=i18n.__("Torrent sources could not be loaded") %></div>
<% } else { %>
<table>
    <%_.each(torrents, function(torrent, k) { %>
    <% var torrentHash = torrentCollectionSearch.infoHash(torrent); %>
    <% var torrentUrl = torrent.url || torrent.magnet || null; %>
    <% var isSelected = torrent === selectedTorrent || (selectedTorrentHash && torrentHash === selectedTorrentHash) || (!selectedTorrentHash && selectedTorrentUrl && torrentUrl === selectedTorrentUrl); %>
    <tr class="item-row <%= torrent.isTorrentCollection ? 'collection-source' : 'fallback-source' %><%= isSelected ? ' selected-source' : '' %>" data-key="<%=k %>">
        <td class="provider tooltipped<%= Settings.seriesUITransparency ? '' : ' transpOff' %>" <% if (torrent.source) { %>title="<%=torrent.source.split('//').pop().split('/')[0] %>" <% } else { %>title="<%=torrent.provider.toLowerCase() %>" style="cursor:default" <% } %>data-toggle="tooltip" data-container="body" data-placement="left"><img data-href="<%=torrent.source %>" src="<%=torrent.icon %>" <% if (!torrent.source) { %>style="cursor:default" <% } %>onerror="this.onerror=null; this.style.display='none'; this.parentElement.style.top='0'; this.parentElement.classList.add('fas', 'fa-link')" onload="this.onerror=null; this.onload=null;"/></td>
        <td class="ellipsis item-play<%= Settings.seriesUITransparency ? '' : ' transpOff' %>"><span data-titleholder="<%=(torrent.title || i18n.__('Untitled torrent')).replace(/\./g, '.\u200B') %>" class="item-play tooltipped" data-toggle="tooltip" data-container="body" data-placement="top" onmouseenter="if (this.offsetWidth < this.scrollWidth) { $(this).attr('data-original-title', $(this).attr('data-titleholder')); } else { $(this).attr('data-original-title', ''); }"><%=torrent.title || i18n.__('Untitled torrent') %></span></td>
        <td class="source-kind item-play<%= Settings.seriesUITransparency ? '' : ' transpOff' %>" title="<%= torrent.isTorrentCollection ? i18n.__('Torrent Collection') : i18n.__('Fallback API') %>"><span class="source-badge"><% if (isSelected) { %><i class="fa fa-check"></i> <%= i18n.__('Selected') %><% } else { %><%= torrent.isTorrentCollection ? i18n.__('Torrent Collection') : i18n.__('Fallback API') %><% } %></span></td>
        <td class="info info-language item-play<%= Settings.seriesUITransparency ? '' : ' transpOff' %>"><%=(torrent.audioLanguages || []).join(', ').toUpperCase() || '-' %></td>
        <td class="info info-peers item-play tooltipped<%= Settings.seriesUITransparency ? '' : ' transpOff' %>" title="<%= i18n.__('Seeds') %> &nbsp;/&nbsp; <%= i18n.__('Peers') %>" data-toggle="tooltip" data-container="body" data-placement="top"><%=torrent.seed || torrent.seeds || 0 %> / <%=torrent.peer || torrent.peers || 0 %></td>
        <td class="info info-quality item-play<%= Settings.seriesUITransparency ? '' : ' transpOff' %>"><%=torrent.quality || '-' %></td>
        <td class="info info-size item-play<%= Settings.seriesUITransparency ? '' : ' transpOff' %>"><%=torrent.filesize || torrent.size || '-' %></td>
        <% if (Settings.activateSeedbox) { %><td class="action item-download tooltipped<%= Settings.seriesUITransparency ? '' : ' transpOff' %>" title="<%= i18n.__('Download') %>" data-toggle="tooltip" data-container="body" data-placement="top"><i class="fa fa-download item-download"></i></td><% } %>
    </tr>
    <% }); %>
</table>
<% } %>
