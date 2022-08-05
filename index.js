var request = require("request");
const args = require('yargs').argv;

var cryptoCompare;
var usdValues;

const getRecentTokenInUSD = () => {
    return new Promise((resolve) => {

        var output = [];

        var btcOutputObj = { "token": "BTC", "amount": 0, "timestamp": 0 };
        var ethOutputObj = { "token": "ETH", "amount": 0, "timestamp": 0 };
        var xrpOutputObj = { "token": "XRP", "amount": 0, "timestamp": 0 };

        var lineStream = require('readline').createInterface({input: require('fs').createReadStream('transactions.csv')});

        lineStream.on('line', (line) => {
            var obj = {};
            var lineSplitedArr = line.split(',');

            obj.timestamp = lineSplitedArr[0];
            obj.transaction_type = lineSplitedArr[1];
            obj.token = lineSplitedArr[2];
            obj.amount = lineSplitedArr[3];

            if (obj.token === 'BTC') {
                if (obj.timestamp > btcOutputObj.timestamp) {
                    btcOutputObj.amount = obj.amount;
                    btcOutputObj.timestamp = obj.timestamp;
                }
            }
            else if (obj.token === 'ETH') {
                if (obj.timestamp > ethOutputObj.timestamp) {
                    ethOutputObj.amount = obj.amount;
                    ethOutputObj.timestamp = obj.timestamp
                }
            }
            else if (obj.token === 'XRP') {
                if (obj.timestamp > xrpOutputObj.timestamp) {
                    xrpOutputObj.amount = obj.amount;
                    xrpOutputObj.timestamp = obj.timestamp;
                }
            }
        });

        lineStream.on('close',  (line) => {

            cryptoCompare = getUSDValues();

            cryptoCompare.then((result) => {
                usdValues = result; // assigning to global variable to use it in other function
                btcOutputObj.amount = btcOutputObj.amount * usdValues.BTC.USD; // CSV amount of BTC to usd
                ethOutputObj.amount = ethOutputObj.amount * usdValues.ETH.USD; // CSV amount of ETH to usd
                xrpOutputObj.amount = xrpOutputObj.amount * usdValues.XRP.USD; // CSV amount of XRP to USD

                output.push(ethOutputObj);
                output.push(btcOutputObj);
                output.push(xrpOutputObj);
                resolve(output);
            }, function (err) {
                console.log(err);
            })

        });
    });
}


var getTokenValueWithDate = () => {
    console.log("Given Date =>",args.date);
    return new Promise((resolve) => {

        var output = [];

        var btcOutputArr = [];
        var ethOutputArr = [];
        var xrpOutputArr = [];

        var lineStream = require('readline').createInterface({input: require('fs').createReadStream('transactions.csv')});

        lineStream.on('line', (line) => {

            var obj = {};
            var lineSplitedArr = line.split(',');

            obj.timestamp = lineSplitedArr[0];
            obj.transaction_type = lineSplitedArr[1];
            obj.token = lineSplitedArr[2];
            obj.amount = lineSplitedArr[3];

            //converting date
            var d = new Date(obj.timestamp * 1000);
            var dateFromCSV = d.getDate() + '/' + (d.getMonth()+1) + '/' + d.getFullYear();

                if(obj.token === 'ETH'){
                    // if any transaction on that day according to timestamp
                    if(args.date === dateFromCSV){
                        ethOutputArr.push({"token":obj.token,"amount":obj.amount * usdValues.ETH.USD})
                    }
                } else if (obj.token === 'BTC'){
                    if(args.date === dateFromCSV){
                        btcOutputArr.push({"token":obj.token,"amount":obj.amount * usdValues.BTC.USD})
                    }
                }
                else if (obj.token === 'XRP'){
                    if(args.date === dateFromCSV){
                        xrpOutputArr.push({"token":obj.token,"amount":obj.amount * usdValues.XRP.USD})
                    }
                }
        }

        )
    ;
        lineStream.on('close', (line) => {
                output.push(ethOutputArr);
                output.push(btcOutputArr);
                output.push(xrpOutputArr);
                resolve(output);

        });

    });
}

const getUSDValues=()=> {
    let cryptoCompareApi = 'https://min-api.cryptocompare.com/data/pricemulti?fsyms=ETH,BTC,XRP&tsyms=BTC,USD,EUR&api_key=ced2388fca81921bb50ed60d7cdc81d8d605d1feab7ac3e691db684556df0389';
    let options = {url: cryptoCompareApi, headers: {'User-Agent': 'request'}};
    
    return new Promise((resolve, reject) => {
        request.get(options, (err, resp, body) => {
            if (err) {
                reject(err);
            } else {
                resolve(JSON.parse(body));
            }
        })
    })

}

const filterByParam =(array, prop, value) => {
    var filtered = [];
    for(var i = 0; i < array.length; i++){
        var obj = array[i];
        for(var key in obj){
            if(typeof(obj[key] == "object")){
                var item = obj[key];
                if(item[prop] == value){
                    filtered.push(item);
                }
            }
        }
    }    
    return filtered;
}


if(args.token === undefined && args.date === undefined){
    console.log("Given no parameters, return the latest portfolio value per token in USD");
  getRecentTokenInUSD().then((result)=> console.log(result) );
}
else if (args.token != undefined && args.date === undefined){
    console.log("Given a token, return the latest portfolio value for that token in USD");
    getRecentTokenInUSD().then((result)=> { 
        let resultPerToken =  result.filter((record)=>  record.token === args.token)
            console.log(resultPerToken);
     });
}
else if (args.date != undefined && args.token === undefined){
    console.log("Given a date, return the portfolio value per token in USD on that date");
    cryptoCompare = getUSDValues();
    cryptoCompare.then((result) => {
     usdValues = result;
     getTokenValueWithDate().then((result) => { console.log(result); });
 }, function (err) {
     console.log(err);
 })

}
else if (args.token != undefined && args.date != undefined){
    console.log("Given a date and a token, return the portfolio value of that token in USD on that date");
    cryptoCompare = getUSDValues();
    cryptoCompare.then((usdVal) => {
    usdValues = usdVal;
     getTokenValueWithDate().then((result) => { 
        let resultPerToken =  filterByParam(result,"token",args.token);
            console.log(resultPerToken); 
        });
 }, function (err) {
     console.log(err);
 })
}