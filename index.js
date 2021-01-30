const Discord = require("discord.js");
const bot = require("./utils/bot.js")
const db = require("./utils/db.js");
const config=require("./config.json");
const messageHandler=require("./messageHandler.js")
const fs = require('fs');

bot.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    bot.commands.set(command.name, command);
    
}

bot.on("ready", () =>{
    console.log("bot online!")
    bot.user.setActivity('!help', { type: 'WATCHING' });

    const startEvents= require("./utils/startEvents.js");
   
    startEvents();
    
});

bot.on("message", message => {
    if(message.author.bot) return;
    
    if(message.channel.id==config.botCommandsChannelID){
        const args=message.content.slice(config.prefix.length).trim().split(/ +/g);
        const command = args.shift().toLowerCase();

        switch (command){
	    case "help":
                bot.commands.get("help").execute(message);
            break;
            case "store":
                bot.commands.get("store").execute(message);
            break;
            case "inventory":
                bot.commands.get("inventory").execute(message);
            break;
            case "remove":
                if(!message.member.hasPermission("ADMINISTRATOR")) return;
                bot.purchases.get("vip").remove(message.author.id);
            break;
            case "set":
                if(!message.member.hasPermission("ADMINISTRATOR")) return;
                bot.commands.get("set").execute(message, args);
            break;
            case "balance":
                if(!message.member.hasPermission("ADMINISTRATOR")) return;
                bot.commands.get("balance").execute(message, args);
            break;
            case "refresh":
                if(!message.member.hasPermission("ADMINISTRATOR")) return;
                bot.commands.get("refresh").execute(message, args);
            break;
            
    	}
    }
    else{
        messageHandler(message);
    }
});

bot.purchases = new Discord.Collection();
const purchaseFiles = fs.readdirSync('./purchases').filter(file => file.endsWith('.js'));
for (const file of purchaseFiles) {
    const purchase = require(`./purchases/${file}`);
    bot.purchases.set(purchase.name, purchase);
    
}

bot.on("messageReactionAdd", (reaction, user) =>{
    if(!(reaction.message.channel.id==config.botCommandsChannelID || reaction.message.channel.parentID==config.customChannelCategoryID) || reaction.message.author.id!=bot.user.id) return;
    if(user.bot) return;

    switch (reaction._emoji.name){
        case "1️⃣":
            bot.purchases.get("vip").execute(reaction, user);
        break;
        /*case "":
            bot.purchases.get("customChannel").execute(reaction, user);
        break;
        case "💳":
            bot.purchases.get("customChannel").extend(reaction, user);
        break;*/
    }
    reaction.users.remove(user);
});

bot.on("guildMemberAdd", (member) => {
    member.guild.channels.cache.get("729452186223902790").send("<@"+member.id+"> has entered the lounge, welcome!");
    member.roles.add(member.guild.roles.cache.get("729379898539376732"));
    if(member.user.bot) return;
    db.query(`INSERT INTO user VALUES(${member.id}, 0)`)
});


bot.login(config.botToken)