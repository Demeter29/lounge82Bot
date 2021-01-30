const Discord=require("discord.js");
const db=require("./../utils/db.js");
const config=require("./../config.json");
const bot = require("../utils/bot.js");
const removeEvents=require("./../utils/removeEvents.js")

module.exports= {
    name:"vip",
    price:150,
    async execute(reaction, user){
        const balance=await db.query(`SELECT credit FROM user WHERE id=${user.id}`).then(rows => {return rows[0]["credit"]});
        const price=require("./vip.js").price;

        if(balance<price){
            reaction.message.channel.send(`<@${user.id}>, you don't have enough credit for this item, you have ${balance} credit but you need ${price}`);
            return;
        }

        let msg= await reaction.message.channel.send(`<@${user.id}>, are you sure you want to buy 1 week worth of vip?`)
        msg.react('👍');
        msg.react('👎');

        msg.awaitReactions((reaction, answerUser) => answerUser.id == user.id && (reaction._emoji.name == '👍' || reaction._emoji.name == '👎'),
            { max: 1, time: 30000 }).then(collected => {
                if (collected.first()._emoji.name == '👍') {
                    giveVIP(user);
                }
                else
                    msg.channel.send(`<@${user.id}>, purchase canceled`)
            }).catch(() => {
               msg.channel.send(`<@${user.id}>, No reaction after 30 seconds, purchase canceled`);
            });

        async function giveVIP(user){
            const rawVIP= await db.query(`SELECT UNIX_TIMESTAMP(expiration_date) AS expiration_unix FROM vip WHERE user_id = ${user.id}`).then(rows => { return rows});
            if(rawVIP.length===0){
                db.query(`INSERT INTO vip VALUES(${user.id}, FROM_UNIXTIME(${Math.floor(Date.now()/1000)+604800}))`);
                msg.channel.send(`<@${user.id}>, success, you bought 1 week worth of vip`);

                let role = reaction.message.guild.roles.cache.find(role => role.id === config.vipRoleID);
                if (role) reaction.message.guild.members.resolve(user.id).roles.add(role);

                db.query(`UPDATE user SET credit=credit-${price} WHERE id=${user.id}`)
                removeEvents.push({
                    "userID":user.id,
                    "type":"vip",
                    "event":setTimeout(()=>{require("./vip.js").remove(user.id)}, 604800000)
                })
                
            }
            else{
                db.query(`UPDATE vip SET expiration_date=DATE_ADD(expiration_date, INTERVAL 1 WEEK) WHERE user_id=${user.id}`);
                msg.channel.send(`<@${user.id}>, success, you extended your vip by 1 week`);

                let expirationDate=rawVIP[0]["expiration_unix"]+604800;
                const millisecsTilExpiration=(expirationDate*1000)-Date.now();

                db.query(`UPDATE user SET credit=credit-${price} WHERE id=${user.id}`)
                
                let index=removeEvents.indexOf(removeEvents.find(element => element.userID===user.id))
                clearTimeout(removeEvents[index].event);
                removeEvents.splice(index, 1);
                removeEvents.push({
                    "userID":user.id,
                    "type":"vip",
                    "event":setTimeout(()=>{require("./vip.js").remove(user.id)}, millisecsTilExpiration+604800000)
                })
            }
        }

        

    },
    async remove(userID){
        bot.guilds.resolve(config.guildID).members.resolve(userID).roles.remove(config.vipRoleID);
        db.query(`DELETE FROM vip WHERE user_id=${userID}`)

        bot.channels.resolve(config.logChannelID).send(`${bot.guilds.resolve(config.guildID).members.resolve(userID).displayName}'s VIP has been removed`)
    }
};