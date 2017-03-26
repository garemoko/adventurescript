class Game {
    constructor(adventure){

        var game = this;
        var adventure = adventure;
        var currentNode = adventure.getFirstNode();
        var lastGameContents;
        var lastInventoriesContents;

        setScene(currentNode);
        setInventories();

        function setScene(node){
            lastGameContents = $('#game').children().detach();
            $('#game')
                .append($('<h2 id="game-title"/>').text(node.title))
                .append($('<p id="game-description" />').text(node.descripton));

            $.each(node.actions, function(index, action){
                $('#game').append(buildActionButton(action, 'default'));
            });

            if (node.items.length > 0) {
                var itemTitles = [];
                $.each(node.items, function(index, item){
                    var title = item.title;
                    if (Object.keys(item.status).length > 1) {
                        $.each(item.status, function(key, value){
                            if (key !='location') {
                                title = value + ' ' + title;
                            }
                        });
                    }
                    itemTitles.push(title);
                    if (item.actions.length > 0) {
                        $('#game')
                            .append(
                                $('<p id="item-buttons-' + slug(item.title) + '" />')
                                    .text(item.title + ': ')
                                    .addClass('hidden')
                            );
                        $.each(item.actions, function(index, action){
                            var button = buildActionButton(action, 'default');
                            if (button.hasClass('hidden') == false){
                                // Don't even add hidden buttons to the DOM.
                                $('#item-buttons-' + slug(item.title)).append(button);
                                $('#item-buttons-' + slug(item.title)).removeClass('hidden');
                            }
                        });
                    }
                });
                var pluralSuffix = node.items.length == 1 ? '' : "s";
                var itemsList = 'You can see the following item' + pluralSuffix + ': ' + arrayToList(itemTitles);
                $('#game-description').after($('<p id="items" />').text(itemsList));
            }
            else {
                $('#game-description').after($('<p id="items" />').text('There are no items here.'));
            }

            tidyActionButtons('game');
        }
        function setInventories(){
            lastInventoriesContents = $('#inventories').children().detach();
            $.each(adventure.inventoryIds, function(index, inventoryId){
                setInventory(adventure.getNode(inventoryId));
            });
            tidyActionButtons('inventories');
        }

        function setInventory(node){
            $('#inventories').append($('<div id="inventory-' + slug(node.title) + '" />'));
            $('#inventory-' + slug(node.title)).empty()
                .append($('<h2 id="inventory-' + slug(node.title) + '-title"/>').text(node.title));

            if (node.items.length > 0) {
                var itemTitles = [];
                $.each(node.items, function(index, item){
                    var title = item.title;
                    if (Object.keys(item.status).length > 1) {
                        $.each(item.status, function(key, value){
                            if (key !='location') {
                                title = value + ' ' + title;
                            }
                        });
                    }
                    itemTitles.push(title);
                    if (item.actions.length > 0) {
                        $('#inventory-' + slug(node.title))
                            .append(
                                $('<p id="item-buttons-' + slug(item.title) + '" />')
                                    .text(item.title + ': ')
                                    .addClass('hidden')
                            );
                        $.each(item.actions, function(index, action){
                            var button = buildActionButton(action, 'default');
                            if (button.hasClass('hidden') == false){
                                // Don't even add hidden buttons to the DOM.
                                $('#item-buttons-' + slug(item.title)).append(button);
                                $('#item-buttons-' + slug(item.title)).removeClass('hidden');
                            }
                        });
                    }
                });
                var pluralSuffix = node.items.length == 1 ? '' : "s";
                var itemsList = node.descripton.replace(/{s}/g , pluralSuffix) + ': ' + arrayToList(itemTitles);
                $('#inventory-' + slug(node.title) + '-title').after($('<p id="items" />').text(itemsList));
            }
            else {
                $('#inventory-' + slug(node.title) + '-title').after($('<p id="items" />').text('There are no items here.'));
            }
        }

        function buildActionButton(action, type) {
            var button = $('<button data-action-label ="' + slug(action.label) + '" type="button" class="action-btn btn btn-' + type + '">' 
                + action.label +'</button>');

            if (action.conditions.length > 0){
                $.each(action.conditions, function(index, condition){
                    var value = adventure.getProperty(condition.item, condition.property)
                    if (value === null || condition.value.toLowerCase() !== value.toLowerCase()
                    ){
                        button.addClass('hidden');
                        return button
                    }
                });
            }

            if (action.type == 'goto') {
                var destinationNode = adventure.getNode(action.destination);
                if (destinationNode === false){
                    button.addClass('hidden');
                    return button;
                }
                else {
                    button.click(function(){
                        currentNode = destinationNode;
                        setScene(currentNode);
                    });
                }
            }

            if (action.type == 'set'){
                var propertyExists = adventure.propertyExists(action.item, action.property);
                if (propertyExists === false){
                    button.addClass('hidden');
                    return button;
                }
                else {
                    button.click(function(){
                        adventure.setProperty(action.item, action.property, action.value);
                        // Update the scene.
                        setScene(currentNode);
                        // If any items have moved, refresh the inventories. 
                        if (action.property == 'location'){
                            setInventories();
                        }
                    });
                }
            }

            if (action.hasOwnProperty('message')){
                button.click(function(){
                    $('#game .alert').remove();
                    $('#game').append($('<div class="alert alert-success" role="alert"/>').text(action.message));
                });
            }

            return button;
        }

        function tidyActionButtons(parentElementId){
            $('#'+parentElementId).find('.action-btn').each(function(index, actionButton){
                if (
                    $('[data-action-label="' + $(actionButton).attr('data-action-label') + '"]').length > 1 
                    && !$(actionButton).hasClass('duplicate-btn')
                ){
                    $('[data-action-label="' + $(actionButton).attr('data-action-label') + '"]')
                        .not($(actionButton)).each(function(index, duplicateButton){
                            $(duplicateButton).addClass('duplicate-btn');
                            $(duplicateButton).addClass('hidden');
                            $(actionButton).click(function(){
                                $(duplicateButton).click();
                            });
                        });
                }
            });
        }

        function isNodeValid(nodeTitle) {
            node = adventure.getNode(nodeTitle);
            if (node === false){
                return false
            }
            return true;
        }

        // ['item1', 'item2', 'item 3'] returns 'item1, item2 and item3'
        function arrayToList(array){
            return array.join(", ").replace(/, ((?:.(?!, ))+)$/, ' and $1');
        }

        function slug(str) {
            var $slug = '';
            str.trim();
            str = str.replace(/[^a-z0-9-]/gi, '-').
            replace(/-+/g, '-').
            replace(/^-|-$/g, '');
            return str.toLowerCase();
        }
    }
}