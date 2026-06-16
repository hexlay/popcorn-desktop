<nav class="btn-set <%= process.platform %>">
    <% _.each(getButtons(), function(button) { %>
    <button class="btn-os os-<%= button %>"></button>
    <% }); %>
</nav>

<div class="events img-<%= events() %>"></div>
