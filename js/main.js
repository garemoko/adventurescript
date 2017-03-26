$(function() {
    var debug = new Debug(config.debug);
    var adventureData;
    var adventure;
    var game;

    $.each(config.games, appendAdventureLoadLink);

    if (config.games.length > 0){
        loadAdventureByUrl(
            adventuresFolderUrl(config.games[0].toLowerCase())
        );
    }

    $('#upload-nav').click(function(){
        $('#upload-panel').toggleClass('hidden');
    });

    $('#upload-panel-close span').click(function(){
        $('#upload-panel').addClass('hidden');
    });

    $('#upload').change(function(){
        loadAdventureFromFile(this);
    });

    function loadAdventureFromFile(input){
        if (input.files && input.files[0]) {
            var reader = new FileReader();
            reader.onload = function (e) {
                try {
                    data = window.atob(
                        e.target.result.split("base64,")[1]
                    );
                    loadAdventure(data);
                }
                catch(err) {
                    $('#upload-panel .panel-body .alert').remove();
                    $('#upload-panel .panel-body').append(
                        $('<div class="alert alert-danger" role="alert"/>')
                            .text('Unable to read file. Plesse check the file and try again.')
                    );
                }
            }
            reader.readAsDataURL(input.files[0]);
        }
    }

    function adventuresFolderUrl(gameName){
        return 'adventures/' + gameName + '.adventurescript'
    }

    function loadAdventureByUrl(url){
        $.get({
            url: url,
            cache: false
        })
        .done(loadAdventure)
        .fail(function(jqXHR, textStatus, errorThrown){
            debug.log(textStatus);
        });
    }

    function loadAdventure(data) {
        // Update and reset some things.
        adventureData = data;
        $('.download').attr('href','data:text/plain;base64,' + window.btoa(data));
        $('#upload-panel').addClass('hidden');

        // Load the new adventure.
        adventure = new Adventure(data);
        game = new Game(adventure);

        // Log the parsed adventure to debug.
        debug.log(adventure);
    }

    function appendAdventureLoadLink(index, game){
        var adventureLoadLink = $('<a href="#">' + game + '</a>');
        adventureLoadLink.click(function(){
            loadAdventureByUrl(
                adventuresFolderUrl(game.toLowerCase())
            );
        });
        $('#change-adventure ul').append(
            $('<li></li>').append(adventureLoadLink)
        );
    }
});




