(function (App){
    'use strict';

    App.View.LangDropdown = Marionette.View.extend({
        template: '#lang-dropdown-tpl',
        ui: {
            selected: '.selected-lang',
        },
        events: {
            'click .lang-dropdown': 'fitDropdownToViewport',
            'click .flag-icon': 'closeDropdown',
        },

        initialize: function () {
            var self = this;

            this.type = this.model.get('type');
            this.selected = this.model.get('selected');
            this.values = this.model.get('values');
            this.hasNull = this.model.get('hasNull');

            if (this.hasNull) {
                this.values = Object.assign({}, {none: undefined}, this.values);
                this.model.set('values', this.values);
                if (!this.selected) {
                    this.selected = 'none';
                }
            } else if (!this.selected && this.values) {
                var values = Object.keys(this.values);
                if (values.length) {
                    this.selected = values.pop();
                }
            }
        },

        onAttach: function () {
            if (this.selected) {
                this.setLang(this.selected);
            }

            this.resizeHandler = this.fitDropdownToViewport.bind(this);
            $(window).off('resize.' + this.cid)
                .on('resize.' + this.cid, this.resizeHandler);
            this.fitDropdownToViewport();
        },

        onBeforeDestroy: function () {
            $(window).off('resize.' + this.cid, this.resizeHandler);
        },

        updateLangs: function (newLangs) {
            if (this.hasNull) {
                newLangs = Object.assign({}, {none: undefined}, newLangs);
            }
            this.model.set('values', newLangs);
            this.values = newLangs;
            this.render();

            if ((Settings.subtitle_language !== 'none') && (Settings.subtitle_language in newLangs)) {
                this.setLang(Settings.subtitle_language);
            }

            $('.tooltipped').tooltip({
                delay: {
                    'show': 800,
                    'hide': 100
                }
            });
        },

        setLang: function (value) {
            this.model.set('selected', value);
            const langClass = value === 'none' ? value : value.substr(0,2);
            this.ui.selected.removeClass().addClass('flag toggle selected-lang').addClass(langClass);
            let title = App.Localization.nativeName(value);
            if (langClass !== 'none' && langClass !== 'en') {
                title += ' (' + App.Localization.name(value).replace(/\(|\)/g, '') + ')';
            }
            this.ui.selected.attr('title', title)
                .tooltip({delay: {show: 800, hide: 100}, html: true}).tooltip('fixTitle');
            this.$('.lang-name').text(this.model.get('title') + ': ' + title);
            App.vent.trigger(this.type + ':lang', value);
        },

        fitDropdownToViewport: function () {
            var toggle = this.$('.lang-dropdown')[0];
            var menu = this.$('.dropdown-menu');

            if (!toggle || !menu.length) {
                return;
            }

            // The menu opens upward. Keep it compact as well as inside the
            // window, then let the language options scroll within the frame.
            var viewportGutter = 16;
            var menuGap = 12;
            var availableHeight = Math.floor(toggle.getBoundingClientRect().top - viewportGutter - menuGap);
            var designMaxHeight = Math.min(480, Math.floor(window.innerHeight * 0.52));
            var maxHeight = Math.min(availableHeight, designMaxHeight);
            menu.css('max-height', Math.max(0, maxHeight) + 'px');
        },

        closeDropdown: function (e) {
            var value = $(e.currentTarget).attr('data-lang');

            if (value) {
                this.setLang(value);
            }
        },
    });
})(window.App);
