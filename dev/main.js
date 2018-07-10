const Blockchain = require('./blockchain');

const domcoin = new Blockchain();
console.log('Mining block...');
domcoin.createNewBlock(2389);
domcoin.createNewTransaction(100, 'ALEX7878FASF7A7D', 'DAN86TA8SDTASD78T');
console.log('Mining block...');
domcoin.createNewBlock(80000);
domcoin.createNewTransaction(500, 'ALEX7878FASF7A7D', 'DAN86TA8SDTASD78T');
domcoin.createNewTransaction(4000, 'ALEX7878FASF7A7D', 'DAN86TA8SDTASD78T');
domcoin.createNewTransaction(9880, 'ALEX7878FASF7A7D', 'DAN86TA8SDTASD78T');
console.log('Mining block...');
domcoin.createNewBlock(322000);

console.log(domcoin.chain);