(function (App) {
    'use strict';

    var HomeBrowser = Marionette.View.extend({
        template: '#home-tpl',
        className: 'main-browser home-browser',
        regions: {
            FilterBar: '.filter-bar-region'
        },
        events: {
            'click .home-card': 'showDetail',
            'click .home-favorite': 'toggleFavorite',
            'click .home-watched': 'toggleWatched',
            'click .retry-button': 'loadHome'
        },

        initialize: function () {
            this.model = new Backbone.Model({
                loading: true,
                error: null,
                sections: {
                    spotlight: [],
                    rows: []
                }
            });
            this.movieProvider = App.Config.getProviderForType('movie')[0];
            this.showProvider = App.Config.getProviderForType('tvshow')[0];
            this.itemsById = {};
            this.homeRequestId = 0;
        },

        onAttach: function () {
            App.currentview = 'home';
            this.renderFilterBar();
            this.finishStartup();
            this.loadHome();
        },

        onRender: function () {
            this.renderFilterBar();
        },

        renderFilterBar: function () {
            if (!this.isAttached()) {
                return;
            }
            if (!this.bar || this.bar.isDestroyed()) {
                this.bar = new App.View.FilterBar({
                    model: this.createFilterModel()
                });
            }
            this.showChildView('FilterBar', this.bar);
            this.bar.setActive('Home');
        },

        createFilterModel: function () {
            return new Backbone.Model({
                type: undefined,
                rating: undefined,
                genre: undefined,
                sorter: undefined,
                types: [],
                ratings: [],
                genres: [],
                sorters: []
            });
        },

        finishStartup: function () {
            if (isNaN(startupTime)) {
                return;
            }

            startupTime = 'none';
            if (parseInt(AdvSettings.get('bigPicture'))) {
                if (AdvSettings.get('bigPicture') !== 100) {
                    win.zoomLevel = Math.log(AdvSettings.get('bigPicture') / 100) / Math.log(1.2);
                } else if (!AdvSettings.get('disclaimerAccepted') && ScreenResolution.QuadHD) {
                    AdvSettings.set('bigPicture', 140);
                    win.zoomLevel = Math.log(1.4) / Math.log(1.2);
                }
            } else {
                if (ScreenResolution.QuadHD) {
                    AdvSettings.set('bigPicture', 140);
                    win.zoomLevel = Math.log(1.4) / Math.log(1.2);
                } else {
                    AdvSettings.set('bigPicture', 100);
                }
            }
            App.vent.trigger('app:started');
        },

        serializeData: function () {
            return this.model.toJSON();
        },

        withTimeout: function (promise, message) {
            var timeoutId;
            return Promise.race([
                promise,
                new Promise(function (resolve, reject) {
                    timeoutId = setTimeout(function () {
                        reject(new Error(message));
                    }, 15000);
                })
            ]).then(function (result) {
                clearTimeout(timeoutId);
                return result;
            }, function (err) {
                clearTimeout(timeoutId);
                throw err;
            });
        },

        fetchItems: function (provider, sorter, order) {
            return this.withTimeout(provider.fetch({
                page: 1,
                sorter: sorter,
                order: order || -1
            }), 'Home request timed out: ' + sorter).then(function (data) {
                return data.results || [];
            }).catch(function (err) {
                win.error('home section failed:', sorter, err);
                return [];
            });
        },

        ratingValue: function (item) {
            var rating = item.rating;
            if (rating && typeof rating === 'object') {
                rating = rating.percentage / 10;
            }
            rating = parseFloat(rating);
            return isNaN(rating) ? 0 : rating;
        },

        normalizeItem: function (item) {
            item.title1 = item.title1 || item.title || item.name;
            item.title = item.title1;
            item.poster = item.poster || item.image || item.cover || (item.images && item.images.poster) || 'images/posterholder.png';
            item.backdrop = item.backdrop || (item.images && item.images.fanart) || item.poster;
            item.ratingText = this.ratingValue(item) ? this.ratingValue(item).toFixed(1) : '';
            item.watched = item.type === 'movie' && App.watchedMovies.indexOf(item.imdb_id) !== -1;
            item.faded = item.watched && Settings.watchedCovers === 'fade';
            item.bookmarked = App.userBookmarks.indexOf(item.imdb_id) !== -1;
            item.num_seasons = item.num_seasons || item.number_of_seasons || item.seasons;
            this.itemsById[item.imdb_id] = item;
            return item;
        },

        takeUnique: function (items, limit) {
            var seen = {};
            return items.filter(function (item) {
                if (!item.imdb_id || seen[item.imdb_id]) {
                    return false;
                }
                seen[item.imdb_id] = true;
                return true;
            }).slice(0, limit);
        },

        loadHome: function () {
            var requestId = ++this.homeRequestId;
            this.model.set({
                loading: true,
                error: null
            });
            this.render();

            return Promise.all([
                this.fetchItems(this.movieProvider, 'trending'),
                this.fetchItems(this.movieProvider, 'year'),
                this.fetchItems(this.movieProvider, 'rating'),
                this.fetchItems(this.showProvider, 'trending')
            ]).then(function (results) {
                if (this.isDestroyed() || requestId !== this.homeRequestId) {
                    return;
                }
                var trendingMovies = this.takeUnique(results[0].map(this.normalizeItem.bind(this)), 20);
                var newestMovies = this.takeUnique(results[1].map(this.normalizeItem.bind(this)), 16);
                var topMovies = this.takeUnique(results[2].map(this.normalizeItem.bind(this)), 16);
                var trendingShows = this.takeUnique(results[3].map(this.normalizeItem.bind(this)), 10);
                var topTrending = trendingMovies.slice(0, 10).sort(function (a, b) {
                    return this.ratingValue(b) - this.ratingValue(a);
                }.bind(this));

                if (!trendingMovies.length && !newestMovies.length && !topMovies.length && !trendingShows.length) {
                    this.model.set({
                        loading: false,
                        error: i18n.__('The remote API failed to respond, please try again later.')
                    });
                    this.render();
                    return;
                }

                this.model.set({
                    loading: false,
                    sections: {
                        spotlight: trendingMovies.slice(0, 5),
                        rows: [
                            {
                                title: 'Top 10 Right Now',
                                icon: 'fa-fire',
                                layout: 'ranked-row',
                                numbered: true,
                                items: trendingMovies.slice(0, 10)
                            },
                            {
                                title: 'Best Trending Movies',
                                icon: 'fa-trophy',
                                layout: 'poster-row',
                                numbered: false,
                                items: topTrending
                            },
                            {
                                title: 'New Releases',
                                icon: 'fa-bolt',
                                layout: 'poster-row',
                                numbered: false,
                                items: newestMovies
                            },
                            {
                                title: 'Top Rated Movies',
                                icon: 'fa-star',
                                layout: 'poster-row',
                                numbered: false,
                                items: topMovies
                            },
                            {
                                title: 'Trending Shows',
                                icon: 'fa-tv',
                                layout: 'poster-row',
                                numbered: false,
                                items: trendingShows
                            }
                        ]
                    }
                });
                this.render();
            }.bind(this)).catch(function (err) {
                if (this.isDestroyed() || requestId !== this.homeRequestId) {
                    return;
                }
                win.error('home load failed:', err);
                this.model.set({
                    loading: false,
                    error: i18n.__('The remote API failed to respond, please try again later.')
                });
                this.render();
            }.bind(this));
        },

        showDetail: function (e) {
            e.preventDefault();
            var id = e.currentTarget.getAttribute('data-imdb-id');
            var type = e.currentTarget.getAttribute('data-type');
            var item = this.itemsById[id];
            var provider = type === 'show' ? this.showProvider : this.movieProvider;
            var eventName = type === 'show' ? 'show:showDetail' : 'movie:showDetail';

            if (!item) {
                return;
            }

            item.providers = {
                torrent: provider
            };

            $('.spinner').show();
            return provider.detail(id, item).then(function (data) {
                if (this.isDestroyed()) {
                    $('.spinner').hide();
                    return;
                }
                $('.spinner').hide();
                App.vent.trigger(eventName, new App.Model.Movie(Object.assign(item, data)));
            }.bind(this)).catch(function (err) {
                if (this.isDestroyed()) {
                    $('.spinner').hide();
                    return;
                }
                win.error('home detail failed:', err);
                $('.spinner').hide();
                App.vent.trigger(eventName, new App.Model.Movie(item));
            }.bind(this));
        },

        providerForItem: function (item) {
            return item.type === 'show' ? this.showProvider : this.movieProvider;
        },

        toggleFavorite: function (e) {
            e.preventDefault();
            e.stopPropagation();

            var card = $(e.currentTarget).closest('.home-card');
            var item = this.itemsById[card.data('imdb-id')];
            var icon = $(e.currentTarget);
            var bookmarked;

            if (!item) {
                return;
            }

            bookmarked = !item.bookmarked;
            icon.toggleClass('selected', bookmarked);
            item.bookmarked = bookmarked;

            if (!bookmarked) {
                return Database.deleteBookmark(item.imdb_id).then(function () {
                    return item.type === 'show' ? Database.deleteTVShow(item.imdb_id) : Database.deleteMovie(item.imdb_id);
                }).catch(function (err) {
                    win.error('home favorite remove failed:', err);
                    item.bookmarked = true;
                    icon.addClass('selected');
                });
            }

            var provider = this.providerForItem(item);
            return provider.detail(item.imdb_id, item).then(function (data) {
                var itemData = Object.assign({}, item, data, {
                    provider: provider.name
                });
                return item.type === 'show' ? Database.addTVShow(itemData) : Database.addMovie(itemData);
            }).then(function () {
                return Database.addBookmark(item.imdb_id, item.type);
            }).catch(function (err) {
                win.error('home favorite add failed:', err);
                item.bookmarked = false;
                icon.removeClass('selected');
            });
        },

        toggleWatched: function (e) {
            e.preventDefault();
            e.stopPropagation();

            var card = $(e.currentTarget).closest('.home-card');
            var item = this.itemsById[card.data('imdb-id')];
            var watched;
            var dbCall;
            var appEvent;

            if (!item || item.type !== 'movie') {
                return;
            }

            watched = !item.watched;
            dbCall = watched ? 'markMovieAsWatched' : 'markMovieAsNotWatched';
            appEvent = watched ? 'movie:watched' : 'movie:unwatched';

            return Database[dbCall]({
                imdb_id: item.imdb_id,
                from_browser: true
            }, true).then(function () {
                item.watched = watched;
                $(e.currentTarget).toggleClass('selected', watched);
                card.toggleClass('watched', watched && Settings.watchedCovers === 'fade');
                App.vent.trigger(appEvent, {
                    imdb_id: item.imdb_id
                }, 'seen');
            });
        },

        onBeforeDestroy: function () {
            this.homeRequestId++;
            this.itemsById = {};
            if (this.bar && !this.bar.isDestroyed()) {
                this.bar.destroy();
            }
        }
    });

    App.View.HomeBrowser = HomeBrowser;
})(window.App);
