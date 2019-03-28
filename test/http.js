'use strict';

const urllib = require('urllib');
const tammy = require('../dist/tammy');
const http = require('../dist/http');

const url = 'http://api.map.baidu.com/place/v2/search?query=ATM%E6%9C%BA&tag=%E9%93%B6%E8%A1%8C&region=%E5%8C%97%E4%BA%AC&output=json';

tammy.use(http);

urllib.request(url, (err, data, res) => {
  if (err) {
    throw err; // you need to handle error
  }
  console.log('urllib: ', data.toString());
});

tammy(url)
  .then(({ data }) => {
    console.log('tammy: ', data);
  })
  .catch((err) => {
    console.log(err);
  });
