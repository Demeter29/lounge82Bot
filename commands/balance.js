const Discord=require("discord.js");
const db=require("./../utils/db.js");

module.exports= {
    name:"balance",
    async execute(message, args){
        const target=message.mentions.members.first()
        message.channel.send("the target's balance is "+await db.query(`SELECT credit FROM user WHERE id=${target.id}`).then(rows =>{ return rows[0]["credit"] })+" credits")

    }
};