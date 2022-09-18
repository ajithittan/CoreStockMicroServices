module.exports = (app,passport) => {
    app.get('/auth/google',
    passport.authenticate('google', { scope : ['profile', 'email'] }));
   
  app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/error' }),
    setUserIDResponseCookie,
    function(req, res) {
      // Successful authentication, redirect success.
      res.redirect('/Dashboard');
    });

    app.post('/auth/google',
    passport.authenticate('google', { scope : ['profile', 'email'] }));

    function setUserIDResponseCookie(req, res, next) {
      console.log("req.user",req.cookies)
      if (req.user) {
          res.cookie("initial", req.user.initial, {
              expires: new Date(253402300000000),
              httpOnly: false, // allows JS code to access it
          });
      } else {
          res.clearCookie("initial");
      }
      next();
  }

}