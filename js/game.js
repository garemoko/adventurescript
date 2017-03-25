class Game {
    constructor(adventure){
        var adventure = adventure;
        var currentNode = adventure.getFirstNode();
        var game = this;
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
                    itemTitles.push(item.title);
                });
                var itemsList = 'You can see the following items: ' + arrayToList(itemTitles);
                $('#game-description').after($('<p id="items" />').text(itemsList));
            }
            else {
                $('#game-description').after($('<p id="items" />').text('There are no items here.'));
            }
        }

        function buildActionButton(action, type) {
            var destinationNode = adventure.getNode(action.destination);
            var button = $('<button type="button" class="btn btn-' + type + '">'+action.label+'</button>');
            if (destinationNode === false){
                button.addClass('disabled');
            }
            else {
                button.click(function(){
                    setScene(destinationNode);
                });
            }
            return button;
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
    }
}