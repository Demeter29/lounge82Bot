const Discord=require("discord.js");
const db=require("./../utils/db.js");
const bot=require("./../utils/bot.js")
const config=require("./../config.json")

module.exports= {
    name:"refresh",
    async execute(message){
        
        const memberIDs=bot.guilds.resolve(config.guildID).members.cache.map(member => member.id);;
        for(memberID of memberIDs){
            const raw=await db.query(`SELECT id FROM user WHERE id=${memberID}`).then(rows=>{return rows})
            if(raw.length===0 && !bot.guilds.resolve(config.guildID).members.resolve(memberID).user.bot){
                db.query(`INSERT INTO user VALUES(${memberID}, 0)`)
            }
        }
        message.channel.send("db refreshed")

    }
};