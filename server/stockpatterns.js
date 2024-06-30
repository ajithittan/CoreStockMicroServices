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
    myCache.setCacheWithTtl("STOCK_PATTERNS_" + limitOfrecords,dbresponse,3000)  
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
    myCache.setCacheWithTtl("LAST_DT_STK_PTRNS_" + limitdays,dbresponse,3000)  
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
      myCache.setCacheWithTtl("STK_PTRNS_DT" + inpdate,dbresponse,3000)  
  }
  return dbresponse
}

const getMostRecentPatternsForDay = async () =>{
  let latestDates = await getAllStockPatterns(1)
  return await getStockPatternsByDate(latestDates[0].date)
}

const getRecentPatternsForAStock =  async (stock,limitdays) =>{
  const moment = require("moment");
  let initModels = require("../models/init-models"); 
  let models = initModels(sequelize);
  let stkPatterns = models.stockpatternsformed
  let dbresponse = []
  let myCache = require('../servercache/cacheitems')
  let cacheVal = myCache.getCache("PTRN_STK_" + stock + "_" + limitdays)

  if (cacheVal){
    dbresponse = cacheVal
  }
  else{
    await stkPatterns.findAll({where: {symbol: {[Op.eq] : stock},
      date: {[Op.gte] : moment().subtract(limitdays, "days")}},
      order: [['idstockpatternsformed', 'DESC']]}).then(data => dbresponse=data) 
    myCache.setCacheWithTtl("PTRN_STK_" + stock + "_" + limitdays,dbresponse,3000)  
  }
  return dbresponse
}

const gethistroicalpricefromDb = async (stksym,fromDt) =>{
  let retData = []
  var initModels = require("../models/init-models"); 
  var models = initModels(sequelize);
  var mdlStockprice = models.stockpriceday

  await mdlStockprice.findAll({where: {
        symbol: {
            [Op.eq] : stksym
        },
        date: {
          [Op.gte] : fromDt
        }
      },
      order: [
        ['date', 'ASC']
    ]
    }).then(data => retData=data)
  return retData
}

const getStockPatternsCountByDate = async (limitdays) =>{
    const moment = require("moment");
    let initModels = require("../models/init-models"); 
    let models = initModels(sequelize);
    let stkPatterns = models.stockpatternsformed
    let dbresponse = []
    let myCache = require('../servercache/cacheitems')
    let cacheVal = myCache.getCache("PTRN_STK_CNT" + limitdays)

    if (cacheVal){
      dbresponse = cacheVal
    }
    else{
      await stkPatterns.findAll({
            where: {date: {[Op.gte] : moment().subtract(limitdays, "days")}},
            attributes: [
              'symbol',
              [sequelize.fn('COUNT', sequelize.col('date')), 'count'],
            ],
            group:["symbol"]
          }
        ).then(data => dbresponse=data) 
      myCache.setCacheWithTtl("PTRN_STK_CNT" + limitdays,dbresponse,3000)  
    }
    return dbresponse  
}

const formatCorrelationResp = (inpdata,formattype) =>{
    if (formattype === "bubblecht"){
      let formattedCorr = inpdata.map((item,indx) => {        
        let retobj = {"category":indx}
        for (var key in item) {
          if (item.hasOwnProperty(key)) {
            if (item[key] > process.env.MIN_CORRELATION_SCORE){
              retobj[key] = item[key]
            }
          }
        }   
        return retobj
      })
      return formattedCorr
    }else
    {
      return inpdata
    }
}

module.exports = {getAllStockPatterns,getLatestDatesStockPatterns,getStockPatternsByDate,getMostRecentPatternsForDay,
                 getRecentPatternsForAStock,gethistroicalpricefromDb,getStockPatternsCountByDate,formatCorrelationResp};
