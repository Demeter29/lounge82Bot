const Discord=require("discord.js");
const db=require("./../utils/db.js");

module.exports= {
    name:"inventory",
    async execute(message){
       
        const infoEmbed = new Discord.MessageEmbed()
        .setAuthor(message.member.displayName)
        .setTitle("Lounge82 Inventory")
        .setThumbnail(message.author.avatarURL())
        .addField("Balance", await await getCredit()+" credits")
        .addField("VIP", await getExpirationDate())
        .setColor("#c90afe");


        let msgEmbed= await message.channel.send(infoEmbed);

        
        async function getCredit(){
            
            return await db.query(`SELECT credit FROM user WHERE id=${message.author.id}`).then(rows => {return rows[0]["credit"]})
        }
        async function getExpirationDate(){
            
            const rows= await db.query(`SELECT expiration_date FROM vip WHERE user_id=${message.author.id}`).then(rows => {return rows})
            if(rows.length===0){
                return "no VIP active";
            }
            else{
                return  "Expiration Date: "+rows[0]["expiration_date"].toUTCString();
            }
        }

    }
};