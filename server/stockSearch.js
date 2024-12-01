const URLConfig = require("../config/url.config.js");
const urlconf = new URLConfig()
const URL_HOST = urlconf.HOST

const getDataFromSource = async (shardnm,inpQuery) =>{
    const fetch = require("node-fetch");
    let response = []

    try{  
        let retfromfetch = await fetch(URL_HOST + 'pricetrends/searchdataset/' + shardnm, {method:'post', body:JSON.stringify(inpQuery), 
                        headers: { 'Content-Type': 'application/json' }}).then(ret => ret.json())
        response = JSON.parse(retfromfetch) 
    }
    catch (err){
        console.log("ERROR: in fn getDataFromSource",err)
    }
    return response

}

const getShardKeysFromCache = async () =>{
    let myCache = require('../servercache/genericcacheglobal')(process.env.BING_SECRET_KEY,process.env.REDIS_SEARCHDS_PORT)
    let cacheVal = await myCache.getCache(process.env.SEARCH_DS_SHARDS)
    return cacheVal
}

const searchDataSet = async (inpQuery) =>{

    //get the shardnames from redis cache
    //let sharvals = await getShardKeysFromCache()
    let sharvals = ["SEARCH_DS_LARGE","SEARCH_DS_MID","SEARCH_DS_SMALL"]
    let promisesforsrch = []
    let retval = []
    try{        

        for(let i=0;i<sharvals.length;i++){
            promisesforsrch.push(getDataFromSource(sharvals[i],inpQuery))
        }
        
        await Promise.all(promisesforsrch)
                     .then(result => retval = result)
                     .catch(err => console.log("searchDataSet error",err))
    }
    catch (err){
        console.log("ERROR: in fn searchDataSet",err)
    }
    return retval.flat()
}

module.exports={searchDataSet}