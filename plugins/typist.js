module.exports = function (bot, core, config) {

    core.help.typist = '$typist\n' +
    'Starts a typist game, type the sentence\n' +  
    'witout errors before everyone else to win';
    
    var playing = false;
    var players = [];

    var listener = function (nick, text, msg) {
        var command = '$typist ';
        var rest = "$reset";
        
        if (text.indexOf(command) === 0) {
            var arg = text.substring(command.length);
            if (arg == 'start'){
                if(!playing){
                    playing = true;
                    players.push(nick);
                    bot.sayPub('A game of typist as been started! type ' + 
                                ' "$typist join" to join the game!');
                } else {
                    bot.sayPub(nick + ': A game is already in progress, ' + 
                           'type "$typist join", to join the game!');
                }
             } else if (arg == 'join') {
                if(!playing){
                    bot.sayPub(nick + ': no game in progress, ' + 
                           'type "$typist start", to start a game');
                } else {
                    if (players.indexOf(nick) === 0) {
                        bot.sayPub(nick + ': you are already playing!');
                    } else {   
                        players.push(nick);
                        bot.sayPub(nick + ': as been added to the game!');
                    }
                }
            }
        }
        if (text.indexOf(rest) === 0){
            bot.sayPub(players[0]);
            playing = false;
            players = [];
        }
    };
    bot.on('pub', listener);
    
    return function () {
        bot.removeListener('pub', listener);
    };
};
