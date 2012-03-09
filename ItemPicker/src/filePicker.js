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

        if (!settings.sourceHeader) {
            var $sourceHeader = $('<div></div>')
                .appendTo($picker);
            settings.sourceHeader = $sourceHeader;
        }

        if (!settings.source) {
            var $source = $('<div></div>')
                .appendTo($picker);
            settings.source = $source;
        }

        if (!settings.targetHeader) {
            var $targetHeader = $('<div></div>')
                .appendTo($picker);
            settings.targetHeader = $targetHeader;
        }

        if (!settings.target) {
            var $target = $('<div></div>')
                .appendTo($picker);
            settings.target = $target;
        }

        var $addAll = $('<div class="itemPicker-addAll"><a href="#">' + settings.addAllLabel + '</a></div>')
            .click(function () {
                settings.source.find('.itemPicker-item').each(function () {
                    var $item = cloneItem($(this), settings);
                    showIconsOnHover($item);
                    settings.target.append($item);
                });
                onTargetUpdated(settings);
                return false;
            });

        var $filterInput = $('<input type="text" />').css('visibility', 'hidden');

        settings.sourceHeader
            .addClass('itemPicker-source-header')
            .append($filterInput)
            .append($addAll);

        settings.source.itemPicker({
            selection: 'none',
            loadContent: settings.loadContent,
            setContent: function ($picker, content, itemFactory, createItem) {
                var $container = $picker;
                $container.empty();

                for (var i = 0; i < content.length; i++) {
                    var item = content[i];

                    var $icons = $('<div class="itemPicker-item-icons"></div>');
                    var $icon = $('<div></div>')
                        .attr('class', 'itemPicker-icon-add')
                        .click(function () {
                            var $item = cloneItem($(this).closest('.itemPicker-item'), settings);
                            settings.target.append($item);
                            onTargetUpdated(settings);
                        });
                    $icons.append($icon);

                    var $itemContainer = $('<div class="itemPicker-item"></div>')
                        .appendTo($container)
                        .data('item', item)
                        .append($icons);
                    showIconsOnHover($itemContainer);
                    itemFactory($itemContainer, item, createItem);
                }
            },
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

        var $removeAll = $('<div class="itemPicker-removeAll"><a href="#">' + settings.removeAllLabel + '</a></div>')
            .click(function () {
                settings.target.find('.itemPicker-item').each(function () {
                    $(this).remove();
                });
                onTargetUpdated(settings);
                return false;
            });

        var $itemsSelected = $('<span>0 ' + settings.itemsSelectedLabel + '</span>');
        settings.itemsSelected = $itemsSelected;

        settings.targetHeader
            .addClass('itemPicker-target-header')
            .append($itemsSelected)
            .append($removeAll);

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

                $item.find('.itemPicker-item-icons').remove();
                var $icons = $('<div class="itemPicker-item-icons"></div>');
                createIconsForSelectedItem($icons, settings);
                showIconsOnHover($item);
                $item.append($icons);
            },
            update: function () {
                onTargetUpdated(settings);
            }
        });
    }

    function onTargetUpdated(settings) {
        var count = settings.target.find('.itemPicker-item').size();
        settings.itemsSelected.text(count + ' ' + settings.itemsSelectedLabel);
        settings.target.change();
    }

    function cloneItem($item, settings) {
        var $cloned = $item.clone();
        var data = $item.data('item');
        $cloned.data('item', data);

        $cloned.find('.itemPicker-item-icons').remove();

        var $icons = $('<div class="itemPicker-item-icons"></div>');
        createIconsForSelectedItem($icons, settings);

        $cloned.append($icons);
        showIconsOnHover($cloned);

        return $cloned;
    }

    function createIconsForSelectedItem($container, settings) {
        var $iconMoveUp = $('<div></div>')
            .attr('class', 'itemPicker-icon-moveUp')
            .click(function () {
                var $item = $(this).closest('.itemPicker-item');
                hideItemIcons($item);
                $item.prev().before($item);
                onTargetUpdated(settings);
            });

        var $iconMoveDown = $('<div></div>')
            .attr('class', 'itemPicker-icon-moveDown')
            .click(function () {
                var $item = $(this).closest('.itemPicker-item');
                hideItemIcons($item);
                $item.next().after($item);
                onTargetUpdated(settings);
            });

        var $iconMoveToTop = $('<div></div>')
            .attr('class', 'itemPicker-icon-moveToTop')
            .click(function () {
                var $item = $(this).closest('.itemPicker-item');
                hideItemIcons($item);
                $item.prependTo(settings.target);
                onTargetUpdated(settings);
            });

        var $iconMoveToBottom = $('<div></div>')
            .attr('class', 'itemPicker-icon-moveToBottom')
            .click(function () {
                var $item = $(this).closest('.itemPicker-item');
                hideItemIcons($item);
                $item.appendTo(settings.target);
                onTargetUpdated(settings);
            });

        var $iconRemove = $('<div></div>')
        .attr('class', 'itemPicker-icon-remove')
        .click(function () {
            $(this).closest('.itemPicker-item').remove();
            onTargetUpdated(settings);
        });

        $container.append($iconMoveUp);
        $container.append($iconMoveDown);
        $container.append($iconMoveToTop);
        $container.append($iconMoveToBottom);
        $container.append($iconRemove);

        return $container;
    }

    function showIconsOnHover($item) {
        $item.hover(function () {
            $(this).find('.itemPicker-item-icons').css('visibility', 'visible');
        }, function () {
            $(this).find('.itemPicker-item-icons').css('visibility', 'hidden');
        });
    }

    function hideItemIcons($item) {
        $item.find('.itemPicker-item-icons').css('visibility', 'hidden');
    }
})(jQuery);
