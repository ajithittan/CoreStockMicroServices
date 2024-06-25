const URLConfig = require("../config/url.config.js");
const urlconf = new URLConfig()
const URL_HOST = urlconf.HOST

module.exports = (app,ensureAuthenticated) => {
  app.post('/api/stocks/compare/:stkdur/:perchng', async (req, res) => {
    console.log("made it to stockstats.js file....")
    const fetch = require("node-fetch");
    let response
    try{
      console.log("req",req.body)
      await fetch(URL_HOST + 'pricetrends/Compare/' + req.params.stkdur + '/' + req.params.perchng, {method:'post', body:JSON.stringify(req.body), headers: { 'Content-Type': 'application/json' }})
      .then(res => res.json())
      .then(json => {response=json});
    }
    catch (err){
      console.log(err)
    }
    return res.status(200).send(response);
  });
  app.get('/api/stocks/whatif/:stksym/:stkind/:days/:profit', async (req, res) => {
    const fetch = require("node-fetch");
    let response
    try{
      await fetch(URL_HOST + 'pricetrends/whatif/' + req.params.stksym + '/' + req.params.stkind  + '/' + req.params.days  + '/' + req.params.profit)
      .then(res => res.json())
      .then(json => {response=json});
    }
    catch (err){
      console.log(err)
    }
    return res.status(200).send(response);
  });
  app.post('/api/stocks/whatif/sentiment', async (req, res) => {
    console.log("made it to stockstats.js file....",req.body)
    const fetch = require("node-fetch");
    var sentiana = require('../server/sentimentana');
    let response
    try{
      sentiana.getsentimentana()
    }
    catch (err){
      console.log(err)
    }
    return res.status(200).send(response);
  });
  app.get('/api/corelation/:stkdur',ensureAuthenticated, async (req, res) => {
    const fetch = require("node-fetch");
    let response
    try{
      await fetch(URL_HOST + 'pricetrends/perchng/' + req.params.stkdur + '?stks=AAPL,AMZN,UAA')
      .then(res => res.json())
      .then(json => {response=json});
    }
    catch (err){
      console.log(err)
    }
    return res.status(200).send(response);
  });
}
