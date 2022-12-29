const URLConfig = require("../config/url.config.js");
const urlconf = new URLConfig()
const URL_HOST = urlconf.HOST

const getStockPricesForDuration = async (stksym,stkdur) =>{
    let response = {}
    const fetch = require("node-fetch");

    let myCache = require('../servercache/cacheitems')
    let cacheVal = myCache.getCache("STOCK_QUOTES_" + stksym + "_" + stkdur)

    try{
        if (cacheVal){
            console.log("found STOCK_QUOTES_ incache")
            response = cacheVal
        }else{
            await fetch(URL_HOST + 'pricetrends/' + stksym + '/' + stkdur)
            .then(res => res.json())
            .then(json => {response=json});  
            myCache.setCacheWithTtl("STOCK_QUOTES_" + stksym + "_" + stkdur,response,6000)  
        }
    }
    catch (err){
        console.log(err)
    }
    return response
}

module.exports={getStockPricesForDuration}