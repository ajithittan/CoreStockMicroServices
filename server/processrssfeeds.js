"use strict";
const DBConfig = require("../config/db.config.js");
const { Op } = require("sequelize");
const conf = new DBConfig()

const Sequelize = require("sequelize");
const sequelize = new Sequelize(conf.DB, conf.USER, conf.PASSWORD, {
    host: conf.HOST,
    dialect: conf.dialect
})

const getAggregatedNews = async (rssfeeds) =>{
  console.log(typeof(JSON.parse(rssfeeds)))
  let arrayofNews = JSON.parse(rssfeeds)
  let promisesfornews = []
  let retval = []
  for(let i=0;i<arrayofNews.length;i++){
    let newsfeeds = promisesfornews.push(getNewsFeeds(parseInt(arrayofNews[i])))
  }
  
  await Promise.all(promisesfornews)
                            .then(result => retval = result)
                            .catch(err => console.log("newsfeed error",err))
  return retval.flat()
}

const getNewsFeeds = async (unqUid) =>{
    let Parser = require('rss-parser');
    let formatFeeder = require('./feedformat').FeedFormat
    let params
    let feedData = []
    if (!checkifdataexistsincache(unqUid)){
      params = await getFeedParams(unqUid)
    }else{
      return checkifdataexistsincache(unqUid)
    }
    try{
      console.log("no cache for news get news.....")
      let parser = new Parser({'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36'});
      let feed = await parser.parseURL(params.feedsource);
  
      let objfeedformat = new formatFeeder(feed)
      feedData = objfeedformat.getAllFeedData()  
      let myCache = require('../servercache/cacheitems')
          myCache.setCacheWithTtl("ALL_FEED_FORMATS" + unqUid,feedData,300) //cache for 5 mins....

    }catch (error){
      console.log("Error in function getNewsFeeds for feed id",unqUid,error)
    }
    return feedData
}  

const getFeedParams = async (feedId) => {
  let initModels = require("../models/init-models"); 
  let models = initModels(sequelize);
  let feedsources = models.feedsources
  let dbresponse
  try{
    await feedsources.findAll().then(data => dbresponse=data) 
    if (dbresponse){
      let myCache = require('../servercache/cacheitems')
      myCache.setCacheWithTtl("ALL_FEED_FORMATS",dbresponse,600)
    }
  }catch{
    console.log("Error in getFeedParams function")
  }
  return dbresponse.filter(item => item.feedid === feedId)[0]
}

const checkifdataexistsincache = (feedId) =>{
  let myCache = require('../servercache/cacheitems')
  return myCache.getCache("ALL_FEED_FORMATS" + feedId)
}

module.exports = {getNewsFeeds,getAggregatedNews}