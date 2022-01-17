const URLConfig = require("../config/url.config.js");
const urlconf = new URLConfig()
const URL_HOST = urlconf.HOST2

module.exports = (app) => {
  app.get('/api/predictions/allstkmodels', async (req, res) => {
    const fetch = require("node-fetch");
    let response
    try{
      await fetch(URL_HOST + 'StkPrediction/PredictionModels')
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
      await fetch(URL_HOST + 'StkPrediction/Prediction/' + req.params.model + '/' + req.params.stksym)
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
}
