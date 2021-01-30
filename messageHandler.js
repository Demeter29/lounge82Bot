const Discord=require("discord.js")
const bot=require("./utils/bot.js")
const db=require("./utils/db.js")
const config=require("./config.json")
let recentlyMessaged=[];

async function handleMessage(message){
    if(recentlyMessaged.includes(message.author.id)) return;

    const users=await db.query(`SELECT id FROM user WHERE id=${message.author.id}`).then(rows => {return rows});
    
    if(users.length===0){
        
        db.query(`INSERT INTO user VALUES(${message.author.id}, 0)`)
    }

    db.query(`UPDATE user SET credit = credit+1 WHERE id=${message.author.id}`);

    recentlyMessaged.push(message.author.id);
    setTimeout(()=>{
        recentlyMessaged.splice(recentlyMessaged.indexOf(message.author.id), 1); 
    }, config.timeout);

}

module.exports=handleMessage;