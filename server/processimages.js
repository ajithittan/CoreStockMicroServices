"use strict";

const tranformimages = async (inpval) =>{
    const cloudinary = require('cloudinary').v2
    for (let i=0;i<inpval.length-1;i++){
        console.log(cloudinary.image('PAINTINGS/Week_1-_Subtractive_Glaze_Painting_upfj8b', {transformation: [
            {width: 150, height: 150, gravity: "face", crop: "thumb"},
            {radius: 20},
            {effect: "sepia"},
            {overlay: "cloudinary_icon_blue", gravity: "south_east", x: 5, y: 5, width: 50, opacity: 60, effect: "brightness:200"},
            {angle: 10}
            ]}))
    }
}

const formatResponseFromCloudinary = async (inpVal) =>{

    let retval = []

    if (inpVal && inpVal.resources && inpVal.resources.length > 0){
        let urlsfromsrvc = inpVal.resources
        retval = urlsfromsrvc.map(item => {return {url:item.secure_url,width:item.width,height:item.height,id:item.public_id,format:item.format}})
        //retval = urlsfromsrvc.map(item => item.secure_url.replace("upload/","upload/t_media_lib_thumb/"))         
        //tranformimages(retval)
    }

    return retval

}
const getAllImagesFromCloudinary = async () =>{
    let retval=[]
    const cloudinary = require('cloudinary').v2

    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NM,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
        secure: true
      });

    await cloudinary.search
        .expression(`resource_type:image AND folder=${process.env.CLOUDINARY_CLOUD_FOLDER}`)
        .sort_by('public_id','desc')
        .max_results(100)
        .execute()
        .then(result => retval=result)

    console.log("retval",retval)    
    
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