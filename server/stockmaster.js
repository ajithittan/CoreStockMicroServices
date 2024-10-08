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

const getStockDetailsForList = async (listOfStks) =>{
    let arrstocklist = []
    try {
          for (let i=0;i<listOfStks.length;i++){
            let stockobj = {}
            let myCache = require('../servercache/cacheitems')
            let stkDtlsFromCache = myCache.getCache("STOCK_BASIC_DETAILS_" + listOfStks[i])
            if (stkDtlsFromCache){
              console.log("found in cache STOCK_BASIC_DETAILS_" + listOfStks[i])
              stockobj = stkDtlsFromCache
            }else{
              stockobj.symbol = listOfStks[i]
              let retfromextsite = await getperchange(listOfStks[i])
              stockobj.perchange = retfromextsite.perchange
              stockobj.close = retfromextsite.latestprice
              stockobj.avgdayvol3mon = retfromextsite.avgdayvol3mon
              stockobj.avgdayvol10day = retfromextsite.avgdayvol10day
              stockobj.volume = retfromextsite.volume
              stockobj.itemKey = listOfStks[i]
              stockobj.key = listOfStks[i]  
              if (stockobj){
                let cacheset = myCache.setCacheWithTtl("STOCK_BASIC_DETAILS_" + listOfStks[i],stockobj,60)
              }      
            }
            arrstocklist.push(stockobj)
          }
          arrstocklist.sort((a, b) => Math.abs(b.perchange) - Math.abs(a.perchange))
        }
      catch (error) {
        console.error('Error in getStockDetailsForList function:', error);
    }
    return arrstocklist
}

const getstockquotesformulstks = async (stkList,limitNum) => {
  const si = require("stock-info");
  let response = []
  try{
    if (stkList && stkList.length > 0){
      await si.getStocksInfo(stkList).then(retval => response = getLimitedStocksFromObj(retval,limitNum));
    }
  }catch (err){
    console.log("ERROR - in function getstockquotesformulstks", err)
  }
  console.log("getstockquotesformulstks",response)
  return response.map(item => item.symbol)
}

const getLimitedStocksFromObj = (respFromExt,limitNum) =>{
  let result = respFromExt.sort((a,b) => Math.abs(b.regularMarketChange) - Math.abs(a.regularMarketChange))
  console.log("getLimitedStocksFromObj",result)
  return result.splice(0,limitNum)
}

const getStockLists = async (userObj,noCache) => {
    let dbresponse = ''
    let arrstocklist = []
    try {
        
        let userId = await getUserDataForOps(userObj)
        let myCache = require('../servercache/cacheitems')
        arrstocklist = myCache.getCache("STOCK_HOME_PAGE" + userId)
        if (noCache || arrstocklist === undefined){
          console.log("Not in cache STOCK_HOME_PAGE"+ userId)
          arrstocklist = [];
          var initModels = require("../models/init-models"); 
          var models = initModels(sequelize);
          var usrStkPos = models.userstockpositions

          await usrStkPos.findAll({where: {
            iduserprofile: {
              [Op.eq] : userId
            }
          }}).then(data => dbresponse=data[0].positions) 

          for (let i=0;i<dbresponse.length;i++){
            const stockobj = {}
            stockobj.symbol = dbresponse[i]
            let retfromextsite = await getperchange(dbresponse[i])
            stockobj.perchange = retfromextsite.perchange
            stockobj.close = retfromextsite.latestprice
            stockobj.avgdayvol3mon = retfromextsite.avgdayvol3mon
            stockobj.avgdayvol10day = retfromextsite.avgdayvol10day
            stockobj.volume = retfromextsite.volume
            stockobj.itemKey = dbresponse[i]
            stockobj.key = dbresponse[i]
            arrstocklist.push(stockobj)
          }
          arrstocklist.sort((a, b) => Math.abs(b.perchange) - Math.abs(a.perchange))
            if (arrstocklist !== []){
                let cacheset = myCache.setCacheWithTtl("STOCK_HOME_PAGE" + userId,arrstocklist,60)
            }    
        }else{
          console.log("found in cache....STOCK_HOME_PAGE"+ userId)
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
  let stockdtls = {}
  const stkInfo = require("./stockquotes");
  //let retval = await getValidityOfStock(stksym)
  try{
    stockdtls = await stkInfo.getLatestStockQuote(stksym)
  }catch (error){
    console.log("error in getperchange ",error)
  }
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
        let cacheset = myCache.setCacheWithTtl("ALL_CANDLE_PATTERNS",allcdlptrns,600)
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
        },
        order: sequelize.col('sector')
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

const getAllExtStockSectors = async () =>{

  var initModels = require("../models/init-models"); 
  var models = initModels(sequelize);
  var stocksector = models.stocksectorsexternal
  try {
        await stocksector.findAll({  
        attributes: ['idstocksectorsexternal','sectorsymbol','symbol']
      }).then(data => dbresponse=(data))
    } catch (error) {
      console.log("getAllExtStockSectors - Error",error)
    }
    return dbresponse
}

 const createStockSectors = async (sector,userObj) =>{
  
  let retval = false
  var initModels = require("../models/init-models"); 
  var models = initModels(sequelize); 
  var stocksector = models.stocksector
  let stkliks = new Set([...sector.stocks])
  try{
    let userId = await getUserDataForOps(userObj)
    retval = await stocksector.create({'sector':sector.sector,'stocks':Array.from(stkliks),'iduserprofile':userId})
    await publishMessage("STOCK_EOD_PRICES",{stocks:Array.from(stkliks)})
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
    console.log("updating a stock sector in fn - updSectors",[...new Set(sectors.map(item => item.stocks).flat())])
    for (let i=0;i<sectors.length;i++){
      await stocksector.update({'sector':sectors[i].sector,'stocks':sectors[i].stocks},{where:{idstocksector:sectors[i].idstocksector}})
      await publishMessage("STOCK_EOD_PRICES",{stocks:[...new Set(sectors.map(item => item.stocks).flat())]})
    }
  }catch(error){
    retval = false
    console.log("deleteSector - Error when deleting sector",error)
  }
  return retval
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

 const getAllExtSecStocksNormalized = async () =>{
  let stkExtSecs = await getAllExtStockSectors()
  return ([...stkExtSecs.map(item => item.symbol)].flat())
 }

 const getAllPosStks = async () =>{
  var initModels = require("../models/init-models"); 
  var models = initModels(sequelize);
  var stkPos = models.userstockpositions
  let dbresponse = []

  await stkPos.findAll().then(data => dbresponse=data) 

  return(dbresponse.map(item => item.positions).flat(1))

 }

 const updateAllStockPrices = async () =>{
  
    let postks = await getAllPosStks()
    let secStks = await getAllSecStocksNormalized()
    let extSecStks = await getAllExtSecStocksNormalized()
    let setOfStks = new Set([...postks,...secStks,...extSecStks])

    await publishMessage("STOCK_EOD_PRICES",{stocks:[...setOfStks]})
    //await publishMessage("STOCK_LATEST_SEC_DATA",{stocks:[...setOfStks]})
    return true

 }

 const initiatePatternRecog = async () =>{
  await publishMessage("INITIATE_PATTERN_RECOG",{})
  return true
}

const initiateEODStockPrice = async () =>{
  await publishMessage("V2_STOCK_EOD_PRICES",{})
  return true
}

const initiateCachePrevClose = async () =>{
  await publishMessage("CACHE_PREV_CLOSE",{})
  return true
}

 const updStockPrices = async (arrofStks) =>{

    let responsefromextsite = await getStockHistDataMultiple([...arrofStks])
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

 const savePositions = async (newPos, userObj) =>{

    let userId = await getUserDataForOps(userObj)
    let currpos = []

    var initModels = require("../models/init-models"); 
    var models = initModels(sequelize);
    var usrStkPos = models.userstockpositions

    try{

      await usrStkPos.findAll({where: {
        iduserprofile: {
          [Op.eq] : userId
        }
      }}).then(data => currpos=data) 

      if (currpos.length > 0 ){
        currpos = currpos[0].positions
        let temppos = Array.from(new Set([...currpos,...newPos]))
        await usrStkPos.update({'positions':temppos},{where:{iduserprofile:userId}}) 
        await publishMessage("STOCK_EOD_PRICES",{stocks:[...newPos]})
      }else{
        await usrStkPos.create({'positions':[...newPos],'iduserprofile':userId,'createdt':Date.now()})
        await publishMessage("STOCK_EOD_PRICES",{stocks:[...newPos]})
      }

      let myCache = require('../servercache/cacheitems')
      myCache.delCachedKey("STOCK_HOME_PAGE" + userId)

    }catch(err){
      console.log("error in function savePositions",err)
      return false
    }

    return true

 }

 const initiateCaching = async (stksym,inpParams) =>{
    for (let i=0;i<inpParams.length;i++){
      let objForCache = {}
      objForCache.processId = inpParams[i].type
      let allparams = inpParams[i].options
      allparams.unshift({"value":stksym})
      objForCache.params = allparams
      publishMessage("PROCESS_CACHE",{tocache:objForCache})  
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
        .then(res => console.log("Message posted to redis queue",type))
    }
    catch (err){
        console.log("error in publishMessage",err)
    }
 }

 const deleteStkPositions = async (removeStk, userObj) =>{

    let userId = await getUserDataForOps(userObj)
    let currpos = []

    var initModels = require("../models/init-models"); 
    var models = initModels(sequelize);
    var usrStkPos = models.userstockpositions

    try{

        await usrStkPos.findAll({where: {
          iduserprofile: {
            [Op.eq] : userId
          }
        }}).then(data => currpos=data) 
        console.log("in deleteStkPositions positions......",userId,removeStk)
        currpos = currpos[0].positions.filter(item => item != removeStk)

        if (currpos.length === 0 ){
          await usrStkPos.destroy({where:{iduserprofile:userId}}) 
        }else{
          await usrStkPos.update({'positions':currpos},{where:{iduserprofile:userId}}) 
        }

        let myCache = require('../servercache/cacheitems')
        myCache.delCachedKey("STOCK_HOME_PAGE" + userId)

    }catch(err){
      console.log("error in function deleteStkPositions",err)
      return false
    }

    return true

}

const getValidityOfStock = async (stkSym) =>{
  const yahooFinance = require('yahoo-finance');
  const qtFormatter = require('./stocksourceformatter')
  let retval = {}
  retval.status = false

  let myCache = require('../servercache/cacheitems')

  let cacheVal = myCache.getCache("VALID_SYMBOL_DETAILS_" + stkSym)

  if (cacheVal){
    retval = cacheVal
    console.log("found cached value for getValidityOfStock",cacheVal)
  }else{
    await yahooFinance.quote({
      symbol: stkSym,
      modules: ['price']       // optional; default modules.
    }).then(quote => {
                        if(quote.price.longName){
                          retval.status=true;
                          retval.details=qtFormatter.formatQuote(quote)  
                        }
                     }
            ).catch(err => console.log("there is an error",err));

    myCache.setCacheWithTtl("VALID_SYMBOL_DETAILS_" + stkSym,retval,600)            
  }          

  return retval

}

const getCompanyDetails = async (stkSym) =>{
  let retval = {}
  let retfromyahoo = undefined
  let myCache = require('../servercache/cacheitems')

  let cacheVal = myCache.getCache("COMPANY_DETAILS_" + stkSym)

  if (cacheVal){
    retval = cacheVal
    console.log("found cached value for company details",stkSym)
  }else{
    const yahooFinance = require('yahoo-finance');
    const yahFormat = require('./yahooformat')

    await yahooFinance.quote({
      symbol: stkSym,
      modules: ['price','summaryProfile','financialData','defaultKeyStatistics']       // optional; default modules.
    }).then(quote => retfromyahoo = quote)
      .catch(err => console.log("there is an error",err));

      retval = await yahFormat.formatCompanyDetails(retfromyahoo,stkSym)
      console.log("getCompanyDetails",stkSym)
  }
          
  return retval
}

const getAllStocks = async () =>{
  var initModels = require("../models/init-models"); 
  var models = initModels(sequelize);
  var stkList = models.stocksymbols
  let dbresponse = []
  let myCache = require('../servercache/cacheitems')

  let cacheVal = myCache.getCache("FULL_STOCK_LIST")

  if (cacheVal){
    dbresponse = cacheVal
    console.log("found cached value for getAllStocks")
  }else{
    console.log("Getting all stocks from DB - getAllStocks")
    await stkList.findAll({attributes: ['symbol','companyname']}).then(data => dbresponse=data).catch(err => console.log("ERROR - getAllStocks",err));
    myCache.setCacheWithTtl("FULL_STOCK_LIST",dbresponse,600)            
  }         
  return(dbresponse)
 }

module.exports = {getStockSectors,stopTrackingStock,getstockquotes,getStockLists,getStockHistData,getcdlpatterns,getcdlpatternstrack,
                updcdlpatternstrack,getAllIndicatorParams, flushAllCache,createStockSectors,deleteSector,updSectors,
                savePositions,updateAllStockPrices,updStockPrices,deleteStkPositions,getValidityOfStock,
                getCompanyDetails,getStockDetailsForList,getstockquotesformulstks,getUserDataForOps,getAllStocks,
                initiateCaching,initiatePatternRecog,initiateEODStockPrice,initiateCachePrevClose};
