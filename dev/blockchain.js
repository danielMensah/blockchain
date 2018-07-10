const currentNodeUrl = process.argv[3];
const uuid = require('uuid/v1');
const Block = require('./block');
const Transaction = require('./transaction');

class Blockchain {

  constructor() {
    this.chain = [this.createGenesis()];
    this.pendingTransactions = []; // pending transactions. They get validated when a new block is created.
    this.setDifficulty = 4;
    // this.getDifficulty = retur
  }

  createGenesis() {
    return new Block(0, "Genesis block", "0");
  }

  latestBlock() {
    return this.chain[this.chain.length - 1];
  }

  createNewBlock(nonce) {
    const newBlock = new Block(this.chain.length, this.pendingTransactions, nonce, this.latestBlock().hash);
    newBlock.mineBlock(this.getDifficulty);
    this.emptyTransactions();
    this.chain.push(newBlock);

    return newBlock;
  }

  createNewTransaction(amount, sender, recipient) {
    const newTransaction = new Transaction(amount, sender, recipient);
    this.pendingTransactions.push(newTransaction);

    return this.latestBlock()['index'];
  }

  emptyTransactions() {
    this.pendingTransactions = [];
  }
}

module.exports = Blockchain;