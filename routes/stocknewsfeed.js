const { request } = require('express');

module.exports = (app,ensureAuthenticated) => {
    app.get('/api/v2/news/:stksym', async (req, res) => {
        const stkNews = require('../server/stocknews')
        let response  = {}
        try{
            response = await stkNews.getStockNews(req.params.stksym)
        }
        catch (err){
          console.log(err)
        }
        return res.status(200).send(response);
      });
  }
  