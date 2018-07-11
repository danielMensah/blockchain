const currentNodeUrl = process.argv[3];
const Block = require('./block');
const Transaction = require('./transaction');

class Blockchain {

  constructor() {
    this.chain = [];
    this.pendingTransactions = []; // pending transactions. They get validated when a new block is created.

    this.currentNodeUrl = currentNodeUrl;
    this.networkNodes = [];
    this.getDifficulty = () => 4;

    this.createGenesis();
  }

  createGenesis() {
    this.chain.push(new Block(this.chain.length + 1, "Genesis block", "0", "0", 18));
  }

  latestBlock() {
    return this.chain[this.chain.length - 1];
  }

  createNewBlock(nonce) {
    const newBlock = new Block(this.chain.length + 1, this.pendingTransactions, nonce, this.latestBlock().hash);
    newBlock.mineBlock(this.getDifficulty());
    this.emptyTransactions();
    this.chain.push(newBlock);

    return newBlock;
  }

  createNewTransaction(amount, sender, recipient) {
    return new Transaction(amount, sender, recipient);
  }

  addTransactionToPendingTransactions(transaction) {
    this.pendingTransactions.push(transaction);
    return this.latestBlock()['index'] + 1;
  }

  emptyTransactions() {
    this.pendingTransactions = [];
  }
}

module.exports = Blockchain;