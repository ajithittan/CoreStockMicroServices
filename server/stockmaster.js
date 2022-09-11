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
    if (myCache.getCache("USER_OBJECT_FOR_ID" + userObj.usrid)){
      userIdreturn = myCache.getCache("USER_OBJECT_FOR_ID" + userObj.usrid).iduserprofile
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

const getStockLists = async () => {
    let dbresponse = ''
    let arrstocklist = []
    try {
        let myCache = require('../servercache/cacheitems')
        arrstocklist = myCache.getCache("STOCK_HOME_PAGE")
        if (arrstocklist === undefined){
          arrstocklist = [];
          var initModels = require("../models/init-models"); 
          var models = initModels(sequelize);
          var stocklist = models.stocklist

          await stocklist.findAll({where: {
            track: {
              [Op.eq] : 1
            }
          }}).then(data => dbresponse=data) 

          for (let i=0;i<dbresponse.length;i++){
            const stockobj = {}
            stockobj.symbol = dbresponse[i].symbol
            let retfromextsite = await getperchange(dbresponse[i].symbol)
            stockobj.perchange = retfromextsite.perchange
            stockobj.close = retfromextsite.latestprice
            stockobj.avgdayvol3mon = retfromextsite.avgdayvol3mon
            stockobj.avgdayvol10day = retfromextsite.avgdayvol10day
            stockobj.volume = retfromextsite.volume
            stockobj.itemKey = dbresponse[i].symbol
            stockobj.key = dbresponse[i].symbol
            arrstocklist.push(stockobj)
          }
          arrstocklist.sort((a, b) => Math.abs(b.perchange) - Math.abs(a.perchange))
            if (arrstocklist !== []){
                let cacheset = myCache.setCacheWithTtl("STOCK_HOME_PAGE",arrstocklist,120)
            }    
        }
      }catch (error) {
        console.error('Error in getStockLists function:', error);
    }
    return arrstocklist
}

//regularMarketChange: -2.3899994,
//regularMarketChangePercent: -2.0655081,
//regularMarketTime: 1613666348,
//regularMarketPrice: 113.32,
//regularMarketDayHigh: 115.63,
//regularMarketDayRange: '112.44 - 115.63',
//regularMarketDayLow: 112.44,
//regularMarketVolume: 2706938,
//regularMarketPreviousClose: 115.71,
//bid: 113.55,
//ask: 113.62,

const getperchange = async (stksym) => {
  let perchange = 0
  let latestprice = 0
  let stockdtls = {}
  const stkInfo = require('stock-info');
  await stkInfo.getSingleStockInfo(stksym).then(retData => {stockdtls.perchange = parseFloat(retData.regularMarketChangePercent)
            ,stockdtls.latestprice=parseFloat(retData.regularMarketPrice),
            stockdtls.avgdayvol3mon = parseFloat(retData.averageDailyVolume3Month),
            stockdtls.avgdayvol10day = parseFloat(retData.averageDailyVolume10Day),
            stockdtls.volume = parseFloat(retData.regularMarketVolume)});
  return stockdtls 
}

const getstockquotes = async (stksym) => {
  let stockdtls = {}
  const stkInfo = require('stock-info');
  await stkInfo.getStocksInfo(stksym).then(retData => stockdtls = retData);
  console.log(typeof(stockdtls[0]))
  return formatResp(stockdtls)
}

const formatResp = (respfromext) =>{
  let retvals = []
  for (var i = 0; i < respfromext.length; i++) { 
    let objval = {}
    //console.log(respfromext[i])
    objval["symbol"] = respfromext[i].symbol
    objval["close"] = respfromext[i].regularMarketPrice
    objval["high"] = respfromext[i].regularMarketDayHigh
    objval["low"] = respfromext[i].regularMarketDayLow
    objval["open"] = respfromext[i].regularMarketOpen
    objval["volume"] = respfromext[i].regularMarketVolume
    objval["perchange"] = respfromext[i].regularMarketChangePercent
    retvals.push(objval)
  }
  return retvals
}

const getStockHistData = async (stksym,position) => {
  
  let response
  let enddt = new Date()
  let dow = enddt.getDay()

  if (dow === 1 || dow === 2 || dow === 3 || dow === 4 || dow === 5){
    enddt.setDate(enddt.getDate() - 1)
  }
  const yahooFinance = require('yahoo-finance');     
  await yahooFinance.historical({
    symbol: stksym,
    from: '2000-01-01',
    to: enddt,
    period: 'd'

  }).then(result => response=result)

  console.log(response)

  if (response.length > 0){
    try{
      await insertintostkprcday(response)
      position === 1 ? await checkandinsertstklist(stksym) : null
    }catch (error) {
      console.log("getStockHistData - Error when updating DB from Yahoo",error,response,stksym)
      return false
    }
  }
  return response
}

const insertintostkprcday = async (arrofprices) => {

  var initModels = require("../models/init-models"); 
  var models = initModels(sequelize);
  var stockpriceday = models.stockpriceday

  let transformedarr = arrofprices.map(item => ({'symbol':item.symbol,'date':item.date,'Open':item.open,
                        'high':item.high,'low':item.low,'close':item.close,'adjclose':item.adjClose,'volume':item.volume}))

  await stockpriceday.bulkCreate(transformedarr, {
        updateOnDuplicate: ["close"] 
  })
  await flushAllCache()
}

 const checkandinsertstklist = async (stksym) => {

  var initModels = require("../models/init-models"); 
  var models = initModels(sequelize);
  var stocklist = models.stocklist
  let prclist 
  await stocklist.count({where: {
        symbol: {
          [Op.eq] : stksym
        }
      }
    }).then(data => prclist=data) 
    console.log('data checkandinsertstklist',prclist)
    if (prclist === 0){
      await stocklist.create({'symbol':stksym,'name':stksym,'sector':'UNKOWN','updated_on':'2021-01-01','track':1})
    }else{
      await stocklist.update({'track':1},{where:{symbol:stksym}})
    } 
 } 

 const getcdlpatterns = async () => {
  let allcdlptrns = ''
  let myCache = require('../servercache/cacheitems')
  allcdlptrns = myCache.getCache("ALL_CANDLE_PATTERNS")
  //console.log("myCache.getStats",myCache.getCacheStats(),myCache.getCacheKeys(),allcdlptrns)
  if (allcdlptrns === undefined){  
    var initModels = require("../models/init-models"); 
    var models = initModels(sequelize);
    var cdlpttrns = models.stockcandlepatterns
    await cdlpttrns.findAll().then(data => allcdlptrns=data) 
      //console.log('data getcdlpatterns',allcdlptrns)
    if (allcdlptrns !== ''){
        let cacheset = myCache.setCacheWithTtl("ALL_CANDLE_PATTERNS",allcdlptrns,60000)
        //console.log("Cache was set in function getcdlpatterns...",cacheset)
    }  
  }  
  return allcdlptrns
 }
 const getcdlpatternstrack = async (tracktype) => {
  let allcdlptrns = ''
  var initModels = require("../models/init-models"); 
  var models = initModels(sequelize);
  var cdlpttrns = models.stockcandlepatterns
  await cdlpttrns.findAll({where: {
    track: {
          [Op.eq] : tracktype
        }
      }
    }).then(data => allcdlptrns=data) 
  return allcdlptrns
 }

 const updcdlpatternstrack = async (cdlpattern,tracktype) =>{
  var initModels = require("../models/init-models"); 
  var models = initModels(sequelize);
  var cdlpttrns = models.stockcandlepatterns
  cdlpttrns.update( {track: tracktype ? 1:0},
    {where: {
      candlepattern: {
            [Op.eq] : cdlpattern
          }
        }
    }).then(result => console.log('Result as part of update',result))
    let myCache = require('../servercache/cacheitems')
    value = myCache.delCachedKey("ALL_CANDLE_PATTERNS");
    console.log("delete cache key - ",value,myCache.getCacheKeys())
 }

 const getAllIndicatorParams = async () =>{
  var initModels = require("../models/init-models"); 
  var models = initModels(sequelize);
  var cdlpttrns = models.stockindicatorparams
  let retdata = ""
  await cdlpttrns.findAll().then(result => console.log('Result of getAllIndicatorParams',retdata = result))
  return retdata
 }

 const flushAllCache = async () =>{
  let myCache = require('../servercache/cacheitems')
  console.log("before flushing - ",myCache.getCacheStats())
  let retVal = myCache.flushAll()
  console.log("after flushing - ",myCache.getCacheStats())
  return retVal
 }

 const stopTrackingStock = async (stkSym) =>{
    var initModels = require("../models/init-models"); 
    var models = initModels(sequelize);
    var stocklist = models.stocklist
    try {
      await stocklist.update({'track':0},{where:{symbol:stkSym}})
      return true
    } catch (error) {
      console.log("stopTrackingStock - Error when stopping tracking",error)
      return false
    }
 }

 const getStockSectors = async (userObj) =>{
  let userId = await getUserDataForOps(userObj)
  let dbresponse = await getStockSectorsfromDB(userId)
  return dbresponse
}

const getStockSectorsfromDB = async (user) =>{

  var initModels = require("../models/init-models"); 
  var models = initModels(sequelize);
  var stocksector = models.stocksector
  try {
        await stocksector.findAll({  
        attributes: ['sector','stocks','idstocksector'],
        where: {
          iduserprofile: {
                [Op.eq] : user
        }
        }
      }).then(data => dbresponse=(data))
    } catch (error) {
      console.log("getStockSectorsfromDB - Error",error)
    }
    return dbresponse
}

const getAllStockSectors= async () =>{

  var initModels = require("../models/init-models"); 
  var models = initModels(sequelize);
  var stocksector = models.stocksector
  try {
        await stocksector.findAll({  
        attributes: ['sector','stocks','idstocksector']
      }).then(data => dbresponse=(data))
    } catch (error) {
      console.log("getStockSectorsfromDB - Error",error)
    }
    return dbresponse
}

 const createStockSectors = async (sector,userObj) =>{
  
  let retval = false
  var initModels = require("../models/init-models"); 
  var models = initModels(sequelize); 
  var stocksector = models.stocksector
  try{
    let userId = await getUserDataForOps(userObj)
    await stocksector.create({'sector':sector.sector,'stocks':sector.stocks,'iduserprofile':userId})
    retval = true
  }catch(error){
    console.log("createStockSectors - Error when creating sector",error)
  }
  return retval
 }

 const deleteSector = async (sectorid) =>{
  let retval = false
  var initModels = require("../models/init-models"); 
  var models = initModels(sequelize); 
  var stocksector = models.stocksector
  try{
    await stocksector.destroy({
      where: {
        idstocksector: sectorid
      }
   }).then(retval = true)
  }catch(error){
    console.log("deleteSector - Error when deleting sector",error)
  }
  return retval
 }

 const updSectors = async (sectors) =>{
  let retval = true
  var initModels = require("../models/init-models"); 
  var models = initModels(sequelize); 
  var stocksector = models.stocksector
  try{
    for (let i=0;i<sectors.length;i++){
      await stocksector.update({'sector':sectors[i].sector,'stocks':sectors[i].stocks},{where:{idstocksector:sectors[i].idstocksector}})
    }
  }catch(error){
    retval = false
    console.log("deleteSector - Error when deleting sector",error)
  }
  return retval
 }

 const updateAllSectorStks = (setStks) =>{
  setStks.forEach(
    item => getStockHistData(item,0)
  )
 }

 const getStockHistDataMultiple = async (stksym) => {
  
  console.log(stksym)
  let response
  let enddt = new Date()
  let dow = enddt.getDay()

  if (dow === 1 || dow === 2 || dow === 3 || dow === 4 || dow === 5){
    enddt.setDate(enddt.getDate() - 1)
  }
  const yahooFinance = require('yahoo-finance');     
  await yahooFinance.historical({
    symbols: stksym,
    from: '2000-01-01',
    to: enddt,
    period: 'd'

  }).then(result => response=result)
  return response
}

 const getAllSecStocksNormalized = async () =>{
  let stkSecs = await getAllStockSectors()
  return ([...stkSecs.map(item => item.stocks)].flat())
 }

 const getAllPosStks = async () =>{
  var initModels = require("../models/init-models"); 
  var models = initModels(sequelize);
  var stocklist = models.stocklist
  let dbresponse = []

  await stocklist.findAll({where: {
    track: {
      [Op.eq] : 1
    }
  }}).then(data => dbresponse=data) 

  return(dbresponse.map(item => item.symbol))

 }

 const updateAllStockPrices = async () =>{
  
  let postks = await getAllPosStks()
  let secStks = await getAllSecStocksNormalized()
  let setOfStks = new Set([...postks,...secStks])
  let responsefromextsite = await getStockHistDataMultiple([...setOfStks])
  let count = 0 

  Object.values(responsefromextsite).forEach(async stockprice => {
    try{
      await insertintostkprcday(stockprice)
      count++
    }catch(error){
      retval = false
      console.log("updateAllStockPrices - Error when updateAllStockPrices",error,stockprice[0].symbol)
    }
  }
  )
  
  return{
    'position': setOfStks,
    'successful' :  count,
    'failed': setOfStks.length - count
  }

 }
 

module.exports = {getStockSectors,stopTrackingStock,getstockquotes,getStockLists,getStockHistData,getcdlpatterns,getcdlpatternstrack,
                updcdlpatternstrack,getAllIndicatorParams, flushAllCache,createStockSectors,deleteSector,updSectors,updateAllStockPrices};