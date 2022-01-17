
function FeedFormat (feeddata){
    this.feeddata = feeddata;
};

FeedFormat.prototype.getAllFeedData = function (){
    let formattedFeed = this.feeddata.items
    return formattedFeed
};

module.exports = {FeedFormat}