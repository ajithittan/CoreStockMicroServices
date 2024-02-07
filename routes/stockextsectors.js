module.exports = (app,ensureAuthenticated) => {
    app.get('/api/extsectorsstocks',ensureAuthenticated,async (req, res) => {
      const stkPatterns = require("../server/stockextsectors");
      let response = []
      try{
          response = await stkPatterns.getAllExtSectorsAndStocks()
      }
      catch (err){
        console.log(err)
      }
      return res.status(200).send(response);
    });
}