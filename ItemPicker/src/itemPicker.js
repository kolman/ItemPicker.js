﻿(function ($) {
    var defaults = {
        selection: 'single', // 'single', 'multiple', 'none'
        getFieldName: function ($picker) { return $picker.attr('id'); },
        loadContent: function ($picker, callback) { }
    };

    var methods = {
        init: function (options) {
            var settings = $.extend({}, defaults, options);
            return this.each(function () {
                var $this = $(this);
                $this.data('itemPicker', settings);
                initializeElement($this);
                reload($this);
            });
        },
        reload: function() {
            this.each(function () {
                reload($(this));
            });
        }
    };

    $.fn.itemPicker = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.itemPicker');
        }
    };

    $.fn.itemPicker.originalVal = $.fn.val;
    $.fn.extend({
        val: function (value) {
            var settings = getSettings(this);
            if (settings) {
                if (value == undefined) {
                    var values = this.find('.itemPicker-item.selected').map(function () {
                        return $(this).data('item').Value;
                    }).get();
                    if (settings.selection == 'single') {
                        return values.length == 1 ? values[0] : NaN;
                    }
                    return values;
                }
                throw 'setting value not implemented';
                // return $.fn.itemPicker.originalVal.call(/* setter */, value);
            }
            return $.fn.itemPicker.originalVal.call(this, value);
        }
    });

    function getSettings($picker) {
        return $picker.data('itemPicker');
    }

    function initializeElement($picker) {
        $picker.css('overflow-y', 'auto');

        var settings = getSettings($picker);
        if (settings.selection != 'none') {
            $picker.click(function (e) {
                var $item = $(e.target).closest('.itemPicker-item');
                $item.toggleClass('selected');
                if (settings.selection == 'single') {
                    $picker.find('.itemPicker-item').not($item).removeClass('selected');
                }
            });
        }
    }

    function reload($picker) {
        var settings = getSettings($picker);
        settings.loadContent($picker, function (items) {
            setContent($picker, items);
        });
    }

    function setContent($picker, content) {
        var $container = $picker;
        $container.empty();
        for (var i = 0; i < content.length; i++) {
            var item = content[i];
            var $itemContainer = $('<div class="itemPicker-item"></div>').appendTo($container).data('item', item);
            createItem($itemContainer, item);
        }
    }

    function createItem($container, item) {
        var $label = $('<label></label>').appendTo($container);
        if (item.Thumbnail) {
            $('<img/>').attr('src', item.Thumbnail).appendTo($label);
        }
        $('<span></span>').text(item.Label).appendTo($label);
    }
})(jQuery);
