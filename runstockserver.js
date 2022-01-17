const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors')
const compression = require('compression')

const app = express();

console.log('huh in here?')

app.disable('x-powered-by');
app.use(bodyParser.json());
app.use(cors())
app.use(compression({filter: shouldCompress}))

function shouldCompress (req, res) {
   if (req.headers['x-no-compression']) {
       console.log('no compress???')
       // don't compress responses with this request header
       return false
   }

  // fallback to standard filter function
   return compression.filter(req, res)
 }

require('./routes/stocklist')(app);
require('./routes/stockstats')(app);
require('./routes/stockmaint')(app);
require('./routes/stocksignal')(app);
require('./routes/stocklistv2')(app);
require('./routes/stockops')(app);
require('./routes/stockpredictions')(app);
require('./routes/stockstreams')(app);
require('./routes/stockpositions')(app);
require('./routes/useroptions')(app);
require('./routes/rssfeeds')(app);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));

  const path = require('path');
  app.get('*', (req,res) => {
      res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'))
  })

}

const PORT = process.env.PORT || 5100;
app.listen(PORT, () => {
  console.log(`app running on port ${PORT}`)
});
