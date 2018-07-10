const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const Blockchain = require('./blockchain');

const domcoin = new Blockchain();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/blockchain', function (req, res) {
  res.send(domcoin);
});

app.post('/transaction', function (req, res) {

});

app.get('/mine', function (req, res) {

});

app.listen(3000, () => {
  console.log('Listening on: http://localhost:3000/');
});
