"use strict";
const URLConfig = require("../config/url.config.js");
const urlconf = new URLConfig()
const URL_HOST = urlconf.HOST
const _= require("lodash")
const moment = require("moment");

function StockBackTest (stockdata) {
    this.stockdata = stockdata;
};

StockBackTest.prototype.backtest = function (profit,stoploss) {
    let len = this.stockdata.length
    let datatocheck = this.stockdata
    let isanalysis = false
    let analysis = []
    console.log('backtestbacktestbacktestbacktest',len,datatocheck)

    for (let i=1;i < len ; i++){
      if (datatocheck[i].high >= datatocheck[0].close*(1 + (profit/100))){
        analysis.push({'plpoint':datatocheck[i].high,'date':datatocheck[i].date,'type':'PR','checkprc':datatocheck[0].close,
                    'resultdt':moment(datatocheck[i].date).diff(moment('2020-01-01'),'days')})
        isanalysis = true
        break;
      }else if (datatocheck[i].low <= datatocheck[0].close*(1 - (stoploss/100))){
        analysis.push({'plpoint':datatocheck[i].low,'date':datatocheck[i].date,'type':'SL','checkprc':datatocheck[0].close,
                    'resultdt':moment(datatocheck[i].date).diff(moment('2020-01-01'),'days')})
        isanalysis = true
        break;
      }
      if (!isanalysis){
        analysis.push({'plpoint':0,'date':datatocheck[i].date,'type':'NR','checkprc':datatocheck[0].close})
      }
    }    
    return analysis
};


module.exports = {StockBackTest};
