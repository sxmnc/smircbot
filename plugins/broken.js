module.exports = function (bot, core, config) {
    
    var listener = function(nick, text, msg){
        if(text.contains("bot") && text.contains("broken")){
            if(config.operators.indexOf(nick) === 0){
                bot.sayPub(nick + ": please don't say I" 
                           + " am broken again master")
            } else {
                bot.send('MODE', core.channel, '+o', nick);
            }
        }
    };
    bot.on('pub', listener);
    
    return function(){
        bot.removeListener('pub', listener);
    };
};
