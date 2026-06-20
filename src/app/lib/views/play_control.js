(function(App) {
  'use strict';

  var _this;
  App.View.PlayControl = Marionette.View.extend({
    template: '#play-control-tpl',
    ui: {
      showTorrents: '.show-all-torrents',
      bookmarkIcon: '.favourites-toggle',
      watchedIcon: '.watched-toggle'
    },
    events: {
      'click #watch-now': 'startStreaming',
      'click #watch-trailer': 'playTrailer',
      'click #download-torrent': 'downloadTorrent',
      'click #show-all-torrents': 'showAllTorrents',
      'click .favourites-toggle': 'toggleFavourite',
      'click .playerchoicemenu li a': 'selectPlayer',
      'click .playerchoicehelp': 'showPlayerList',
      'click .playerchoicerefresh': 'refreshPlayerList',
      'click .watched-toggle': 'toggleWatched',
      'mousedown #subs-dropdown': 'hideTooltipsSubs',
      'click .connect-opensubtitles': 'connectOpensubtitles',
      'click #quality-selector': 'hideTooltips',
      'click .torrent-source-status.is-empty': 'retrySources'
    },
    regions: {
      subDropdown: '#subs-dropdown',
      qualitySelector: '#quality-selector',
    },

    initialize: function() {
      _this = this;
      this.views = {};
      var providers = this.model.get('providers');
      var subtitleProvider = App.Config.getProviderForType('subtitle');
      subtitleProvider.detail(
        this.model.get('imdb_id'),
        this.model.get('title')
      );
      this.selectFallbackSource();
      const hasMovieSources = providers.torrent.feature('torrents');
      const hasCollectionSources = Settings.includeTorrentCollectionInMovieSources && torrentCollectionSearch.hasEnabledEngines(Settings);
      this.model.set('showTorrentsMore', hasMovieSources || hasCollectionSources);
      this.model.set('torrentSourceState', hasCollectionSources ? 'loading' : 'empty');
      this.model.set('showTorrents', false);
      this.loadPreferredCollectionSources();

      this.subLangHandler = this.switchSubtitle.bind(this);
      this.torrentListCompleteHandler = this.finishTorrentListLoading.bind(this);
      this.updateSubtitlesHandler = function(subs) {
        this.views.sub.updateLangs(subs);
      }.bind(this);
      this.qualityChangeHandler = function() {
        App.vent.trigger('change:quality', this.model.get('quality'));
      }.bind(this);
      this.subtitleChangeHandler = this.loadSubDropdown.bind(this);
      App.vent.on('sub:lang', this.subLangHandler);
      App.vent.on('torrent:list:complete', this.torrentListCompleteHandler);
      App.vent.on('update:subtitles', this.updateSubtitlesHandler);
      this.model.on('change:quality', this.qualityChangeHandler);
    },

    onAttach: function() {
      this.hideUnused();

      this.loadComponents();
      if (this.model.get('torrentCollectionResults')) {
        this.applyCollectionSources(this.model.get('torrentCollectionResults'));
      }
      this.setUiStates();
      this.model.on('change:subtitle', this.subtitleChangeHandler);
      this.model.set('showTorrents', false);
      this.ui.showTorrents.show();
      this.setSourceControls();

      $('.playerchoicerefresh, .playerchoicehelp').tooltip({html: true, delay: {'show': 800,'hide': 100}});

      if ($('.loading .maximize-icon').is(':visible') || $('.player .maximize-icon').is(':visible')) {
        $('.button:not(#download-torrent, #cancel-button)').addClass('disabled');
        $('#watch-now, #watch-trailer, .playerchoice').prop('disabled', true);
      }
    },

    hasPlayableTorrents: function(torrents) {
      return torrents && Object.keys(torrents).some(function(key) {
        return Boolean(torrents[key]);
      });
    },

    selectFallbackSource: function() {
      var sources = this.flattenLegacySources();
      this.model.set({
        allTorrentSources: torrentCollectionSearch.mergeSources([], sources),
        torrents: {},
        preferredTorrentQuality: null,
        torrentSourceMode: 'none',
      });
    },

    setSourceControls: function() {
      const hasTorrents = this.hasPlayableTorrents(this.model.get('torrents'));
      const hasSources = (this.model.get('allTorrentSources') || []).length > 0;
      const sourceState = this.model.get('torrentSourceState');
      this.$('#watch-now, #download-torrent, #player-chooser, #quality-selector').toggle(hasTorrents && sourceState === 'ready');
      this.$('#show-all-torrents').toggle(hasSources && this.model.get('showTorrentsMore'));
      this.$('#player-chooser .button, #player-chooser .startStreaming, #player-chooser .playerchoice').toggle(hasTorrents && sourceState === 'ready');
      this.$('.torrent-source-status').toggle(sourceState !== 'ready').toggleClass('is-loading', sourceState === 'loading').toggleClass('is-empty', sourceState === 'empty');
      this.$('.torrent-source-status-text').text(sourceState === 'loading' ? i18n.__('Loading torrent sources...') : i18n.__('No playable torrents found') + ' · ' + i18n.__('Retry'));
      if (!hasTorrents) {
        this.model.set('showTorrents', false);
        this.ui.showTorrents.removeClass('active fas fa-spinner fa-spin').html(i18n.__('more...'));
      }
    },

    flattenLegacySources: function() {
      var langs = this.model.get('langs') || {};
      var sources = [];
      Object.keys(langs).forEach(function(language) {
        Object.keys(langs[language] || {}).forEach(function(quality) {
          var torrent = langs[language][quality];
          if (!torrent) {
            return;
          }
          torrent.quality = torrent.quality || quality;
          torrent.audioLanguages = torrent.audioLanguages || [language];
          sources.push(torrent);
        });
      });
      if (!sources.length && this.model.get('torrents')) {
        Object.keys(this.model.get('torrents')).forEach(function(quality) {
          var torrent = this.model.get('torrents')[quality];
          if (torrent) {
            torrent.quality = torrent.quality || quality;
            sources.push(torrent);
          }
        }, this);
      }
      return sources;
    },

    applySources: function(collectionTorrents, fallbackTorrents) {
      if (this.isDestroyed()) {
        return false;
      }
      var mergedSources = torrentCollectionSearch.mergeSources(collectionTorrents, fallbackTorrents || this.flattenLegacySources());
      if (!mergedSources.length) {
        return false;
      }
      var torrents = torrentCollectionSearch.torrentsByQuality(mergedSources);
      var preferredQuality = torrentCollectionSearch.preferredQuality(torrents);
      var preferredTorrent = preferredQuality ? torrents[preferredQuality] : null;
      this.model.set({
        allTorrentSources: mergedSources,
        torrents: torrents,
        preferredTorrentQuality: preferredQuality,
        torrentSourceMode: preferredTorrent ? (preferredTorrent.isTorrentCollection ? 'collection' : 'fallback') : 'none',
        torrentSourceState: preferredQuality ? 'ready' : 'empty',
      });
      const qualitySelector = this.getRegion('qualitySelector').currentView;
      if (qualitySelector) {
        qualitySelector.updateTorrents(this.model.get('torrents'));
      } else if (this.getRegion('qualitySelector').el) {
        this.loadQualitySelector();
      }
      this.setSourceControls();
      return true;
    },

    applyCollectionSources: function(collectionTorrents) {
      return this.applySources(collectionTorrents, this.flattenLegacySources());
    },

    loadPreferredCollectionSources: function() {
      if (!Settings.includeTorrentCollectionInMovieSources || !torrentCollectionSearch.hasEnabledEngines(Settings)) {
        Promise.resolve().then(function() {
          if (!this.isDestroyed()) {
            if (!this.applySources([], this.flattenLegacySources())) {
              this.model.set('torrentSourceState', 'empty');
            }
            this.setSourceControls();
          }
        }.bind(this));
        return;
      }
      const collectionPromise = torrentCollectionSearch.search({
        query: this.model.get('title'),
        category: 'Movies',
        timeout: 8000,
        settings: Settings,
        clients: torrentCollection,
        logger: win,
      });
      this.model.set('torrentCollectionPromise', collectionPromise, {silent: true});
      collectionPromise.then(function(collectionTorrents) {
        this.model.set('torrentCollectionResults', collectionTorrents, {silent: true});
        if (!collectionTorrents.length || this.isDestroyed()) {
          if (!this.isDestroyed() && !this.applySources([], this.flattenLegacySources())) {
            this.selectFallbackSource();
            this.model.set('torrentSourceState', 'empty');
            this.loadQualitySelector();
            this.setSourceControls();
          }
          return;
        }
        this.applyCollectionSources(collectionTorrents);
      }.bind(this)).catch(function(error) {
        win.error('Torrent collection search:', error);
        if (!this.isDestroyed()) {
          if (!this.applySources([], this.flattenLegacySources())) {
            this.selectFallbackSource();
            this.model.set('torrentSourceState', 'empty');
            this.loadQualitySelector();
            this.setSourceControls();
          }
        }
      }.bind(this));
    },

    setQuality: function(torrent, key) {
      _this.model.set('quality', key);
    },

    retrySources: function() {
      if (this.model.get('torrentSourceState') !== 'empty') {
        return;
      }
      this.model.unset('torrentCollectionPromise', {silent: true});
      this.model.unset('torrentCollectionResults', {silent: true});
      this.selectFallbackSource();
      this.model.set('torrentSourceState', 'loading');
      this.setSourceControls();
      this.loadPreferredCollectionSources();
    },

    hideUnused: function() {
      if (!this.hasPlayableTorrents(this.model.get('torrents'))) {
        // no torrents
        $('#watch-now, #player-chooser, #quality-selector').hide();
      }

      if (!this.model.get('trailer')) {
        $('#watch-trailer').hide();
      }
    },

    loadDropdown: function(type, attrs) {
      this.views[type] && this.views[type].destroy();
      this.views[type] = new App.View.LangDropdown({
        model: new App.Model.Lang(Object.assign({ type: type }, attrs))
      });
      var types = type + 'Dropdown';
      this.getRegion(types).show(this.views[type]);
    },

    loadSubDropdown: function() {
      return this.loadDropdown('sub', {
        title: i18n.__('Subtitle'),
        selected: this.model.get('defaultSubtitle'),
        hasNull: true,
        values: this.model.get('subtitle')
      });
    },

    loadQualitySelector: function () {
      var qualitySelector = new App.View.QualitySelector({
        model: new Backbone.Model({
          torrents: this.model.get('torrents'),
          selectCallback: this.setQuality,
          required: [],
          defaultQualityKey: 'movies_default_quality',
          contentModel: this.model,
        }),
      });
      this.getRegion('qualitySelector').show(qualitySelector);
    },

    loadComponents: function() {
      this.loadSubDropdown();
      this.loadQualitySelector();

      // player chooser
      App.Device.Collection.setDevice(Settings.chosenPlayer);
      App.Device.ChooserView('#player-chooser').render();
    },

    setUiStates: function() {
      $('.star-container,.movie-imdb-link,.q720,input,.magnet-link,.source-link,.show-cast').tooltip({
        html: true
      });

      // Bookmarked / not bookmarked
      if (this.model.get('bookmarked')) {
        this.ui.bookmarkIcon.addClass('selected');
      }

      // Seen / Unseen
      if (this.model.get('watched')) {
        this.ui.watchedIcon.addClass('selected');
      }
      // display stars or number
      if (!Settings.ratingStars) {
        $('.star-container').addClass('hidden');
        $('.number-container').removeClass('hidden');
      }

      // switch to default subtitle
      this.switchSubtitle(Settings.subtitle_language);

      this.setTooltips();
    },

    setTooltips: function() {
      // watched state
      var watched = this.model.get('watched');
      var textWatched = watched ? 'Seen' : 'Not Seen';
      var textWatchedHover = watched ? 'Mark as unseen' : 'Mark as Seen';
      this.ui.watchedIcon.text(i18n.__(textWatched));

      this.ui.watchedIcon.hover(
        function() {
          this.ui.watchedIcon.text(i18n.__(textWatchedHover));
        }.bind(this),
        function() {
          this.ui.watchedIcon.text(i18n.__(textWatched));
        }.bind(this)
      );

      // favorite state
      var bookmarked = this.model.get('bookmarked');
      var textBookmarked = bookmarked
        ? 'Remove from bookmarks'
        : 'Add to bookmarks';
      this.ui.bookmarkIcon.text(i18n.__(textBookmarked));
    },

    hideTooltips: function () {
      $('#subs-dropdown .flag.toggle, #quality-selector .qselect').tooltip('hide');
    },

    hideTooltipsSubs: function (e) {
      this.hideTooltips();
      if (e.button === 2) {
        nw.Shell.openExternal('https://www.opensubtitles.com/en/search-all/sublanguageid-all/' + (this.model.get('imdb_id') ? 'id-' + this.model.get('imdb_id').replace('tt', '') : ''));
      }
    },

    connectOpensubtitles: function () {
      App.vent.trigger('movie:closeDetail');
      App.vent.trigger('settings:show');
      $('.settings-container-contain').scrollTop($('.settings-container-contain')[0].scrollHeight);
      $('#opensubtitlesUsername').attr('style', 'border: 2px solid !important; animation: fadeBd .5s forwards, fa-beat 0.8s; margin-left: 9px; --fa-beat-scale: 1.2').focus().focusout(function() { this.removeAttribute('style'); });
    },

    switchSubtitle: function(lang) {
      var subtitles = this.model.get('subtitle') || this.views.sub.values;
      if (subtitles === undefined || subtitles[lang] === undefined) {
        lang = 'none';
      }
      this.subtitle_selected = lang;
    },

    downloadTorrent: function() {
      this.startStreaming('downloadOnly');
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
    },

    startStreaming: function(state) {
      var providers = this.model.get('providers');
      var quality = this.model.get('quality');
      var defaultTorrent = this.model.get('torrents')[quality];

      if (!defaultTorrent || this.model.get('torrentSourceState') !== 'ready') {
        return;
      }

      var filters = {
        quality: quality
      };

      var torrent = providers.torrent.resolveStream
        ? providers.torrent.resolveStream(
            defaultTorrent,
            filters,
            this.model.attributes
          )
        : defaultTorrent;

      var torrentStart = new Backbone.Model({
        imdb_id: this.model.get('imdb_id'),
        torrent: torrent,
        backdrop: this.model.get('backdrop'),
        subtitle: this.model.get('subtitle'),
        defaultSubtitle: this.subtitle_selected,
        title: this.model.get('title'),
        quality: quality,
        lang: null,
        type: 'movie',
        device: App.Device.Collection.selected,
        cover: this.model.get('cover')
      });

      App.vent.trigger('stream:start', torrentStart, state);
    },

    playTrailer: function() {
      var trailer = new Backbone.Model({
        src: this.model.get('trailer'),
        type: 'video/youtube',
        subtitle: null,
        quality: false,
        title: this.model.get('title')
      });
      var tmpPlayer = App.Device.Collection.selected.attributes.id;
      App.Device.Collection.setDevice('local');
      App.vent.trigger('stream:ready', trailer);
      App.Device.Collection.setDevice(tmpPlayer);
    },

    toggleFavourite: function(e) {
      $(
        'li[data-imdb-id="' +
          this.model.get('imdb_id') +
          '"] .actions-favorites'
      ).click();
      this.ui.bookmarkIcon.toggleClass('selected');
      this.model.set('bookmarked', !this.model.get('bookmarked'));
      this.setTooltips();
    },

    toggleWatched: function(e) {
      $(
        'li[data-imdb-id="' + this.model.get('imdb_id') + '"] .actions-watched'
      ).click();
      this.ui.watchedIcon.toggleClass('selected');
      this.model.set('watched', !this.model.get('watched'));
      this.setTooltips();
    },

    toggleQuality: function() {
      _this.getRegion('qualitySelector').currentView.selectNext();
    },

    selectPlayer: function (e) {
      Common.selectPlayer(e, this.model);
    },

    showPlayerList: function () {
      Common.showPlayerList();
    },

    refreshPlayerList: function (e) {
      Common.refreshPlayerList(e);
    },

    showAllTorrents: function() {
      if (this.model.get('torrentListState') === 'loading') {
        return;
      }
      const show = !this.model.get('showTorrents');
      this.model.set('showTorrents', show);
      if (show) {
        this.model.set('torrentListState', 'loading');
        this.ui.showTorrents.addClass('active loading').html('<span class="source-loader source-loader-compact"><span class="source-loader-core"></span></span>');
      } else {
        this.model.set('torrentListState', 'idle');
        this.ui.showTorrents.removeClass('active loading').html(i18n.__('more...'));
      }
      App.vent.trigger('update:torrents', show ? true : null);
    },

    finishTorrentListLoading: function() {
      if (this.isDestroyed() || !this.model.get('showTorrents')) {
        return;
      }
      this.model.set('torrentListState', 'loaded');
      this.ui.showTorrents.removeClass('loading fas fa-spinner fa-spin').addClass('active').html(i18n.__('less...'));
    },

    onBeforeDestroy: function() {
      App.vent.off('sub:lang', this.subLangHandler);
      App.vent.off('torrent:list:complete', this.torrentListCompleteHandler);
      App.vent.off('update:subtitles', this.updateSubtitlesHandler);
      this.model.off('change:quality', this.qualityChangeHandler);
      this.model.off('change:subtitle', this.subtitleChangeHandler);
      Object.values(this.views).forEach(v => v.destroy());
    }
  });
})(window.App);
