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

    socialdata.subId = googleObj._json.sub
    socialdata.type = socialType

    userObj.fname = googleObj._json.given_name || ""
    userObj.lname = googleObj._json.family_name || ""
    userObj.email = googleObj._json.email
    userObj.username = googleObj._json.email

    try{
        let currSocialProfile = await chkForSocialProfile(googleObj._json.sub,socialType)
        let userProfileInserted = await chkandCreateUsrProfile(userObj)
        userObj.uuid = userProfileInserted.uniqueUUID
    
        if (currSocialProfile.length === 0){
            socialdata.iduserprofile = userProfileInserted.iduserprofile
            let datainserted = await createSocialProfile(socialdata)
        }    
    }catch(error){
        console.log("error in createGoogleUser",error)
    }

    return {usrid: userObj.uuid}    
} 
  const chkForSocialProfile = async (uniqSocialId,socialProvider) =>{
        
    let socialProfile = []

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
            }).then(data => socialProfile=data)

        }
    catch (error) {
        console.error('Error in chkForSocialProfile function:', error);
    }
    return socialProfile
  }

  const chkandCreateUsrProfile = async(userProfile) =>{
    let retData = {}

    try{
        //console.log("userProfile",userProfile)
        let userData = await chkForUsrProfile(userProfile.email)
        console.log("chkandCreateUsrProfile",userData.length)

        if (userData.length === 0){
            retData = await createUserProfile(userProfile)
        }else{
            retData = userData[0]
        }    
    }catch(error){
        console.log("error in chkandCreateUsrProfile",error)

    }
    return retData 
  } 
  
  const chkForUsrProfile = async (email) =>{
      let userProf = []
      try {
            var initModels = require("../models/init-models"); 
            var models = initModels(sequelize);
            var usrtable = models.userprofile

            await usrtable.findAll({where: {
                email: {
                        [Op.eq] : email.trim()
                    }
                },raw : true
            }).then(data => userProf=data)
            console.log("retfromdb in chkForUsrProfile",userProf)
        
      }catch (error) {
        console.error('Error in chkForUsrProfile function:', error);
    }
    return userProf;
  }

  const createUserProfile = async (userObj) =>{

        console.log("userObj-createUserProfile",userObj)
        const { randomUUID } = require('crypto');
        let retval = []

        try {
            var initModels = require("../models/init-models"); 
            var models = initModels(sequelize);
            var usrtable = models.userprofile

            retval = await usrtable.create({ 'username':userObj.username,'fname':userObj.fname,'lname':userObj.lname,
                                    'email':userObj.email,'phone':userObj.phone,'allowsms':userObj.allowsms,
                                    'uniqueUUID':randomUUID()})
            
        }catch (error) {

            console.error('Error in createUserProfile function:', error);
        }
        return retval
  }

  const createSocialProfile = async (userSocialObj) =>{

    console.log("userObj-createSocialProfile",userSocialObj)
    let retval = []

    try {
        var initModels = require("../models/init-models"); 
        var models = initModels(sequelize);
        var usrsocialtable = models.usersocialprofile

        retval = await usrsocialtable.create({ 'socialUniqIdentifier':userSocialObj.subId,'socialprovider':userSocialObj.type,
                                'iduserprofile':userSocialObj.iduserprofile,'status':"A",'additionalinfo':userSocialObj.additionalinfo,
                                'createdt':Date.now()})
        
    }catch (error) {

        console.error('Error in createSocialProfile function:', error);
    }
    return retval
}

  module.exports = {createGoogleUser}