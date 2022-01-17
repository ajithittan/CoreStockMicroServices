module.exports = (app) => {
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
  }
  