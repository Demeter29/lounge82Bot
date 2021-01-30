const Discord=require("discord.js");
const db=require("./../utils/db.js");
const isHexcolor=require("is-hexcolor");
const config=require("./../config.json");
const bot = require("../utils/bot.js");
const removeEvents=require("./../utils/removeEvents.js");
const { remove } = require("./vip.js");

module.exports= {
    name:"customChannel",
    price:65,
    async execute(reaction, user){
        const balance=await db.query(`SELECT credit FROM user WHERE id=${user.id}`).then(rows => {return rows[0]["credit"]});
        const price=require("./customChannel.js").price;
        if(balance<price){
            reaction.message.channel.send(`<@${user.id}>, you don't have enough credit for this item, you have ${balance} credit but you need ${price}`);
            return;
        }

        reaction.message.channel.send(`<@${user.id}>, what should the name of the channel be? (name cannot contain spaces, use "-" instead)`)
        const filter= (m) => m.author.id==user.id ;
        reaction.message.channel.awaitMessages(filter, {max: 1, time: 30000, errors: ["time"] })
        .then((collected) => {
            let response=collected.first().content.toLowerCase();

            if(response.includes(" ")){
                reaction.message.channel.send(`<@${user.id}>, name cannot contain spaces, use "-" instead, purchase cancelled`);
                return;
            }

            confirm(response)

        })
        .catch((err) => {reaction.message.channel.send(`<@${user.id}>, no answer in 30 sec, purchase cancelled`); console.log(err)});

        async function confirm(channelName){
            let msg= await reaction.message.channel.send(`<@${user.id}>, are you sure you create channel "${channelName}" for 1 week?`)
            msg.react('👍');
            msg.react('👎');

            msg.awaitReactions((reaction, answerUser) => answerUser.id == user.id && (reaction._emoji.name == '👍' || reaction._emoji.name == '👎'),
                { max: 1, time: 30000 }).then(collected => {
                    if (collected.first()._emoji.name == '👍') {
                        msg.channel.send(`<@${user.id}>, success, you created channel "${channelName}" `)
                        createChannel(channelName, user);
                    }
                    else
                        msg.channel.send(`<@${user.id}>, purchase canceled`)
                }).catch((err) => {
                msg.channel.send(`<@${user.id}>, No reaction after 30 seconds, purchase canceled`);
                console.log(err)
                });
        }
        

        async function createChannel(channelName, user){
            const guild=bot.guilds.resolve(config.guildID)

             const customChannel=await guild.channels.create(channelName, {
                type: 'text',
                parent: config.customChannelCategoryID,
                topic: `A custom channel created by ${user}`
            })

            db.query(`INSERT INTO custom_channel VALUES(${customChannel.id}, ${user.id}, FROM_UNIXTIME(${Math.floor(Date.now()/1000)+12}))`)

            removeEvents.push({
                "channelID":customChannel.id,
                "type":"customChannelWarning",
                "event":setTimeout(()=>{require("./customChannel.js").removeWarning(customChannel.id)}, 12000)
            }) 
        }


    },
    async removeWarning(channelID){
        const price=require("./customChannel.js").price;
        const row= await db.query(`SELECT * FROM custom_channel WHERE id=${channelID}`).then(rows =>{ return rows[0]});
        const customChannel= bot.guilds.resolve(config.guildID).channels.cache.get(row["id"]);
        
        const warningMessage= await customChannel.send(`This channel is going to expire in 24 hours, react to this message to extend the channel's life by 1 week for ${price} credit`);
        warningMessage.react("💳");
    },

    async extend(reaction, user){
        const row= await db.query(`SELECT * FROM custom_channel WHERE id=${reaction.message.channel}`).then(rows =>{ return rows[0]});

        const balance=await db.query(`SELECT credit FROM user WHERE id=${user.id}`).then(rows => {return rows[0]["credit"]});
        const price=require("./customChannel.js").price;
        if(balance<price){
            reaction.message.channel.send(`<@${user.id}>, you don't have enough credit for this item, you have ${balance} credit but you need ${price}`);
            return;
        }


        let msg= await reaction.message.channel.send(`<@${user.id}>, are you sure you want to extend this channel's life for ${price}`)
        msg.react('👍');
        msg.react('👎');

        msg.awaitReactions((reaction, answerUser) => answerUser.id == user.id && (reaction._emoji.name == '👍' || reaction._emoji.name == '👎'),
            { max: 1, time: 30000 }).then(collected => {
                if (collected.first()._emoji.name == '👍') {
                    msg.channel.send(`<@${user.id}>, success, you extended it with 1 week`)
                    add1Week();
                }
                else
                    msg.channel.send(`<@${user.id}>, purchase canceled`)
            }).catch((err) => {
            msg.channel.send(`<@${user.id}>, No reaction after 30 seconds, purchase canceled`);
            console.log(err)
            });
    
        async function add1Week(){
            db.query(`UPDATE vip SET expiration_date=DATE_ADD(expiration_date, INTERVAL 1 MINUTE) WHERE channel_id=${reaction.message.channel.id}`);
            
            let expirationDate=row[0]["expiration_unix"];
            const millisecsTilExpiration=(expirationDate*1000)-Date.now();

             
            let index=removeEvents.indexOf(removeEvents.find(element => element.channelID===reaction.message.channel.id))
            clearTimeout(removeEvents[index].event);
            removeEvents.splice(index, 1);
            removeEvents.push({
                "channelID":user.id,
                "type":"customChannel",
                "event":setTimeout(()=>{require("./customChannel.js").remove(user.id)}, millisecsTilExpiration+60000)
            })

        }
        
    }
};