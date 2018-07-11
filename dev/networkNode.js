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
  const newTransaction = req.body;
  const blockIndex = domcoin.addTransactionToPendingTransactions(newTransaction);

  res.json({note: `Transaction will be added in block ${blockIndex}.`})
});

app.post('/transaction/broadcast', function (req, res) {
  const newTransaction = domcoin.createNewTransaction(req.body.amount, req.body.sender, req.body.recipient);
  domcoin.addTransactionToPendingTransactions(newTransaction);

  // broadcasting the new transaction to all the nodes
  const requestPromises = [];
  domcoin.networkNodes.forEach(networkNodeUrl => {
    const requestOptions = {
      uri: networkNodeUrl + '/transaction',
      method: 'POST',
      body: newTransaction,
      json: true
    };

    requestPromises.push(rp(requestOptions));
  });

  Promise.all(requestPromises)
    .then(() => {
      res.json({ note: 'Transaction created and broadcast successfully.'})
    })
});

app.get('/mine', function (req, res) {
  console.log('Mining block...');
  const newBlock = domcoin.createNewBlock(0);

  const requestPromises = [];
  domcoin.networkNodes.forEach(networkNodeUrl => {
    const requestOptions = {
      uri: networkNodeUrl + '/receive-new-block',
      method: 'POST',
      body: { newBlock },
      json: true
    };

    requestPromises.push(rp(requestOptions));
  });

  Promise.all(requestPromises)
    .then(() => {
      // broadcasting mining reward
      const requestOptions = {
        uri: domcoin.currentNodeUrl + '/transaction/broadcast',
        method: 'POST',
        body: { amount: 12.5, sender: '00', recipient: nodeAddress },
        json: true
      };

      return rp(requestOptions);
    }).then(() => {
    console.log('Done!');
    res.write(JSON.stringify({ note: "New block mined & broadcast successfully", newBlock}), () => res.end());
  });
});

app.post('/receive-new-block', function (req, res) {
  const newBlock = req.body.newBlock;
  const lastBlock = domcoin.latestBlock();
  const correctHash = lastBlock.hash === newBlock.previousBlockHash;
  const correctIndex = lastBlock['index'] + 1 === newBlock['index'];

  if (correctHash && correctIndex) {
    domcoin.chain.push(newBlock);
    domcoin.pendingTransactions = [];
    res.json({note: 'New block received and accepted.', newBlock});
  } else {
    res.json({note: 'New block rejected.', newBlock})
  }
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
      res.json({ note: 'New node registered with network successfully.' });
  })
});

// register new node
app.post('/register-node', function (req, res) {
  const newNodeUrl = req.body.newNodeUrl;
  const nodeNotAlreadyPresent = domcoin.networkNodes.indexOf(newNodeUrl) === -1;
  const notCurrentNode = domcoin.currentNodeUrl !== newNodeUrl;

  if (nodeNotAlreadyPresent && notCurrentNode) {
    domcoin.networkNodes.push(newNodeUrl);
  }

  res.json({ note: 'New node registered successfully.' });
});

// register multiple nodes at once
app.post('/register-nodes-bulk', function (req, res) {
  const allNetworkNodes = req.body.allNetworkNodes; // array of all networks nodes saved.

  allNetworkNodes.forEach(networkNodeUrl => {
    const nodeNotAlreadyPresent = domcoin.networkNodes.indexOf(networkNodeUrl) === -1;
    const notCurrentNode = domcoin.currentNodeUrl !== networkNodeUrl;
    if (nodeNotAlreadyPresent && notCurrentNode) {
      domcoin.networkNodes.push(networkNodeUrl);
    }

    res.write(JSON.stringify({ note: 'Bulk registration successful.' }), () => res.end());
  });
});

app.listen(port, () => {
  console.log(`Listening on: http://localhost:${port}/`);
});
