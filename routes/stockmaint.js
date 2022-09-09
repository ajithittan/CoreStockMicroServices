const URLConfig = require("../config/url.config.js");
const urlconf = new URLConfig()
const URL_HOST = urlconf.HOST

module.exports = (app,ensureAuthenticated) => {
  app.get('/api/stkmaint/grps', ensureAuthenticated, async (req, res) => {
    try{
      const fetch = require("node-fetch");
      await fetch(URL_HOST + 'Stk1/strategy/ALL')
      .then(res => res.json())
      .then(json => {response=json});
    }
    catch (err){
      console.log(err)
    }
    return res.status(200).send(response);
  });
  app.get('/api/stkmaint/cdlpttrns', async (req, res) => {
    let response
    try{
      var stockmstr = require('../server/stockmaster');
      await stockmstr.getcdlpatterns().then(retdata => response = retdata)
    }
    catch (err){
      console.log(err)
    }
    return res.status(200).send(response);
  });
  app.get('/api/stkmaint/allindparans', async (req, res) => {
    let response
    try{
      var stockmstr = require('../server/stockmaster');
      await stockmstr.getAllIndicatorParams().then(retdata => response = retdata)
    }
    catch (err){
      console.log(err)
    }
    return res.status(200).send(response);
  });  
  app.get('/api/stkmaint/cdlpttrnstrack/:tracktype', async (req, res) => {
    let response
    try{
      var stockmstr = require('../server/stockmaster');
      await stockmstr.getcdlpatternstrack(req.params.tracktype).then(retdata => response = retdata)
    }
    catch (err){
      console.log(err)
    }
    return res.status(200).send(response);
  }); 
  app.post('/api/stkmaint/updatecdlpttrntrk/', async (req, res) => {
    let response
    console.log('updatecdlpttrntrk',req.body)
    try{
      var stockmstr = require('../server/stockmaster');
      stockmstr.updcdlpatternstrack(req.body.cdl_pattern,req.body.track_type).then(retdata => response = retdata)
    }
    catch (err){
      console.log(err)
    }
    return res.status(200).send(response);
  });    
  app.get('/api/stkmaint/stksellpts/', async (req, res) => {
    console.log("in construction")
    //let stocksellpts = await sellpts.find();
    //return res.status(200).send(stocksellpts);
  });
  app.get('/api/stkmaint/stkbuypts/', async (req, res) => {
    console.log("in construction")
    //let stockbuypts = await buypts.find();
    //return res.status(200).send(stockbuypts);
  });
  app.get('/api/stkmaint/exitpts/', async (req, res) => {
    console.log("in construction")
    //let stkexitpts = await exitpts.find();
    //return res.status(200).send(stkexitpts);
  });
  app.post('/api/stkmaint/flushcache', async (req, res) => {
    let response
    try{
      var stockmstr = require('../server/stockmaster');
      stockmstr.flushAllCache().then(retdata => response = retdata)
    }
    catch (err){
      console.log(err)
    }
    return res.status(200).send(response);
  });  
  app.post('/api/stkmaint/stoptrack/:stkSym', async (req, res) => {
    let response
    try{
      var stockmstr = require('../server/stockmaster');
      response = stockmstr.stopTrackingStock(req.params.stkSym).then(retdata => response = retdata)
    }
    catch (err){
      console.log(err)
    }
    return res.status(200).send(response);
  });  
}
