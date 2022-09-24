const URLConfig = require("../config/url.config.js");
const urlconf = new URLConfig()
const URL_HOST = urlconf.HOST

module.exports = (app,ensureAuthenticated) => {
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
    app.get('/api/v2/stocks/secperchange/:stksym/:stkdur/:rollup/:unit', async (req, res) => {
      const fetch = require("node-fetch");
      let response
      try{
        await fetch(URL_HOST + 'Stk1/secperchng/' + req.params.stksym + '/' + req.params.stkdur + '/' + req.params.rollup + '/' + req.params.unit)
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
      app.get('/api/v2/sectors', ensureAuthenticated, async (req, res) => {
        var masterstkops = require('../server/stockmaster');
        let response
        try{
          response = await masterstkops.getStockSectors(req.user)
        }
        catch (err){
          console.log(err)
        }
        return res.status(200).send(response);
      });
      app.post('/api/v2/sectors', ensureAuthenticated, async (req, res) => {
        var masterstkops = require('../server/stockmaster');
        let response
        try{
          response = await masterstkops.createStockSectors(req.body,req.user)
          /** 
          if (response){
            let stocks = req.body.stocks
            for (let i=0;i < stocks.length;i++ ){
                await masterstkops.getStockHistData(stocks[i],0)
            }
          }**/
        }
        catch (err){
          console.log(err)
        }
        return res.status(200).send(response);
      });
      app.post('/api/v2/delsectors/:sectorid',ensureAuthenticated, async (req, res) => {
        var masterstkops = require('../server/stockmaster');
        let response
        try{
          response = await masterstkops.deleteSector(req.params.sectorid)
        }
        catch (err){
          console.log(err)
        }
        return res.status(200).send(response);
      });
      app.post('/api/v2/updsectors',ensureAuthenticated, async (req, res) => {
        var masterstkops = require('../server/stockmaster');
        let request = req.body
        let response 
        try{
          console.log(request)
          response = await masterstkops.updSectors(request,'007')
          if (response){
            for (let j=0;j<request.length;j++){
              let stocks = request[j].stocks
              for (let i=0;i < stocks.length;i++ ){
                  await masterstkops.getStockHistData(stocks[i],0)
              }  
            }
          }
        }
        catch (err){
          console.log(err)
        }
        return res.status(200).send(response);
      });
      app.post('/api/v2/syncstkprices', async (req, res) => {
        var masterstkops = require('../server/stockmaster');
        let response
        try{
          response = await masterstkops.updateAllStockPrices()
        }
        catch (err){
          console.log(err)
        }
        return res.status(200).send(response);
      });
      app.post('/api/v2/savepositions', ensureAuthenticated, async (req, res) => {
        var masterstkops = require('../server/stockmaster');
        let response
        try{
          response = await masterstkops.savePositions(req.body,req.user)
        }
        catch (err){
          console.log(err)
        }
        return res.status(200).send(response);
      });
      app.post('/api/v2/deletestkpos/:stksym', ensureAuthenticated, async (req, res) => {
        var masterstkops = require('../server/stockmaster');
        let response
        try{
          response = await masterstkops.deleteStkPositions(req.params.stksym,req.user)
        }
        catch (err){
          console.log(err)
        }
        return res.status(200).send(response);
      });
      app.get('/api/v2/checkvalidstock/:stksym', async (req, res) => {
        const masterstkops = require('../server/stockmaster')
        let response
        try{
          response = await masterstkops.getValidityOfStock(req.params.stksym)
          console.log(response)
        }
        catch (err){
          console.log(err)
        }
        return res.status(200).send(response);
      });
  }
   