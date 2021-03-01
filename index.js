const express = require('express');
const request = require('request');
const cheerio = require('cheerio');

const app = express();

var foodName;
const foods = [];

app.get('/', function(req, res) {
  let url = 'https://www.bbcgoodfood.com/recipes/';

  request(url, function(error, response, html) {
      if (!error) {
        const $ = cheerio.load(html);
        foodName = $('h4.standard-card-new__display-title');
        
        foodName.each(function() {
          const name = $(this).find('a.standard-card-new__article-title').text();
          foods.push({
            name: name.toLowerCase().replace(/\s+/g, "-")
          })
        })

        console.log(foods)
      }
  });
});

app.listen('8080');
console.log('API is running on http://localhost:8080');


module.exports = app;