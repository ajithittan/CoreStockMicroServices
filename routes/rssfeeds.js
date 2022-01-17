module.exports = (app) => {
    app.get('/newsfeed/:type', async (req, res) => {
      const rssfeeds = require('../server/processrssfeeds');
      let response
      try{
        await rssfeeds.getNewsFeeds(parseInt(req.params.type)).then(data => response=data);
        console.log("newsfeed before sending back",typeof(response))
      }
      catch (err){
        console.log(err)
      }
      return res.status(200).send(response);
    });
  }
  