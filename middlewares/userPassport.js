const GoogleStrategy = require('passport-google-oauth20').Strategy
require('dotenv').config()

module.exports = (passport) => {
    passport.serializeUser(function(user, cb) {
        console.log("did I make it serializeUser",user)
        cb(null, user);
      });
      
      passport.deserializeUser(function(obj, cb) {
        cb(null, obj);
      });
      
      passport.use(
        new GoogleStrategy(
          {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: "http://localhost:3000/auth/google/callback",
            passReqToCallback:true
          },
          function(request, accessToken, refreshToken, profile, done) {
            return done(null, profile);
          }
        )
      );
}
