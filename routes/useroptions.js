module.exports = (app,ensureAuthenticated) => {
    app.get('/user/dashboard/:uuid', async (req, res) => {
      const useroptions = require('../server/userdrivenoptions');
      let response
      try{
        await useroptions.getDashboardOptions(req.params.uuid).then(data => response=data);
        console.log("response before sending back",typeof(response))
      }
      catch (err){
        console.log(err)
      }
      return res.status(200).send(response);
    });
    app.get('/api/userPositions/:stkSym', async (req, res) => {
      const useroptions = require('../server/userdrivenoptions');
      let response
      try{
        await useroptions.getExistingPortfolioPositions(req.user,req.params.stkSym).then(data => response=data);
        console.log("userPortfolio - response before sending back",response)
      }
      catch (err){
        console.log(err)
      }
      return res.status(200).send(response);
    });
    app.post('/api/userPositions/:stkSym',ensureAuthenticated, async (req, res) => {
      console.log("made it to userPositions",req.body)
      const fetch = require("node-fetch");
      const useroptions = require('../server/userdrivenoptions');
      let response = {}
      try{
        console.log("userPositions",req.body,req.user)
        response = await useroptions.saveStockPositions(req.body,req.user,req.params.stkSym)
      }
      catch (err){
        console.log(err)
      }
      return res.status(200).send(response);
    });
    app.post('/api/deluserPositions/:stkSym',ensureAuthenticated, async (req, res) => {
      console.log("made it to userPositions",req.body)
      const fetch = require("node-fetch");
      const useroptions = require('../server/userdrivenoptions');
      let response = {}
      try{
        console.log("deluserPositions",req.body,req.user)
        response = await useroptions.deleteStockPositions(req.body,req.user,req.params.stkSym)
      }
      catch (err){
        console.log(err)
      }
      return res.status(200).send(response);
    });
    app.get('/api/usernotifications/:type',ensureAuthenticated, async (req, res) => {
      const fetch = require("node-fetch");
      const useroptions = require('../server/userdrivenoptions');
      let response = {}
      try{
        response = await useroptions.getUserNotifications(req.user,req.params.type.trim())
      }
      catch (err){
        console.log(err)
      }
      return res.status(200).send(response);
    });
  }
  