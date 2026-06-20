(function (App){
    'use strict';

    App.View.TorrentList = Marionette.View.extend({
        template: '#torrent-list-tpl',
        ui: {
        },

        events: {
            'click .item-play': 'addItem',
            'click .item-download': 'addItem',
            'mousedown .provider img': 'openSource',
            'contextmenu .item-row td:not(.provider)': 'copyMagnet',
        },

        initialize: function() {
            this.model.set('torrents', []);
            this.model.set('state', 'loading');
            this.icons = App.Providers.get('Icons');
            this.selectionChangeHandler = this.refreshSelection.bind(this);
            App.vent.on('torrent:selection:changed', this.selectionChangeHandler);
        },

        serializeData: function() {
            const data = this.model.toJSON();
            const getSelectedTorrent = this.model.get('selectedTorrent');
            const selectedTorrent = typeof getSelectedTorrent === 'function' ? getSelectedTorrent() : null;
            data.selectedTorrent = selectedTorrent;
            data.selectedTorrentHash = torrentCollectionSearch.infoHash(selectedTorrent);
            data.selectedTorrentUrl = selectedTorrent && (selectedTorrent.url || selectedTorrent.magnet) || null;
            return data;
        },

        onAttach: function () {
            this.model.set('torrents', []);
            this.model.get('promise').then((data) => {
                if (!this.isDestroyed()) {
                    this.updateTorrents(data || []);
                }
            }).catch((error) => {
                win.error('Torrent list:', error);
                if (!this.isDestroyed()) {
                    this.model.set({state: 'error', torrents: []});
                    this.render();
                    this.finishLoading();
                }
            });
        },

        finishLoading: function() {
            App.vent.trigger('torrent:list:complete');
        },

        refreshSelection: function() {
            if (this.isDestroyed() || this.model.get('state') !== 'ready') {
                return;
            }
            this.render();
            this.initializeRows();
        },

        initializeRows: function() {
            this.$('.tooltipped').tooltip({
                delay: {
                    'show': 1200,
                    'hide': 100
                }
            });
            if ($('.loading .maximize-icon').is(':visible') || $('.player .maximize-icon').is(':visible')) {
                this.$('.item-row, .item-play').addClass('disabled').prop('disabled', true);
            }
        },

        updateTorrents: function (torrents) {
            const provider = this.model.get('provider');
            let loadIcons = [];
            for(let torrent of torrents) {
                torrent.icon = torrent.icon || '/src/app/images/icons/' + torrent.provider + '.png';
                loadIcons.push(this.icons.getLink(provider, torrent.provider)
                    .then((icon) => torrent.icon = icon || torrent.icon)
                    .catch((error) => error));
            }
            Promise.race([
                Promise.all(loadIcons),
                new Promise((resolve) => setTimeout(resolve, 3000)),
            ]).then((data) => {
                if (this.isDestroyed()) {
                    return;
                }
                this.model.set({
                    state: torrents.length ? 'ready' : 'empty',
                    torrents: torrents,
                });
                this.render();
                this.initializeRows();
                this.finishLoading();
            });
        },

        onBeforeDestroy: function() {
            App.vent.off('torrent:selection:changed', this.selectionChangeHandler);
        },

        getTorrent: function(node) {
            const key = $(node).parents('tr').data('key');
            return this.model.get('torrents')[key];
        },

        openSource: function(e) {
            const torrent = this.getTorrent(e.target);
            if (torrent.source) {
                Common.openOrClipboardLink(e, torrent.source, i18n.__('source link'));
            }
        },

        copyMagnet: function(e) {
            const torrent = this.getTorrent(e.target);
            const magnetLink = torrent.url.split('&tr=')[0] + _.union(decodeURIComponent(torrent.url).replace(/\/announce/g, '').split('&tr=').slice(1), Settings.trackers.forced.toString().replace(/\/announce/g, '').split(',')).map(t => `&tr=${t}/announce`).join('');
            Common.openOrClipboardLink(e, magnetLink, i18n.__('magnet link'));
        },

        addItem: function (e) {
            e.stopPropagation();
            const torrent = this.getTorrent(e.target);
            const download = !$(e.target).hasClass('item-play');
            const cover = $('.poster-box img')[0] ? $('.poster-box img')[0].src : null;
            const backdrop = ($('.backdrop')[0] && $('.backdrop')[0].style ? $('.backdrop')[0].style.backgroundImage : ($('.shb-img')[0] && $('.shb-img')[0].style ? $('.shb-img')[0].style.backgroundImage : null));
            Settings.droppedMagnet = torrent.url || null;
            Settings.droppedMagnetName = torrent.title || null;
            if ($('.meta-container .title').text()) {
                torrent.title = $('.meta-container .title').text();
            } else if ($('.sh-metadata .shm-title').text()) {
                torrent.title = $('.sh-metadata .shm-title').text() + ' - ' + $('.sdoi-number').text() + ' - ' + $('.sdoi-title').text();
            }
            var torrentStart = new Backbone.Model({
                torrent: torrent.url,
                title: this.model.get('select') && !download ? null : torrent.title,
                type: cover ? 'movie' : null,
                cover: cover,
                backdrop: backdrop ? backdrop.replace('url("', '').replace('")', '') : null,
                defaultSubtitle: $('#subs-dropdown .selected-lang')[0] ? $('#subs-dropdown .selected-lang')[0].classList[$('#subs-dropdown .selected-lang')[0].classList.length - 1] : Settings.subtitle_language,
                imdb_id: $('.list .items .item.selected')[0] ? $('.list .items .item.selected')[0].dataset.imdbId : null,
                season: $('.tab-episode.active')[0] ? $('.tab-episode.active')[0].attributes['data-season'].value : null,
                episode: $('.tab-episode.active')[0] ? $('.tab-episode.active')[0].attributes['data-episode'].value : null,
                device: App.Device.Collection.selected
            });
            App.vent.trigger('stream:start', torrentStart, download ? 'downloadOnly' : '' );
            if (download) {
                if (Settings.showSeedboxOnDlInit) {
                    App.previousview = App.currentview;
                    App.currentview = 'Seedbox';
                    App.vent.trigger('seedbox:show');
                    $('.filter-bar').find('.active').removeClass('active');
                    $('#filterbar-seedbox').addClass('active');
                    $('#nav-filters, .right .search').hide();
                } else {
                    $('.notification_alert').stop().text(i18n.__('Download added')).fadeIn('fast').delay(1500).fadeOut('fast');
                }
            }
        },
    });
})(window.App);
