const Discord=require("discord.js");
const db=require("./../utils/db.js");
const isHexcolor=require("is-hexcolor");
const config=require("./../config.json");
const bot = require("../utils/bot.js");
const removeEvents=require("./../utils/removeEvents.js");
const { remove } = require("./vip.js");

module.exports= {
    name:"customColor",
    price:80,
    async execute(reaction, user){
        const balance=await db.query(`SELECT credit FROM user WHERE id=${user.id}`).then(rows => {return rows[0]["credit"]});
        const price=require("./customColor.js").price;

        if(balance<price){
            reaction.message.channel.send(`<@${user.id}>, you don't have enough credit for this item, you have ${balance} credit but you need ${price}`);
            return;
        }

        reaction.message.channel.send(`<@${user.id}>, please send here the hex value of your choosen color, (ex: #1100FF or just 1100FF)`)
        const filter= (m) => m.author.id==user.id ;
        reaction.message.channel.awaitMessages(filter, {max: 1, time: 30000, errors: ["time"] })
        .then((collected) => {
            let response=collected.first().content.toUpperCase();

            if(!response.startsWith("#")) response="#"+response;
            
            if(!isHexcolor(response)){
                reaction.message.channel.send(`<@${user.id}>, this value is invalid`)
                return;
            }
            confirm(response);

        })
        .catch(() => message.channel.send(`<@${user.id}>, no answer in 30 sec, purchase cancelled`));

        async function confirm(hexValue){
            let msg= await reaction.message.channel.send(`<@${user.id}>, are you sure you want to buy this chat color for 1 week? (${hexValue})`)
        msg.react('👍');
        msg.react('👎');

        msg.awaitReactions((reaction, answerUser) => answerUser.id == user.id && (reaction._emoji.name == '👍' || reaction._emoji.name == '👎'),
            { max: 1, time: 30000 }).then(collected => {
                if (collected.first()._emoji.name == '👍') {
                    msg.channel.send(`<@${user.id}>, success, you bought a custom color for 1 week`)
                    giveCustomColor(user, hexValue);
                }
                else
                    msg.channel.send(`<@${user.id}>, purchase canceled`)
            }).catch((err) => {
               msg.channel.send(`<@${user.id}>, No reaction after 30 seconds, purchase canceled`);
               console.log(err)
            });
        }
        

        async function giveCustomColor(user, hexValue){
            const guild=bot.guilds.resolve(config.guildID);
            const customColorRole= await guild.roles.create({
                data: {
                  name: hexValue,
                  color: hexValue,
                  position: guild.roles.cache.find(role => role.name==="Server Booster").position+1
                }
              })

              guild.members.resolve(user.id).roles.add(customColorRole);

              db.query(`INSERT INTO custom_color VALUES(${user.id}, ${customColorRole.id}, FROM_UNIXTIME(${Math.floor(Date.now()/1000)+60}))`)

              removeEvents.push({
                "userID":user.id,
                "type":"vip",
                "event":setTimeout(()=>{require("./customColor.js").remove(user.id)}, 12000)
            })
            
        }

    },
    async remove(userID){
        const row= await db.query(`SELECT * FROM custom_color WHERE user_id=${userID}`).then(rows =>{ return rows[0]});
        const customColorRole= bot.guilds.resolve(config.guildID).roles.cache.get(row["role_id"]);
        
        console.log(customColorRole)
        customColorRole.delete()
        db.query(`DELETE FROM custom_color WHERE user_id=${userID}`)
    }
};