const URLConfig = require("../config/url.config.js");
const urlconf = new URLConfig()
const URL_HOST = urlconf.HOST

module.exports = (app) => {
  app.get('/api/stocksignals/:stksym/:stktermtype', async (req, res) => {
    try{
      const fetch = require("node-fetch");
      await fetch(URL_HOST + 'stksignals/whatif/getindssnearprice/' + req.params.stksym + '/' + req.params.stktermtype)
      .then(res => res.json())
      .then(json => {response=json});
    }
    catch (err){
      console.log(err)
    }
    return res.status(200).send(response);
  });
  app.get('/api/stocksignals/perf/:stkstgyid/:stkdur/:stksym', async (req, res) => {
    try{
      const fetch = require("node-fetch");
      console.log("Here in stocksignals performance???")
      await fetch(URL_HOST + 'stksignals/strgyperf/' + req.params.stkstgyid + '/' + req.params.stkdur + '/' + req.params.stksym)
      .then(res => res.json())
      .then(json => {response=json});
    }
    catch (err){
      console.log(err)
    }
    return res.status(200).send(response);
  });
  app.get('/api/stocksignals/swing/:stksym/:stkdur', async (req, res) => {
    try{
      const fetch = require("node-fetch");
      await fetch(URL_HOST + 'stksignals/swingtrds/' + req.params.stksym + '/' + req.params.stkdur)
      .then(res => res.json())
      .then(json => {response=json});
    }
    catch (err){
      console.log(err)
    }
    return res.status(200).send(response);
  });
  app.post('/api/stocksignals/updswing/:stksym/:stkdur', async (req, res) => {
    const fetch = require("node-fetch");
    let response
    try{
      console.log("req",req.body)
      await fetch(URL_HOST + 'stksignals/swingtrds/' + req.params.stksym + '/' + req.params.stkdur, {method:'post', body:JSON.stringify(req.body), headers: { 'Content-Type': 'application/json' }})
      .then(res => res.json())
      .then(json => {response=json});
    }
    catch (err){
      console.log(err)
    }
    return res.status(200).send(response);
  });
  app.get('/api/stocksignals/curswingpts/:stksym/:stkdur', async (req, res) => {
    try{
      const fetch = require("node-fetch");
      await fetch(URL_HOST + 'stksignals/curswingpts/' + req.params.stksym + '/' + req.params.stkdur)
      .then(res => res.json())
      .then(json => {response=json});
    }
    catch (err){
      console.log(err)
    }
    return res.status(200).send(response);
  });
  app.post('/api/stocksignals/delswingpts/:stksym', async (req, res) => {
    const fetch = require("node-fetch");
    let response
    try{
      console.log("req",req.body)
      await fetch(URL_HOST + 'stksignals/delswingtrds/' + req.params.stksym, {method:'post', body:JSON.stringify(req.body), headers: { 'Content-Type': 'application/json' }})
      .then(res => res.json())
      .then(json => {response=json});
    }
    catch (err){
      console.log(err)
    }
    return res.status(200).send(response);
  });
  app.get('/api/stocksignals/indicators/:stksym/:stkInd/:stkdur', async (req, res) => {
    let response
    try{
      let myCache = require('../servercache/cacheitems')
      response = myCache.getCache(req.params.stkInd + '_' + req.params.stksym)
      console.log('response from cache - indicators....',response,myCache.getCacheKeys(),req.params.stkInd + '_' + req.params.stksym)
      if (response === undefined){
        const fetch = require("node-fetch");
        await fetch(URL_HOST + 'StkStats/indicators/' + req.params.stksym + '/' + req.params.stkInd + '/' + req.params.stkdur)
        .then(res => res.json())
        .then(json => {response=json});
        let cacheset = myCache.setCache(req.params.stkInd + '_' + req.params.stksym,response)
        console.log("Cache was set in /api/stocksignals/indicators/...",cacheset)
      }
    }
    catch (err){
      console.log(err)
    }
    return res.status(200).send(response);
  });
  app.get('/api/stocksignals/v2/notifications/:tilldate', async (req, res) => {
    let response = ''
    try{
        var notifications = require('../server/stocknotifications');
        await notifications.getnotifications(req.params.tilldate).then(retdata => response = retdata)
    }
    catch (err){
      console.log(err)
    }
    return res.status(200).send(response);
  }); 
  app.get('/api/stocksignals/v2/supportnotifications/:tilldate/:stksym', async (req, res) => {
    let response = ''
    try{
        var notifications = require('../server/stocknotifications');
        await notifications.getNotificationsForSupport(req.params.tilldate,req.params.stksym).then(retdata => response = retdata)
    }
    catch (err){
      console.log(err)
    }
    return res.status(200).send(response);
  });  
  app.get('/api/stocksignals/v2/candlepatterns/:stksym/:stkdur/:candleptrn', async (req, res) => {
    const fetch = require("node-fetch");
    let response
    try{
      console.log("req",req.body)
      await fetch(URL_HOST + 'stksignals/getallcandlepatterns/' + req.params.stksym + '/' + req.params.stkdur + '/' + req.params.candleptrn)
      .then(res => res.json())
      .then(json => {response=json});
    }
    catch (err){
      console.log(err)
    }
    return res.status(200).send(response);
  });
  app.get('/api/stocksignals/v2/getcdlpttrns/:stksym/:stkdur/:candleptrn/:gobackdays', async (req, res) => {
    const fetch = require("node-fetch");
    const transformcdldata = require("../server/stockdatatransform")
    let response
    try{
      console.log("req in /api/stocksignals/v2/getcdlpttrns",req.body)
      await fetch(URL_HOST + 'stksignals/getallcandlepatterns/' + req.params.stksym + '/' + req.params.stkdur + '/' + req.params.candleptrn)
      .then(res => res.json())
      .then(json => {response=json});
      console.log(response)
      await transformcdldata.getrecentcdlpatterns(response,req.params.gobackdays).then(databack => response = databack)
      console.log('before leaving server - ',response)
    }
    catch (err){
      console.log(err)
    }
    return res.status(200).send(response);
  });  
}
