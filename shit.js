var Q = require('q');
const express = require('express');
const request = require('request');
const cheerio = require('cheerio');

//... where ever your function is
//start with an array of string urls
var urls = [ "http://Blablablabla.com", 'https://www.youtube.com/', 'https://www.youtube.com/watch?v=pKpAcBZUPuc'];

//store results in this array in the form:
//  { 
//       url: url, 
//       promise: <will be resolved when its done>, 
//       share:'code that you wanted'
//    }
var results = [];

//loop over each url and perform the request
urls.forEach(processUrl);

function processUrl(url) {
  //we use deferred object so we can know when the request is done
  var deferred = Q.defer();

  //create a new result object and add it to results
  var result = {
    url: url,
    promise: deferred.promise
  };
  results.push(result);


  //perform the request
  request(url, function (error, response, body) {
      if (!error) {
        var $ = cheerio.load(body),
          share = $(".theitemIwant").html();
        //resolve the promise so we know this request is done.
        //  no one is using the resolve, but if they were they would get the result of share
        deferred.resolve(share);
        //set the value we extracted to the results object
        result.share = share;
      } else {

        //request failed, reject the promise to abort the chain and fall into the "catch" block
        deferred.reject(error)
        console.log("We've encountered an error: " + error);
      }
  });
}

//results.map, converts the "array" to just promises
//Q.all takes in an array of promises
//when they are all done it rull call your then/catch block.
Q.all(results.map(function(i){i.promise}))
    .then(sendResponse) //when all promises are done it calls this
    .catch(sendError);  //if any promise fails it calls this

 function sendError(error){
   res.status(500).json({failed: error});
 }
 function sendResponse(data){ //data = response from every resolve call
  //process results and convert to your response
  return res.send(results);
}