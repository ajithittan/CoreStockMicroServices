
const validateSession = (req,res) =>{
    if (googleSess(sessionObj)){
        console.log("move it along")
    }else{
        console.log("do a redirect")
    }
}

const checkGoogleSession = (sessionObj) =>{
    let googleSess = require('./google');
    return googleSess(sessionObj)
}

module.exports = {validateSession}