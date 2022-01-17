"use strict";
const DBConfig = require("../config/db.config.js");
const { Op } = require("sequelize");
const conf = new DBConfig()

const Sequelize = require("sequelize");
const sequelize = new Sequelize(conf.DB, conf.USER, conf.PASSWORD, {
    host: conf.HOST,
    dialect: conf.dialect
})

const getNewsFeeds = async (unqUid) =>{
    let Parser = require('rss-parser');
    let formatFeeder = require('./feedformat').FeedFormat
    let params
    if (!checkifdataexistsincache()){
      params = await getFeedParams(unqUid)
      console.log("Param from DB..... :(",params)
    }else{
      params = getmasterlistfromcache(unqUid)
      console.log("param from cache... :)",params)
    }
    try{
      let parser = new Parser({'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36'});
      let feed = await parser.parseURL(params.feedsource);
  
      let objfeedformat = new formatFeeder(feed)
      return objfeedformat.getAllFeedData()  
    }catch{
      console.log("Error in function getNewsFeeds")
    }
}  

const getFeedParams = async (feedId) => {
  let initModels = require("../models/init-models"); 
  let models = initModels(sequelize);
  let feedsources = models.feedsources
  let dbresponse
  try{
    await feedsources.findAll().then(data => dbresponse=data) 
    console.log("feedsourcesfeedsourcesfeedsources",dbresponse)
    if (dbresponse){
      let myCache = require('../servercache/cacheitems')
      myCache.setCacheWithTtl("ALL_FEED_FORMATS",dbresponse,120)
    }
  }catch{
    console.log("Error in getFeedParams function")
  }
  return dbresponse.filter(item => item.feedid === feedId)[0]
}

const checkifdataexistsincache = () =>{
  let myCache = require('../servercache/cacheitems')
  console.log("myCache.getStats",myCache.getCacheStats())
  return myCache.getCache("ALL_FEED_FORMATS")
}

const getmasterlistfromcache = (feedId) =>{
  let myCache = require('../servercache/cacheitems')
  console.log("myCache.getStats",myCache.getCacheStats())
  return myCache.getCache("ALL_FEED_FORMATS").filter(item => item.feedid === feedId)[0]
}

module.exports = {getNewsFeeds}