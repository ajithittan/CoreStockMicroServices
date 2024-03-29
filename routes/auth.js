const URLConfig = require("../config/url.config.js");
const urlconf = new URLConfig()
const URL_HOST = urlconf.HOST

module.exports = (app,ensureAuthenticated) => {
  app.get('/api/loggedinstatus',ensureAuthenticated , async (req, res) => {
    return res.status(200).send(true);
  });
  app.post('/api/logout', function(req, res, next){
    req.logout(function(err) {
      console.log("logging out??")
      if (err) {res.status(200).send(false); return next(err); }
      res.status(200).send(true);
    });
  });
  app.get('/api/auth/session/',ensureAuthenticated, async (req, res) => {
    var masterstkops = require('../server/stockmaster');
    try{
      response = await masterstkops.getUserDataForOps(req.user)
    }
    catch (err){
      console.log(err)
    }
    return res.status(200).send({sessionUserId:response});
  });
}