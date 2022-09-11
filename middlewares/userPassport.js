const GoogleStrategy = require('passport-google-oauth20').Strategy

require('dotenv').config()

module.exports = (passport) => {
    passport.serializeUser(async (user, cb) => {
        //console.log("did I make it serializeUser",user)
        cb(null, user);
      });
      
      passport.deserializeUser(function(obj, cb) {
        //console.log("did I make it deserializeUser",obj)
        cb(null, obj);
      });
      
      passport.use(
        new GoogleStrategy(
          {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: "http://localhost:3000/auth/google/callback",
            passReqToCallback:true,
            userProfileURL:"https://www.googleapis.com/oauth2/v3/userinfo"
          },
          async (request, accessToken, refreshToken, profile, done) => {
            console.log(request, accessToken, refreshToken, profile, done)
            const userAcc = require('../server/useraccountmgmt')    
            let prof = await userAcc.createGoogleUser(profile)
            return done(null, prof);
          }
        )
      );
}