const DBConfig = require("../config/db.config.js");
const { Op } = require("sequelize");
const conf = new DBConfig()

const Sequelize = require("sequelize");
const sequelize = new Sequelize(conf.DB, conf.USER, conf.PASSWORD, {
    host: conf.HOST,
    dialect: conf.dialect
  })

const getDashboardOptions = async (unqUid) =>{
    let dashboardopts
    try {
        let myCache = require('../servercache/cacheitems')
        dashboardopts = myCache.getCache("DASHBOARD_OPTIONS_" + unqUid)
        console.log("myCache.getStats",myCache.getCacheStats(),dashboardopts)
        if (dashboardopts === undefined){
            dashboardopts = {}  
          var initModels = require("../models/init-models"); 
          var models = initModels(sequelize);
          var usercustomopts = models.usercustomizeoptions

          await usercustomopts.findAll({where: {
            uuid: {
              [Op.eq] : unqUid
            }
          },raw : true
        }).then(data => dashboardopts=data)
          
          console.log("from Db.......",dashboardopts[0])

            if (dashboardopts !== {}){
                let cacheset = myCache.setCacheWithTtl("DASHBOARD_OPTIONS_" + unqUid,dashboardopts,120)
                console.log("Cache was set in function getDashboardOptions...",cacheset)
            }    
        }
        return dashboardopts[0];
      }catch (error) {
        console.error('Error in getDashboardOptions function:', error);
    }
}  

module.exports = {getDashboardOptions}