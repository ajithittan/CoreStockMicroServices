const DBConfig = require("../config/db.config.js");
const { Op } = require("sequelize");
const conf = new DBConfig()

const Sequelize = require("sequelize");
const sequelize = new Sequelize(conf.DB, conf.USER, conf.PASSWORD, {
    host: conf.HOST,
    dialect: conf.dialect
})

const getAllExtSectorsAndStocks = async () => {
    let initModels = require("../models/init-models"); 
    let models = initModels(sequelize);
    var sectbl = models.stocksectorsexternal
    let myCache = require('../servercache/cacheitems')
    let retval = []
    
    try{
      if (myCache.getCache("EXTERNAL_SECTOR_STOCKS")){
        retval = myCache.getCache("EXTERNAL_SECTOR_STOCKS")
      }
      else{
          await sectbl.findAll().then(data => retval=data)
          let sectors = [...new Set(retval.map(item => item.sectorsymbol))]
          retval = sectors.map(sector => {
              return {
                        "sector":sector,
                        "stocks":retval.filter(item => item.sectorsymbol === sector).map(eachitem => eachitem.symbol)}
            })  
          myCache.setCacheWithTtl("EXTERNAL_SECTOR_STOCKS",retval,36000)
      }
    }
    catch(error){
      console.log("error in getAllSectorsAndStocks",error)
    }
    return retval
}

module.exports= {getAllExtSectorsAndStocks}