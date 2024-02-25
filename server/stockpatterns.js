const DBConfig = require("../config/db.config.js");
const { Op } = require("sequelize");
const conf = new DBConfig()

const Sequelize = require("sequelize");
const sequelize = new Sequelize(conf.DB, conf.USER, conf.PASSWORD, {
    host: conf.HOST,
    dialect: conf.dialect
  })

const getAllStockPatterns = async (limitOfrecords) =>{
  let initModels = require("../models/init-models"); 
  let models = initModels(sequelize);
  let stkPatterns = models.stockpatternsformed
  let dbresponse = []
  let myCache = require('../servercache/cacheitems')
  let cacheVal = myCache.getCache("STOCK_PATTERNS_" + limitOfrecords)

  if (cacheVal){
    dbresponse = cacheVal
  }
  else{
    await stkPatterns.findAll({limit:limitOfrecords,order: [['idstockpatternsformed', 'DESC']]}).then(data => dbresponse=data) 
    myCache.setCacheWithTtl("STOCK_PATTERNS_" + limitOfrecords,dbresponse,36000)  
  }
  return dbresponse
}

const getLatestDatesStockPatterns = async (limitdays) =>{
  let initModels = require("../models/init-models"); 
  let models = initModels(sequelize);
  let stkPatterns = models.stockpatternsformed
  let dbresponse = []
  let myCache = require('../servercache/cacheitems')
  let cacheVal = myCache.getCache("LAST_DT_STK_PTRNS_" + limitdays)

  if (cacheVal){
    dbresponse = cacheVal
  }
  else{
    await stkPatterns.findAll({attributes:['date',[sequelize.fn('COUNT', sequelize.col('idstockpatternsformed')), 'patterncount']],group: ['date'],limit:limitdays,order: [['date', 'DESC']]}).then(data => dbresponse=data) 
    myCache.setCacheWithTtl("LAST_DT_STK_PTRNS_" + limitdays,dbresponse,36000)  
  }
  return dbresponse
}

const getStockPatternsByDate = async (inpdate) =>{
  let initModels = require("../models/init-models"); 
  let models = initModels(sequelize);
  let stkPatterns = models.stockpatternsformed
  let dbresponse = []
  let myCache = require('../servercache/cacheitems')
  let cacheVal = myCache.getCache("STK_PTRNS_DT" + inpdate)

  if (cacheVal){
    dbresponse = cacheVal
  }
  else{
    await stkPatterns.findAll({where: {
      date: {[Op.eq] : inpdate}},order: [['symbol', 'ASC']]}).then(data => dbresponse=data) 
      myCache.setCacheWithTtl("STK_PTRNS_DT" + inpdate,dbresponse,36000)  
  }
  return dbresponse
}

module.exports = {getAllStockPatterns,getLatestDatesStockPatterns,getStockPatternsByDate};
