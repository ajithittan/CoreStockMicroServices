"use strict";

const formatQuote = (inpQuoteDetails) =>{
    //this will change when other sources get added.
    console.log("inpQuoteDetails",inpQuoteDetails)
    return formatYahooQuote(inpQuoteDetails)
}

const formatYahooQuote = (inpQuoteDetails) =>{
    let retVal = {}
    retVal.CompanyName = inpQuoteDetails.price.longName
    retVal.Currency = inpQuoteDetails.price.currency
    retVal.Exchange = inpQuoteDetails.price.exchange
    retVal.Mcap = inpQuoteDetails.price.marketCap
    retVal.QuoteType = inpQuoteDetails.price.quoteType
    retVal.ShortName = inpQuoteDetails.price.shortName
    retVal.Symbol = inpQuoteDetails.price.symbol
    retVal.High = inpQuoteDetails.price.regularMarketDayHigh
    retVal.Low = inpQuoteDetails.price.regularMarketDayLow
    retVal.Open = inpQuoteDetails.price.regularMarketOpen
    retVal.Close = inpQuoteDetails.price.regularMarketPrice
    return retVal
}

module.exports = {formatQuote};