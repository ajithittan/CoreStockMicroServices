const URLConfig = require("../config/url.config.js");
const urlconf = new URLConfig()
const URL_HOST = urlconf.HOST2
const URL_PREDICTIONS = urlconf.STK_PREDICTIONS

module.exports = (app) => {
  app.get('/api/predictionmodels/:stksym', async (req, res) => {
    const fetch = require("node-fetch");
    let response
    try{
      await fetch(URL_PREDICTIONS + 'predictions/models/' + req.params.stksym)
      .then(res => res.json())
      .then(json => {response=json});
    }
    catch (err){
      console.log(err)
    }
    return res.status(200).send(response);
  });
  app.get('/api/predictions/getprediction/:stksym/:model', async (req, res) => {
    const fetch = require("node-fetch");
    let response
    try{
      await fetch(URL_PREDICTIONS + 'predictions/predict/' + req.params.stksym  + '/' + req.params.model)
      .then(res => res.json())
      .then(json => {response=json});
    }
    catch (err){
      console.log(err)
    }
    return res.status(200).send(response);
  });
  app.get('/api/predictions/gethistprediction/:stksym/:model', async (req, res) => {
    const fetch = require("node-fetch");
    let response
    try{
      await fetch(URL_HOST + 'StkPrediction/PredictionAtClose/' + req.params.model + '/' + req.params.stksym)
      .then(res => res.json())
      .then(json => {response=json});
    }
    catch (err){
      console.log(err)
    }
    return res.status(200).send(response);
  });  
  app.post('/api/genpredictions/:stksym/:model', async (req, res) => {
    const fetch = require("node-fetch");
    let response
    try{
      console.log("req",req.body)
      await fetch(URL_PREDICTIONS + 'predictions/' + req.params.stksym + "/" + req.params.model, 
                                  {method:'post', body:JSON.stringify(req.body), 
                                  headers: { 'Content-Type': 'application/json' }})
      .then(res => res.json())
      .then(json => {response=json});
    }
    catch (err){
      console.log(err)
    }
    return res.status(200).send(response);
  });
  app.post('/api/savemodel/:stksym/:model', async (req, res) => {
    const fetch = require("node-fetch");
    let response
    try{
      console.log("req",req.body)
      await fetch(URL_PREDICTIONS + 'predictions/save/' + req.params.stksym + "/" + req.params.model, 
                                  {method:'post', body:JSON.stringify(req.body), 
                                  headers: { 'Content-Type': 'application/json' }})
      .then(res => res.json())
      .then(json => {response=json});
    }
    catch (err){
      console.log(err)
    }
    return res.status(200).send(response);
  });
  }