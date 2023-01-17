const DBConfig = require("../config/db.config.js");
const { Op } = require("sequelize");
const conf = new DBConfig()

const URLConfig = require("../config/url.config.js");
const urlconf = new URLConfig()

const Sequelize = require("sequelize");
const sequelize = new Sequelize(conf.DB, conf.USER, conf.PASSWORD, {
    host: conf.HOST,
    dialect: conf.dialect
  })

  const getUserDataForOps = async (userObj) =>{

    var initModels = require("../models/init-models"); 
    var models = initModels(sequelize);
    var usrtable = models.userprofile
    let userProf = {}
    let userIdreturn = 0
    let myCache = require('../servercache/cacheitems')
    
    try{
      console.log("cached value - ",myCache.getCache("USER_OBJECT_FOR_ID" + userObj.usrid))
      if (myCache.getCache("USER_OBJECT_FOR_ID" + userObj.usrid)){
        userIdreturn = myCache.getCache("USER_OBJECT_FOR_ID" + userObj.usrid).iduserprofile
        console.log("userIdreturn",userIdreturn)
      }
      else{
          await usrtable.findAll({where: {
            uniqueUUID: {
                      [Op.eq] : userObj.usrid
                  }
              },raw : true
          }).then(data => userProf=data)
          userIdreturn = userProf[0].iduserprofile
          myCache.setCacheWithTtl("USER_OBJECT_FOR_ID" + userObj.usrid,userProf[0],120)
      }
    }
    catch(error){
      console.log("error in getUserDataForOps",error)
    }
  
    return userIdreturn
  }  

const getDashboardOptions = async (unqUid) =>{
    let dashboardopts
    try {
        let myCache = require('../servercache/cacheitems')
        dashboardopts = myCache.getCache("DASHBOARD_OPTIONS_" + unqUid)
        console.log("myCache.getStats",myCache.getCacheStats(),dashboardopts)
        if (dashboardopts === undefined){
            dashboardopts = {}  
          var initModels = require("../models/init-models"); 
          var models = initModels(sequelize);
          var usercustomopts = models.usercustomizeoptions

          await usercustomopts.findAll({where: {
            uuid: {
              [Op.eq] : unqUid
            }
          },raw : true
        }).then(data => dashboardopts=data)
          
          console.log("from Db.......",dashboardopts[0])

            if (dashboardopts !== {}){
                let cacheset = myCache.setCacheWithTtl("DASHBOARD_OPTIONS_" + unqUid,dashboardopts,120)
                console.log("Cache was set in function getDashboardOptions...",cacheset)
            }    
        }
        return dashboardopts[0];
      }catch (error) {
        console.error('Error in getDashboardOptions function:', error);
    }
}  

const publishMessage =  async (type,message) =>{
  let pubMsg = {}
   try{
       pubMsg.channel = type
       pubMsg.message = message
       const fetch = require("node-fetch"); 
       await fetch(urlconf.PUB_MESSAGES, {method:'post', body: JSON.stringify(pubMsg), 
                                         headers: { 'Content-Type': 'application/json' }})
       .then(res => console.log(res))
   }
   catch (err){
       console.log("error in publishMessage",err)
   }
}

const saveStockPositions = async (stkPositions,userObj) =>{
  try {
    let userId = await getUserDataForOps(userObj)
    await publishMessage("USER_STOCK_POSITIONS",{position:stkPositions,userId:userId})
  }catch (error) {
    console.error('Error in saveStockPositions function:', error);
}
}

module.exports = {getDashboardOptions,saveStockPositions}