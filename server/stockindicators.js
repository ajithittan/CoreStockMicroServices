"use strict";
const URLConfig = require("../config/url.config.js");
const urlconf = new URLConfig()
const URL_HOST = urlconf.HOST


function StockIndicators (stksymbol,durmonths) {
    this.stksymbol = stksymbol;
    this.durmonths = durmonths
}   

StockIndicators.prototype.getAllIndicators = async function () {
    let response = []
    
    try{
        let myCache = require('../servercache/cacheitems')
        console.log("myCache.getStats",myCache.getCacheStats())
        response = myCache.getCache("ALL_IND_" + this.stksymbol)
        console.log("value returned from cache....",response)
        if (response === undefined){
            const fetch = require("node-fetch");
            await fetch(URL_HOST + 'pricetrends/indicators/' + this.stksymbol + '/ALL_IND/' + this.durmonths)
            .then(res => res.json())
            .then(json => {response=json});
            console.log('what is the response ?', response)
            if (response !== []){
                let cacheset = myCache.setCache("ALL_IND_" + this.stksymbol,response)
                console.log("Cache was set in function StockIndicators.prototype.getAllIndicators...",cacheset)
            }    
        }else{
            console.log("got value from cache function StockIndicators.prototype.getAllIndicators...",response)
        }
    }
    catch (err){
        console.log(err)
    }
    return response
};

StockIndicators.prototype.getSpecificIndicators = async function (indType) {
    console.log(this.stksymbol)
    return getStockPriceFromDB()
};

module.exports = {StockIndicators};
