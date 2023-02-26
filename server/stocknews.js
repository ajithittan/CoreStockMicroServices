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

const getStockNews = async (stkSym) =>{
    let newsResp = {}
    let myCache = require('../servercache/cacheitems')
    let cacheVal = myCache.getCache("NEWS_STOCK_BING_" + stkSym)

    if (cacheVal){
        newsResp = cacheVal
        console.log("found news in cache for - ",stkSym)
      }else{
        newsResp = await getBingNews (stkSym)
        myCache.setCacheWithTtl("NEWS_STOCK_BING_" + stkSym,newsResp,3000)  
      }

      return newsResp
}

const getMultipleStockNews = async (arrStks) => {
  let arrnewsResp = []
  let myCache = require('../servercache/cacheitems')

      for (let i=0;i < arrStks.length;i++){
        let cacheVal = myCache.getCache("NEWS_STOCK_BING_" + arrStks[i])
        if (cacheVal){
          arrnewsResp.push(...cacheVal)
        }else{
          newsResp = await getBingNews (arrStks[i])
          arrnewsResp.push(...newsResp)
          myCache.setCacheWithTtl("NEWS_STOCK_BING_" + arrStks[i],newsResp,3000)      
        }
      }

    return arrnewsResp
}

const getBingNews = async(stkSym) => {
    const fetch = require("node-fetch");
    const encodedValue = encodeURIComponent(await getNameToBuildQuery(stkSym))
    let header = {"Ocp-Apim-Subscription-Key":process.env.BING_SECRET_KEY}
    let response = {}

    console.log("encodedValue",encodedValue)

    try{
        await fetch(urlconf.BING_NEWS + '?count=25&q=' + encodedValue, {method: 'GET', headers:header})
        .then(res => res.json())
        .then(json => {response=json});  

        console.log("response from bing",response,stkSym)
        response = await formatBingNews(response)
        response = response.map(function(item){return {...item,stock:stkSym}})
    }
    catch (err){
      console.log(err)
    }
          
    return response
}

const getNameToBuildQuery = async (stkSym) =>{
  var initModels = require("../models/init-models"); 
  var models = initModels(sequelize);
  var stocklist = models.stocklist
  let dbresponse = []
  let myCache = require('../servercache/cacheitems')
  let cacheVal = myCache.getCache("STOCK_DEFINITION_" + stkSym)

  if (cacheVal){
    dbresponse = cacheVal
  }
  else{
    await stocklist.findAll({where: {
      symbol: {
        [Op.eq] : stkSym
      }
    }}).then(data => dbresponse=data) 
    myCache.setCacheWithTtl("STOCK_DEFINITION_" + stkSym,dbresponse,60000)  
  }

  return `"${stkSym} stock"` + " OR " + `"${dbresponse[0].name}"`
}

const formatBingNews = async (bingNews) =>{
    let formattedresp = []
    if (bingNews.value){
        for (let i=0;i<bingNews.value.length;i++){
            formattedresp.push({title:bingNews.value[i].name,link:bingNews.value[i].url,
                                date:bingNews.value[i].datePublished})
        }
    }
    return formattedresp
}

module.exports = {getStockNews,getMultipleStockNews};
