const URLConfig = require("../config/url.config.js");
const urlconf = new URLConfig()
const URL_HOST = urlconf.HOST

module.exports = (app) => {
    app.get('/api/v2/stocks/perchange/:stksym/:stkdur/:perchng', async (req, res) => {
      const fetch = require("node-fetch");
      const getperchangedata = require('../server/stockdatatransform')
      let response

      try{
        await fetch(URL_HOST + 'Stk1/perchng/' + req.params.stksym + '/' + req.params.stkdur + '/' + req.params.perchng)
        .then(res => res.json())
        .then(json => {response=json});
        response = await getperchangedata.stockdataperchange(response)
      }
      catch (err){
        console.log(err)
      }
      return res.status(200).send(response);
    });
    app.get('/api/v2/stocks/perchange/:stksym/:stkdur/:rollup/:unit', async (req, res) => {
      const fetch = require("node-fetch");
      let response
      try{
        await fetch(URL_HOST + 'Stk1/perchng/' + req.params.stksym + '/' + req.params.stkdur + '/' + req.params.rollup + '/' + req.params.unit)
        .then(res => res.json())
        .then(json => {response=json});
      }
      catch (err){
        console.log(err)
      }
      return res.status(200).send(response);
    });
    app.get('/api/v2/stocks/similarstks/:stksym', async (req, res) => {
        const fetch = require("node-fetch");
        const getperchangedata = require('../server/stockdatatransform')
        let response
        try{
          response = await getperchangedata.getstockfamily(req.params.stksym)
          console.log(response)
        }
        catch (err){
          console.log(err)
        }
        return res.status(200).send(response);
      });
      app.post('/api/v2/stocks/getstkdata/:stksym/:position', async (req, res) => {
        let response
        try{
          console.log('in here to get data from yahoo....')
          var masterstkops = require('../server/stockmaster');
          await masterstkops.getStockHistData(req.params.stksym,req.params.position).then(data => response=data)
        }
        catch (err){
          console.log(err)
        }
        return res.status(200).send(response);
      });
      app.get('/api/v2/sectors', async (req, res) => {
        var masterstkops = require('../server/stockmaster');
        let response
        try{
          response = await masterstkops.getStockSectors()
        }
        catch (err){
          console.log(err)
        }
        return res.status(200).send(response);
      });
      app.post('/api/v2/sectors', async (req, res) => {
        var masterstkops = require('../server/stockmaster');
        let response
        try{
          response = await masterstkops.createStockSectors(req.body,'007')
          if (response){
            let stocks = req.body.stocks
            for (let i=0;i < stocks.length;i++ ){
                await masterstkops.getStockHistData(stocks[i],0)
            }
          }
        }
        catch (err){
          console.log(err)
        }
        return res.status(200).send(response);
      });
  }
   