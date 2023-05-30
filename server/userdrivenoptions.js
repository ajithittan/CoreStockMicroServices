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

const saveStockPositions = async (stkPositions,userObj,stkSym) =>{
  try {
    let userId = await getUserDataForOps(userObj)
    await publishMessage("USER_STOCK_POSITIONS",{position:stkPositions,userId:userId,stock:stkSym})
  }catch (error) {
    console.error('Error in saveStockPositions function:', error);
  }
}

const deleteStockPositions = async (stkPositions,userObj,stkSym) =>{
  try {
    let userId = await getUserDataForOps(userObj)
    await publishMessage("DEL_USER_STOCK_POSITIONS",{position:stkPositions,userId:userId,stock:stkSym})
  }catch (error) {
    console.error('Error in deleteStockPositions function:', error);
  }
  
}

const getExistingPortfolioPositions = async (userObj,stkSym) => {
  var initModels = require("../models/init-models"); 
  var models = initModels(sequelize);
  var usrPrflio = models.userportfolio
  let response = []
  try{
    let userId = await getUserDataForOps(userObj)
    await usrPrflio.findAll({where: {
        symbol: {
          [Op.eq] : stkSym
        },iduserprofile: {
          [Op.eq] : userId
        }
      }
    }).then(data => response = data) 
  }catch (err){
      console.log("error in function - getExistingPositions",err)
  }
  return response
}

const getMappedDBValues = (tpAlert,inpVal) =>{
  const URLConfig = require("../config/map.dbvalues.config");
  return URLConfig[tpAlert][inpVal]
}

const getUserNotifications = async (userObj,typeOfNot) => {
  var initModels = require("../models/init-models"); 
  var models = initModels(sequelize);
  var usrnotifications = models.usernotifications
  let response = []
  let whereclause = {}
  try{
    let userId = await getUserDataForOps(userObj)
    if (typeOfNot === "ALL"){
      whereclause = {iduserprofile: {[Op.eq] : userId}}
    }else{
      whereclause = {iduserprofile: {[Op.eq] : userId},
                     notificationtype: {[Op.eq] : getMappedDBValues("ALERT_TYPE",typeOfNot)}}
    }
    await usrnotifications.findAll(
      {
        attributes: ['idusernotifications','notificationtype','symbol','notifcationmessage','readstatus','createdt'],
        where: whereclause
      }
    ).then(data => response = data) 
  }catch (err){
      console.log("error in function - getUserNotifications",err)
  }
  return response
}

const getStockInPortfolio = async (userObj) => {

  let dbresponse = []

  var initModels = require("../models/init-models"); 
  var models = initModels(sequelize);
  var usrStkPos = models.userstockpositions
  let stkMaster = require("./stockmaster")
  let userDetails = await stkMaster.getUserDataForOps(userObj)

  await usrStkPos.findAll({where: {
    iduserprofile: {
      [Op.eq] : userDetails
    }
  }}).then(data => dbresponse=data[0]?.positions || []) 

  return dbresponse

}

module.exports = {getDashboardOptions,saveStockPositions,deleteStockPositions,getExistingPortfolioPositions
                  ,getUserNotifications,getStockInPortfolio}