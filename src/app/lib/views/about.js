(function (App) {
    'use strict';

    var marked = require('marked').marked;

    var About = Marionette.View.extend({
        template: '#about-tpl',
        className: 'about',

        ui: {
            success_alert: '.success_alert'
        },

        events: {
            'click .close-icon': 'closeAbout',
            'mousedown #changelog': 'showChangelog',
            'click .changelog-text a': 'openChangelogLink',
            'contextmenu .links': 'copytoclip'
        },

        onAttach: function () {
            Mousetrap.bind(['esc', 'backspace'], function (e) {
                App.vent.trigger('about:close');
            });
            $('.links,#changelog').tooltip();
            $('#movie-detail').hide();
        },

        onBeforeDestroy: function () {
            Mousetrap.unbind(['esc', 'backspace']);
            $('#movie-detail').show();
        },

        closeAbout: function () {
            if ($('.changelog-overlay').css('display') === 'block') {
                this.closeChangelog();
            } else {
                App.vent.trigger('about:close');
            }
        },

        copytoclip: (e) => Common.openOrClipboardLink(e, $(e.target)[0].href, i18n.__('link'), true),

        showChangelog: function (e) {
            if (e.button === 2) {
                Common.openOrClipboardLink(e, (App.git ? App.git.semver : App.settings.version), i18n.__('version number'), true);
            } else {
                fs.readFile('./CHANGELOG.md', 'utf-8', function (err, contents) {
                    if (!err) {
                        $('.changelog-text').html(marked.parse(contents, {
                            headerIds: false,
                            mangle: false
                        }));
                        $('.changelog-overlay').show();
                    } else {
                        nw.Shell.openExternal(Settings.changelogUrl);
                    }
                });
            }
        },

        openChangelogLink: function (e) {
            e.preventDefault();
            nw.Shell.openExternal(e.currentTarget.href);
        },

        closeChangelog: function () {
            $('.changelog-overlay').hide();
        }

    });

    App.View.About = About;
})(window.App);
