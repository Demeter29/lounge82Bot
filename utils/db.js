const mysql = require("mysql");
const bot=require("./bot.js")

var con = mysql.createConnection({
    host: "localhost",
    user: "doggi",
    password: "caster-die",
    database: "lounge82"
});

con.connect(err => {
    if(err) throw err;
    console.log("connected to database!");
});

function query(sql, message){
    return new Promise( (resolve) =>{ //no rejection!
        con.query(sql, (err, rows) =>{        
            if(err){
                //bot.guilds.resolve("396780439760797697").members.cache.get("269161773217611786").send("!!ERROR: Probably database error, message sent by user: "+message.member.displayName+"; At channel: "+message.channel+"; Message content: '"+message.content+"'; Error message: "+err);
                console.log(err);       
            }
            else resolve(rows);                               
        });
    });

};

module.exports= {
    query
};