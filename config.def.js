module.exports = {
    core: {
        adapter: "discord", // "irc" or "discord"

        // IRC settings (used when adapter is "irc")
        server: "irc.freenode.net",
        port: 6667,
        channel: "#freenode",
        nickname: "nobody",
        realname: "nobody",
        //password: "swordfish",

        // Discord settings (used when adapter is "discord")
        //discord: {
        //    token: "your-bot-token",
        //    guildId: "your-guild-id",
        //    channelId: "your-channel-id",
        //},

        //debug: true,
    },
    //mysql: {
    //    connectionLimit: 10,
    //    host: "localhost",
    //    user: "root",
    //    database: "BigDataAnalytics",
    //},
};
