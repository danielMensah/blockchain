const SHA256 = require('crypto-js/sha256');

class Block {

  constructor(index, transaction, nonce, previousBlockHash = '') {
    this.index = index;
    this.timestamp = Date.now();
    this.transaction = transaction;
    this.previousBlockHash = previousBlockHash;
    this.hash = this.calculateHash();
    this.nonce = nonce; // comes from a proof of work and can be any number. It's a proof that we created this new block in a good way.
  }

  calculateHash() {
    return SHA256(`${this.nonce}${this.hash}${this.previousBlockHash}${this.timestamp}${JSON.stringify(this.transaction)}`).toString();
  }

  mineBlock(difficulty) {
    while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
  }
}

module.exports = Block;