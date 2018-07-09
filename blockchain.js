const Block = require('./block');

class Blockchain {

  constructor() {
    this.chain = [this.createGenesis()];
  }

  createGenesis() {
    return new Block(0, "Genesis block", "0");
  }

  latestBlock() {
    return this.chain[this.chain.length - 1];
  }

  createBlock(data) {
    const index = this.chain.length;
    const previousHash = this.chain[index - 1].hash;
    this.addBlock(new Block(index, data, previousHash))
  }

  addBlock(newBlock) {
    newBlock.previousHash = this.latestBlock().hash;
    newBlock.hash = newBlock.calculateHash();
    this.chain.push(newBlock);
  }

  checkValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i -1];

      if (currentBlock.hash !== currentBlock.calculateHash()) return false;
      if (currentBlock.previousHash !== previousBlock.hash) return false;
    }

    return true;
  }
}

module.exports = Blockchain;