$(function() {
    var debug = new Debug(config.debug);
    
    var adventure = new Adventure(config.game, function(){
        debug.log(adventure);
        var game = new Game(adventure);
    }, function(jqXHR, textStatus, errorThrown){
        debug.log(textStatus);
    });
});




