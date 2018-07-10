const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const Blockchain = require('./blockchain');
const uuid = require('uuid/v1');
const rp = require('request-promise');

const domcoin = new Blockchain();
const nodeAddress = uuid().split('-').join('');
const port = process.argv[2];

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/blockchain', function (req, res) {
  res.json(domcoin);
});

app.post('/transaction', function (req, res) {
  console.log('Making a transaction....');
  const blockIndex = domcoin.createNewTransaction(req.body.amount, req.body.sender, req.body.recipient);
  console.log('Transaction created successfully!');
  res.json({ note: `Transaction will be added in block ${blockIndex}.`})
});

app.get('/mine', function (req, res) {
  domcoin.createNewTransaction(12.5, "00", nodeAddress);

  console.log('Mining block...');
  const block = domcoin.createNewBlock(0);

  console.log('Done!');
  res.write(JSON.stringify({note: "New block mined successfully", block}));

  res.end();
});

// register and broadcast new node
app.post('/register-broadcast-node', function (req, res) {
  const newNodeUrl = req.body.newNodeUrl;
  if (domcoin.networkNodes.indexOf(newNodeUrl) === -1) domcoin.networkNodes.push(newNodeUrl);

  // broadcast
  const regNodesPromises = [];
  domcoin.networkNodes.forEach(networkNodeUrl => {
    const requestOptions = {
      uri: networkNodeUrl + '/register-node',
      method: 'POST',
      body: { newNodeUrl },
      json: true
    };

    regNodesPromises.push(rp(requestOptions));
  });

  Promise.all(regNodesPromises)
    .then(() => {
      const bulkRegisterOptions = {
        uri: newNodeUrl + '/register-nodes-bulk',
        method: 'POST',
        body: { allNetworkNodes: [...domcoin.networkNodes, domcoin.currentNodeUrl]},
        json: true
      };

      return rp(bulkRegisterOptions);
    }).then(() => {
      res.json({note: 'New node registered successfully!'})
  })

});

// register new node
app.post('/register-node', function (req, res) {
  const newNodeUrl = req.body.newNodeUrl;
  const nodeNotAlreadyPresent = domcoin.networkNodes.indexOf(newNodeUrl) === -1;
  const notCurrentNode = domcoin.currentNodeUrl !== newNodeUrl;

  if (nodeNotAlreadyPresent && notCurrentNode) {
    domcoin.networkNodes.push(newNodeUrl);
    res.json({ note: 'New node registered successfully.'});
  } else {
    res.json({ note: 'Error while adding new node.'});
  }
});

// register multiple nodes at once
app.post('/register-nodes-bulk', function (req, res) {
  const allNetworkNodes = req.body.allNetworkNodes; // array of all networks nodes saved.

  allNetworkNodes.forEach(networkNodeUrl => {
    const nodeNotAlreadyPresent = domcoin.networkNodes.indexOf(networkNodeUrl) === -1;
    const notCurrentNode = domcoin.currentNodeUrl !== networkNodeUrl;
    if (nodeNotAlreadyPresent && notCurrentNode) {
      domcoin.networkNodes.push(networkNodeUrl);
      res.json({ note: 'Bulk registered successfully.'});
    } else {
      res.json({ note: 'Error while adding bulk node.'});
    }
  });


});

app.listen(port, () => {
  console.log(`Listening on: http://localhost:${port}/`);
});
