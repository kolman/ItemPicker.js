(function ($) {
    var defaults = {
        source: null,
        target: null,
        loadContent: function ($picker, callback) { },
        loadDefaultSelection: function ($picker, callback) { return callback([]); },
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
                    var values = settings.targetContent.find('.itemPicker-item').map(function () {
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
            settings.source = $('<div></div>');
        }
        settings.source
            .appendTo($picker)
            .addClass('filePicker-source');

        settings.resizing = false;
        settings.resizer = $('<div></div>')
            .appendTo($picker)
            .addClass('filePicker-resizer')
            .mousedown(function (e) {
                settings.resizeOrigin = e.pageY;
                settings.resizing = true;
            });

        $(document).mousemove(function (e) {
            if (!settings.resizing) return;
            var dY = e.pageY - settings.resizeOrigin;

            // limits minimum size of source and target to 15% of the overall size of the file picker
            var minSizeMultiplier = 0.15;
            if ((settings.source.height() + dY) > ($picker.height() * minSizeMultiplier) && (settings.target.height() - dY) > ($picker.height() * minSizeMultiplier)) {
                settings.resizeOrigin = e.pageY;

                settings.source.height(settings.source.height() + dY);
                settings.target.height(settings.target.height() - dY);
            }
        })
        .mouseup(function () {
            settings.resizing = false;
        });

        if (!settings.target) {
            settings.target = $('<div></div>');
        }
        settings.target
            .appendTo($picker)
            .addClass('filePicker-target');

        var $sourceHeader = $('<div></div>')
            .appendTo(settings.source);
        settings.sourceHeader = $sourceHeader;

        var $sourceContent = $('<div></div>')
            .appendTo(settings.source);
        settings.sourceContent = $sourceContent;
        settings.sourceContent.addClass('filePicker-source-content');

        var $targetHeader = $('<div></div>')
            .appendTo(settings.target);
        settings.targetHeader = $targetHeader;

        var $targetContent = $('<div></div>')
            .appendTo(settings.target);
        settings.targetContent = $targetContent;
        settings.targetContent.addClass('filePicker-target-content');

        var $addAll = $('<div class="filePicker-addAll"><a href="#">' + settings.addAllLabel + '</a></div>')
            .click(function () {
                settings.sourceContent.find('.itemPicker-item').each(function () {
                    var $item = cloneItem($(this), settings);
                    settings.targetContent.append($item);
                });
                onTargetUpdated(settings);
                return false;
            });

        var $filterInput = $('<input type="text" />').css('visibility', 'hidden');

        settings.sourceHeader
            .addClass('filePicker-source-header')
            .append($filterInput)
            .append($addAll);

        if (!settings.dragContainer) {
            settings.dragContainer = settings.source.parent();
        }

        settings.sourceContent.itemPicker({
            selection: 'none',
            loadContent: settings.loadContent,
            setContent: function ($picker, content, itemFactory, createItem) {
                var $container = $picker;
                $container.empty();

                for (var i = 0; i < content.length; i++) {
                    var item = content[i];

                    var $icons = createIconsForSourceItem(settings);

                    var $itemContainer = $('<div class="itemPicker-item"></div>')
                        .appendTo($container)
                        .data('item', item)
                        .append($icons);
                    itemFactory($itemContainer, item, createItem);
                }
            },
            itemFactory: function ($itemContainer, item, createItem) {
                if (settings.itemFactory)
                    settings.itemFactory($itemContainer, item, createItem);
                else
                    createItem($itemContainer, item);
                $itemContainer.draggable({
                    connectToSortable: settings.targetContent,
                    helper: function () {
                        var $clone = $(this).clone();
                        $clone.width(settings.sourceContent.width());
                        return $clone;
                    },
                    appendTo: settings.dragContainer
                });
            }
        });

        var $removeAll = $('<div class="filePicker-removeAll"><a href="#">' + settings.removeAllLabel + '</a></div>')
            .click(function () {
                settings.targetContent.find('.itemPicker-item').each(function () {
                    $(this).remove();
                });
                onTargetUpdated(settings);
                return false;
            });

        var $itemsSelected = $('<span>0 ' + settings.itemsSelectedLabel + '</span>');
        settings.itemsSelected = $itemsSelected;

        settings.targetHeader
            .addClass('filePicker-target-header')
            .append($itemsSelected)
            .append($removeAll);

        settings.targetContent.itemPicker({
            selection: 'single',
            loadContent: settings.loadDefaultSelection,
            setContent: function ($picker, content, itemFactory, createItem) {
                var $container = $picker;
                $container.empty();

                for (var i = 0; i < content.length; i++) {
                    var item = content[i];

                    var $icons = createIconsForSelectedItem(settings);

                    var $itemContainer = $('<div class="itemPicker-item"></div>')
                        .appendTo($container)
                        .data('item', item)
                        .append($icons);
                    itemFactory($itemContainer, item, createItem);
                }
            }
        }).sortable({
            receive: function (ev, ui) {
                var data = $(ui.sender).data('item');
                var $item = $(this).data().sortable.currentItem;
                $item.data('item', data);

                $item.find('.filePicker-item-icons').remove();
                var $icons = createIconsForSelectedItem(settings);
                $item.append($icons);
            },
            update: function () {
                onTargetUpdated(settings);
            },
            appendTo: settings.dragContainer
        });

        fitToSize($picker, settings);
    }

    function onTargetUpdated(settings) {
        var count = settings.targetContent.find('.itemPicker-item').size();
        settings.itemsSelected.text(count + ' ' + settings.itemsSelectedLabel);
        settings.targetContent.change();
    }

    function cloneItem($item, settings) {
        var $cloned = $item.clone();
        var data = $item.data('item');
        $cloned.data('item', data);

        $cloned.find('.filePicker-item-icons').remove();

        var $icons = createIconsForSelectedItem(settings);

        $cloned.append($icons);

        return $cloned;
    }

    function fitToSize($picker, settings) {
        var availableHeight = getAvailableHeight($picker, settings);

        // divide the remaining height between source and target to 66% / 34%
        settings.source.height(availableHeight * 0.66);
        settings.target.height(availableHeight * 0.34);
    }

    function getAvailableHeight($picker, settings) {
        var height = $picker.height() - settings.resizer.height();
        // substract border of source and target elements
        height -= (settings.source.outerHeight() - settings.source.height());
        height -= (settings.target.outerHeight() - settings.target.height());
        return height;
    }

    function createIconsForSelectedItem(settings) {
        var $icons = $('<div class="filePicker-item-icons"></div>');
        function addIcon(className, onClick) {
            appendIcon($icons, settings, className, function ($item) {
                onClick($item);
                onTargetUpdated(settings);
            });
        }
        addIcon('filePicker-icon-moveUp', function ($item) { $item.prev().before($item); });
        addIcon('filePicker-icon-moveDown', function ($item) { $item.next().after($item); });
        addIcon('filePicker-icon-moveToTop', function ($item) { $item.prependTo(settings.targetContent); });
        addIcon('filePicker-icon-moveToBottom', function ($item) { $item.appendTo(settings.targetContent); });
        addIcon('filePicker-icon-remove', function ($item) { $item.remove(); });
        return $icons;
    }

    function createIconsForSourceItem(settings) {
        var $icons = $('<div class="filePicker-item-icons"></div>');
        appendIcon($icons, settings, 'filePicker-icon-add', function ($item) {
            var $clonedItem = cloneItem($item, settings);
            settings.targetContent.append($clonedItem);
            onTargetUpdated(settings);
        });
        return $icons;
    }

    function appendIcon($container, settings, className, onClick) {
        var $icon = $('<div></div>')
            .attr('class', className)
            .click(function () {
                var $item = $(this).closest('.itemPicker-item');
                onClick($item, settings);
            });
        $container.append($icon);
    }

})(jQuery);
