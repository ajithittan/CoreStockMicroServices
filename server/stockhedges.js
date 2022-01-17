"use strict";
const URLConfig = require("../config/url.config.js");
const urlconf = new URLConfig()
const URL_HOST = urlconf.HOST
const _= require("lodash");
const DBConfig = require("../config/db.config.js");
const { Op } = require("sequelize");
const conf = new DBConfig()

const Sequelize = require("sequelize");
const sequelize = new Sequelize(conf.DB, conf.USER, conf.PASSWORD, {
    host: conf.HOST,
    dialect: conf.dialect
  })

function StockHedges (stksymbol,fromdt) {
    this.stksymbol = stksymbol;
    this.fromdt = fromdt
}   

StockHedges.prototype.getHistoricalPrice = function () {
    console.log(this.stksymbol)
    return getStockPriceFromDB(this.stksymbol,this.fromdt)
};
StockHedges.prototype.getLatestPrice = function () {
    console.log(this.stksymbol)
    return getStockPriceFromDB()
};

module.exports = {StockHedges};
