const DBConfig = require("../config/db.config.js");
const { Op } = require("sequelize");
const conf = new DBConfig()

const URLConfig = require("../config/url.config.js");
const urlconf = new URLConfig()
const URL_HOST = urlconf.HOST

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

const getCompanyPerfFromYahoo = async (stkSym) =>{
    let retval = {}
    let retfromyahoo = undefined

    const yahooFinance = require('yahoo-finance');
    const yahFormat = require('./yahooformat')

    await yahooFinance.quote({
        symbol: stkSym,
        modules: ['earnings']
    }).then(quote => retfromyahoo = quote)
        .catch(err => console.log("there is an error",err));

    retval = await yahFormat.formatCompanyQtrPerf(retfromyahoo,stkSym)
    console.log("getCompanyPerfFromYahoo",stkSym)
          
    return retval
}

const formatQtrPerfForChart = async (qtrInput) => {
    return qtrInput.map(item => ({xAxis:item.date,yAxis:item.revenue,yAxis1:item.earnings}))
}

const getCompanyQtrPerf = async (stkSym,forChart) =>{
    let retval = {}
    let myCache = require('../servercache/cacheitems')
  
    let cacheVal = myCache.getCache("COMPANY_QTR_PERF" + stkSym)
  
    if (cacheVal){
      retval = cacheVal
      console.log("found cached value for company details",stkSym)
    }else{
        retval = await getCompanyPerfFromYahoo(stkSym)
        console.log("getCompanyQtrPerf",stkSym)
        myCache.setCacheWithTtl("COMPANY_QTR_PERF" + stkSym,retval,60000)
    }
            
    return forChart ? formatQtrPerfForChart(retval) : retval
  }

module.exports = {getCompanyQtrPerf};
