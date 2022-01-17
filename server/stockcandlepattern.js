"use strict";
const URLConfig = require("../config/url.config.js");
const urlconf = new URLConfig()
const URL_HOST = urlconf.HOST
const _= require("lodash")

function StockCandlePattern (stock,duration) {
    this.stock = stock
    this.duration = duration
};

StockCandlePattern.prototype.getAllCandlePatterns = function () {
    console.log(getCandleDatafromAPI(this.stock,this.duration,"ALL"))
    return getCandleDatafromAPI(this.stock,this.duration,"ALL")
};
StockCandlePattern.prototype.getCandlePattern = function (cdlpattern) {
    console.log(getCandleDatafromAPI(this.stock,this.duration,cdlpattern))
    return getCandleDatafromAPI(this.stock,this.duration,cdlpattern)
};
StockCandlePattern.prototype.getTrackingCandlePattern = function () {
    console.log(this.stockdata)
    return 'Test'
};

const getCandleDatafromAPI = (stksym,stkdur,candleptrn) => {
    const fetch = require("node-fetch");
    let response
    try{
      console.log("req",req.body)
      await fetch(URL_HOST + 'stksignals/getallcandlepatterns/' + stksym + '/' + stkdur + '/' + candleptrn)
      .then(res => res.json())
      .then(json => {response=json});
    }
    catch (err){
      console.log(err)
    }
    return response
}

module.exports = {StockCandlePattern};
