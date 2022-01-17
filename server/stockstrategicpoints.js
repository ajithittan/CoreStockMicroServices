"use strict";
const URLConfig = require("../config/url.config.js");
const urlconf = new URLConfig()
const DBConfig = require("../config/db.config.js");
const { Op } = require("sequelize");
const conf = new DBConfig()

const Sequelize = require("sequelize");
const sequelize = new Sequelize(conf.DB, conf.USER, conf.PASSWORD, {
    host: conf.HOST,
    dialect: conf.dialect
  })

function StockStrategicPoints (stkSym,stgyType) {
    this.stkSym = stkSym;
    this.stgyType = stgyType
};

StockStrategicPoints.prototype.addSupportPts = async function (inpData) {
    var initModels = require("../models/init-models"); 
    var models = initModels(sequelize);
    var mdlstockstgypts = models.stocksupportpoints

    console.log("data before insert",inpData)

    let transformedarr = inpData.map(item => ({'symbol':this.stkSym,'close':item.close,'date':item.date}))

    await mdlstockstgypts.destroy({where: {
        symbol: {
          [Op.eq] : this.stkSym
        }
      }
    })

    await mdlstockstgypts.bulkCreate(transformedarr, {
    updateOnDuplicate: ["close"] 
    })
};

StockStrategicPoints.prototype.getSupportPts = async function (){
  var initModels = require("../models/init-models"); 
  var models = initModels(sequelize);
  var mdlstockstgypts = models.stocksupportpoints
  let response = []

  await mdlstockstgypts.findAll({where: {
        symbol: {
          [Op.eq] : this.stkSym
        }
      },
      attributes: ['close', 'date']
    }).then(data => response = data)

  return response  
}

module.exports = {StockStrategicPoints};
