(function(App) {
  'use strict';

  const normalizeChromiumArgs = require('./lib/chromium_args');
  var _this;

  var MainWindow = Marionette.View.extend({
    template: '#main-window-tpl',

    id: 'main-window',

    regions: {
      Header: '#header',
      Content: '#content',
      MovieDetail: '#movie-detail',
      FileSelector: '#file-selector-container',
      Player: '#player',
      Settings: '#settings-container',
      InitModal: '#initializing',
      Disclaimer: '#disclaimer-container',
      About: '#about-container',
      Keyboard: '#keyboard-container',
      Notification: '#notification'
    },

    ui: {
      posterswidth_alert: '.notification_alert'
    },

    events: {
      dragover: 'preventDefault',
      drop: 'preventDefault',
      dragstart: 'preventDefault',
      auxclick: 'backToPreviousView',
      'click .links': 'links'
    },

    lockDesignSettings: function() {
      var lockedSettings = {
        theme: 'Official_-_Dark_theme',
        startScreen: 'Home',
        moviesTabEnable: true,
        seriesTabEnable: true,
        animeTabEnable: false,
        favoritesTabEnable: true,
        watchedTabEnable: true,
        coversShowRating: true,
        alwaysShowBookmarks: false,
        showSeedboxOnDlInit: false,
        expandedSearch: false,
        defaultFilters: 'default',
        watchedCovers: 'fade',
        postersWidth: Settings.postersMinWidth,
        bigPicture: 100,
        moviesUITransparency: '0.65',
        seriesUITransparency: 'medium',
        nativeWindowFrame: nw.App.manifest.window.frame,
        activateTorrentCollection: false,
        activateSeedbox: false,
        separateDownloadsDir: false,
        continueSeedingOnStart: false
      };

      _.each(lockedSettings, function(value, key) {
        Settings[key] = value;
        AdvSettings.set(key, value);
      });
    },

    initialize: function() {
      _this = this;

      _.each(_this.getRegions(), function(element, index) {
        element.on('before:show', function(region, view) {
          if (view.className && App.ViewStack[0] !== view.className) {
            App.ViewStack.push(view.className);
          }
          App.vent.trigger('viewstack:push', view.className);
        });

        element.on('empty', function(region, view) {
          var viewName =
            typeof view !== 'undefined' ? view.className : 'unknown';
          App.ViewStack.pop();
          App.vent.trigger('viewstack:pop', viewName);
          if (!App.ViewStack[0]) {
            App.ViewStack = ['main-browser'];
          }
        });
      });

      // Application events
      App.vent.on('home:list', _.bind(this.homeTabShow, this));
      App.vent.on('movies:list', _.bind(this.movieTabShow, this));
      App.vent.on('shows:list', _.bind(this.tvshowTabShow, this));
      App.vent.on('favorites:list', _.bind(this.showFavorites, this));
      App.vent.on('favorites:render', _.bind(this.renderFavorites, this));
      App.vent.on('watchlist:list', _.bind(this.showWatchlist, this));
      App.vent.on('shows:update', _.bind(this.updateShows, this));
      App.vent.on('shows:init', _.bind(this.initShows, this));

      // Add event to show disclaimer
      App.vent.on('disclaimer:show', _.bind(this.showDisclaimer, this));
      App.vent.on(
        'disclaimer:close',
        _.bind(this.getRegion('Disclaimer').empty, this.getRegion('Disclaimer'))
      );

      // Add event to show about
      App.vent.on('about:show', _.bind(this.showAbout, this));
      App.vent.on(
        'about:close',
        _.bind(this.getRegion('About').empty, this.getRegion('About'))
      );

      // Keyboard
      App.vent.on('keyboard:show', _.bind(this.showKeyboard, this));
      App.vent.on(
        'keyboard:close',
        _.bind(this.getRegion('Keyboard').empty, this.getRegion('Keyboard'))
      );
      App.vent.on('keyboard:toggle', _.bind(this.toggleKeyboard, this));

      // Help
      App.vent.on('help:show', _.bind(this.showHelp, this));
      App.vent.on('help:close',_.bind(this.showHelp, this));
      App.vent.on('help:toggle', _.bind(this.showHelp, this));

      // Movies
      App.vent.on('movie:showDetail', _.bind(this.showMovieDetail, this));
      App.vent.on(
        'movie:closeDetail',
        _.bind(this.closeMovieDetail, this.getRegion('MovieDetail'))
      );

      // Tv Shows
      App.vent.on('show:showDetail', _.bind(this.showShowDetail, this));
      App.vent.on(
        'show:closeDetail',
        _.bind(this.closeShowDetail, this.getRegion('MovieDetail'))
      );

      // Settings events
      App.vent.on('settings:show', _.bind(this.showSettings, this));
      App.vent.on(
        'settings:close',
        _.bind(this.getRegion('Settings').empty, this.getRegion('Settings'))
      );

      App.vent.on('notification:show', _.bind(this.showNotification, this));
      App.vent.on('notification:close', _.bind(this.closeNotification, this));

      App.vent.on(
        'system:openFileSelector',
        _.bind(this.showFileSelector, this)
      );
      App.vent.on(
        'system:closeFileSelector',
        _.bind(
          this.getRegion('FileSelector').empty,
          this.getRegion('FileSelector')
        )
      );

      // Stream events
      App.vent.on('stream:started', _.bind(this.streamStarted, this));
      App.vent.on('stream:ready', _.bind(this.streamReady, this));
      App.vent.on('stream:local', _.bind(this.showPlayer, this));
      App.vent.on('player:close', _.bind(this.showViews, this));
      App.vent.on(
        'player:close',
        _.bind(this.getRegion('Player').empty, this.getRegion('Player'))
      );

      App.vent.on('restartButter', _.bind(this.restartButter, this));

      App.vent.on(
        'updatePostersSizeStylesheet',
        _.bind(this.updatePostersSizeStylesheet, this)
      );
    },

    showSubtitles: function(model) {
      var s = new App.View.Subtitles({
        model: model
      });
      s.render();
    },

    onAttach: function() {
      if (pkJson.window.frame) {
        $('#header').remove();
        $('#' + this.id).addClass('default-frame');
      } else {
        if (os.platform() === 'win32') {
          this.showChildView('Header', new App.View.WindowsTitleBar());
        } else {
          this.showChildView('Header', new App.View.TitleBar());
        }
      }

      // The custom chrome already carries the app identity.
      document.title = ' ';
      win.title = ' ';

      var status = new Backbone.Model({
        status: i18n.__('Init Database'),
        done: 0.05
      });
      // Show loading modal on startup
      var that = this;
      this.showChildView(
        'Content',
        new App.View.InitModal({
          model: status
        })
      );

      App.db.initialize(status).then(function() {
        that.lockDesignSettings();

        status.set({
          status: i18n.__('Create Temp Folder'),
          done: 0.25
        });

        // Create the System Temp Folder. This is used to store temporary data like movie files.
        if (!fs.existsSync(Settings.tmpLocation)) {
          fs.mkdir(Settings.tmpLocation, function(err) {
            if (!err || err.errno === '-4075') {
              //success
            } else {
              Settings.tmpLocation = path.join(
                os.tmpDir(),
                Settings.projectName
              );
              fs.mkdir(Settings.tmpLocation);
            }
          });
        }
        const torrent_cache_dir = path.join(Settings.tmpLocation, 'TorrentCache');
        if (!fs.existsSync(torrent_cache_dir)) {
          fs.mkdir(torrent_cache_dir, function (err) {
            if (err && err.errno !== '-4075') { win.error('error creating TorrentCache dir', err); }
          });
        }

        if (AdvSettings.get('separateDownloadsDir')) {
          if (!fs.existsSync(Settings.downloadsLocation)) {
            fs.mkdir(Settings.downloadsLocation, function(err) {
              if (!err || err.errno === '-4075') {
                //success
              } else {
                Settings.downloadsLocation = path.join(
                  os.tmpDir(),
                  Settings.projectName
                );
                fs.mkdir(Settings.downloadsLocation);
              }
            });
          }
          const torrent_cache_dir2 = path.join(Settings.downloadsLocation, 'TorrentCache');
          if (!fs.existsSync(torrent_cache_dir2)) {
            fs.mkdir(torrent_cache_dir2, function (err) {
              if (err && err.errno !== '-4075') { win.error('error creating Downloads TorrentCache dir', err); }
            });
          }
        }

        status.set({
          status: i18n.__('Set System Theme'),
          done: 0.3
        });

        $('link#theme').attr('href', 'themes/Official_-_Dark_theme.css');

        // focus win. also handles AlwaysOnTop
        App.vent.trigger('window:focus');

        status.set({
          status: i18n.__('Disclaimer'),
          done: 0.5
        });

        // we check if the disclaimer is accepted
        if (!AdvSettings.get('disclaimerAccepted')) {
          that.showDisclaimer();
        }

        status.set({
          status: i18n.__('Done'),
          done: 1
        });

        that.getRegion('InitModal').empty();

        var openScreen = Settings.startScreen === 'Last Open' ? Settings.lastTab : Settings.startScreen;

        switch (openScreen) {
          case 'Home': that.homeTabShow(); break;
          case 'Watchlist': that.showWatchlist(); break;
          case 'Favorites': that.showFavorites(); break;
          case 'Watched': that.showFavorites(); break;
          case 'TV Series': that.tvshowTabShow(); break;
          default:
            that.homeTabShow();
        }

        // do we celebrate events?
        if (AdvSettings.get('events')) {
          $('.events').css('display', 'block');
          if (os.platform() === 'win32' && $('.windows-titlebar .events').css('background-repeat') === 'no-repeat') {
            $('.windows-titlebar .icon').css('opacity', '0');
          }
        }

        // set player from settings
        var players = App.Device.Collection.models;
        for (var i in players) {
          if (players[i].id === AdvSettings.get('chosenPlayer')) {
            App.Device.Collection.setDevice(AdvSettings.get('chosenPlayer'));
          }
        }

        // set native frame & audio passthrough on first run after updating from settings
        if ((Settings.nativeWindowFrame && !nw.App.manifest.window.frame) || (Settings.audioPassthrough && !nw.App.manifest['chromium-args'].includes('resampler'))) {
          let packageJson = jsonFileEditor(`package.json`);
          Settings.nativeWindowFrame ? packageJson.get('window').frame = true : null;
          packageJson.set('chromium-args', normalizeChromiumArgs(packageJson.get('chromium-args'), Settings.audioPassthrough));
          packageJson.save();
          that.restartButter();
        }

        fs.promises.readdir(data_path + '/TorrentCollection/').then(files => {
            if (files.length) {
                const fse = require('fs-extra');
                fse.move(data_path + '/TorrentCollection', App.settings['databaseLocation'] + '/TorrentCollection', { overwrite: true }).then(() => {
                    fse.ensureDir(data_path + '/TorrentCollection');
                }).catch(err => {});
            }
        }).catch(err => {});

        // Focus the window when the app opens
        win.focus();
      });

      // Cancel all new windows (Middle clicks / New Tab)
      win.on('new-win-policy', function(frame, url, policy) {
        policy.ignore();
      });

      this.updatePostersSizeStylesheet(true);
      App.vent.trigger('main:ready');
    },

    movieTabShow: function(e) {
      this.getRegion('Settings').empty();
      this.getRegion('MovieDetail').empty();

      this.showChildView('Content', new App.View.MovieBrowser());
    },

    homeTabShow: function(e) {
      this.getRegion('Settings').empty();
      this.getRegion('MovieDetail').empty();

      this.showChildView('Content', new App.View.HomeBrowser());
    },

    tvshowTabShow: function(e) {
      this.getRegion('Settings').empty();
      this.getRegion('MovieDetail').empty();

      this.showChildView('Content', new App.View.ShowBrowser());
    },

    updateShows: function(e) {
      var that = this;
      App.vent.trigger('show:closeDetail');
      this.showChildView('Content', new App.View.InitModal());
      App.db.syncDB(function() {
        that.getRegion('InitModal').empty();
        that.tvshowTabShow();
        // Focus the window when the app opens
        win.focus();
      });
    },

    // used in app to re-triger a api resync
    initShows: function(e) {
      var that = this;
      App.vent.trigger('settings:close');
      this.showChildView('Content', new App.View.InitModal());
      App.db.initDB(function(err, data) {
        that.getRegion('InitModal').empty();

        if (!err) {
          // we write our new update time
          AdvSettings.set('tvshow_last_sync', +new Date());
        }

        App.vent.trigger('shows:list');
        // Focus the window when the app opens
        win.focus();
      });
    },

    showFavorites: function(e) {
      this.getRegion('Settings').empty();
      this.getRegion('MovieDetail').empty();

      this.showChildView('Content', new App.View.FavoriteBrowser());
    },

    renderFavorites: function(e) {
      this.showChildView('Content', new App.View.FavoriteBrowser());
      App.currentview = 'Favorites';
      $('.right .search').hide();
      $('.filter-bar')
        .find('.active')
        .removeClass('active');
      $('#filterbar-favorites').addClass('active');
    },

    showWatchlist: function(e) {
      this.getRegion('Settings').empty();
      this.getRegion('MovieDetail').empty();

      var that = this;
      $('#nav-filters, .search, .items').hide();
      $('.spinner').show();

      this.showChildView('Content', new App.View.WatchlistBrowser());
    },

    showDisclaimer: function(e) {
      this.showChildView('Disclaimer', new App.View.DisclaimerModal());
    },

    showAbout: function(e) {
      this.showChildView('About', new App.View.About());
    },

    showKeyboard: function(e) {
      this.showChildView('Keyboard', new App.View.Keyboard());
    },

    toggleKeyboard: function(e) {
      if ($('.keyboard-container').length > 0) {
        App.vent.trigger('keyboard:close');
      } else {
        this.showKeyboard();
      }
    },

    showHelp: function(e) {
      nw.Shell.openExternal(Settings.projectBlog + '/FAQ');
    },

    preventDefault: function(e) {
      e.preventDefault();
    },

    showMovieDetail: function(movieModel) {
      this.showChildView(
        'MovieDetail',
        new App.View.MovieDetail({
          model: movieModel
        })
      );
    },

    closeMovieDetail: function(movieModel) {
      _this.getRegion('MovieDetail').empty();
      App.vent.trigger('shortcuts:list');
    },

    // This simply close Movie/Show details and some other views (about) when mouse's back(down) button is used (so kinda like in browsers, it get back)
    backToPreviousView: function(e) {
      // if (App.ViewStack is different of torrent loading or player and mouse's back/down button clicked
      if (e.button === 3 && !App.ViewStack.includes('app-overlay')) {
        Mousetrap.trigger('esc');
      }
    },    

    showNotification: function(notificationModel) {
      this.showChildView(
        'Notification',
        new App.View.Notification({
          model: notificationModel
        })
      );
    },

    closeNotification: function() {
      this.getRegion('Notification').empty();
    },

    showShowDetail: function(showModel) {
      this.showChildView(
        'MovieDetail',
        new App.View.ShowDetail({
          model: showModel
        })
      );
    },

    closeShowDetail: function(showModel) {
      _this.getRegion('MovieDetail').empty();
      App.vent.trigger('shortcuts:list');
    },

    showFileSelector: function(fileModel) {
      App.vent.trigger('about:close');
      App.vent.trigger('stream:stopFS');
      App.vent.trigger('player:close');
      this.showChildView(
        'FileSelector',
        new App.View.FileSelector({
          model: fileModel
        })
      );
    },

    showSettings: function(settingsModel) {
      this.showChildView(
        'Settings',
        new App.View.Settings({
          model: settingsModel
        })
      );
    },

    streamStarted: function(stateModel) {
      // People wanted to keep the active
      // modal (tvshow/movie) detail open when
      // the streaming start.
      //
      // this.getRegion('MovieDetail').empty();
      //
      // uncomment previous line to close it

      this.showChildView(
        'Player',
        new App.View.Loading({
          model: stateModel
        })
      );
    },

    streamReady: function(streamModel) {
      App.Device.Collection.startDevice(streamModel);
    },

    showPlayer: function(streamModel) {
      this.showChildView(
        'Player',
        new App.View.Player({
          model: streamModel
        })
      );
      if ($('.loading .maximize-icon').is(':hidden')) {
        this.getRegion('Content').$el.hide();
        if (this.getRegion('MovieDetail').$el !== undefined) {
          this.getRegion('MovieDetail').$el.hide();
        }
      }
    },

    showViews: function(streamModel) {
      this.getRegion('Content').$el.show();
      try {
        this.getRegion('MovieDetail').$el.show();

        var detailWin = this.getRegion('MovieDetail').el.firstElementChild
          .classList[0];

        if (detailWin === 'shows-container-contain') {
          App.vent.trigger('shortcuts:shows');
          App.ViewStack = [
            'main-browser',
            'shows-container-contain',
            'app-overlay'
          ];
        } else {
          App.vent.trigger('shortcuts:movies');
          App.ViewStack = ['main-browser', 'movie-detail', 'app-overlay'];
        }
      } catch (err) {
        App.ViewStack = ['main-browser', 'app-overlay'];
      }
      $(window).trigger('resize');
    },

    updatePostersSizeStylesheet: function(start) {
      Settings.postersWidth = Settings.postersMinWidth;
      $('#postersSizeStylesheet').remove();
      $('.cover-image').css('width', Settings.postersWidth);
    },

    links: function(e) {
      e.preventDefault();
      nw.Shell.openExternal($(e.currentTarget).attr('href'));
    },

    restartButter: function() {
      var children;
      if (process.platform === 'darwin') {
        children = child.spawn(
          'open',
          ['-n', '-a', process.execPath.match(/^([^\0]+?\.app)\//)[1]],
          { detached: true }
        );
      } else {
        children = child.spawn(process.execPath, [], { detached: true });
      }
      children.unref();
      win.hide();
      nw.App.quit();
    }
  });

  App.View.MainWindow = MainWindow = MainWindow;
})(window.App);
