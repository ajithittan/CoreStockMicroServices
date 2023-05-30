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
  app.get('/api/stocksignals/indicators/:stksym/:stkInd/:stkLast', async (req, res) => {
    let response
    try{
      let defaultDur = 12
      let myCache = require('../servercache/cacheitems')
      response = myCache.getCache(req.params.stkInd + '_' + req.params.stksym + '_' + defaultDur)
      if (response === undefined){
        const fetch = require("node-fetch");
        await fetch(URL_HOST + 'pricetrends/indicatorsatclose/' + req.params.stksym + '/' + req.params.stkInd + '/' + defaultDur)
        .then(res => res.json())
        .then(json => {response=json})
        if (response.message || response?.length === 0){
          throw 'Error from backend';
        }else{
          myCache.setCache(req.params.stkInd + '_' + req.params.stksym + '_' + defaultDur,response)
        }
      }
      else{
        console.log("found in cache...../api/stocksignals/indicators",req.params.stksym,req.params.stkInd)
      }
    }
    catch (err){
      console.log("error in err api/stocksignals/indicators",err)
      return res.status(200).send([])
    }
    if (req.params.stkLast){
      return res.status(200).send(JSON.parse(response).pop())
    }else{
      return res.status(200).send(response)
    }
  });
  app.get('/api/indicators/:stksym/:stkInd/:stkdur', async (req, res) => {
    let response
    try{
      let myCache = require('../servercache/cacheitems')
      response = myCache.getCache(req.params.stkInd + '_' + req.params.stksym + '_' + req.params.stkdur)
      if (response === undefined){
        const fetch = require("node-fetch");
        await fetch(URL_HOST + 'pricetrends/indicatorsatclose/' + req.params.stksym + '/' + req.params.stkInd + '/' + req.params.stkdur)
        .then(res => res.json())
        .then(json => {response=json})
        
        if (response.message){
          throw 'Error from backend';
        }else{
          myCache.setCache(req.params.stkInd + '_' + req.params.stksym + '_' + req.params.stkdur,response)
        }
      }
      else{
        console.log("found in cache...../api/stocksignals/indicators")
      }
    }
    catch (err){
      console.log("error in err api/stocksignals/indicators",err)
      return res.status(200).send([])
    }
    if (req.params.stkLast){
      return res.status(200).send(JSON.parse(response).pop())
    }else{
      return res.status(200).send(response)
    }
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
  app.get('/api/indicators/:stksym/:indType/:indVal/:stkdur', async (req, res) => {
    let response
    try{
      let myCache = require('../servercache/cacheitems')
      let cacheKey = req.params.stksym + '_' + req.params.indType + '_' + req.params.indVal + "_" + req.params.stkdur
      response = myCache.getCache(cacheKey)
      if (response === undefined){
        const fetch = require("node-fetch");
        await fetch(URL_HOST + 'pricetrends/indicatorsatclose/' + req.params.stksym + '/' + 
                    req.params.indType + '/' + req.params.indVal + '/' + req.params.stkdur)
        .then(res => res.json())
        .then(json => {response=json})

        console.log("in here - for indicators cache",response)
        
        if (response.message){
          throw 'Error from backend';
        }else{
          myCache.setCache(cacheKey,response)
        }
      }
      else{
        console.log("found in cache...../api/stocksignals/indicators" , cacheKey,response)
      }
    }
    catch (err){
      console.log("error in err api/stocksignals/indicators" + req.params.indVal,err)
      return res.status(200).send([])
    }
    if (req.params.stkLast){
      return res.status(200).send(JSON.parse(response).pop())
    }else{
      return res.status(200).send(response)
    }
  });  
}
