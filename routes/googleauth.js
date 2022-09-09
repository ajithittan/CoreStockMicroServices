module.exports = (app,passport) => {
    app.get('/auth/google',
    passport.authenticate('google', { scope : ['profile', 'email'] }));
   
  app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/error' }),
    function(req, res) {
      // Successful authentication, redirect success.
      res.redirect('/Dashboard');
    });

    app.post('/auth/google',
    passport.authenticate('google', { scope : ['profile', 'email'] }));

}