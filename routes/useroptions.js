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
    app.post('/api/userPositions',ensureAuthenticated, async (req, res) => {
      console.log("made it to userPositions",req.body)
      const fetch = require("node-fetch");
      const useroptions = require('../server/userdrivenoptions');
      let response = {}
      try{
        console.log("req",req.body,req.user)
        response = await useroptions.saveStockPositions(req.body,req.user)
      }
      catch (err){
        console.log(err)
      }
      return res.status(200).send(response);
    });
  }
  