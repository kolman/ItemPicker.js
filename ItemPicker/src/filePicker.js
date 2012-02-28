(function ($) {
    var defaults = {
        source: null,
        target: null,
        loadContent: function ($picker, callback) { },
        itemFactory: null
    };

    var methods = {
        init: function (options) {
            var settings = $.extend({}, defaults, options);
            return this.each(function () {
                var $this = $(this);
                $this.data('filePicker', settings);
                initializeElement($this);
            });
        }
    };

    $.fn.filePicker = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.filePicker');
        }
    };

    $.fn.filePicker.originalVal = $.fn.val;
    $.fn.extend({
        val: function (value) {
            var settings = getSettings(this);
            if (settings) {
                if (value == undefined) {
                    var values = settings.target.find('.itemPicker-item').map(function () {
                        return $(this).data('item').Value;
                    }).get();
                    return values;
                }
                throw 'setting value not implemented';
                // return $.fn.itemPicker.originalVal.call(/* setter */, value);
            }
            return $.fn.filePicker.originalVal.apply(this, arguments);
        }
    });

    function getSettings($picker) {
        return $picker.data('filePicker');
    }

    function initializeElement($picker) {
        var settings = getSettings($picker);
        if (!settings.source) {
            var $source = $('<div></div>')
                .appendTo($picker);
            settings.source = $source;
        }

        if (!settings.target) {
            var $target = $('<div></div>')
                .appendTo($picker);
            settings.target = $target;
        }

        settings.source.itemPicker({
            selection: 'none',
            loadContent: settings.loadContent,
            itemFactory: function ($itemContainer, item, createItem) {
                if (settings.itemFactory)
                    settings.itemFactory($itemContainer, item, createItem);
                else
                    createItem($itemContainer, item);
                $itemContainer.draggable({
                    connectToSortable: settings.target,
                    helper: 'clone'
                });
            }
        });

        settings.target.itemPicker({
            selection: 'single',
            loadContent: function ($picker, callback) {
                callback([]);
            }
        }).sortable({
            receive: function (ev, ui) {
                var data = $(ui.sender).data('item');
                var $item = $(this).data().sortable.currentItem;
                $item.data('item', data);
            },
            update: function () {
                $picker.change();
            }
        });
    }
})(jQuery);
