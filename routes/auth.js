const URLConfig = require("../config/url.config.js");
const urlconf = new URLConfig()
const URL_HOST = urlconf.HOST

module.exports = (app,ensureAuthenticated) => {
  app.get('/api/loggedinstatus',ensureAuthenticated , async (req, res) => {
    return res.status(200).send(true);
  });
}