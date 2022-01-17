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

function StockPrice (stksymbol,fromdt) {
    this.stksymbol = stksymbol;
    this.fromdt = fromdt
}   

StockPrice.prototype.getHistoricalPrice = function () {
    console.log(this.stksymbol)
    return getStockPriceFromDB(this.stksymbol,this.fromdt)
};
StockPrice.prototype.getLatestPrice = function () {
    console.log(this.stksymbol)
    return getStockPriceFromDB()
};

const getStockPriceFromDB = async (stksym,frmdt) => {
    let dbresponse = ''
    let arrstocklist = []
    try {
        var initModels = require("../models/init-models"); 
        var models = initModels(sequelize);
        var stockpriceday = models.stockpriceday

        await stockpriceday.findAll({where: {
            symbol: {
              [Op.eq] : stksym
            },
            date: {
                [Op.gte] : frmdt
            }
          }
        }).then(data => dbresponse=data) 
        
      } catch (error) {
        console.error('Error in getStockPriceFromDB function:', error);
    }
    return dbresponse
}

module.exports = {StockPrice};
