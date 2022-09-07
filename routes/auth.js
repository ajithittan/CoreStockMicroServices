const URLConfig = require("../config/url.config.js");
const urlconf = new URLConfig()
const URL_HOST = urlconf.HOST

module.exports = (app) => {
  app.post('/api/auth/google', async (req, res) => {
    const fetch = require("node-fetch");
    let response
    try{
      console.log("Google Auth",req.body)  
    }
    catch (err){
      console.log(err)
    }
    return res.status(200).send(response);
  });
}
