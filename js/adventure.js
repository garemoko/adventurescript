class Adventure {

    constructor(adventureName, successCallback, errorCallback) {
        var adventure = this;
        adventure.nodes = [];
        var jqxhr = $.get({
            url: 'adventures/' + adventureName + '.adventurescript',
            cache: false
        })
            .done(function(data){
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

            // If the description is also the action, don't remove it from the array.
            if (actionArr.length > 1) {
                action.label = actionArr.shift().trim();
            }
            else {
                action.label = actionArr[0].trim();
            }

            var actionStr = actionArr[0].trim();
            if (actionStr.substring(0, 6) == 'go to '){
                action.type = 'goto';
                action.destination = actionStr.substring(6).trim();
            } 
            else if (actionStr.indexOf('.') > -1){
                action.type = 'set'
                action.item = actionStr.substr(
                    0, 
                    actionStr.indexOf('.')
                ).trim();
                action.property = actionStr.substr(
                    actionStr.indexOf('.') + 1, 
                    actionStr.indexOf('=') - actionStr.indexOf('.') - 1
                ).trim();
                action.value = actionStr.substr(
                    actionStr.indexOf('=') + 1
                ).trim();
            }

            return action;
        }
    }

    getFirstNode() {
        return this.nodes[0];
    }

    // Returns the first matching node.
    getNode(name) {
        var matchedNode = false;
        $.each(this.nodes, function(index, node){
            if (name && node.title.toLowerCase() == name.toLowerCase()){
                matchedNode = node;
                return false;
            };
        });
        return matchedNode;
    }

    // Returns the first matching node index.
    getNodeIndex(name) {
        var matchedNodeIndex = -1;
        $.each(this.nodes, function(index, node){
            if (name && node.title.toLowerCase() == name.toLowerCase()){
                matchedNodeIndex = index;
                return false
            };
        });
        return matchedNodeIndex;
    }

    propertyExists(itemTitle, property){
        return this.setProperty(itemTitle, property);
    }

    // Sets the first matching property.
    setProperty(itemTitle, property, newValue = undefined) {
        var adventure = this,
        propertyFound = false,
        matchedNodeIndex = null,
        matchedItemIndex = null;

        $.each(adventure.nodes, function(nodeIndex, node){
            $.each(node.items, function(itemIndex, item){
                if (itemTitle && item.title.toLowerCase() == itemTitle.toLowerCase()){
                    $.each(item.status, function(key, value){
                        if (property && key.toLowerCase() == property.toLowerCase()){
                            propertyFound = true;
                            if (typeof newValue != 'undefined'){
                                adventure.nodes[nodeIndex].items[itemIndex].status[key] = newValue;
                            }
                            matchedNodeIndex = nodeIndex;
                            matchedItemIndex = itemIndex;
                            return false;
                        };
                    });
                };
                if (propertyFound === true){
                    return false;
                }
            });
            if (propertyFound === true){
                return false;
            }
        });
        if (property === 'location' && propertyFound === true){
            var newNodeIndex = this.getNodeIndex(newValue);
            if (newNodeIndex > -1){
                // Move the item from one node to the other.
                adventure.nodes[newNodeIndex].items.push(
                    adventure.nodes[matchedNodeIndex].items.splice(matchedItemIndex, 1)[0]
                );
            }
        }
        return propertyFound;
    }
}