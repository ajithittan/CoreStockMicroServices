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
      app.get('/api/v2/multinews', ensureAuthenticated, async (req, res) => {
        const stkNews = require('../server/stocknews')
        let response  = {}
        try{
          console.log("req.params.stkList in news",req.query.stkList.split(","))
          let stocks = req.query.stkList.split(",")
          if(stocks && stocks.length > 0){
            await stkNews.getMultipleStockNews(stocks).then(retval => response=retval)
          }   
        }
        catch (err){
          console.log(err)
        }
        return res.status(200).send(response);
      });
  }
  