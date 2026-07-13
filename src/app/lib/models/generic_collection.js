(function (App) {
    'use strict';

    var getDataFromProvider = function (providers, collection) {
        var filters = Object.assign({}, collection.filter, {page: providers.torrent.page});
        return providers.torrent.fetch(filters)
            .then(function (torrents) {
                // If a new request was started...
                _.each(torrents.results, function (movie) {
                    var id = movie[collection.popid];
                    /* XXX(xaiki): check if we already have this
                     * torrent if we do merge our torrents with the
                     * ones we already have and update.
                     */
                    var model = collection.get(id);
                    if (model) {
                        var ts = model.get('torrents');
                        _.extend(ts, movie.torrents);
                        model.set('torrents', ts);

                        return;
                    }

                    movie.providers = providers;
                });
                return torrents;
            });
    };

    var PopCollection = Backbone.Collection.extend({
        popid: 'imdb_id',
        initialize: function (models, options) {
            this.providers = this.getProviders();

            //XXX(xaiki): this is a bit of hack
            this.providers.torrents.forEach(t => {
                t.hasMore = true;
                t.page = 1;
            });

            options = options || {};
            options.filter = options.filter || new App.Model.Filter();

            this.filter = _.clone(options.filter.attributes);
            this.hasMore = true;
            this.fetchPromise = null;

            Backbone.Collection.prototype.initialize.apply(this, arguments);
        },

        fetch: function () {
            var self = this;

            if (this.state === 'loading') {
                return this.fetchPromise;
            }
            if (!this.hasMore) {
                return Promise.resolve(this);
            }

            this.state = 'loading';
            self.trigger('loading', self);

            var metadata = this.providers.metadata;
            var torrents = this.providers.torrents;

            var torrentPromises = torrents.filter(torrentProvider => (
                !torrentProvider.loading && torrentProvider.hasMore
            )).map((torrentProvider) => {
                var providers = {
                    torrent: torrentProvider,
                    metadata: metadata
                };

                torrentProvider.loading = true;
                return getDataFromProvider(providers, self)
                    .then(function (torrents) {
                        // set state, can't fail
                        if (torrents.results.length !== 0) {
                            torrentProvider.page++;
                        } else {
                            torrentProvider.hasMore = false;
                        }

                        self.add(torrents.results);

                        self.trigger('sync', self);
                        return torrents;
                    }).then(function(result) {
                        torrentProvider.loading = false;
                        return result;
                    }, function(err) {
                        torrentProvider.loading = false;
                        throw err;
                    });
            });

            if (!torrentPromises.length) {
                this.hasMore = false;
                this.state = 'loaded';
                this.trigger('loaded', this, this.state);
                return Promise.resolve(this);
            }

            this.fetchPromise = Promise.all(torrentPromises).then(function() {
                self.hasMore = torrents.some(function(torrentProvider) {
                    return torrentProvider.hasMore;
                });
                self.state = 'loaded';
                self.trigger('loaded', self, self.state);
                return self;
            }).catch(function(err) {
                self.state = 'error';
                self.trigger('loaded', self, self.state);
                win.error('provider error err', err);
                return self;
            }).then(function(result) {
                self.fetchPromise = null;
                return result;
            });

            return this.fetchPromise;
        },

        fetchMore: function () {
            this.fetch();
        }
    });

    App.Model.Collection = PopCollection;
})(window.App);
