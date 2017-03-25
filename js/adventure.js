class Adventure {

    constructor(adventureName, successCallback, errorCallback) {
        var adventure = this;
        adventure.nodes = []
        var jqxhr = $.get('adventures/' + adventureName + '.adventureScript', function(data){
            var places = data.split(/place:/i);
            addPlaces(places);
            successCallback();
        })
          .fail(errorCallback);

        function addPlaces(places){
            $.each(places, function(index, place){
                var lines = place.split(/\n/);
                addPlace(lines);
            });
        }

        function addPlace(lines){
            var node = {};
            // Get rid of any empty lines before the title.
            while (lines.length > 0 && lines[0].trim() == '') {
                lines.shift();
            }
            if (lines.length == 0){
                return;
            }

            // The first line is the title.
            node.title = lines.shift().trim();

            // The description ends when we have an empty line or an action
            node.descripton = '';
            while (lines.length > 0 && lines[0].substring(0, 2) != '=>' && lines[0].trim() != '') {
                node.descripton += lines.shift().trim() + '\n';
            }

            // Action lines start with '=>'.
            node.actions = [];
            while (lines.length > 0 && lines[0].substring(0, 2) == '=>' && lines[0].trim() != '') {
                node.actions.push(parseAction(lines.shift().split('=>')));
            }

            // Get rid of any empty lines before the next thing.
            node.items = [];
            while (lines.length > 0 ) {
                if (lines[0].trim() == ''){
                    lines.shift();
                }
                else if (lines[0].trim().substring(0, 5).toLowerCase() == 'item:'){
                    var item = {};
                    item.title = lines.shift().trim().substring(5).trim();

                    // Set item location
                    item.status = {
                        location: node.title
                    };
                    // Loop through item status lines
                    while (
                        lines.length > 0 
                        && lines[0].trim().substring(0, 5).toLowerCase() != 'item:' 
                        && lines[0].substring(0, 2) != '=>' 
                        && lines[0].trim() != ''
                    ) {
                        // Handle item status
                        var lineArr = lines.shift().split('=');
                        if (lineArr.length == 2){
                            item.status[lineArr[0].trim()] = lineArr[1].trim();
                        }
                    }
                    // Loop through item action lines
                    item.actions = [];
                    while (
                        lines.length > 0 
                        && lines[0].trim().substring(0, 5).toLowerCase() != 'item:' 
                        && lines[0].substring(0, 2) == '=>' 
                        && lines[0].trim() != ''
                    ) {
                        // Handle item actions
                        item.actions.push(parseAction(lines.shift().split('=>')));
                    }
                    node.items.push(item);
                }
                else {
                    // Unknown value on line; skip it.
                    lines.shift();
                }
            }

            adventure.nodes.push(node);
            return;
        }

        function parseAction(actionArr){
            var action = {};
            actionArr.shift();
            action.label = actionArr.shift().trim();

            $.each(actionArr, function(index, actionStr){
                actionStr = actionStr.trim();
                if (actionStr.substring(0, 6) == 'go to '){
                    action.destination = actionStr.substring(6);
                }
                // todo figure out status modification actions
            });

            return action;
        }
    }

    getFirstNode() {
        return this.nodes[0];
    }

    getNode(name) {
        var matchedNode = false;
        $.each(this.nodes, function(index, node){
            if (node.title.toLowerCase() == name.toLowerCase()){
                matchedNode = node;
            };
        });
        return matchedNode;
    }
}