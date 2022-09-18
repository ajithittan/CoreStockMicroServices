const URLConfig = require("../config/url.config.js");
const urlconf = new URLConfig()
const URL_HOST = urlconf.HOST

module.exports = (app,ensureAuthenticated) => {
  app.get('/api/stocks', async (req, res) => {
    const fetch = require("node-fetch");
    let response
    try{
      await fetch(URL_HOST + 'Stk')
      .then(res => res.json())
      .then(json => {response=json});
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
      response.forEach(function(itm){
        itm.blink = false;
       })
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
      await fetch(URL_HOST + 'Stk1/latestprc/' + req.params.stksym)
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
      await fetch(URL_HOST + 'Stk1/historical/' + req.params.stksym)
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
    const fetch = require("node-fetch");
    let response
    try{
      await fetch(URL_HOST + 'Stk1/' + req.params.stksym + '/' + req.params.stkdur)
      .then(res => res.json())
      .then(json => {response=json});
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
      await fetch(URL_HOST + 'Stk1/perchng/' + req.params.stksym + '/' + req.params.stkdur + '/' + req.params.perchng)
      .then(res => res.json())
      .then(json => {response=json});
    }
    catch (err){
      console.log(err)
    }
    return res.status(200).send(response);
  });

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
}
