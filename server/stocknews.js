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

const getStockNews = async (stkSym,limitOfNews) =>{
    let newsResp = []
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
        myCache.setCacheWithTtl("NEWS_STOCK_BING_" + stkSym,newsResp,600)  
      }
      return newsResp.slice(0,limitOfNews)
}

const getMultipleStockNews = async (arrStks,limitOfNews) => {
  const moment = require("moment");
  let arrnewsResp = []
  let promisesfornews = []
  for (let i=0;i < arrStks.length;i++){
        promisesfornews.push(getStockNews(arrStks[i],limitOfNews))
        await Promise.all(promisesfornews)
                      .then(result => arrnewsResp = removeDuplicateNews([].concat(...result)))
                      .catch(err => console.log("getMultipleStockNews - newsfeed error",err))
    }
    arrnewsResp = arrnewsResp.sort((a,b) => moment(b.date).diff(a.date))
    return arrnewsResp
}

const removeDuplicateNews = (inpData) => {
  const _ = require('lodash')
  return _.uniqBy(inpData, 'title')
}

const formatFinnHubNews = (inpNews) => {
  const moment = require("moment");
  let slicedNews = inpNews.slice(0,25)
  return slicedNews.map(item => {return {"title":item.headline,"link":item.url,"date":moment(item.datetime*1000).format(),
  "stock":item.related,"summary":item.summary,"source":item.source}})
}

const getFinnHubNews = async(stkSym) => {
    const moment = require("moment");
    let response = []
    let dateTo = moment().format('YYYY-MM-DD');
    let dateFrom = moment().subtract(10,'d').format('YYYY-MM-DD');
    const fetch = require("node-fetch");
    let finURL = "https://finnhub.io/api/v1/company-news?symbol="+stkSym+"&from=" + dateFrom + "&to=" + dateTo + "&token="+process.env.FINN_HUB_APIKEY
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
    myCache.setCacheWithTtl("STOCK_DEFINITION_" + stkSym,dbresponse,600)  
  }

  return `"${dbresponse[0].title}"`
}

const formatBingNews = async (bingNews) =>{
    const moment = require("moment");
    let formattedresp = []
    if (bingNews.value){
        for (let i=0;i<bingNews.value.length;i++){
            formattedresp.push({title:bingNews.value[i].name,link:bingNews.value[i].url,
                                date:moment(bingNews.value[i].datePublished).format(),summary:bingNews.value[i].description,
                                source:bingNews.value[i].provider[0]?.name})
        }
    }
    return formattedresp
}

module.exports = {getStockNews,getMultipleStockNews};
