const URLConfig = require("../config/url.config.js");
const urlconf = new URLConfig()
const URL_HOST = urlconf.HOST

module.exports = (app,ensureAuthenticated) => {
  app.get('/api/stocks', ensureAuthenticated, async (req, res) => {
    const fetch = require("node-fetch");
    let response = []
    try{
      const getallstocks = require('../server/stockmaster');
      console.log("req.params.stkList",req.query.stkList.split(","))
      let stocks = req.query.stkList.split(",")
      if(stocks && stocks.length > 0){
        response = await getallstocks.getStockDetailsForList(stocks)
      }
    }
    catch (err){
      console.log(err)
    }
    return res.status(200).send(response);
  });
  app.get('/api/stocks/limit/:numberofstks', ensureAuthenticated, async (req, res) => {
    const fetch = require("node-fetch");
    let response = []
    try{
      const getallstocks = require('../server/stockmaster');
      console.log("req.params.stkList",req.query.stkList.split(","))
      let stocks = req.query.stkList.split(",")
      if(stocks && stocks.length > 0){
        response = await getallstocks.getstockquotesformulstks(stocks,parseInt(req.params.numberofstks))
      }
    }
    catch (err){
      console.log(err)
    }
    return res.status(200).send(response);
  });
  app.get('/api/stocks/v2',ensureAuthenticated, async (req, res) => {
    console.log('made it in v2?')
    const fetch = require("node-fetch");
    let response
    try{
      const getallstocks = require('../server/stockmaster');
      response = await getallstocks.getStockLists(req.user)
    }
    catch (err){
      console.log(err)
    }
    return res.status(200).send(response);
  });

  app.get('/api/stocks/latest/:stksym', async (req, res) => {
    const fetch = require("node-fetch");
    let response
    try{
      await fetch(URL_HOST + 'pricetrends/latestprc/' + req.params.stksym)
      .then(res => res.json())
      .then(json => {response=json});
    }
    catch (err){
      console.log(err)
    }
    return res.status(200).send(response);
  });

  app.get('/api/stocks/history/:stksym', async (req, res) => {
    const fetch = require("node-fetch");
    let response
    try{
      await fetch(URL_HOST + 'pricetrends/historical/' + req.params.stksym)
      .then(res => res.json())
      .then(json => {response=json});
    }
    catch (err){
      console.log(err)
    }
    return res.status(200).send(response);
  });

  app.get('/api/stocks/:stksym', async (req, res) => {
    const fetch = require("node-fetch");
    let response
    try{
      await fetch(URL_HOST + 'Stk/getdashboardview/' + req.params.stksym)
      .then(res => res.json())
      .then(json => {response=json});
    }
    catch (err){
      console.log(err)
    }
    return res.status(200).send(response);
  });

  app.get('/api/stocks/:stksym/:stkdur', async (req, res) => {
    const stkQuotes = require('../server/stockquotes')
    let response = {}
    try{
      response = await stkQuotes.getStockPricesForDuration(req.params.stksym,parseInt(req.params.stkdur))
    }
    catch (err){
      console.log(err)
    }
    return res.status(200).send(response);
  });

  app.get('/api/stocks/perchange/:stksym/:stkdur/:perchng', async (req, res) => {
    const fetch = require("node-fetch");
    let response
    try{
      await fetch(URL_HOST + 'pricetrends/perchng/' + req.params.stksym + '/' + req.params.stkdur + '/' + req.params.perchng)
      .then(res => res.json())
      .then(json => {response=json});
    }
    catch (err){
      console.log(err)
    }
    return res.status(200).send(response);
  });
  app.get('/api/allstocks', ensureAuthenticated, async (req, res) => {
    let response = []
    try{
      const getallstocks = require('../server/stockmaster');
      response = await getallstocks.getAllStocks()
    }
    catch (err){
      console.log(err)
    }
    return res.status(200).send(response);
  });
  app.post('/api/stockquotes/bulk/:typeOfQuote', async (req, res) => {
    var stkquotes = require('../server/stockquotes');
    let response
    try{
      response = await stkquotes.updateStockQuotesBulk(req.body,req.params.typeOfQuote)
    }
    catch (err){
      console.log(err)
    }
    return res.status(200).send(response);
  });
  app.get('/api/stockquotes/bulk/:typeOfQuote', async (req, res) => {
    let response = []
    try{
      var stkquotes = require('../server/stockquotes');
      response = await stkquotes.getStockQuotesBulk(req.params.typeOfQuote)
    }
    catch (err){
      console.log(err)
    }
    return res.status(200).send(response);
  });
/*
  //Below code is not working...not sure why the routing is not being detected...
  app.get('/api/stocks/dashboard/:stksym', async (req, res) => {
    try{
      console.log("in the dashboard node route function....")
      await fetch(URL_HOST + 'Stk/getdashboardview/' + req.params.stksym)
      .then(res => res.json())
      .then(json => {response=json});
    }
    catch (err){
      console.log(err)
    }
    return res.status(200).send(response);
  });
  */
}
