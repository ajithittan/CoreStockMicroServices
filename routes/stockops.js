const URLConfig = require("../config/url.config.js");
const urlconf = new URLConfig()
const URL_HOST = urlconf.HOST

module.exports = (app) => {
  app.post('/api/stockops', async (req, res) => {
    console.log('app.post - stockops',req.body)
    let inpData = req.body
    const stkInds = require("../server/stockindicators")
    let response = ''
    try{
        let objstkprc = new stkInds.StockIndicators(inpData.stock,120)
        let histData = await objstkprc.getAllIndicators()
        response = await performbacktest(histData)    
    }
    catch (err){
      console.log(err)
    }
    return res.status(200).send(response);
  });

  const performbacktest = async (histdata) =>{
    const StockBackTestOps = require("../server/stockbacktest");
    let objstkbacktest = new StockBackTestOps.StockBackTest(histdata)
    let arrbacktest = await objstkbacktest.backtest(5,5)
    return arrbacktest
  }
  app.post('/api/stockops/support', async (req, res) => {
    console.log('app.post - stockops - updatesupport',req.body)
    let inpData = req.body
    try{
      const stkStrgyPts = require("../server/stockstrategicpoints")
      let objStrgyPts = new stkStrgyPts.StockStrategicPoints(inpData.stkSym)
      let arrbacktest = await objStrgyPts.addSupportPts(inpData.suppoints)  
    }
    catch (err){
      console.log(err)
    }
    return res.status(200).send(true);
  });
  app.get('/api/stockops/support/:stksym', async (req, res) => {

    let response
    console.log("in here to get support lines....")
    try{
      const stkStrgyPts = require("../server/stockstrategicpoints")
      let objStrgyPts = new stkStrgyPts.StockStrategicPoints(req.params.stksym)
      response = await objStrgyPts.getSupportPts()  
    }
    catch (err){
      console.log(err)
    }
    return res.status(200).send(response);
  });
}
