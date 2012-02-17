(function ($) {
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

    function getSettings($picker) {
        return $picker.data('itemPicker');
    }

    function initializeElement($picker) {
        $picker.css('overflow-y', 'auto');

        var settings = getSettings($picker);
        var fieldName = settings.getFieldName($picker);
        if (!fieldName) throw 'Field name must be set';

        $picker.click(function (e) {
            var $item = $(e.target).closest('.itemPicker-item');
            $item.toggleClass('selected');
        });
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
            var $itemContainer = $('<div class="itemPicker-item"></div>').appendTo($container);
            createItem($itemContainer, content[i]);
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
