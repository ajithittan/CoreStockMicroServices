"use strict";
const DBConfig = require("../config/db.config.js");
const { Op } = require("sequelize");
const conf = new DBConfig()

const Sequelize = require("sequelize");
const sequelize = new Sequelize(conf.DB, conf.USER, conf.PASSWORD, {
    host: conf.HOST,
    dialect: conf.dialect
  })


function StockPositions (stksymbol,durmonths) {
    this.stksymbol = stksymbol;
}   

StockPositions.prototype.getPositions = async function () {
    let response = []
    
    try{
        let myCache = require('../servercache/cacheitems')
        console.log("myCache.getStats",myCache.getCacheStats())
        response = myCache.getCache("CUR_POSITIONS_" + this.stksymbol)
        console.log("value returned from cache....",response)
        if (response === undefined){
            var initModels = require("../models/init-models"); 
            var models = initModels(sequelize);
            var stkPsts = models.stockpositions
            await stkPsts.findAll({where: {
                symbol: {
                        [Op.eq] : this.stksymbol
                    }
                    }
                }).then(data => response=data) 
            console.log("data from db..",response)    
            let cacheset = myCache.setCache("CUR_POSITIONS_" + this.stksymbol,response)
            console.log("Cache was set in function StockPositions.prototype.getPositions...",cacheset)    
        }else{
            console.log("got value from cache function StockPositions.prototype.getPositions...",response)
        }
    }
    catch (err){
        console.log(err)
    }
    return response
};

StockPositions.prototype.createPosition = async function (close,dateval,sigTp,pt,sl,posSize) {
    let myCache = require('../servercache/cacheitems')
    var initModels = require("../models/init-models"); 
    var models = initModels(sequelize);
    var stkPsts = models.stockpositions
    try {
        await stkPsts.create({'symbol':this.stksymbol,'close':close,'date':dateval,'signaltype':sigTp,'verdict':-1,'profit':pt,'stoploss':sl,'possize':posSize})
        myCache.delCachedKey("CUR_POSITIONS_" + this.stksymbol)
        return true
    } catch (error) {
        console.log(error)
        return false
    }
};

module.exports = {StockPositions};
