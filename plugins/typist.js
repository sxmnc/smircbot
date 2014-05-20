module.exports = function (bot, core, config) {

    core.help.typist = '$typist\n' +
    'Starts a typist game, type the sentence ' +
    'without errors before everyone else to win';
    
    var playing = false;
    var joinPhase = false;
    var playPhase = false;
    var writePhase = false;
    var players = [];
    var timer = 0;
    
    var phrase = '';
    
    function setPhrase() {
        var total = Object.keys(config.typist).length;
        var phrase = config.typist[Math.floor(Math.random() * total)];
        return phrase;
    }
    
    setInterval(function(){
        if (playing && !playPhase) {
            timer++;
            if (timer == 15) {
                bot.sayPub('15 seconds until the game starts');
            } else if (timer == 30) {
                bot.sayPub('game is starting! joining closed, get ready to play!');
                joinPhase = false;
                playPhase = true;
                timer = 0;
            }
        } else if (playPhase && !writePhase) {
            if (timer === 0) {
                bot.sayPub('Phrase in...');
                phrase = setPhrase();
                timer++;
            } else if (timer <= 3) {
                bot.sayPub(timer);
                timer++;
            } else {
                writePhase = true;
                var botPhrase = phrase.replace(' ', '_');
                bot.sayPub(botPhrase);   
            }
        }
    }, 1000);

    var listener = function (nick, text, msg) {
        var command = '$typist ';
        var rest = '$reset';
        
        if (text.indexOf(command) === 0) {
            var arg = text.substring(command.length);
            if (arg === 'start') {
                if (!playing) {
                    playing = true;
                    joinPhase = true;
                    players.push(nick);
                    bot.sayPub('A game of typist has been started! type ' + 
                        ' "$typist join" to join the game!');
                } else {
                    bot.sayPub(nick + ': A game is already in progress, ' + 
                        'type "$typist join", to join the game!');
                }
             } else if (arg == 'join') {
                if (!playing) {
                    bot.sayPub(nick + ': no game in progress, ' + 
                        'type "$typist start", to start a game');
                } else if (!joinPhase) {
                    bot.sayPub(nick + ": it's too late to join!");
                } else {
                    if (players.indexOf(nick) !== -1) {
                        bot.sayPub(nick + ': you are already playing!');
                    } else {   
                        players.push(nick);
                        bot.sayPub(nick + ': has been added to the game!');
                    }
                }
            }
        }
        if (text.indexOf(rest) === 0 || players.length === 0) {
            bot.sayPub(players[0]);
            playing = false;
            joinPhase = false;
            playPhase = false;
            writePhase = false;
            phrase = '';
            timer = 0;
            players = [];
        }
        
        if (writePhase) {
            if (text.indexOf(phrase) === 0 && players.indexOf(nick) !== -1) {
                bot.sayPub(nick + ' wrote the phrase faster!');
                writePhase = false;
                timer = 0;
            } else if (players.indexOf(nick) !== -1) {
                bot.sayPub(nick + ' you are wrong! ' + nick +
                    ' is no longer in the game!');
                players.splice(players.indexOf(nick), 1);
            }
        }
    };
    bot.on('pub', listener);
    
    return function () {
        bot.removeListener('pub', listener);
    };
};
