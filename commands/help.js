const Discord=require("discord.js");
const db=require("./../utils/db.js");
const config=require("./../config.json");

module.exports= {
    name:"help",
    async execute(message){
        const helpEmbed = new Discord.MessageEmbed()
        .setTitle("Lounge82 Credit System Help")
        .setDescription("The credit system is our way of rewarding active members with roles and other perks.\n \n The system is very easy: you get points for sending messages in any channel other than <#"+config.botCommandsChannelID+">, there is a delay between messages that can earn you credits so you can't just spam for it, once you get a good amount of them, you can spend it in the store. \n \n Here are a few commands you can use (they only work in <#"+config.botCommandsChannelID+">):")
        .addField("!inventory", "See what you currently own like your balance, roles and things like that.", true)
        .addField("!store", "Here's where you can spend your credits.")
        .setFooter("bot created by Doggi#4758")
        .setColor("#c90afe");

        message.channel.send(helpEmbed)

    }
};