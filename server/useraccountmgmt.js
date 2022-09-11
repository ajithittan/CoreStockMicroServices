const DBConfig = require("../config/db.config.js");
const { Op } = require("sequelize");
const conf = new DBConfig()

const Sequelize = require("sequelize");
const e = require("express");
const sequelize = new Sequelize(conf.DB, conf.USER, conf.PASSWORD, {
    host: conf.HOST,
    dialect: conf.dialect
  })

const createGoogleUser = async (googleObj) => {
    const socialType = "GOOGLE"
    let userObj = {}
    let socialdata = {}
    let currSocialProfile = {}

    socialdata.subId = googleObj.sub
    socialdata.type = socialType

    userObj.fname = googleObj.given_name || ""
    userObj.family_name = googleObj.family_name || ""
    userObj.email = googleObj.email
    //userObj.socialDetails = [socialdata]

    currSocialProfile = await chkForSocialProfile(googleObj.sub,socialType)

    if (currSocialProfile === {}){
        let userProfileInserted = chkandCreateUsrProfile(userObj)
        socialdata.iduserprofile = userProfileInserted.iduserprofile

        let datainserted = createSocialProfile(socialdata)
    }else{
        dataforsession = getUserObjFromSocialId()
    }

    return dataforsession    
} 
  const chkForSocialProfile = async (uniqSocialId,socialProvider) =>{
        
    let socialProfile = {}
    let retfromdb = {}  
    try {
            var initModels = require("../models/init-models"); 
            var models = initModels(sequelize);
            var usrSocProf = models.usersocialprofile

            await usrSocProf.findAll({where: {
                socialUniqIdentifier: {
                        [Op.eq] : uniqSocialId
                    },
                    socialprovider: {
                        [Op.eq] : socialProvider
                    }
                },raw : true
            }).then(data => retfromdb=data)
            console.log("retfromdb in chkForSocialProfile",retfromdb)
            
            return socialProfile;
        }
    catch (error) {
        console.error('Error in chkForSocialProfile function:', error);
    }
  }

  const chkandCreateUsrProfile = (userProfile) =>{
    let userData = {}
    let retData = {}

    try{
        userData = chkForUsrProfile(userProfile.email)

        if (userData === {}){
            userData = createUserProfile(userProfile)
        }    
    }catch(error){
        console.log("error in chkandCreateUsrProfile",error)

    }
    return userData 
  } 
  
  const chkForUsrProfile = (email) =>{
      let userProf = {}
      try {
            var initModels = require("../models/init-models"); 
            var models = initModels(sequelize);
            var usrtable = models.userprofile

            await usrtable.findAll({where: {
                email: {
                        [Op.eq] : email
                    }
                },raw : true
            }).then(data => userProf=data)
            console.log("retfromdb in chkForUsrProfile",userProf)
            
            return userProf;
      }catch (error) {
  
        console.error('Error in chkForUsrProfile function:', error);
    }
  }

  const createUserProfile = (userObj) =>{

        try {
            var initModels = require("../models/init-models"); 
            var models = initModels(sequelize);
            var usrtable = models.userprofile

            await usrtable.findAll({where: {
                email: {
                        [Op.eq] : email
                    }
                },raw : true
            }).then(data => userProf=data)
            console.log("retfromdb in chkForUsrProfile",userProf)
            
            return userProf;
        }catch (error) {

            console.error('Error in chkForUsrProfile function:', error);
        }
  }

  module.exports = {createGoogleUser}