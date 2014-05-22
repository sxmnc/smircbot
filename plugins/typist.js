module.exports = function (bot, core, config) {

  core.help.typist = '$typist\n' +
      'Starts a typist game with "$typist start"\n' +
      'type the sentence without errors before everyone else to win points\n' +
      'type "$typist reset" to end the current game';

  var startingLives = 2;
  var win = 6; // amount of lives you need to win

  var playing = false;
  var joinPhase = false;
  var playPhase = false;
  var writePhase = false;
  var players = [];
  var lives = [];
  var timer = 0;

  var phrase = '';

  function reset() {
    playing = false;
    joinPhase = false;
    playPhase = false;
    writePhase = false;
    phrase = '';
    timer = 0;
    players = [];
  }

  function setPhrase() {
    var total = Object.keys(config.typist).length;
    var phrase = config.typist[Math.floor(Math.random() * total)];
    return phrase;
  }

  function setLives() {
    for (var i = 0; i < players.length; i++) {
      lives[i] = startingLives;
    }
  }

  var typistLoop = setInterval(function () {
    if (playing && !playPhase) {
      timer++;
      if (timer === 15) {
        bot.sayPub('15 seconds until the game starts');
      } else if (timer === 30) {
        bot.sayPub('game is starting! joining closed, get ready to play!');
        joinPhase = false;
        setLives();
        playPhase = true;
        timer = 0;
      }
    } else if (playPhase && !writePhase) {
      if (timer === 0) {
        bot.sayPub('Phrase in...');
        phrase = setPhrase();
        timer++;
      } else if (timer <= 3) {
        bot.sayPub(3 - timer);
        timer++;
      } else {
        writePhase = true;
        bot.sayPub(phrase);
      }
    }
  }, 1000);

  var listener = function (nick, text, msg) {
    var command = '$typist ';

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
      } else if (arg === 'join') {
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
      } else if (arg === 'reset' || players.length === 0) {
        reset();
        bot.sayPub('game as been reset by : ' + nick);
      }
    }

    if (writePhase) {
      if (text.indexOf(phrase) === 0 && players.indexOf(nick) !== -1) {
        bot.sayPub(nick + ' wrote the phrase faster! + 1 life to him!');
        lives[players.indexOf(nick)] += 1;
        bot.sayPub(nick + ' is now at : ' +
            lives[players.indexOf(nick)] + ' lives');
        if (lives[players.indexOf(nick)] >= win) {
          bot.sayPub(nick + ' Wins the game!');
          reset();
        }
        writePhase = false;
        timer = 0;
      } else if (players.indexOf(nick) !== -1) {
        bot.sayPub(nick + ' : you are wrong! ' +
            ' you lose 1 life!');
        lives[players.indexOf(nick)] -= 1;
        if (lives[players.indexOf(nick)] <= 0) {
          players.splice(players.indexOf(nick), 1);
          bot.sayPub(nick + ': you are dead!');
        } else {
          bot.sayPub(nick + ': you have ' + lives[players.indexOf(nick)] +
              ' live(s) left!');
        }
      }
      if (players.length === 0) {
        reset();
        bot.sayPub('every one is dead! no winner :(');
      }
    }
  };
  bot.on('pub', listener);

  return function () {
    bot.removeListener('pub', listener);
    clearInterval(typistLoop);
  };
};
