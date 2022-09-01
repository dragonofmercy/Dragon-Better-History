var application = {

    KEYS: {
        A: 65
    },

    /**
     * @type {Date}
     */
    now: new Date(),

    /**
     * Options {Object}
     */
    options: {
        use24HoursFormat: true,
        timeBeforeTitle: false,
        popupNbItems: 10
    },

    /**
     * @type {Date}
     */
    today: null,

    /**
     * @type {boolean}
     */
    isSearching: false,

    /**
     * @type {boolean}
     */
    isLoading: false,

    /**
     * @type {boolean}
     */
    autoFocus: false,

    /**
     * @type {function(_.debounce)}
     */
    trottleSearch: null,

    /**
     * @type {boolean}
     */
    controlPressed: false,

    /**
     * @type {boolean}
     */
    majPressed: false,

    /**
     * @type {JQuery}
     */
    multiSelectLastEntry: null,

    /**
     * Init application
     */
    init: function(){
        let $this = this;

        moment.locale(this.getCurrentLocale());

        this.i18n();
        this.today = new Date(this.now.getFullYear(), this.now.getMonth(), this.now.getDate(), 0, 0, 0, 0);

        chrome.storage.sync.get(function(items){
            $this.options.use24HoursFormat = items.use24HoursFormat === undefined ? true : items.use24HoursFormat;
            $this.options.timeBeforeTitle = items.timeBeforeTitle === undefined ? false : items.timeBeforeTitle;
            $this.options.popupNbItems = items.popupNbItems === undefined ? 10 : items.popupNbItems;

            if($('body.popup').length){
                $this.initPopup();
            } else {
                $this.initMain();
            }
        });
    },

    /**
     * Init popup
     */
    initPopup: function(){
        this.historyGetDay(this.today, this.options.popupNbItems);

        $('#go_history').on('click', function(e){
            e.preventDefault();
            chrome.tabs.create({url: 'chrome://history'});
        });
    },

    /**
     * Init main
     */
    initMain: function(){

        let $this = this;
        this.trottleSearch = _.debounce(this.historySearch, 500);

        if($(window).width() == 360)
        {
            chrome.tabs.create({url: 'chrome://history'});
        }

        $('#go_options').on('click', function(){
             $this.openOptions();
        });

        $('#options_cancel, #options_close').on('click', function(){
            $this.closeOptions();
        });

        $('#options_save').on('click', function(){
            $this.saveOptions();
        });

        $('#search_input').focusin(function(){
            $(this).parent().addClass('focus');
        }).focusout(function(){
            $(this).parent().removeClass('focus');
        }).on('keyup', function(){
            $this.inputSearch();
        });

        $('#search_clear').on('click', function(e){
            e.preventDefault();
            $this.clearSearch();
        });

        this.initCalendar();

        $('#go_today').on('click', function(e){
            e.preventDefault();
            $this.historyGetDay($this.today);
            $this.initCalendar();
        });

        $('.remove-confirmation>#clear_confirm').on('click', function(e){
            e.preventDefault();
            $this.removeSelectedEntires();
        });

        $('.remove-confirmation>#clear_cancel').on('click', function(e){
            e.preventDefault();
            $this.clearSelectedItems();
        });

        $(document).keydown(function(e){
            if(e.which == 17){
                $this.controlPressed = true;
            } else if (e.which == 16){
                $this.majPressed = true;
            } else {
                $this.keypressMulti(e);
            }
        }).keyup(function(e){
            if(e.which == 17){
                $this.controlPressed = false;
            } else if (e.which == 16){
                $this.majPressed = false;
            }
        }).click(function(e){
            if(!$this.is(e.target, 'entry') && !$this.is(e.target, 'remove-confirmation')){
                $this.clearSelectedItems();
            }
        });

        $('#search_input').focus();

        this.historyGetDay(this.today);
    },

    /**
     * Init or reload calendar
     */
    initCalendar: function(){
        let $this = this;

        if($('.sidebar .calendar .ic__container').length){
            $('.sidebar .calendar').remove();
        }

        let calendar = $('<div />').addClass('calendar');
        $('.sidebar .nav .content').prepend(calendar);

        calendar.ionCalendar({
            lang: this.getCurrentLocale(),
            sundayFirst: moment.localeData().firstDayOfWeek() == 0,
            startDate: this.today,
            years: (this.now.getFullYear() - 3) + "-" + this.now.getFullYear(),
            onClick: function(date){
                $this.historyGetDay(new Date(date));
            }
        });
    },

    /**
     * Input search change
     */
    inputSearch: function(){
        let search_query = $('#search_input').val();

        if(search_query.toString() !== ''){
            $('#search_clear').css('display', 'flex');
            this.trottleSearch(search_query);
        } else {
            if(this.isSearching){
                this.clearContent();
                this.historyGetDay(this.today);
            }
            this.trottleSearch.cancel();
            this.isSearching = false;
            $('#search_clear').hide();
        }
    },

    /**
     * Cleanup search
     */
    clearSearch: function(){
        $('#search_input').val('');
        this.inputSearch();
    },

    /**
     * Search inside history
     *
     * @param {string} query
     */
    historySearch: function(query){
        this.isSearching = true;
        this.clearContent();
        this.historyQuery(query, new Date(1970, 1, 1, 0, 0, 0, 0), new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate(), 23, 59, 59), 0);
    },

    /**
     * Gets history for specific day
     *
     * @param {Date} day
     * @param {int} [nb_entries]
     */
    historyGetDay: function(day, nb_entries){
        nb_entries = nb_entries || 0;

        if(day > this.now){
            return;
        }

        let date_start = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 0, 0, 0, 0);
        let date_end = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 23, 59, 59);

        this.clearContent();
        this.historyQuery('', date_start, date_end, parseInt(nb_entries));
    },

    /**
     * Query history
     *
     * @param {string} search
     * @param {Date} start
     * @param {Date} end
     * @param {int} nb_entries
     */
    historyQuery: function(search, start, end, nb_entries){
        let $this = this;
        this.isLoading = true;
        chrome.history.search({ text: search, startTime: start.getTime(), endTime: end.getTime(), maxResults: nb_entries }, function(results){
            $this.historyCallback(results, start, end);
        });
    },

    /**
     * History callback
     *
     * @param {chrome.history.HistoryItem[]} results
     * @param {Date} start
     * @param {Date} end
     * @returns {void}
     */
    historyCallback: function(results, start, end){
        let items = {};
        let count = 0;

        $.each(results, function(k, v){
            let item_date = new Date(v.lastVisitTime);

            if(item_date >= start && item_date <= end){
                let item_key = new Date(item_date.getFullYear(), item_date.getMonth(), item_date.getDate(), 0, 0, 0, 0).getTime().toString();

                if(!items[item_key]){
                    items[item_key] = [];
                }
                items[item_key].push(v);
                count++;
            }
        });

        if($.isEmptyObject(items)){
            items[start.getTime()] = {};
        }

        this.historyFormatDays(items, count);
    },

    /**
     * Format history item
     *
     * @param {object[]} items
     * @param {int} count
     */
    historyFormatDays: function(items, count){
        let $this = this;

        this.clearContent();

        if(this.isSearching){
            this.insertContent('<h1>' + chrome.i18n.getMessage('search_display') + ' "' + $('#search_input').val() + '"</h1>');

            if(count > 0){
                this.insertContent('<div class="search-result">' + chrome.i18n.getMessage('search_found', count.toString()) + '</div>');
            } else {
                this.insertContent('<div class="search-result">' + chrome.i18n.getMessage('search_empty') + '</div>');
                this.isLoading = false;
                return;
            }
        }

        $.each(items, function(k, day){

            let html = '';
            k = k.toString();

            if($('.wrapper .history-container #' + k).length < 1){
                html+= '<div class="history-day" id="' + k + '">';
            }

            html+= '<h2>' + moment(new Date(parseFloat(k.toString()))).format(chrome.i18n.getMessage('date_format')) + '</h2>';

            if(Object.keys(day).length > 0){
                $.each(day, function(z, entry){
                    html+= $this.historyEntryFormat(entry);
                });
            } else {
                html+= '<div class="entry-empty">' + chrome.i18n.getMessage('history_date_empty') + '</div>';
            }

            if($('.wrapper .history-container #' + k).length < 1){
                html+= '</div>';
            }

            $this.insertContent(html);
        });

        this.historyEntriesBind();
        this.isLoading = false;
    },

    /**
     * Format entry
     *
     * @param {chrome.history.HistoryItem} entry
     */
    historyEntryFormat: function(entry){
        let html = '';

        html+= '<div class="entry">';

        if(this.options.timeBeforeTitle){
            html+= '<div class="entry-time">' + moment(new Date(entry.lastVisitTime)).format(this.options.use24HoursFormat ? 'HH:mm' : 'hh:mm A') + '</div>';
        }

        html+= '<img class="entry-icon" src="' + this.getFavicon(entry.url, 2) + '" />';
        html+= '<div class="entry-link"><a href="' + this.escape(entry.url) + '" target="_blank" title="' + this.escape(entry.url) + '">' + this.escape(entry.title ? entry.title : entry.url) + '</a></div>';

        if(!this.options.timeBeforeTitle)
        {
            html+= '<div class="entry-time">' + moment(new Date(entry.lastVisitTime)).format(this.options.use24HoursFormat ? 'HH:mm' : 'hh:mm A') + '</div>';
        }

        html+= '<a class="entry-remove" title="' + chrome.i18n.getMessage('history_remove_single') + '"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 15 15" width="12px" height="12px" slot="before"><path d="M14.1016 1.60156L8.20312 7.5L14.1016 13.3984L13.3984 14.1016L7.5 8.20312L1.60156 14.1016L0.898438 13.3984L6.79688 7.5L0.898438 1.60156L1.60156 0.898438L7.5 6.79688L13.3984 0.898438L14.1016 1.60156Z"></path></svg></a>';
        html+= '</div>';

        return html;
    },

    /**
     * Remove history entry
     *
     * @param {string} url
     * @param {JQuery} sender
     */
    historyEntryDelete: function(url, sender){
        let $this = this;
        chrome.history.deleteUrl({ url: url }, function(){
            let container = sender.parent().parent();
            sender.parent().remove();

            if($('.entry', container).length === 0){
                $this.insertContent('<div class="entry-empty">' + chrome.i18n.getMessage('history_date_empty') + '</div>', container);
            }

            $this.updateConfirm();
        });
    },

    /**
     * Bind entries events
     */
    historyEntriesBind: function(){
        let $this = this;

        $('.history-container .entry>.entry-remove').unbind();
        $('.history-container .entry>.entry-remove').on('click', function(e){
             e.preventDefault();
             $this.historyEntryDelete($(this).parent().find('.entry-link>a').attr('href'), $(this));
        });

        $('.history-container .entry', $('body.main')).unbind();
        $('.history-container .entry', $('body.main')).on('click', function(e){
            if(!$(e.target).is('a') && !$this.is(e.target, 'entry-remove')){
                e.preventDefault();

                if($this.majPressed && $this.multiSelectLastEntry !== null){
                    let tmp = $this.multiSelectLastEntry;
                    document.getSelection().removeAllRanges();

                    if($(this).offset().top > $this.multiSelectLastEntry.offset().top){
                        while($(this).offset().top > tmp.offset().top){
                            tmp = tmp.next();
                            tmp.addClass('selected');
                        }
                    } else {
                        while(tmp.offset().top > $(this).offset().top){
                            tmp = tmp.prev();
                            tmp.addClass('selected');
                        }
                    }
                } else {
                    $this.multiSelectLastEntry = $(this);

                    if($(this).hasClass('selected')){
                        $(this).removeClass('selected');
                    } else {
                        $(this).addClass('selected');
                    }
                }

                $this.updateConfirm();
            }
        });
    },

    /**
     * Keypressed multi action
     *
     * @param {JQueryKeyEventObject} e
     */
    keypressMulti: function(e){
        if($(e.target).attr('id') !== 'search_input'){
            if(this.controlPressed && (e.which == this.KEYS.A)){
                e.preventDefault();
                $('.history-container .entry').addClass('selected');
                this.updateConfirm();
            }
        }

        if(e.which == 46){
            if($('.history-container .entry.selected').length > 0){
                this.removeSelectedEntires();
            }
        }
    },

    /**
     * Display / hide delete confirmation
     */
    updateConfirm: function(){
        let count = $('.history-container .entry.selected').length;

        if(count > 0){
            $('.remove-confirmation').show();
            $('.remove-confirmation>.num').html(count.toString());
        } else {
            $('.remove-confirmation').hide();
        }
    },

    /**
     * Clear selection
     */
    clearSelectedItems: function(){
        $('.history-container .entry.selected').removeClass('selected');
        this.multiSelectLastEntry = null;
        this.updateConfirm();
    },

    /**
     * Remove selected entries
     */
    removeSelectedEntires: function(){
        $('.history-container .entry.selected').each(function(){
            $(this).find('.entry-remove').click();
        });
    },

    /**
     * Insert content in html
     *
     * @param {string} html
     * @param {(JQuery|null)} [context]
     */
    insertContent: function(html, context){
        context = context || null;

        if(context !== null){
            context.append(html)
        } else {
            $('.wrapper .history-container .content').append(html);
        }
    },

    /**
     * Clear html content
     */
    clearContent: function(){
        $('.wrapper .history-container .content').html('');
    },

    /**
     * Replace i18n item in html
     */
    i18n: function(){
        $('[i18n]').each(function(){
            let i18n = $(this).attr('i18n');
            if(i18n.indexOf(':') >= 0){
                let tmp = i18n.split(':');
                $(this).attr(tmp[0], chrome.i18n.getMessage(tmp[1]));
            } else {
                $(this).html(chrome.i18n.getMessage(i18n));
            }
        });
    },

    /**
     * Target is classname or children
     *
     * @param {Element} target
     * @param {string} classname
     * @returns {boolean}
     */
    is: function(target, classname){
        return !!($(target).hasClass(classname) || $(target).parents('.' + classname).length > 0);
    },

    /**
     * Gets current language
     *
     * @returns {string}
     */
    getCurrentLanguage: function(){
        return this.getCurrentLocale().substr(0, 2);
    },

    /**
     * Gets current locale
     *
     * @returns {string}
     */
    getCurrentLocale: function(){
        return chrome.i18n.getMessage('language');
    },

    /**
     * Gets favicon source file
     *
     * @param {string} url
     * @param {int} size
     * @returns {string}
     */
    getFavicon: function(url, size){
        size = size || 1;
        return "chrome://favicon/size/16@" + size + "x/" + this.escape(url);
    },

    /**
     * Open options modal
     *
     * @returns {void}
     */
    openOptions: function(){
        $('#options_field_24hoursformat').prop('checked', this.options.use24HoursFormat);
        $('#options_field_displaytitlebeforetime').prop('checked', this.options.timeBeforeTitle);
        $('#options_field_popupnbitems').val(this.options.popupNbItems);
        $('#modal_options').css('display', 'flex');
    },

    /**
     * Close options modal
     *
     * @param {boolean} reload
     * @returns {void}
     */
    closeOptions: function(reload){
        $('#modal_options').css('display', 'none');
        if(reload){
            location.reload();
        }
    },

    /**
     * Save options
     *
     * @returns {void}
     */
    saveOptions: function(){
        let $this = this;
        chrome.storage.sync.set({
            use24HoursFormat: $('#options_field_24hoursformat').prop('checked'),
            timeBeforeTitle: $('#options_field_displaytitlebeforetime').prop('checked'),
            popupNbItems: $('#options_field_popupnbitems').val()
        }, function(){
            $this.closeOptions(true);
        });
    },

    /**
     * Espace string
     *
     * @param {string} string
     * @returns {string}
     */
    escape: function(string) {
        return string
            .replace(/&/g, "&amp;")
            .replace(/</g, "&#x3C;")
            .replace(/>/g, "&#x3E;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

};

$(function(){
    application.init();
});