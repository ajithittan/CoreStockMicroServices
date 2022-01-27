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
      app.post('/api/v2/stocks/getstkdata/:stksym', async (req, res) => {
        let response
        try{
          console.log('in here to get data from yahoo....')
          var masterstkops = require('../server/stockmaster');
          await masterstkops.getStockHistData(req.params.stksym).then(data => response=data)
          //console.log('data returned', response)
          //return stkData
        }
        catch (err){
          console.log(err)
        }
        return res.status(200).send(response);
      });
  }
   