"use strict";

const checkIfValidGoogleCreds = async (token) =>{
  let payload = {}
  const {OAuth2Client} = require('google-auth-library');
  const CLIENT_ID = process.env.GOOGLE_CLIENT_ID

  try{
    const client = new OAuth2Client(CLIENT_ID);

    const ticket = await client.verifyIdToken({
          idToken: token,
          audience: CLIENT_ID,
      });
      payload = ticket.getPayload();
  }catch (error) {
    console.log("error in function checkIfValidGoogleCreds",error)
  }
  return payload
}

const checkAndCreateUser = (userInfo) => {
  console.log("checkAndCreateUser",userInfo)
}

const validateGoogleSession = async (token) =>{
  let userInfo = await checkIfValidGoogleCreds(token)
  userInfo === {} ? console.log("Something wrong with Google Sign in") : checkAndCreateUser(userInfo)
}

module.exports = {validateGoogleSession}