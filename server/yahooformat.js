const DBConfig = require("../config/db.config.js");
const { Op } = require("sequelize");
const conf = new DBConfig()

const Sequelize = require("sequelize");
const sequelize = new Sequelize(conf.DB, conf.USER, conf.PASSWORD, {
    host: conf.HOST,
    dialect: conf.dialect
  })

const formatCompanyDetails = async (inpQuote,stkSym) =>{
    let retVal = {}
    try {
        let myCache = require('../servercache/cacheitems')
        if (inpQuote){
            let formatter = Intl.NumberFormat('en', { notation: 'compact' })
            retVal.marketcap=formatter.format(inpQuote.price.marketCap)
            retVal.companyName=inpQuote.price.longName
            retVal.sector=inpQuote.summaryProfile.sector
            retVal.industry=inpQuote.summaryProfile.industry
            retVal.website=inpQuote.summaryProfile.website
            retVal.revenue= inpQuote.financialData.totalRevenue ? formatter.format(inpQuote.financialData.totalRevenue) : 0 
            retVal.cash=formatter.format(inpQuote.financialData.totalCash)
            retVal.debt=formatter.format(inpQuote.financialData.totalDebt)
            retVal.ebitdaMargins=inpQuote.financialData.ebitdaMargins*100
            retVal.operatingMargins=inpQuote.financialData.operatingMargins*100
            retVal.profitMargins=inpQuote.financialData.profitMargins*100
            retVal.deratio=inpQuote.financialData.debtToEquity || 0
            retVal.returnOnEquity=inpQuote.financialData.returnOnEquity  || 0
            retVal.pe = inpQuote.defaultKeyStatistics.trailingEps > 0 ? inpQuote.price.regularMarketPrice/inpQuote.defaultKeyStatistics.trailingEps: 0
            retVal.trailingEps=inpQuote.defaultKeyStatistics.trailingEps  || 0
            retVal.fiscalYear=inpQuote.defaultKeyStatistics.lastFiscalYearEnd
            myCache.setCacheWithTtl("COMPANY_DETAILS_" + stkSym,retVal,60000)
        }
      }catch (error) {
        console.error('Error in formatCompanyDetails function:', error);
    }
    return retVal
}  


const formatCompanyQtrPerf = async (inpQuote) =>{
    console.log("formatCompanyQtrPerf",inpQuote.earnings.financialsChart.quarterly)
    let retVal = {}
    try {
        if (inpQuote){
            let formatter = Intl.NumberFormat('en', { notation: 'compact' })
            retVal = inpQuote.earnings.financialsChart.quarterly.map(item => ({date:item.date,revenue:item.revenue,earnings:item.earnings}))    
        }
      }catch (error) {
        console.error('Error in formatCompanyDetails function:', error);
    }
    return retVal
}

module.exports = {formatCompanyDetails,formatCompanyQtrPerf}