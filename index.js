const express = require('express');
const request = require('request');
const cheerio = require('cheerio');
const Q = require('q');
const { EventEmitter } = require('events');
const fs = require('fs')

const currysGpuUrls = ['https://www.currys.co.uk/gbuk/computing-accessories/components-upgrades/graphics-cards/msi-geforce-gtx-1660-super-6-gb-gaming-x-graphics-card-10200631-pdt.html',
'https://www.currys.co.uk/gbuk/computing-accessories/components-upgrades/graphics-cards/msi-geforce-gtx-1660-ti-6-gb-ventus-xs-oc-graphics-card-10191506-pdt.html',
'https://www.currys.co.uk/gbuk/computing-accessories/components-upgrades/graphics-cards/asus-geforce-gtx-1650-super-4-gb-tuf-gaming-oc-graphics-card-10206962-pdt.html',
'https://www.currys.co.uk/gbuk/computing-accessories/components-upgrades/graphics-cards/msi-geforce-rtx-3060-12-gb-ventus-2x-oc-graphics-card-10220926-pdt.html',
'https://www.currys.co.uk/gbuk/computing-accessories/components-upgrades/graphics-cards/gigabyte-geforce-rtx-3060-ti-8-gb-eagle-oc-graphics-card-10219306-pdt.html'];

const overclookersGpuUrls = ['https://www.overclockers.co.uk/gigabyte-geforce-gtx-1660-super-oc-6144mb-gddr6-pci-express-graphics-card-gx-1bd-gi.html',
'https://www.overclockers.co.uk/msi-geforce-gtx-1660ti-ventus-xs-oc-6144mb-gddr6-pci-express-graphics-card-gx-352-ms.html',
'https://www.overclockers.co.uk/msi-geforce-gtx-1660-gaming-x-6144mb-gddr5-pci-express-graphics-card-gx-357-ms.html',
'https://www.overclockers.co.uk/gigabyte-geforce-rtx-3060-eagle-oc-12gb-gddr6-pci-express-graphics-card-gx-1d6-gi.html',
'https://www.overclockers.co.uk/zotac-geforce-rtx-3060ti-gaming-twin-edge-8gb-gddr6-pci-express-graphics-card-gx-12b-zt.html'];

const scanGpuUrls = ['https://www.scan.co.uk/products/msi-geforce-gtx-1660-super-gaming-x-6gb-gddr6-vr-ready-graphics-card-1408-core-1830mhz-boost',
'https://www.scan.co.uk/products/msi-geforce-gtx-1660-ti-gaming-x-6gb-gddr6-vr-ready-graphics-card-1536-core-1875mhz-boost',
'https://www.scan.co.uk/products/gigabyte-geforce-gtx-1660-gaming-oc-6gb-gddr5-vr-ready-graphics-card-1408-core-1530mhz-gpu-1860mhz-b',
'https://www.scan.co.uk/products/zotac-nvidia-geforce-rtx-3060-twin-edge-oc-12gb-gddr6-graphics-card-3584-core-1320mhz-gpu-1807mhz-bo',
'https://www.scan.co.uk/products/gigabyte-nvidia-geforce-rtx-3060-ti-eagle-8gb-gddr6-ray-tracing-graphics-card-4864-core'];

const amazonGpu = ['https://www.amazon.co.uk/dp/B07ZPM2BVR/ref=olp_aod_redir#aod',
'https://www.amazon.co.uk/MSI-Nvidia-GTX-XS-6G/dp/B07YKZ6MBH/ref=sr_1_3?dchild=1&keywords=GTX+1660+ti&qid=1615384452&s=computers&sr=1-3',
'https://www.amazon.co.uk/MSI-GTX-1660-GAMING-6G/dp/B07P66WG5D/ref=sr_1_9?dchild=1&keywords=gtx+1660&qid=1615384477&s=computers&sr=1-9',
'https://www.amazon.co.uk/GeForce-192-bit-Graphics-IceStorm-ZT-A30600H-10M/dp/B08W8DGK3X/ref=sr_1_2?dchild=1&keywords=rtx+3060&qid=1615384497&s=computers&sr=1-2',
'https://www.amazon.co.uk/MSI-GEFORCE-graphics-Express-14000MHz/dp/B08NW76K61/ref=sr_1_1?dchild=1&keywords=rtx+3060+ti&qid=1615384512&s=computers&sr=1-1'];

const app = express();

var emitter = new EventEmitter();
emitter.setMaxListeners(0);

app.get('/', function(req, res) {
var results = []
currysGpuUrls.forEach(processUrls);                                                                                                    
function processUrls(url) {
  var deffered = Q.defer();

  var result = {
    url: url,
    promise: deffered.promise
  }
  results.push(result);

  request(url, function(error, response, html) {
    if (!error) {
      const $ = cheerio.load(html);
      stock = $('i.dcg-icon-cross').hasClass('dcg-icon-cross');

      if (!stock){
        stock = "Not in Stock"
        console.log("Not in Stock")
      }else{
        currysPrices = $('div.amounts > div.prd-amounts > div > strong.current').text()
        currysPrices = currysPrices.substring(0,7)
        //deffered.resolve('Price: ' + currysPrices)
        currysPrices = JSON.stringify(currysPrices);
        fs.writeFileSync('prices.json', currysPrices)
        //results.price = currysPrices;
        console.log(currysPrices)
      }
    }else{
      deffered.reject(error)
      console.log("We've encountered an error: " + error)
    }

});
}

//console.log(currysPrices)

Q.all(results.map(function(i){i.promise})).then(sendResponse).catch(sendError);

function sendError(error){
  res.status(500).json({failed: error});
}

function sendResponse(data){
  return res.send(results)
}
});

// function populateJSON(companyName, gpuName, gpuPrice){
//   var gpuStock = {
//     company: companyName,
//     name: gpuName,
//     price: gpuPrice
//   }

  
// }

// app.get('/', function(req, res) {
//   let url = 'https://www.bbcgoodfood.com/recipes/';

//   request(url, function(error, response, html) {
//       if (!error) {
//         const $ = cheerio.load(html);
//         foodName = $('h4.standard-card-new__display-title');
        
//         foodName.each(function() {
//           const name = $(this).find('a.standard-card-new__article-title').text();
//           foods.push({
//             name: name.toLowerCase().replace(/\s+/g, "-")
//           })
//         })
//         console.log(foods)
//       }
//   });
// });
app.listen('8080');
console.log('API is running on http://localhost:8080');


module.exports = app;