"use strict";

const formatResponseFromCloudinary = async (inpVal) =>{

    let retval = []

    if (inpVal && inpVal.resources && inpVal.resources.length > 0){
        let urlsfromsrvc = inpVal.resources
        retval = urlsfromsrvc.map(item => item.secure_url)         
    }

    return retval

}
const getAllImagesFromCloudinary = async () =>{
    let retval=[]
    const cloudinary = require('cloudinary').v2

    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NM,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
      });

    await cloudinary.search
        .expression(`resource_type:image AND folder=${process.env.CLOUDINARY_CLOUD_FOLDER}`)
        .sort_by('public_id','desc')
        .max_results(30)
        .execute()
        .then(result => retval=result)
    
    return retval
}


const getAllImageURLS = async () => {

    let retval = []

    if (checkifurlsexistsincache()){
        console.log("Got art from cache....")
        retval = checkifurlsexistsincache()    
    }else{
        if (process.env.IMAGEPROCESSOR === "CY"){
            await getAllImagesFromCloudinary().then(images => formatResponseFromCloudinary(images)
                                                              .then(result => retval = result))
        }
    
        addUrlsToCache(retval)
    }
    return retval
}

const addUrlsToCache = (inpVal) =>{
    let myCache = require('../servercache/cacheitems')
    myCache.setCacheWithTtl(`PAINTINGS_${process.env.CLOUDINARY_CLOUD_FOLDER}`,inpVal,6000) //cache for 5 mins....
}

const checkifurlsexistsincache = () =>{
  let myCache = require('../servercache/cacheitems')
  return myCache.getCache(`PAINTINGS_${process.env.CLOUDINARY_CLOUD_FOLDER}`)
}

module.exports={getAllImageURLS}