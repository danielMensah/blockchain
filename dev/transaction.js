const uuid = require('uuid/v1');

class Transaction {

  constructor(amount, sender, recipient) {
    this.amount = amount;
    this.sender = sender;
    this.recipient = recipient;
    this.transactionId = uuid().split('-').join('');
  }
}

module.exports = Transaction;