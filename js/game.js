class Game {
    constructor(adventure){
        var adventure = adventure;
        var currentNode = adventure.getFirstNode();
        var game = this;
        setScene(currentNode);

        function setScene(node){
            
            $('#game').empty()
                .append($('<h2/>').text(node.title))
                .append($('<p/>').text(node.descripton));

            $.each(node.actions, function(index, action){
                $('#game')
                    .append(buildActionButton(action, 'default'));
            });
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
    }
}