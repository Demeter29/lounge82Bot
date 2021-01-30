const Discord=require("discord.js");
const db=require("./../utils/db.js");

module.exports= {
    name:"set",
    async execute(message, args){
        const target=message.mentions.members.first();
        db.query(`UPDATE user SET credit=${args[1]} WHERE id=${target.id}`)

    }
};