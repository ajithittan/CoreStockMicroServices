"use strict";
const URLConfig = require("../config/url.config.js");
const urlconf = new URLConfig()
const URL_HOST = urlconf.HOST
const _= require("lodash")

const stockdataperchange = async (stkInpData) => {

    let arrofperchanges = JSON.parse(stkInpData)
    let rettransformedata = []

    for (let i=arrofperchanges.length-1; i>=0; i--){
        if (arrofperchanges[i].PchangeCum != 0){
            rettransformedata.push(arrofperchanges[i])
        }
    }
    console.log(rettransformedata)
    return rettransformedata
}

const getstockfamily = async (stkSym) => {
    let retVal = []
    //these will need to come from the database....
    const New_TechList = ['DDOG','CRWD','FSLY','NET']    
    const IpoList_2020 = ['DASH','SNOW','AI','QS']    
    const Big_Tech = ['AAPL','AMAT','MSFT']  
    
    const full_list = [New_TechList,IpoList_2020,Big_Tech]

    for (let i=0;i < full_list.length; i++){
       if (full_list[i].includes(stkSym)) {
           retVal = full_list[i].filter(symbol => symbol != stkSym)
           break;
       }
    }
    
    return retVal
}

const getrecentcdlpatterns = async (allcdldata,gobackdays) =>{
    
    const stkMstr = require("./stockmaster")
    let arraytoanalyze = _.takeRight(JSON.parse(allcdldata),gobackdays)
    arraytoanalyze.reverse()
    const arrofpatterns = await stkMstr.getcdlpatterns()
    let arrayofcdlpatterns = []
    let gotit = false
    for (let i=0; i < arraytoanalyze.length; i++){
        for (let j=0; j < arrofpatterns.length -1; j++){
            if (arraytoanalyze[i][arrofpatterns[j].candlepattern] === 100){
                arrayofcdlpatterns.push({'pattern':arrofpatterns[j].candlepattern,'patterndesc':arrofpatterns[j].patterndesc,'date':arraytoanalyze[i].date})
                gotit = true
            }
        }
        if (gotit) break;
    }
    return arrayofcdlpatterns
}

const projectprfloss = async (dataofallcndles,startingpoints,profit,stoploss) =>{
   for (let i=0;i<startingpoints.length -1;i++){
       console.log(dataofallcndles.filter(item => item.date === startingpoints[i].date),startingpoints[i])
   }
}

module.exports = {stockdataperchange,getstockfamily,getrecentcdlpatterns,projectprfloss};
