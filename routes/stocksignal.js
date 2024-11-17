const URLConfig = require("../config/url.config.js");
const urlconf = new URLConfig()
const URL_HOST = urlconf.HOST

module.exports = (app,ensureAuthenticated) => {
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
  app.get('/api/stocksignals/indicators/:stksym/:stkInd/:stkLast', ensureAuthenticated, async (req, res) => {
    let response
    try{
      let defaultDur = 12
      let myCache = require('../servercache/cacheitemsglobal')
      let cacheKey = "TOPIND_" + req.params.stksym + '_' + req.params.stkInd + '_' + defaultDur
      response = await myCache.getCache(cacheKey)
      if (!response){
        const fetch = require("node-fetch");
        await fetch(URL_HOST + 'pricetrends/indicatorsatclose/' + req.params.stksym + '/' + req.params.stkInd + '/' + defaultDur)
        .then(res => res.json())
        .then(json => {response=json})
        if (response.message || response?.length === 0){
          throw 'Error from backend';
        }
      }else{
        console.log("found in cache - stocksignals - indicators",cacheKey)
        return res.status(200).send(response)
      }
      if (req.params.stkLast){
        response = JSON.parse(response).pop()
        myCache.setCacheWithTtl(cacheKey,response,600) 
        return res.status(200).send(response)
      }else{
        return res.status(200).send(response)
      }  
    }
    catch (err){
      console.log("error in err api/stocksignals/indicators",req.params.stksym,err)
      return res.status(200).send([])
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
      let myCache = require('../servercache/cacheitemsglobal')
      let cacheKey = "IND_" + req.params.stksym + '_' + req.params.indType + '_' + req.params.indVal + "_" + req.params.stkdur
      response = await myCache.getCache(cacheKey)
      if (!response){
        const fetch = require("node-fetch");
        await fetch(URL_HOST + 'pricetrends/indicatorsatclose/' + req.params.stksym + '/' + 
                    req.params.indType + '/' + req.params.indVal + '/' + req.params.stkdur)
        .then(res => res.json())
        .then(json => {response=json})

        console.log("Cache miss - ",cacheKey)
        
        if (response.message){
          throw 'Error from backend';
        }else{
          myCache.setCacheWithTtl(cacheKey,response,600)
        }
      }
      else{
        console.log("found in cache...../api/stocksignals/indicators" , cacheKey)
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
  app.get('/api/stocksignals/suppresistance/:stksym', ensureAuthenticated, async (req, res) => {
    let response = []
    try{
      const fetch = require("node-fetch");
      await fetch(URL_HOST + 'pricetrends/supportresistance/' + req.params.stksym)
      .then(res => res.json())
      .then(json => {response=JSON.parse(json)});
    }
    catch (err){
      console.log(err)
    }
    return res.status(200).send(({symbol:req.params.stksym, type:"SAR",data:response}))
  });
  app.post('/api/stocksignals/searchdataset', ensureAuthenticated, async (req, res) => {
    let response = []
    try{
      const fetch = require("node-fetch");
      await fetch(URL_HOST + 'pricetrends/searchdataset', 
      {method:'post', body:JSON.stringify(req.body), 
      headers: { 'Content-Type': 'application/json' }}).then(res => res.json())
      .then(json => {response=JSON.parse(json)});
    }
    catch (err){
      console.log(err)
    }
    return res.status(200).send(response)
  });
  app.get('/api/stocksignals/parsesearchtext', ensureAuthenticated, async (req, res) => {
    let response = []
    try{
      const fetch = require("node-fetch");
      await fetch(URL_HOST + 'pricetrends/extractintent' + '?parsesearch=' + req.query.parsetext)
      .then(res => res.json())
      .then(json => response=json);
    }
    catch (err){
      console.log(err)
    }
    return res.status(200).send(response)
  });
}