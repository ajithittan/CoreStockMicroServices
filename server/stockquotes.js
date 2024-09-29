const URLConfig = require("../config/url.config.js");
const urlconf = new URLConfig()
const URL_HOST = urlconf.HOST

const getStockPricesForDuration = async (stksym,stkdur) =>{
    let response = {}
    const fetch = require("node-fetch");

    let myCache = require('../servercache/cacheitemsglobal')
    let cacheKey = "STOCKQUOTES_" + stksym + "_" + stkdur
    let cacheVal = await myCache.getCache(cacheKey)

    try{
        if (cacheVal){
            console.log("found STOCK_QUOTES_ incache",cacheKey)
            response = cacheVal
        }else{
            await fetch(URL_HOST + 'pricetrends/' + stksym + '/' + stkdur)
            .then(res => res.json())
            .then(json => {response=json});  
            response?.length > 0 ? myCache.setCacheWithTtl(cacheKey,response,600) : null
        }
    }
    catch (err){
        console.log(err)
    }
    return response
}

const getLatestStockQuote = async (stkSym) =>{
    //should abstract the class above....
    const yahooFinance = require('yahoo-finance');
    const qtFormatter = require('./stocksourceformatter')
    let latStkQuote = {}
    latStkQuote.status = false

    let myCache = require('../servercache/cacheitems')

    let cacheVal = myCache.getCache("LATEST_STOCK_QUOTE" + stkSym)

    if (cacheVal){
        latStkQuote = cacheVal
        console.log("found cached value for getValidityOfStock",cacheVal)
    }else{
        await yahooFinance.quote({
        symbol: stkSym,
        modules: ['price']       // optional; default modules.
        }).then(quote => {
                            if(quote.price.longName){
                                console.log("quote",quote)
                                latStkQuote.status = true,
                                latStkQuote.perchange = parseFloat(quote.price.regularMarketChangePercent),
                                latStkQuote.latestprice=parseFloat(quote.price.regularMarketPrice),
                                latStkQuote.avgdayvol3mon = parseFloat(quote.price.averageDailyVolume3Month),
                                latStkQuote.avgdayvol10day = parseFloat(quote.price.averageDailyVolume10Day),
                                latStkQuote.volume = parseFloat(quote.price.regularMarketVolume)
                            }
                        }
                ).catch(err => console.log("there is an error",err));

        myCache.setCacheWithTtl("LATEST_STOCK_QUOTE" + stkSym,latStkQuote,30)            
    }          
  return latStkQuote
}

const updateStockQuotesBulk = async (inpQuotes,typeOfQuote) =>{
    let myCache = require('../servercache/cacheitems')
    myCache.setCacheWithTtl("BULK_STOCK_QUOTE_" + typeOfQuote,inpQuotes,10000)
    return true
}

const getStockQuotesBulk = async (typeOfQuote) =>{
    let myCache = require('../servercache/cacheitems')
    return myCache.getCache("BULK_STOCK_QUOTE_" + typeOfQuote)
}


module.exports={getStockPricesForDuration,getLatestStockQuote,updateStockQuotesBulk,getStockQuotesBulk}