<div class="dropup">
    <div class="dropdown-toggle lang-dropdown" data-toggle="dropdown" >
        <span class="lang-name"><%= title %></span>
        <div class="selected-lang flag-icon flag none" title="<%= App.Localization.nativeName(selected) %>"></div>
        <div class="caret"></div>
    </div>
    <div class="dropdown-menu" role="menu">
        <div class="lang-option-list">
            <% for(var lang in values){ %>
                <% if(Settings.multipleExtSubtitles) { %>
                    <% if(lang.indexOf('|')!==-1 && lang.substr(0,2) !== Settings.subtitle_language) continue; %>
                <% } else { %>
                    <% if(lang.indexOf('|')!==-1) continue; %>
                <% } %>
                <%
                    var langCode = lang !== 'none' ? lang.substr(0,2) : lang;
                    var langTitle = lang !== 'none' ? App.Localization.nativeName(langCode) : App.Localization.nativeName(lang);
                    if (lang !== 'none' && lang.substr(3)) {
                        langTitle += ' ' + lang.substr(3);
                    }
                %>
                <div class="lang-option flag-icon tooltipped" data-toggle="tooltip" data-placement="top" data-lang="<%= lang %>" title="<%= langTitle %>">
                    <span class="flag <%= langCode %>"></span>
                    <span class="lang-option-name"><%= langTitle %></span>
                </div>
            <% } %>
        </div>
    </div>
</div>
