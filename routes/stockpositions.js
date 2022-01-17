const URLConfig = require("../config/url.config.js");
const urlconf = new URLConfig()
const URL_HOST = urlconf.HOST2

module.exports = (app) => {
  app.post('/api/positions', async (req, res) => {
    const varStockPositions = require("../server/stockpositions");
    console.log('app.post - stockpositions',req.body)
    let inpData = req.body
    let response
    try{
      let objstkpos = new varStockPositions.StockPositions(inpData.stksym)
      let signType = {}
      signType.details = inpData.patterns
      signType.type = inpData.type
      //curl -X POST  -H "Content-Type: application/json" -d '{"close":120.54,"profit":8.5,"stoploss":9.5,"sigType":"[{type:candle,desc:3OUTSIDE}]"}'  http://0.0.0.0:5000/api/positions/ABT
      response = await objstkpos.createPosition(inpData.close,inpData.date,signType,inpData.profit,inpData.stoploss,inpData.positionsize)
    }
    catch (err){
      console.log(err)
    }
    return res.status(200).send(response);
  });
  app.get('/api/positions/:stksym', async (req, res) => {

    let response
    console.log("in here to get /api/positions....",req.params.stksym)
    try{
      const varStockPositions = require("../server/stockpositions");
      let objstkpos = new varStockPositions.StockPositions(req.params.stksym)
      response = await objstkpos.getPositions()
    }
    catch (err){
      console.log(err)
    }
    return res.status(200).send(response);
  });  
}
