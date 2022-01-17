const DBConfig = require("../config/db.config.js");
const { Op } = require("sequelize");
const conf = new DBConfig()

const Sequelize = require("sequelize");
const sequelize = new Sequelize(conf.DB, conf.USER, conf.PASSWORD, {
    host: conf.HOST,
    dialect: conf.dialect
  })

const getnotifications = async (inpdt) => {
    let response = ''
    try {
        var initModels = require("../models/init-models"); 
        var models = initModels(sequelize);
        var stockstrategypoints = models.stockstrategypoints
        var stockstrategy = models.stockstrategy

        stockstrategypoints.belongsTo(stockstrategy,{foreignKey : 'stockstrategyid'})

        await stockstrategypoints.findAll({where: {
            date: {
                [Op.gt] : new Date(inpdt)
            }
          },
          include: [{ model: stockstrategy, required: true }],
          order: [
            ['date', 'DESC']
        ]
        }).then(data => response=data) 

      } catch (error) {
        console.error('Error in getnotifications function:', error);
    }
    return response
}

const getNotificationsForSupport = async (datefrom,stksym) =>{
  let arrofsupport = []
  let retArr = []
  let latestprc = 0
  console.log('i n h e r e t o o - getNotificationsForSupport')

  try {
      arrofsupport = await getsupportfromdb(stksym) 
      console.log("length of array is ",arrofsupport.length)             
      for (let i=0; i<arrofsupport.length; i++){
        console.log(arrofsupport[i])
        if (i ===0){
          latestprc= await getLatestStockPrice(stksym)
        }
        if (arrofsupport[i].swingPts){
          let suppobj = arrofsupport[i].swingPts.find(item => item.mainLine ==='Y')
          let arrofprices = await gethistroicalpricefromDb(stksym,suppobj.date)
          let newDt = getprojecteddate(arrofprices.slice(-1)[0].date)
          let projclose = (arrofprices.length -1)*suppobj.sup_slope + suppobj.close
          suppobj.supportid = arrofsupport[i].idstockSwings 
          suppobj.projdate = newDt.format('YYYY-MM-DD')
          suppobj.projclose = projclose
          suppobj.projcloseperlatest = checkclosenesstolatestprc(latestprc,projclose)
          suppobj.latestcloseprc = latestprc
          suppobj.type="swing"
          retArr.push(suppobj)    
        }else{
          let suppobj = {}
          suppobj.supportid = arrofsupport[i].idstocksupportpoints
          suppobj.projcloseperlatest = checkclosenesstolatestprc(latestprc,arrofsupport[i].close)
          suppobj.latestcloseprc = latestprc
          suppobj.type="support"
          retArr.push(suppobj)
        }
      }
      } catch (error) {
        console.error('E r r o r - getNotificationsForSupport function:', stksym, error);
      }
    //console.log("data in getNotificationsForSupport",retArr)  
    retArr.sort((a, b) => Math.abs(a.projcloseperlatest) - Math.abs(b.projcloseperlatest))
    return retArr
}

const getsupportfromdb = async (stksym) => {
  let arrofsupport = []
  var initModels = require("../models/init-models"); 
  var models = initModels(sequelize);
  var mdlSupport = models.stockswings
  var mdlstockstgypts = models.stocksupportpoints

  await mdlSupport.findAll({where: {
        symbol: {
            [Op.eq] : stksym
        }
      },
      order: [
        ['asofdate', 'DESC']
    ]
    }).then(data => arrofsupport=data) 
   
    await mdlstockstgypts.findAll({where: {
        symbol: {
          [Op.eq] : stksym
        }
      }
    }).then(data2 => arrofsupport = [...arrofsupport,...data2]) 

    return arrofsupport 
}

const getprojecteddate = (latestDt) =>{
  const moment = require("moment");
  let lastdate = new Date(latestDt.replace(/-/g, '\/'))
  
  if (lastdate.getDay() === 5) return moment(lastdate,'YYYY-MM-DD').add(3,'day')
  else return moment(lastdate,'YYYY-MM-DD').add(1,'day')
}

const gethistroicalpricefromDb = async (stksym,fromDt) =>{
    let retData = []
    var initModels = require("../models/init-models"); 
    var models = initModels(sequelize);
    var mdlStockprice = models.stockpriceday

    await mdlStockprice.findAll({where: {
          symbol: {
              [Op.eq] : stksym
          },
          date: {
            [Op.gt] : new Date(fromDt)
          }
        },
        order: [
          ['date', 'ASC']
      ]
      }).then(data => retData=data)
    return retData
}

const getLatestStockPrice = async (stksym) => {
  let latestregprc = 0
  const stkInfo = require('stock-info');
  await stkInfo.getSingleStockInfo(stksym).then(retData => latestregprc = retData.regularMarketPrice);
  return parseFloat(latestregprc)
}

const checkclosenesstolatestprc = (pricefrom,priceto) => {
  return parseFloat(((pricefrom - priceto)/((pricefrom + priceto)/2))*100)
}

const sendsmsnotifications = async (fromDt) => {
  let retData = []
  var initModels = require("../models/init-models"); 
  var models = initModels(sequelize);
  var stockstrategypoints = models.stockstrategypoints

  await mdlStockprice.findAll({where: {
        date: {
          [Op.gt] : new Date(fromDt)
        }
      },
      order: [
        ['date', 'ASC']
    ]
    }).then(data => retData=data)

}

module.exports = {getnotifications,getNotificationsForSupport};