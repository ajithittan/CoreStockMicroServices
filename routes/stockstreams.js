const URLConfig = require("../config/url.config.js");
const urlconf = new URLConfig()
const URL_HOST = urlconf.HOST

module.exports = (app) => {

  const SSE_RESPONSE_HEADER = {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive'
  };
  app.get('/api/stream', async (req, res, next) => {
    console.log("made it /api/stream",req.query.inpdata)
    let response = 100 
    try{
        var stkMaster = require('../server/stockmaster');
        res.writeHead(200, SSE_RESPONSE_HEADER);
        var intOfWrites = setInterval(async () => {
            console.log('Writing to stream in intervals...')
            response = await stkMaster.getstockquotes(JSON.parse(req.query.inpdata))
            res.write('event: message' + "\n");
            res.write('data' + ":" + JSON.stringify(response) + "\n\n");  
            res.flush();
            }, 5000);        
        req.on('close', () => {
          clearInterval(intOfWrites)
          //remove listener so it won't try to write to this stream any more
          console.log('Connection to client closed.');
        res.end();});      
    }
    catch (err){
      console.log(err)
    }
  });
}
