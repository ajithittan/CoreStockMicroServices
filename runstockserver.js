const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors')
const compression = require('compression')
const session = require('express-session')
const passport = require('passport')
require("./middlewares/userPassport")(passport)
require('dotenv').config()

const app = express();

app.disable('x-powered-by');
app.use(bodyParser.json());
app.use(cors())
app.use(compression({filter: shouldCompress}))
app.use(express.urlencoded({ extended: true}));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  }));

app.use(passport.initialize());
app.use(passport.session());

function shouldCompress (req, res) {
   if (req.headers['x-no-compression']) {
       return false
   }
   return compression.filter(req, res)
 }

const ensureAuthenticated = (req, res, next) => {
  console.log("ensureAuthenticated",req.isAuthenticated())
  if (req.isAuthenticated())
    return next();
  else
    res.send(false)
}
 
require('./routes/auth')(app,ensureAuthenticated);
require('./routes/stocklist')(app,ensureAuthenticated);
require('./routes/stockstats')(app);
require('./routes/stockmaint')(app,ensureAuthenticated);
require('./routes/stocksignal')(app);
require('./routes/stocklistv2')(app,ensureAuthenticated);
require('./routes/stockops')(app);
require('./routes/stockpredictions')(app);
require('./routes/stockstreams')(app);
require('./routes/stockpositions')(app);
require('./routes/useroptions')(app);
require('./routes/rssfeeds')(app);
require('./routes/googleauth')(app,passport)

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
