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
        newsResp = await getFinnHubNews (stkSym)
        if (newsResp.length === 0){
          console.log("finnhub failed so going to Bing News")
          newsResp = await getBingNews (stkSym)
        }
        myCache.setCacheWithTtl("NEWS_STOCK_BING_" + stkSym,newsResp,3000)  
      }
      return newsResp
}

const getMultipleStockNews = async (arrStks) => {
  let arrnewsResp = []
  let promisesfornews = []
  for (let i=0;i < arrStks.length;i++){
        promisesfornews.push(getStockNews(arrStks[i]))
        await Promise.all(promisesfornews)
                      .then(result => arrnewsResp = removeDuplicateNews([].concat(...result)))
                      .catch(err => console.log("newsfeed error",err))
    }
    return arrnewsResp
}

const removeDuplicateNews = (inpData) => {
  const _ = require('lodash')
  return _.uniqBy(inpData, 'title')
}

const formatFinnHubNews = (inpNews) => {
  let slicedNews = inpNews.slice(0,50)
  return slicedNews.map(item => {return {"title":item.headline,"link":item.url,"date":item.datetime,"stock":item.related}})
}

const getFinnHubNews = async(stkSym) => {
    let response = []
    const fetch = require("node-fetch");
    let finURL = "https://finnhub.io/api/v1/company-news?symbol="+stkSym+"&from=2023-08-15&to=2023-11-11&token="+process.env.FINN_HUB_APIKEY
    try{
        await fetch(finURL)
        .then(res => res.json())
        .then(json => {response=formatFinnHubNews(json)});  
    }
    catch (err){
      console.log(err)
    }
    return response
}

const getBingNews = async(stkSym) => {
    const fetch = require("node-fetch");
    const encodedValue = encodeURIComponent(await getNameToBuildQuery(stkSym))
    let header = {"Ocp-Apim-Subscription-Key":process.env.BING_SECRET_KEY}
    let response = {}
    try{
        await fetch(urlconf.BING_NEWS + '?count=25&q=' + encodedValue, {method: 'GET', headers:header})
        .then(res => res.json())
        .then(json => {response=json});  

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
  var stockcik = models.stockcik
  let dbresponse = []
  let myCache = require('../servercache/cacheitems')
  let cacheVal = myCache.getCache("STOCK_DEFINITION_" + stkSym)

  if (cacheVal){
    dbresponse = cacheVal
  }
  else{
    await stockcik.findAll({where: {
      symbol: {
        [Op.eq] : stkSym
      }
    }}).then(data => dbresponse=data) 
    myCache.setCacheWithTtl("STOCK_DEFINITION_" + stkSym,dbresponse,60000)  
  }

  return `"${dbresponse[0].title}"`
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
