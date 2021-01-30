const db=require("./db.js")
const removeEvents=require("./removeEvents.js")

async function startEvents(){
    //VIP
    const VIPRows=await db.query(`SELECT user_id,UNIX_TIMESTAMP(expiration_date) AS expiration_date FROM vip`).then(rows =>{ return rows});
    if(VIPRows.length===0) return;
    for(row of VIPRows){
        const millisecsTilExpiration=(row["expiration_date"]*1000)-Date.now();
        removeEvents.push({
            "userID":row["user_id"],
            "type":"vip",
            "event":setTimeout(()=>{require("./../purchases/vip.js").remove(row["user_id"])}, millisecsTilExpiration)
        })
    }

   /* //custom color
    const customColorRows=await db.query(`SELECT user_id, role_id, UNIX_TIMESTAMP(expiration_date) AS expiration_date FROM custom_color`).then(rows =>{ return rows});
    if(customColorRows.length===0) return;
    for(row of customColorRows){
        const millisecsTilExpiration=(row["expiration_date"]*1000)-Date.now();
        removeEvents.push({
            "userID":row["user_id"],
            "type":"customColor",
            "event":setTimeout(()=>{require("./../purchases/vip.js").remove(row["user_id"])}, millisecsTilExpiration)
        })
    }
	*/
    
}

module.exports=startEvents;