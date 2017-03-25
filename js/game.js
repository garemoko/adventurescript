class Game {
    constructor(adventure){

        var game = this;
        var adventure = adventure;
        var currentNode = adventure.getFirstNode();
        setScene(currentNode);

        function setScene(node){
            
            $('#game').empty()
                .append($('<h2 id="game-title"/>').text(node.title))
                .append($('<p id="game-description" />').text(node.descripton));

            $.each(node.actions, function(index, action){
                $('#game')
                    .append(buildActionButton(action, 'default'));
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
                            );
                        $.each(item.actions, function(index, action){
                            $('#item-buttons-' + slug(item.title))
                                .append(buildActionButton(action, 'default'));
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
        }

        function buildActionButton(action, type) {
            var button = $('<button type="button" class="btn btn-' + type + '">'+action.label+'</button>');

            if (action.type == 'goto') {
                var destinationNode = adventure.getNode(action.destination);
                if (destinationNode === false){
                    button.addClass('disabled');
                }
                else {
                    button.click(function(){
                        currentNode = destinationNode;
                        setScene(currentNode);
                    });
                }
                return button;
            }

            if (action.type == 'set'){

                var propertyExists = adventure.propertyExists(action.item, action.property);
                if (propertyExists === false){
                    button.addClass('disabled');
                }
                else {
                    button.click(function(){
                        adventure.setProperty(action.item, action.property, action.value);
                        // Update the scene.
                        setScene(currentNode);
                    });
                }
                return button;
            }
            
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