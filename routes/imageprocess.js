module.exports = (app) => {
    app.get('/api/allimages', async (req, res) => {
      let response = "blah...."
      try{
        const prcimages = require('../server/processimages');  
        await prcimages.getAllImageURLS().then(data => response=data);
        console.log("retval",response)
      }
      catch (err){
        console.log(err)
      }
      return res.status(200).send(response);
    });
}