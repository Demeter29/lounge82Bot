const Discord=require("discord.js");
const db=require("./../utils/db.js");

module.exports= {
    name:"store",
    async execute(message){
       
        const infoEmbed = new Discord.MessageEmbed()
        .setTitle("Lounge82 Credit Store")
        .setThumbnail("https://cdn.discordapp.com/attachments/396780567628087296/797479971064905758/Lounge82.png")
        .addField(":one: VIP role (1 week)", " you will get the VIP role which has a nice purple color \r\n `150 Credit`")
        .addField(":two: Create a channel on the server (stays for 1 week)", "THIS PURCHASE IS NOT YET ADDED, it will be in 1-2 weeks, store up your credits till then ;) \r\n `900 Credit`") 
        //.addField(":three:", "other purchases will be later added") 
        
        .setFooter(`to buy something click on the number below of the item that you want to purchase`)
        .setColor("#c90afe");


        let msgEmbed= await message.channel.send(infoEmbed);

        msgEmbed.react("1️⃣")
        msgEmbed.react("2️⃣")
        
        async function getCredit(){
            
            return await db.query(`SELECT credit FROM user WHERE id=${message.author.id}`).then(rows => {return rows[0]["credit"]})
        }

    }
};